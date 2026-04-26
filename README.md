# Drone Ops — Smart Drone Delivery & Fleet Management System

A complete, production-grade full-stack web application built as a university DBMS showcase project. 
Features a futuristic aerospace mission control design, real-time database simulation, and live PostgreSQL triggers.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (managed via pgAdmin)
- **ORM**: Drizzle ORM

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
- `fn_battery_drain_on_flight`
- `fn_complete_delivery`
- `fn_low_battery_auto_maintenance`

To verify triggers on tables:
- Expand Tables → `flight_logs` → Triggers
- Expand Tables → `drones` → Triggers

---

## Database Functions & API Endpoints

The system provides full end-to-end CRUD capabilities for all tables, mapping directly to PostgreSQL through Drizzle ORM. Here is a comprehensive list of all endpoints, inputs, outputs, and their behaviors.

### 1. Drones (`/api/drones`)
| Method | Endpoint | Input | Output | Description | Underlying SQL |
|---|---|---|---|---|---|
| **GET** | `/api/drones` | None | Array of Drone objects | Retrieves all drones in the fleet. | `SELECT * FROM "drones";` |
| **GET** | `/api/drones/:id` | `id` in URL | Single Drone object | Retrieves a specific drone by its ID. | `SELECT * FROM "drones" WHERE "id" = $1;` |
| **POST** | `/api/drones` | JSON: `{ model, batteryLevel?, status?, lastMaintenance? }` | Created Drone object | Creates a new drone. | `INSERT INTO "drones" ("model", "battery_level", "status", "last_maintenance") VALUES ($1, $2, $3, $4) RETURNING *;` |
| **PUT** | `/api/drones/:id` | JSON: `{ model?, batteryLevel?, status?, lastMaintenance? }` | Updated Drone object | Updates an existing drone's details. | `UPDATE "drones" SET "model" = $1... WHERE "id" = $id RETURNING *;` |
| **DELETE** | `/api/drones/:id` | `id` in URL | Deleted Drone object | Deletes a drone from the system. | `DELETE FROM "drones" WHERE "id" = $1 RETURNING *;` |

### 2. Operators (`/api/operators`)
| Method | Endpoint | Input | Output | Description | Underlying SQL |
|---|---|---|---|---|---|
| **GET** | `/api/operators` | None | Array of Operator objects | Retrieves all drone operators. | `SELECT * FROM "operators";` |
| **GET** | `/api/operators/:id` | `id` in URL | Single Operator object | Retrieves a specific operator by ID. | `SELECT * FROM "operators" WHERE "id" = $1;` |
| **POST** | `/api/operators` | JSON: `{ name, licenseNumber, experienceLevel? }` | Created Operator object | Adds a new operator. | `INSERT INTO "operators" ("name", "license_number", "experience_level") VALUES ($1, $2, $3) RETURNING *;` |
| **PUT** | `/api/operators/:id` | JSON: `{ name?, licenseNumber?, experienceLevel? }` | Updated Operator object | Updates an operator's details. | `UPDATE "operators" SET "name" = $1... WHERE "id" = $id RETURNING *;` |
| **DELETE** | `/api/operators/:id` | `id` in URL | Deleted Operator object | Deletes an operator. | `DELETE FROM "operators" WHERE "id" = $1 RETURNING *;` |

### 3. Orders (`/api/orders`)
| Method | Endpoint | Input | Output | Description | Underlying SQL |
|---|---|---|---|---|---|
| **GET** | `/api/orders` | Optional Query: `?status=` | Array of Order objects | Retrieves all orders (optionally filtered by status). | `SELECT * FROM "orders" [WHERE "status" = $1] ORDER BY "created_at";` |
| **GET** | `/api/orders/:id` | `id` in URL | Single Order object | Retrieves a specific order by ID. | `SELECT * FROM "orders" WHERE "id" = $1;` |
| **POST** | `/api/orders` | JSON: `{ customerName, deliveryAddress, packageWeightKg, status? }` | Created Order object | Creates a new delivery order. | `INSERT INTO "orders" ("customer_name", "delivery_address", "package_weight_kg", "status") VALUES (...) RETURNING *;` |
| **PUT** | `/api/orders/:id` | JSON: `{ customerName?, deliveryAddress?, ... }` | Updated Order object | Updates an order's details. | `UPDATE "orders" SET "customer_name" = $1... WHERE "id" = $id RETURNING *;` |
| **DELETE** | `/api/orders/:id` | `id` in URL | Deleted Order object | Deletes an order. | `DELETE FROM "orders" WHERE "id" = $1 RETURNING *;` |
| **POST** | `/api/orders/:id/assign` | JSON: `{ droneId }` | Updated Order object | Assigns an AVAILABLE drone to the order and marks status as `ASSIGNED`. | `UPDATE "orders" SET "assigned_drone_id" = $1, "status" = 'ASSIGNED' WHERE "id" = $id RETURNING *;` |

