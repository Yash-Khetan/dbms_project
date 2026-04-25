// ─── Trigger SQL Constants ──────────────────────────────
// These are exported so the /api/simulate/trigger-sql endpoint
// can return them to the frontend for display in code blocks.

export const batteryDrainSQL = `
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

CREATE TRIGGER trg_battery_drain_on_flight
AFTER INSERT ON flight_logs
FOR EACH ROW EXECUTE FUNCTION fn_battery_drain_on_flight();
`;

export const completeDeliverySQL = `
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

CREATE TRIGGER trg_complete_delivery
AFTER UPDATE ON flight_logs
FOR EACH ROW EXECUTE FUNCTION fn_complete_delivery();
`;

export const lowBatterySQL = `
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

CREATE TRIGGER trg_low_battery_auto_maintenance
BEFORE UPDATE ON drones
FOR EACH ROW EXECUTE FUNCTION fn_low_battery_auto_maintenance();
`;
