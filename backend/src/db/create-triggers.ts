import 'dotenv/config';
import postgres from 'postgres';

async function createTriggers() {
  const client = postgres({
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT!),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    ssl: 'require'
  });

  console.log('🔧 Creating PostgreSQL triggers...\n');

  // ──────────────────────────────────────────────────────────
  // Prep: make maintenance_records.drone_id nullable + SET NULL
  // so after_delete_drone can insert a record after cascade.
  // ──────────────────────────────────────────────────────────
  await client.unsafe(`
    ALTER TABLE maintenance_records ALTER COLUMN drone_id DROP NOT NULL;
  `);
  await client.unsafe(`
    ALTER TABLE maintenance_records DROP CONSTRAINT IF EXISTS maintenance_records_drone_id_drones_id_fk;
    ALTER TABLE maintenance_records ADD CONSTRAINT maintenance_records_drone_id_drones_id_fk
      FOREIGN KEY (drone_id) REFERENCES drones(id) ON DELETE SET NULL;
  `);
  console.log('  ✅ maintenance_records FK updated to ON DELETE SET NULL');

  // ──────────────────────────────────────────────────────────
  // Drop old triggers (clean slate for drones table)
  // ──────────────────────────────────────────────────────────
  await client.unsafe(`DROP TRIGGER IF EXISTS trg_low_battery_auto_maintenance ON drones;`);
  await client.unsafe(`DROP FUNCTION IF EXISTS fn_low_battery_auto_maintenance();`);
  await client.unsafe(`DROP TRIGGER IF EXISTS before_insert_drone ON drones;`);
  await client.unsafe(`DROP TRIGGER IF EXISTS after_insert_drone ON drones;`);
  await client.unsafe(`DROP TRIGGER IF EXISTS before_update_drone ON drones;`);
  await client.unsafe(`DROP TRIGGER IF EXISTS after_update_drone ON drones;`);
  await client.unsafe(`DROP TRIGGER IF EXISTS before_delete_drone ON drones;`);
  await client.unsafe(`DROP TRIGGER IF EXISTS after_delete_drone ON drones;`);

  // ──────────────────────────────────────────────────────────
  // 1. BEFORE INSERT — Sanitize battery level on drone creation
  // ──────────────────────────────────────────────────────────
  await client.unsafe(`
    CREATE OR REPLACE FUNCTION fn_before_insert_drone()
    RETURNS TRIGGER AS $$
    BEGIN
        IF NEW.battery_level < 0 THEN
            NEW.battery_level := 0;
        END IF;
        IF NEW.battery_level > 100 THEN
            NEW.battery_level := 100;
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
  await client.unsafe(`
    CREATE TRIGGER before_insert_drone
    BEFORE INSERT ON drones
    FOR EACH ROW EXECUTE FUNCTION fn_before_insert_drone();
  `);
  console.log('  ✅ before_insert_drone');

  // ──────────────────────────────────────────────────────────
  // 2. AFTER INSERT — Auto-create initial maintenance check
  // ──────────────────────────────────────────────────────────
  await client.unsafe(`
    CREATE OR REPLACE FUNCTION fn_after_insert_drone()
    RETURNS TRIGGER AS $$
    BEGIN
        INSERT INTO maintenance_records (drone_id, issue_reported, repair_status, maintenance_date)
        VALUES (NEW.id, 'Initial Check', 'COMPLETED', CURRENT_DATE);
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
  await client.unsafe(`
    CREATE TRIGGER after_insert_drone
    AFTER INSERT ON drones
    FOR EACH ROW EXECUTE FUNCTION fn_after_insert_drone();
  `);
  console.log('  ✅ after_insert_drone');

  // ──────────────────────────────────────────────────────────
  // 3. BEFORE UPDATE — Validate battery + low-battery auto-maint
  // ──────────────────────────────────────────────────────────
  await client.unsafe(`
    CREATE OR REPLACE FUNCTION fn_before_update_drone()
    RETURNS TRIGGER AS $$
    BEGIN
        IF NEW.battery_level > 100 THEN
            RAISE EXCEPTION 'Battery level cannot exceed 100%%'
                USING ERRCODE = '45000';
        END IF;
        IF NEW.battery_level < 0 THEN
            RAISE EXCEPTION 'Battery level cannot be negative'
                USING ERRCODE = '45000';
        END IF;
        -- Low battery auto-maintenance
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
    CREATE TRIGGER before_update_drone
    BEFORE UPDATE ON drones
    FOR EACH ROW EXECUTE FUNCTION fn_before_update_drone();
  `);
  console.log('  ✅ before_update_drone');

  // ──────────────────────────────────────────────────────────
  // 4. AFTER UPDATE — Log status transitions as audit records
  // ──────────────────────────────────────────────────────────
  await client.unsafe(`
    CREATE OR REPLACE FUNCTION fn_after_update_drone()
    RETURNS TRIGGER AS $$
    BEGIN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            INSERT INTO maintenance_records (drone_id, issue_reported, repair_status, maintenance_date)
            VALUES (NEW.id,
                    'Status changed: ' || OLD.status || ' → ' || NEW.status,
                    'COMPLETED',
                    CURRENT_DATE);
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
  await client.unsafe(`
    CREATE TRIGGER after_update_drone
    AFTER UPDATE ON drones
    FOR EACH ROW EXECUTE FUNCTION fn_after_update_drone();
  `);
  console.log('  ✅ after_update_drone');

  // ──────────────────────────────────────────────────────────
  // 5. BEFORE DELETE — Block deletion if drone is IN_DELIVERY
  // ──────────────────────────────────────────────────────────
  await client.unsafe(`
    CREATE OR REPLACE FUNCTION fn_before_delete_drone()
    RETURNS TRIGGER AS $$
    BEGIN
        IF OLD.status = 'IN_DELIVERY' THEN
            RAISE EXCEPTION 'Cannot delete drone while status is IN_DELIVERY. Change status first.'
                USING ERRCODE = '45000';
        END IF;
        RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;
  `);
  await client.unsafe(`
    CREATE TRIGGER before_delete_drone
    BEFORE DELETE ON drones
    FOR EACH ROW EXECUTE FUNCTION fn_before_delete_drone();
  `);
  console.log('  ✅ before_delete_drone');

  // ──────────────────────────────────────────────────────────
  // 6. AFTER DELETE — Log final audit record for deleted drone
  // ──────────────────────────────────────────────────────────
  await client.unsafe(`
    CREATE OR REPLACE FUNCTION fn_after_delete_drone()
    RETURNS TRIGGER AS $$
    BEGIN
        INSERT INTO maintenance_records (drone_id, issue_reported, repair_status, maintenance_date)
        VALUES (NULL,
                'Drone Deleted — ID: ' || OLD.id || ', Model: ' || OLD.model,
                'COMPLETED',
                CURRENT_DATE);
        RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;
  `);
  await client.unsafe(`
    CREATE TRIGGER after_delete_drone
    AFTER DELETE ON drones
    FOR EACH ROW EXECUTE FUNCTION fn_after_delete_drone();
  `);
  console.log('  ✅ after_delete_drone');

  // ──────────────────────────────────────────────────────────
  // Flight-log triggers (kept from before)
  // ──────────────────────────────────────────────────────────

  // Trigger A: Battery drain on flight log insert
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

  // Trigger B: Complete delivery on flight log update
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

  console.log('\n✨ All 8 triggers created successfully!');

  // ──────────────────────────────────────────────────────────
  // PostgreSQL VIEW: fleet_overview
  // Joins drones + active orders + maintenance history
  // ──────────────────────────────────────────────────────────
  await client.unsafe(`
    CREATE OR REPLACE VIEW fleet_overview AS
    SELECT
      d.id              AS drone_id,
      d.model           AS drone_model,
      d.battery_level,
      d.status          AS drone_status,
      d.last_maintenance,
      COUNT(DISTINCT o.id) FILTER (WHERE o.status IN ('PENDING','ASSIGNED','IN_TRANSIT'))
                        AS active_orders,
      COUNT(DISTINCT m.id)
                        AS total_maintenance_records,
      MAX(m.maintenance_date)
                        AS latest_maintenance_date
    FROM drones d
    LEFT JOIN orders o            ON o.assigned_drone_id = d.id
    LEFT JOIN maintenance_records m ON m.drone_id = d.id
    GROUP BY d.id, d.model, d.battery_level, d.status, d.last_maintenance
    ORDER BY d.id;
  `);
  console.log('  ✅ VIEW fleet_overview created');

  console.log('\n🎉 All triggers + view created successfully!');
  await client.end();
}

createTriggers().catch((err) => {
  console.error('❌ Failed to create triggers:', err);
  process.exit(1);
});