### 4. Flight Logs (`/api/flights`)
| Method | Endpoint | Input | Output | Description | Underlying SQL |
|---|---|---|---|---|---|
| **GET** | `/api/flights` | Optional Queries: `?droneId=`, `?operatorId=` | Array of FlightLog objects | Retrieves all flights. | `SELECT * FROM "flight_logs" [WHERE "drone_id" = $1 AND "operator_id" = $2] ORDER BY "start_time";` |
| **GET** | `/api/flights/:id` | `id` in URL | Single FlightLog object | Retrieves a specific flight log by ID. | `SELECT * FROM "flight_logs" WHERE "id" = $1;` |
| **POST** | `/api/flights` | JSON: `{ droneId, operatorId, orderId? }` | Created FlightLog object | Starts a flight log. **Triggers `trg_battery_drain_on_flight`**. | `INSERT INTO "flight_logs" ("drone_id", "operator_id", "order_id") VALUES (...) RETURNING *;` |
| **PUT** | `/api/flights/:id` | JSON: `{ endTime?, status?, batteryUsed? }` | Updated FlightLog object | Updates flight log. **Triggers `trg_complete_delivery`**. | `UPDATE "flight_logs" SET "end_time" = $1... WHERE "id" = $id RETURNING *;` |
| **DELETE** | `/api/flights/:id` | `id` in URL | Deleted FlightLog object | Deletes a flight log. | `DELETE FROM "flight_logs" WHERE "id" = $1 RETURNING *;` |

### 5. Maintenance Records (`/api/maintenance`)
| Method | Endpoint | Input | Output | Description | Underlying SQL |
|---|---|---|---|---|---|
| **GET** | `/api/maintenance` | None | Array of Maintenance objects | Retrieves all maintenance logs. | `SELECT * FROM "maintenance_records" ORDER BY "maintenance_date";` |
| **GET** | `/api/maintenance/:id` | `id` in URL | Single Maintenance object | Retrieves a specific maintenance log by ID. | `SELECT * FROM "maintenance_records" WHERE "id" = $1;` |
| **POST** | `/api/maintenance` | JSON: `{ droneId, issueReported, ... }` | Created Maintenance object | Logs a new maintenance record. | `INSERT INTO "maintenance_records" ("drone_id", "issue_reported", ...) VALUES (...) RETURNING *;` |
| **PUT** | `/api/maintenance/:id` | JSON: `{ droneId?, issueReported?, ... }` | Updated Maintenance object | Updates a maintenance record. | `UPDATE "maintenance_records" SET "issue_reported" = $1... WHERE "id" = $id RETURNING *;` |
| **DELETE** | `/api/maintenance/:id` | `id` in URL | Deleted Maintenance object | Deletes a maintenance record. | `DELETE FROM "maintenance_records" WHERE "id" = $1 RETURNING *;` |

### 6. Analytics & Stats (`/api/stats`)
| Method | Endpoint | Input | Output | Description | Underlying SQL |
|---|---|---|---|---|---|
| **GET** | `/api/stats/dashboard` | None | JSON Object with aggregate metrics | Computes and returns totals via SQL aggregation. | `SELECT count(*) FROM "drones";`<br>`SELECT count(*) FROM "drones" WHERE "status" = 'IN_DELIVERY';`<br>`SELECT count(*) FROM "orders" WHERE "status" = 'PENDING';`<br>`SELECT count(*) FROM "drones" WHERE "battery_level" < 20;`<br>`SELECT "status", count(*) FROM "drones" GROUP BY "status";` |

### 7. Simulation Endpoints (`/api/simulate`)
*These endpoints exist primarily to demonstrate database triggers and procedures in real-time.*

| Method | Endpoint | Input | Output | Description | Underlying SQL |
|---|---|---|---|---|---|
| **POST** | `/api/simulate/battery-drain` | JSON: `{ droneId }` | Drone object + trigger status | Inserts a flight log to deliberately fire the battery drain DB trigger. | `INSERT INTO "flight_logs" ("drone_id", "operator_id") VALUES ($1, $2);`<br>`SELECT * FROM "drones" WHERE "id" = $1;` |
| **POST** | `/api/simulate/complete-delivery`| JSON: `{ flightId }` | Updated Flight, Drone, Operator, Order | Updates a flight log's `endTime` to explicitly fire the delivery completion DB trigger. | `UPDATE "flight_logs" SET "end_time" = NOW(), "status" = 'COMPLETED' WHERE "id" = $1 RETURNING *;`<br>*(Followed by selects to fetch updated relational data)* |
| **POST** | `/api/simulate/set-battery` | JSON: `{ droneId, batteryLevel }` | Drone object + trigger status | Modifies drone battery. If `< 20`, fires the `trg_low_battery_auto_maintenance` trigger. | `UPDATE "drones" SET "battery_level" = $1 WHERE "id" = $id;`<br>`SELECT * FROM "drones" WHERE "id" = $1;` |
| **GET** | `/api/simulate/trigger-sql` | None | JSON mapping of Trigger SQL | Returns raw DB trigger definitions for UI display. | *No queries executed, just returns static strings.* |
