# Drone Ops — Smart Drone Delivery & Fleet Management System

A complete, production-grade full-stack web application built as a university DBMS showcase project. 
Features a futuristic aerospace mission control design, real-time database simulation, and live PostgreSQL triggers.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (managed via pgAdmin)
- **ORM**: Drizzle ORM

---

## Latest Updates (Final Polish)
- **Interactive State Toggling**: Added `CHARGING` / `AVAILABLE` toggle buttons directly to Drone Cards on the Dashboard and Fleet pages.
- **Enhanced Data Integrity**: API-level validation added to prevent registering multiple drones with the same exact model name.
- **Improved UX**: Auto-sorting all Maintenance Records and Recent Orders to descending order (newest first) by default.
- **Flight Simulation Fix**: Active orders are now properly linked and auto-marked as `DELIVERED` the moment a simulated flight completes.

---

## Prerequisites
- Node.js 18+
- pgAdmin installed and running
- PostgreSQL server accessible via pgAdmin

---

## Setup Instructions

### Step 1 — Create the database in pgAdmin
Open pgAdmin → expand your server → right-click Databases → Create → Database → name it **`drone_ops`** → Save.

*(You only need to do this once. All tables and triggers are created automatically by the migrations below.)*

### Step 2 — Backend setup
```bash
cd backend
npm install
cp .env.example .env
```

