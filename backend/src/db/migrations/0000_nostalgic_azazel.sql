DO $$ BEGIN
 CREATE TYPE "public"."drone_status" AS ENUM('AVAILABLE', 'IN_DELIVERY', 'CHARGING', 'MAINTENANCE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."experience_level" AS ENUM('JUNIOR', 'INTERMEDIATE', 'SENIOR');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."flight_status" AS ENUM('IN_PROGRESS', 'COMPLETED', 'ABORTED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."order_status" AS ENUM('PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."repair_status" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "drones" (
	"id" serial PRIMARY KEY NOT NULL,
	"model" varchar(100) NOT NULL,
	"battery_level" integer DEFAULT 100 NOT NULL,
	"status" "drone_status" DEFAULT 'AVAILABLE' NOT NULL,
	"last_maintenance" date
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "flight_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"drone_id" integer NOT NULL,
	"operator_id" integer NOT NULL,
	"order_id" integer,
	"start_time" timestamp with time zone DEFAULT now() NOT NULL,
	"end_time" timestamp with time zone,
	"status" "flight_status" DEFAULT 'IN_PROGRESS' NOT NULL,
	"battery_used" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "maintenance_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"drone_id" integer NOT NULL,
	"maintenance_date" date DEFAULT now() NOT NULL,
	"issue_reported" text NOT NULL,
	"repair_status" "repair_status" DEFAULT 'PENDING' NOT NULL,
	"technician_notes" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "operators" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"license_number" varchar(50) NOT NULL,
	"experience_level" "experience_level" DEFAULT 'JUNIOR' NOT NULL,
	"total_flights" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "operators_license_number_unique" UNIQUE("license_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_name" varchar(100) NOT NULL,
	"delivery_address" text NOT NULL,
	"package_weight_kg" numeric(5, 2) NOT NULL,
	"status" "order_status" DEFAULT 'PENDING' NOT NULL,
	"assigned_drone_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "flight_logs" ADD CONSTRAINT "flight_logs_drone_id_drones_id_fk" FOREIGN KEY ("drone_id") REFERENCES "public"."drones"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "flight_logs" ADD CONSTRAINT "flight_logs_operator_id_operators_id_fk" FOREIGN KEY ("operator_id") REFERENCES "public"."operators"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "flight_logs" ADD CONSTRAINT "flight_logs_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "maintenance_records" ADD CONSTRAINT "maintenance_records_drone_id_drones_id_fk" FOREIGN KEY ("drone_id") REFERENCES "public"."drones"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_assigned_drone_id_drones_id_fk" FOREIGN KEY ("assigned_drone_id") REFERENCES "public"."drones"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
