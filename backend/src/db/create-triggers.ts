import 'dotenv/config';
import postgres from 'postgres';

async function createTriggers() {
  const client = postgres({
    host:     process.env.DB_HOST!,
    port:     Number(process.env.DB_PORT!),
    user:     process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
  });

  console.log('🔧 Creating PostgreSQL triggers...\n');

  // Trigger 1: Battery drain on flight log insert
  await client.unsafe(`
    CREATE OR REPLACE FUNCTION fn_battery_drain_on_flight()
    RETURNS TRIGGER AS $$
    BEGIN
        UPDATE drones
        SET
            battery_level = GREATEST(battery_level - 10, 0),
            status = CASE
                WHEN battery_level - 10 < 20 THEN 'MAINTENANCE'::drone_status
                ELSE 'IN_DELIVERY'::drone_status
            END
        WHERE id = NEW.drone_id;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await client.unsafe(`
    DROP TRIGGER IF EXISTS trg_battery_drain_on_flight ON flight_logs;
    CREATE TRIGGER trg_battery_drain_on_flight
    AFTER INSERT ON flight_logs
    FOR EACH ROW EXECUTE FUNCTION fn_battery_drain_on_flight();
  `);

  console.log('  ✅ trg_battery_drain_on_flight');

  // Trigger 2: Complete delivery on flight log update
  await client.unsafe(`
    CREATE OR REPLACE FUNCTION fn_complete_delivery()
    RETURNS TRIGGER AS $$
    BEGIN
        IF OLD.end_time IS NULL AND NEW.end_time IS NOT NULL THEN
            UPDATE orders SET status = 'DELIVERED'
            WHERE id = NEW.order_id;

            UPDATE drones SET status = 'AVAILABLE'
            WHERE id = NEW.drone_id;

            UPDATE operators SET total_flights = total_flights + 1
            WHERE id = NEW.operator_id;
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await client.unsafe(`
    DROP TRIGGER IF EXISTS trg_complete_delivery ON flight_logs;
    CREATE TRIGGER trg_complete_delivery
    AFTER UPDATE ON flight_logs
    FOR EACH ROW EXECUTE FUNCTION fn_complete_delivery();
  `);

  console.log('  ✅ trg_complete_delivery');

  // Trigger 3: Low battery auto maintenance
  await client.unsafe(`
    CREATE OR REPLACE FUNCTION fn_low_battery_auto_maintenance()
    RETURNS TRIGGER AS $$
    BEGIN
        IF NEW.battery_level < 20 AND NEW.status != 'MAINTENANCE' THEN
            NEW.status := 'MAINTENANCE';
        ELSIF NEW.battery_level >= 20 AND OLD.status = 'MAINTENANCE' THEN
            NEW.status := 'AVAILABLE';
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await client.unsafe(`
    DROP TRIGGER IF EXISTS trg_low_battery_auto_maintenance ON drones;
    CREATE TRIGGER trg_low_battery_auto_maintenance
    BEFORE UPDATE ON drones
    FOR EACH ROW EXECUTE FUNCTION fn_low_battery_auto_maintenance();
  `);

  console.log('  ✅ trg_low_battery_auto_maintenance');

  console.log('\n✨ All triggers created successfully!');
  await client.end();
}

createTriggers().catch((err) => {
  console.error('❌ Failed to create triggers:', err);
  process.exit(1);
});