**Edit `backend/.env`** with your pgAdmin connection details:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=drone_ops
```

**Initialize the Database:**
Once your `.env` is configured, run the following commands sequentially to create the tables, triggers, and seed the data:
```bash
npm run db:generate
npm run db:migrate
npx tsx src/db/create-triggers.ts
npm run db:seed
```

**Start the backend server:**
```bash
npm start
```
*(The API will run on http://localhost:3001)*

### Step 3 — Frontend setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view the application.

---

## Verify Triggers in pgAdmin
Open pgAdmin → `drone_ops` → Schemas → public → Functions
You should see:
- `fn_before_insert_drone`
- `fn_after_insert_drone`
- `fn_before_update_drone`
- `fn_after_update_drone`
- `fn_before_delete_drone`
- `fn_after_delete_drone`
- `fn_battery_drain_on_flight`
- `fn_complete_delivery`

To verify triggers on tables:
- Expand Tables → `drones` → Triggers (6 triggers)
- Expand Tables → `flight_logs` → Triggers (2 triggers)

---

## Database Functions & API Endpoints

The system provides full end-to-end CRUD capabilities for all tables, mapping directly to PostgreSQL through Drizzle ORM. Here is a comprehensive list of all endpoints, inputs, outputs, and their behaviors.

### 1. Drones (`/api/drones`)
| Method | Endpoint | Input | Output | Description | Underlying SQL |
|---|---|---|---|---|---|
| **GET** | `/api/drones` | None | Array of Drone objects | Retrieves all drones in the fleet. | `SELECT * FROM "drones";` |
| **GET** | `/api/drones/:id` | `id` in URL | Single Drone object | Retrieves a specific drone by its ID. | `SELECT * FROM "drones" WHERE "id" = $1;` |
| **POST** | `/api/drones` | JSON: `{ model, batteryLevel?, status?, lastMaintenance? }` | Created Drone object | Creates a new drone. **Fires triggers #1 & #2.** | `INSERT INTO "drones" (...) VALUES (...) RETURNING *;` |
| **PUT** | `/api/drones/:id` | JSON: `{ model?, batteryLevel?, status?, lastMaintenance? }` | Updated Drone object | Updates drone. **Fires triggers #3 & #4.** | `UPDATE "drones" SET ... WHERE "id" = $id RETURNING *;` |
| **DELETE** | `/api/drones/:id` | `id` in URL | Deleted Drone object | Deletes drone. **Fires triggers #5 & #6.** | `DELETE FROM "drones" WHERE "id" = $1 RETURNING *;` |

### 2. Operators (`/api/operators`)
| Method | Endpoint | Input | Output | Description | Underlying SQL |
|---|---|---|---|---|---|
| **GET** | `/api/operators` | None | Array of Operator objects | Retrieves all drone operators. | `SELECT * FROM "operators";` |
| **GET** | `/api/operators/:id` | `id` in URL | Single Operator object | Retrieves a specific operator by ID. | `SELECT * FROM "operators" WHERE "id" = $1;` |
| **POST** | `/api/operators` | JSON: `{ name, licenseNumber, experienceLevel? }` | Created Operator object | Adds a new operator. | `INSERT INTO "operators" (...) VALUES (...) RETURNING *;` |
| **PUT** | `/api/operators/:id` | JSON: `{ name?, licenseNumber?, experienceLevel? }` | Updated Operator object | Updates an operator's details. | `UPDATE "operators" SET ... WHERE "id" = $id RETURNING *;` |
| **DELETE** | `/api/operators/:id` | `id` in URL | Deleted Operator object | Deletes an operator. | `DELETE FROM "operators" WHERE "id" = $1 RETURNING *;` |

### 3. Orders (`/api/orders`)
| Method | Endpoint | Input | Output | Description | Underlying SQL |
|---|---|---|---|---|---|
| **GET** | `/api/orders` | Optional Query: `?status=` | Array of Order objects | Retrieves all orders (optionally filtered by status). | `SELECT * FROM "orders" [WHERE "status" = $1] ORDER BY "created_at";` |
| **GET** | `/api/orders/:id` | `id` in URL | Single Order object | Retrieves a specific order by ID. | `SELECT * FROM "orders" WHERE "id" = $1;` |
| **POST** | `/api/orders` | JSON: `{ customerName, deliveryAddress, packageWeightKg, status? }` | Created Order object | Creates a new delivery order. | `INSERT INTO "orders" (...) VALUES (...) RETURNING *;` |
| **PUT** | `/api/orders/:id` | JSON: `{ customerName?, deliveryAddress?, ... }` | Updated Order object | Updates an order's details. | `UPDATE "orders" SET ... WHERE "id" = $id RETURNING *;` |
| **DELETE** | `/api/orders/:id` | `id` in URL | Deleted Order object | Deletes an order. | `DELETE FROM "orders" WHERE "id" = $1 RETURNING *;` |
| **POST** | `/api/orders/:id/assign` | JSON: `{ droneId }` | Updated Order object | Assigns an AVAILABLE drone to the order. | `UPDATE "orders" SET "assigned_drone_id" = $1, "status" = 'ASSIGNED' WHERE "id" = $id RETURNING *;` |

### 4. Flight Logs (`/api/flights`)
| Method | Endpoint | Input | Output | Description | Underlying SQL |
|---|---|---|---|---|---|
| **GET** | `/api/flights` | Optional: `?droneId=`, `?operatorId=` | Array of FlightLog objects | Retrieves all flights. | `SELECT * FROM "flight_logs" [WHERE ...] ORDER BY "start_time";` |
| **GET** | `/api/flights/:id` | `id` in URL | Single FlightLog object | Retrieves a specific flight log. | `SELECT * FROM "flight_logs" WHERE "id" = $1;` |
| **POST** | `/api/flights` | JSON: `{ droneId, operatorId, orderId? }` | Created FlightLog object | Starts flight. **Fires `trg_battery_drain_on_flight`.** | `INSERT INTO "flight_logs" (...) VALUES (...) RETURNING *;` |
| **PUT** | `/api/flights/:id` | JSON: `{ endTime?, status?, batteryUsed? }` | Updated FlightLog object | Updates flight. **Fires `trg_complete_delivery`.** | `UPDATE "flight_logs" SET ... WHERE "id" = $id RETURNING *;` |
| **DELETE** | `/api/flights/:id` | `id` in URL | Deleted FlightLog object | Deletes a flight log. | `DELETE FROM "flight_logs" WHERE "id" = $1 RETURNING *;` |

### 5. Maintenance Records (`/api/maintenance`)
| Method | Endpoint | Input | Output | Description | Underlying SQL |
|---|---|---|---|---|---|
| **GET** | `/api/maintenance` | None | Array of Maintenance objects | Retrieves all maintenance logs. | `SELECT * FROM "maintenance_records" ORDER BY "maintenance_date";` |
| **GET** | `/api/maintenance/:id` | `id` in URL | Single Maintenance object | Retrieves a specific record. | `SELECT * FROM "maintenance_records" WHERE "id" = $1;` |
| **POST** | `/api/maintenance` | JSON: `{ droneId, issueReported, ... }` | Created Maintenance object | Logs a new maintenance record. | `INSERT INTO "maintenance_records" (...) VALUES (...) RETURNING *;` |
| **PUT** | `/api/maintenance/:id` | JSON: `{ droneId?, issueReported?, ... }` | Updated Maintenance object | Updates a maintenance record. | `UPDATE "maintenance_records" SET ... WHERE "id" = $id RETURNING *;` |
| **DELETE** | `/api/maintenance/:id` | `id` in URL | Deleted Maintenance object | Deletes a maintenance record. | `DELETE FROM "maintenance_records" WHERE "id" = $1 RETURNING *;` |

### 6. Analytics & Stats (`/api/stats`)
| Method | Endpoint | Input | Output | Description | Underlying SQL |
|---|---|---|---|---|---|
| **GET** | `/api/stats/dashboard` | None | JSON Object with aggregate metrics | Computes totals via SQL aggregation. | `SELECT count(*) FROM "drones";` `SELECT count(*) FROM "drones" WHERE "status" = 'IN_DELIVERY';` `SELECT count(*) FROM "orders" WHERE "status" = 'PENDING';` `SELECT count(*) FROM "drones" WHERE "battery_level" < 20;` `SELECT "status", count(*) FROM "drones" GROUP BY "status";` |

### 7. Simulation Endpoints (`/api/simulate`)
| Method | Endpoint | Input | Output | Description |
|---|---|---|---|---|
| **POST** | `/api/simulate/battery-drain` | JSON: `{ droneId }` | Drone + trigger status | Inserts flight log → fires battery drain trigger. |
| **POST** | `/api/simulate/complete-delivery` | JSON: `{ flightId }` | Flight, Drone, Operator, Order | Sets end_time → fires delivery completion trigger. |
| **POST** | `/api/simulate/set-battery` | JSON: `{ droneId, batteryLevel }` | Drone + trigger status | Updates battery → fires before_update_drone trigger. |
| **GET** | `/api/simulate/trigger-sql` | None | All 8 trigger SQL definitions | Returns raw SQL for UI display. |

---

## PostgreSQL Triggers (8 Total)

### Drone Triggers (6 — on `drones` table)

| # | Trigger Name | Timing | PL/pgSQL Function | What It Does |
|---|---|---|---|---|
| 1 | `before_insert_drone` | BEFORE INSERT | `fn_before_insert_drone()` | **Sanitizes battery level** on drone creation. Clamps negative values to 0 and anything above 100 to 100. |
| 2 | `after_insert_drone` | AFTER INSERT | `fn_after_insert_drone()` | **Auto-creates maintenance record** with `issue_reported = 'Initial Check'` and `repair_status = 'COMPLETED'`. |
| 3 | `before_update_drone` | BEFORE UPDATE | `fn_before_update_drone()` | **Validates battery** on update — throws SQLSTATE 45000 error if > 100. Also auto-sets status to MAINTENANCE if battery < 20%. |
| 4 | `after_update_drone` | AFTER UPDATE | `fn_after_update_drone()` | **Logs status transitions** — if status changed, inserts audit record like `"Status changed: AVAILABLE → MAINTENANCE"`. |
| 5 | `before_delete_drone` | BEFORE DELETE | `fn_before_delete_drone()` | **Prevents deletion** if drone status is IN_DELIVERY. Throws SQLSTATE 45000 error — forces deactivation first. |
| 6 | `after_delete_drone` | AFTER DELETE | `fn_after_delete_drone()` | **Logs deletion** — inserts `"Drone Deleted — ID: X, Model: Y"` into maintenance_records for audit trail. |

### Flight Triggers (2 — on `flight_logs` table)

| # | Trigger Name | Timing | PL/pgSQL Function | What It Does |
|---|---|---|---|---|
| 7 | `trg_battery_drain_on_flight` | AFTER INSERT | `fn_battery_drain_on_flight()` | Drains drone battery by 10% and sets status to IN_DELIVERY. If battery drops below 20%, sets to MAINTENANCE. |
| 8 | `trg_complete_delivery` | AFTER UPDATE | `fn_after_update_drone()` | When `end_time` changes from NULL to a value: order → DELIVERED, drone → AVAILABLE, operator `total_flights` +1. |

---

## Complete Demo Flow (Step-by-Step)

> **Total time: ~15 minutes.** Follow this exact order to demonstrate every DBMS feature.

### Phase 1 — Schema Overview (pgAdmin, 2 min)
1. Open pgAdmin → `drone_ops` → Schemas → public → Tables
2. Show all 5 tables: `drones`, `operators`, `orders`, `flight_logs`, `maintenance_records`
3. Show table structure — `SERIAL` primary keys, `NOT NULL`, `DEFAULT` values
4. Show 5 custom ENUM types: `drone_status`, `order_status`, `repair_status`, `experience_level`, `flight_status`
5. Show Foreign Keys on `flight_logs`: `drone_id → drones.id (CASCADE)`, `order_id → orders.id (SET NULL)`
6. Show UNIQUE constraint on `operators.license_number`
7. Show all 8 trigger functions under Schemas → public → Functions

### Phase 2 — Dashboard Aggregate Queries (1 min)
8. Open the Dashboard page — point out the 4 stat tiles (each is a `SELECT COUNT(*) ... WHERE ...`)
9. Point out Drones by Status chart (`SELECT status, COUNT(*) FROM drones GROUP BY status`)

### Phase 3 — Drones CRUD + Triggers #1 & #2 (3 min)
10. Go to **Drone Fleet** → click **Add Drone** → enter model, set battery to `150`
11. Submit → **Trigger #1 fires**: battery is clamped to 100 (BEFORE INSERT)
12. Go to **Maintenance Records** → see **"Initial Check"** record auto-created → **Trigger #2 fired** (AFTER INSERT)
13. **Delete** a non-IN_DELIVERY drone → success → go to Maintenance → see **"Drone Deleted"** audit log → **Trigger #6 fired**

### Phase 4 — Operators CRUD + UNIQUE Constraint (1 min)
14. Go to **Operators** → click **Add Operator** → enter name, license `PILOT-99999`, experience Senior
15. Try adding another operator with same license `PILOT-99999` → **UNIQUE constraint error!**
16. Delete the test operator

### Phase 5 — Orders CRUD + Assign Drone (2 min)
17. Go to **Orders** → click **New Order** → fill customer, address, weight → submit
18. Click status filter pills (PENDING, DELIVERED, etc.) to show `WHERE` clause filtering
19. Click **Assign Drone** on the new order → select available drone → order status changes to ASSIGNED
20. Delete the test order

### Phase 6 — Maintenance CRUD + Timeline (1 min)
21. Go to **Maintenance Records** → click **Log Maintenance** → select drone, enter issue
22. Use the **Timeline** sidebar to view chronological history per drone
23. Delete the test record

### Phase 7 — Trigger Simulation Page (5 min) ⭐

#### Trigger #3 — Before Update (Validate Battery)
24. Go to **Triggers** page → **Before Update** tab
25. Select a drone → drag slider below 20% → status auto-changes to MAINTENANCE
26. Drag slider back above 20% → status auto-returns to AVAILABLE

#### Trigger #4 — After Update (Audit Trail)
27. Click **After Update** tab → follow instructions
28. Go to Maintenance → see `"Status changed: AVAILABLE → MAINTENANCE"` auto-logged

#### Trigger #5 — Before Delete (Block Active Deletion)
29. Click **Before Delete** tab → follow instructions
30. Use Battery Drain to set a drone to IN_DELIVERY
31. Try deleting it → **Error: "Cannot delete drone while status is IN_DELIVERY"**

#### Trigger #7 — Battery Drain (Flight Insert)
32. Click **Flight Battery Drain** tab → select drone → click INSERT FLIGHT LOG
33. Battery drops by 10%, status changes to IN_DELIVERY

#### Trigger #8 — Complete Delivery (Flight Update)
34. Click **Flight Complete** tab → select an in-progress flight → click COMPLETE
35. Order → DELIVERED, Drone → AVAILABLE, Operator flights +1, confetti! 🎉

### Phase 8 — Foreign Key Cascades (1 min)
36. In pgAdmin: delete a drone that has flight_logs → all related flight_logs auto-deleted (CASCADE)
37. Orders with that drone get `assigned_drone_id` set to NULL (SET NULL)

---

## DBMS Features Checklist

| # | Feature | Where |
|---|---|---|
| 1 | Schema Design (5 normalized tables, 3NF) | pgAdmin |
| 2 | Custom ENUM types (5) | pgAdmin → Types |
| 3 | Primary Keys (SERIAL auto-increment) | Every table |
| 4 | Foreign Keys (referential integrity) | flight_logs, orders, maintenance_records |
| 5 | ON DELETE CASCADE / SET NULL | flight_logs (CASCADE), orders (SET NULL) |
| 6 | DEFAULT values | battery_level=100, status='AVAILABLE', created_at=NOW() |
| 7 | UNIQUE constraints | operators.license_number |
| 8 | NOT NULL constraints | Most columns |
| 9 | CRUD — CREATE (INSERT) | Add Drone, Add Operator, New Order, Log Maintenance |
| 10 | CRUD — READ (SELECT) | All table pages, Dashboard |
| 11 | CRUD — UPDATE (UPDATE) | Assign Drone, Complete Flight, Set Battery |
| 12 | CRUD — DELETE (DELETE) | Delete buttons on every table |
| 13 | Aggregate Queries (COUNT, GROUP BY) | Dashboard stats |
| 14 | Filtering (WHERE) | Orders status filter, Flights filter |
| 15 | Ordering (ORDER BY) | Orders by created_at, Flights by start_time |
| 16 | BEFORE INSERT Trigger | before_insert_drone (battery clamp) |
| 17 | AFTER INSERT Trigger | after_insert_drone (auto maintenance) |
| 18 | BEFORE UPDATE Trigger | before_update_drone (validate + auto-maint) |
| 19 | AFTER UPDATE Trigger | after_update_drone (audit log) |
| 20 | BEFORE DELETE Trigger | before_delete_drone (block active deletion) |
| 21 | AFTER DELETE Trigger | after_delete_drone (deletion audit) |
| 22 | AFTER INSERT on flight_logs | trg_battery_drain_on_flight |
| 23 | AFTER UPDATE on flight_logs | trg_complete_delivery |
| 24 | PL/pgSQL Stored Functions | 8 trigger functions |
| 25 | SQLSTATE Error Handling | 45000 errors surfaced as HTTP 400 |
| 26 | RETURNING clause | All INSERT/UPDATE/DELETE return affected rows |
