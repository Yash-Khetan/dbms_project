// ─── Trigger SQL Constants ──────────────────────────────
// These are exported so the /api/simulate/trigger-sql endpoint
// can return them to the frontend for display in code blocks.

// ─── 6 Drone Triggers ───────────────────────────────────

export const beforeInsertDroneSQL = `
-- 1. BEFORE INSERT — Sanitize battery level on drone creation
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

CREATE TRIGGER before_insert_drone
BEFORE INSERT ON drones
FOR EACH ROW EXECUTE FUNCTION fn_before_insert_drone();
`;

export const afterInsertDroneSQL = `
-- 2. AFTER INSERT — Auto-create initial maintenance check
CREATE OR REPLACE FUNCTION fn_after_insert_drone()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO maintenance_records (drone_id, issue_reported, repair_status, maintenance_date)
    VALUES (NEW.id, 'Initial Check', 'COMPLETED', CURRENT_DATE);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_insert_drone
AFTER INSERT ON drones
FOR EACH ROW EXECUTE FUNCTION fn_after_insert_drone();
`;

export const beforeUpdateDroneSQL = `
-- 3. BEFORE UPDATE — Validate battery + low-battery auto-maintenance
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

CREATE TRIGGER before_update_drone
BEFORE UPDATE ON drones
FOR EACH ROW EXECUTE FUNCTION fn_before_update_drone();
`;

export const afterUpdateDroneSQL = `
-- 4. AFTER UPDATE — Log status transitions as audit records
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

CREATE TRIGGER after_update_drone
AFTER UPDATE ON drones
FOR EACH ROW EXECUTE FUNCTION fn_after_update_drone();
`;

export const beforeDeleteDroneSQL = `
-- 5. BEFORE DELETE — Block deletion if drone is IN_DELIVERY
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

CREATE TRIGGER before_delete_drone
BEFORE DELETE ON drones
FOR EACH ROW EXECUTE FUNCTION fn_before_delete_drone();
`;

export const afterDeleteDroneSQL = `
-- 6. AFTER DELETE — Log final audit record for deleted drone
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

CREATE TRIGGER after_delete_drone
AFTER DELETE ON drones
FOR EACH ROW EXECUTE FUNCTION fn_after_delete_drone();
`;

// ─── 2 Flight-Log Triggers ──────────────────────────────

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

// Keep for backward compat (old name referenced elsewhere)
export const lowBatterySQL = beforeUpdateDroneSQL;
