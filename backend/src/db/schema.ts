import {
  pgTable, pgEnum, serial, varchar, integer,
  numeric, text, date, timestamp,
} from 'drizzle-orm/pg-core';

// ─── Enums ──────────────────────────────────────────────
export const droneStatusEnum = pgEnum('drone_status', [
  'AVAILABLE', 'IN_DELIVERY', 'CHARGING', 'MAINTENANCE',
]);

export const orderStatusEnum = pgEnum('order_status', [
  'PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED',
]);

export const repairStatusEnum = pgEnum('repair_status', [
  'PENDING', 'IN_PROGRESS', 'COMPLETED',
]);

export const experienceLevelEnum = pgEnum('experience_level', [
  'JUNIOR', 'INTERMEDIATE', 'SENIOR',
]);

export const flightStatusEnum = pgEnum('flight_status', [
  'IN_PROGRESS', 'COMPLETED', 'ABORTED',
]);

// ─── Tables ─────────────────────────────────────────────
export const drones = pgTable('drones', {
  id:              serial('id').primaryKey(),
  model:           varchar('model', { length: 100 }).notNull(),
  batteryLevel:    integer('battery_level').notNull().default(100),
  status:          droneStatusEnum('status').notNull().default('AVAILABLE'),
  lastMaintenance: date('last_maintenance'),
});

export const operators = pgTable('operators', {
  id:              serial('id').primaryKey(),
  name:            varchar('name', { length: 100 }).notNull(),
  licenseNumber:   varchar('license_number', { length: 50 }).notNull().unique(),
  experienceLevel: experienceLevelEnum('experience_level').notNull().default('JUNIOR'),
  totalFlights:    integer('total_flights').notNull().default(0),
});

export const orders = pgTable('orders', {
  id:              serial('id').primaryKey(),
  customerName:    varchar('customer_name', { length: 100 }).notNull(),
  deliveryAddress: text('delivery_address').notNull(),
  packageWeightKg: numeric('package_weight_kg', { precision: 5, scale: 2 }).notNull(),
  status:          orderStatusEnum('status').notNull().default('PENDING'),
  assignedDroneId: integer('assigned_drone_id').references(() => drones.id),
  createdAt:       timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const flightLogs = pgTable('flight_logs', {
  id:          serial('id').primaryKey(),
  droneId:     integer('drone_id').notNull().references(() => drones.id, { onDelete: 'cascade' }),
  operatorId:  integer('operator_id').notNull().references(() => operators.id, { onDelete: 'cascade' }),
  orderId:     integer('order_id').references(() => orders.id, { onDelete: 'set null' }),
  startTime:   timestamp('start_time', { withTimezone: true }).notNull().defaultNow(),
  endTime:     timestamp('end_time', { withTimezone: true }),
  status:      flightStatusEnum('status').notNull().default('IN_PROGRESS'),
  batteryUsed: integer('battery_used'),
});

export const maintenanceRecords = pgTable('maintenance_records', {
  id:              serial('id').primaryKey(),
  droneId:         integer('drone_id').notNull().references(() => drones.id, { onDelete: 'cascade' }),
  maintenanceDate: date('maintenance_date').notNull().defaultNow(),
  issueReported:   text('issue_reported').notNull(),
  repairStatus:    repairStatusEnum('repair_status').notNull().default('PENDING'),
  technicianNotes: text('technician_notes'),
});
