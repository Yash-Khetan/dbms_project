"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintenanceRecords = exports.flightLogs = exports.orders = exports.operators = exports.drones = exports.flightStatusEnum = exports.experienceLevelEnum = exports.repairStatusEnum = exports.orderStatusEnum = exports.droneStatusEnum = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
// ─── Enums ──────────────────────────────────────────────
exports.droneStatusEnum = (0, pg_core_1.pgEnum)('drone_status', [
    'AVAILABLE', 'IN_DELIVERY', 'CHARGING', 'MAINTENANCE',
]);
exports.orderStatusEnum = (0, pg_core_1.pgEnum)('order_status', [
    'PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED',
]);
exports.repairStatusEnum = (0, pg_core_1.pgEnum)('repair_status', [
    'PENDING', 'IN_PROGRESS', 'COMPLETED',
]);
exports.experienceLevelEnum = (0, pg_core_1.pgEnum)('experience_level', [
    'JUNIOR', 'INTERMEDIATE', 'SENIOR',
]);
exports.flightStatusEnum = (0, pg_core_1.pgEnum)('flight_status', [
    'IN_PROGRESS', 'COMPLETED', 'ABORTED',
]);
// ─── Tables ─────────────────────────────────────────────
exports.drones = (0, pg_core_1.pgTable)('drones', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    model: (0, pg_core_1.varchar)('model', { length: 100 }).notNull(),
    batteryLevel: (0, pg_core_1.integer)('battery_level').notNull().default(100),
    status: (0, exports.droneStatusEnum)('status').notNull().default('AVAILABLE'),
    lastMaintenance: (0, pg_core_1.date)('last_maintenance'),
});
exports.operators = (0, pg_core_1.pgTable)('operators', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).notNull(),
    licenseNumber: (0, pg_core_1.varchar)('license_number', { length: 50 }).notNull().unique(),
    experienceLevel: (0, exports.experienceLevelEnum)('experience_level').notNull().default('JUNIOR'),
    totalFlights: (0, pg_core_1.integer)('total_flights').notNull().default(0),
});
exports.orders = (0, pg_core_1.pgTable)('orders', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    customerName: (0, pg_core_1.varchar)('customer_name', { length: 100 }).notNull(),
    deliveryAddress: (0, pg_core_1.text)('delivery_address').notNull(),
    packageWeightKg: (0, pg_core_1.numeric)('package_weight_kg', { precision: 5, scale: 2 }).notNull(),
    status: (0, exports.orderStatusEnum)('status').notNull().default('PENDING'),
    assignedDroneId: (0, pg_core_1.integer)('assigned_drone_id').references(function () { return exports.drones.id; }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: true }).notNull().defaultNow(),
});
exports.flightLogs = (0, pg_core_1.pgTable)('flight_logs', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    droneId: (0, pg_core_1.integer)('drone_id').notNull().references(function () { return exports.drones.id; }, { onDelete: 'cascade' }),
    operatorId: (0, pg_core_1.integer)('operator_id').notNull().references(function () { return exports.operators.id; }, { onDelete: 'cascade' }),
    orderId: (0, pg_core_1.integer)('order_id').references(function () { return exports.orders.id; }, { onDelete: 'set null' }),
    startTime: (0, pg_core_1.timestamp)('start_time', { withTimezone: true }).notNull().defaultNow(),
    endTime: (0, pg_core_1.timestamp)('end_time', { withTimezone: true }),
    status: (0, exports.flightStatusEnum)('status').notNull().default('IN_PROGRESS'),
    batteryUsed: (0, pg_core_1.integer)('battery_used'),
});
exports.maintenanceRecords = (0, pg_core_1.pgTable)('maintenance_records', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    droneId: (0, pg_core_1.integer)('drone_id').notNull().references(function () { return exports.drones.id; }, { onDelete: 'cascade' }),
    maintenanceDate: (0, pg_core_1.date)('maintenance_date').notNull().defaultNow(),
    issueReported: (0, pg_core_1.text)('issue_reported').notNull(),
    repairStatus: (0, exports.repairStatusEnum)('repair_status').notNull().default('PENDING'),
    technicianNotes: (0, pg_core_1.text)('technician_notes'),
});
