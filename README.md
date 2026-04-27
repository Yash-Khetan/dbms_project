# Drone Ops — Smart Drone Delivery & Fleet Management System

A complete, production-grade full-stack web application built as a university DBMS showcase project.
Features a futuristic aerospace command center UI, cinematic landing page with preloader animation, real-time database trigger simulation, and a PostgreSQL VIEW for unified fleet analytics.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | PostgreSQL (managed via pgAdmin) |
| **ORM** | Drizzle ORM |
| **State** | TanStack React Query (real-time cache invalidation) |

---

## Key Features

- **Cinematic Landing Page** — 4-section scrollable landing with animated preloader (drone flies across screen during boot sequence)
- **Fleet Command Dashboard** — KPI stat tiles, fleet distribution panel, drone cards with 3D SVG illustrations and status-based glow
- **Full CRUD** — Create, Read, Update, Delete operations on all 5 tables
- **8 Autonomous PL/pgSQL Triggers** — Battery clamping, auto-maintenance logging, status transition auditing, deletion protection, delivery completion
- **1 PostgreSQL VIEW** (`fleet_overview`) — Joins drones + orders + maintenance into a unified virtual table, visible on the Dashboard
- **Interactive Trigger Simulation** — Dedicated page to fire each trigger live and observe the database reaction
- **Status-Driven Workflows** — Drone assignment auto-updates drone status; flight completion auto-delivers orders
- **Charging System** — Drones with battery < 30% show a "Charge" button; toggling between CHARGING ↔ AVAILABLE
- **Duplicate Prevention** — API rejects creating drones with the same model name

---

## Prerequisites

- Node.js 18+
- pgAdmin installed and running
- PostgreSQL server accessible via pgAdmin

---

## Setup Instructions

### Step 1 — Create the database in pgAdmin
Open pgAdmin → expand your server → right-click Databases → Create → Database → name it **`drone_ops`** → Save.

### Step 2 — Backend setup
```bash
cd backend
npm install
```

Create a `backend/.env` file with your pgAdmin connection details:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_NAME=drone_ops
```

**Initialize the Database:**
```bash
npx drizzle-kit push          # Sync schema to PostgreSQL
npx tsx src/db/create-triggers.ts  # Create all 8 triggers + VIEW
npm run db:seed               # Insert sample data
```

**Start the backend server:**
```bash
npm run dev
```
*(API runs on http://localhost:3001)*

### Step 3 — Frontend setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to view the application.

---

## Application Pages

| Page | Route | Description |
|---|---|---|
| **Landing** | `/` | Cinematic preloader + 4-section hero page with "Enter Command Center" CTA |
| **Dashboard** | `/dashboard` | KPI tiles, fleet distribution, recent orders, drone cards, fleet overview (VIEW) |
| **Drone Fleet** | `/drones` | Full CRUD on drones table, status filters, charging controls |
| **Orders** | `/orders` | Full CRUD on orders, status filters, drone assignment |
| **Operators** | `/operators` | Full CRUD on operators, unique license enforcement |
| **Flight Logs** | `/flights` | Full CRUD on flight_logs, filter by drone/operator |
| **Maintenance** | `/maintenance` | Full CRUD + timeline sidebar, auto-generated audit logs |
| **Trigger Sim** | `/triggers` | Interactive trigger testing with live SQL display |
| **SQL Reference** | `/sql` | Complete SQL documentation for all triggers |

---

## Database Schema (5 Tables + 1 VIEW)

### Tables

| Table | Columns | Key Constraints |
|---|---|---|
| `drones` | id, model, battery_level, status, last_maintenance | PK: id, ENUM: drone_status |
| `operators` | id, name, license_number, experience_level, total_flights | PK: id, UNIQUE: license_number, ENUM: experience_level |
| `orders` | id, customer_name, delivery_address, package_weight_kg, status, assigned_drone_id, created_at | PK: id, FK: assigned_drone_id → drones.id, ENUM: order_status |
| `flight_logs` | id, drone_id, operator_id, order_id, start_time, end_time, status, battery_used | PK: id, FK: drone_id (CASCADE), operator_id (CASCADE), order_id (SET NULL), ENUM: flight_status |
| `maintenance_records` | id, drone_id, maintenance_date, issue_reported, repair_status, technician_notes | PK: id, FK: drone_id (SET NULL), ENUM: repair_status |

### Custom ENUM Types (5)
- `drone_status`: AVAILABLE, IN_DELIVERY, CHARGING, MAINTENANCE
- `order_status`: PENDING, ASSIGNED, IN_TRANSIT, DELIVERED, CANCELLED
- `repair_status`: PENDING, IN_PROGRESS, COMPLETED
- `experience_level`: JUNIOR, INTERMEDIATE, SENIOR
- `flight_status`: IN_PROGRESS, COMPLETED, ABORTED

### PostgreSQL VIEW
```sql
CREATE OR REPLACE VIEW fleet_overview AS
SELECT
  d.id AS drone_id, d.model AS drone_model, d.battery_level, d.status AS drone_status,
  d.last_maintenance,
  COUNT(DISTINCT o.id) FILTER (WHERE o.status IN ('PENDING','ASSIGNED','IN_TRANSIT')) AS active_orders,
  COUNT(DISTINCT m.id) AS total_maintenance_records,
  MAX(m.maintenance_date) AS latest_maintenance_date
FROM drones d
LEFT JOIN orders o ON o.assigned_drone_id = d.id
LEFT JOIN maintenance_records m ON m.drone_id = d.id
GROUP BY d.id, d.model, d.battery_level, d.status, d.last_maintenance
ORDER BY d.id;
```

---

## API Endpoints

### Drones (`/api/drones`)
| Method | Endpoint | Description | Triggers Fired |
|---|---|---|---|
| GET | `/api/drones` | List all drones | — |
| GET | `/api/drones/:id` | Get single drone | — |
| POST | `/api/drones` | Create drone (rejects duplicate names) | #1 before_insert, #2 after_insert |
| PUT | `/api/drones/:id` | Update drone | #3 before_update, #4 after_update |
| DELETE | `/api/drones/:id` | Delete drone | #5 before_delete, #6 after_delete |

### Operators (`/api/operators`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/operators` | List all operators |
| POST | `/api/operators` | Create operator (UNIQUE license enforced) |
| PUT | `/api/operators/:id` | Update operator |
| DELETE | `/api/operators/:id` | Delete operator |

### Orders (`/api/orders`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/orders?status=` | List orders (optional WHERE filter) |
| POST | `/api/orders` | Create new order |
| POST | `/api/orders/:id/assign` | Assign drone → order=ASSIGNED, drone=IN_DELIVERY |
| DELETE | `/api/orders/:id` | Delete order |

### Flight Logs (`/api/flights`)
| Method | Endpoint | Description | Triggers Fired |
|---|---|---|---|
| GET | `/api/flights` | List flights (filter by drone/operator) | — |
| POST | `/api/flights` | Start flight | #7 trg_battery_drain |
| PUT | `/api/flights/:id` | Update/complete flight | #8 trg_complete_delivery |
| DELETE | `/api/flights/:id` | Delete flight log | — |

### Maintenance (`/api/maintenance`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/maintenance` | List records (sorted DESC) |
| POST | `/api/maintenance` | Log new maintenance |
| DELETE | `/api/maintenance/:id` | Delete record |

### Analytics & VIEW (`/api/stats`)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/stats/dashboard` | Aggregated KPIs (COUNT, GROUP BY) |
| GET | `/api/stats/fleet-overview` | Query `fleet_overview` VIEW |

### Simulation (`/api/simulate`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/simulate/battery-drain` | Insert flight → drain battery by 10% |
| POST | `/api/simulate/complete-delivery` | Complete flight → deliver order |
| POST | `/api/simulate/set-battery` | Set battery level → test auto-maintenance |
| GET | `/api/simulate/trigger-sql` | Return all 8 trigger SQL definitions |

---

## PostgreSQL Triggers (8 Total)

### Drone Triggers (6 — on `drones` table)

| # | Trigger | Timing | What It Does |
|---|---|---|---|
| 1 | `before_insert_drone` | BEFORE INSERT | Clamps battery to 0–100 range |
| 2 | `after_insert_drone` | AFTER INSERT | Auto-creates "Initial Check" maintenance record |
| 3 | `before_update_drone` | BEFORE UPDATE | Validates battery ≤ 100 (SQLSTATE 45000), auto-sets MAINTENANCE if < 20% |
| 4 | `after_update_drone` | AFTER UPDATE | Logs status transitions as audit records |
| 5 | `before_delete_drone` | BEFORE DELETE | Blocks deletion if drone is IN_DELIVERY |
| 6 | `after_delete_drone` | AFTER DELETE | Logs "Drone Deleted" audit record |

### Flight Triggers (2 — on `flight_logs` table)

| # | Trigger | Timing | What It Does |
|---|---|---|---|
| 7 | `trg_battery_drain_on_flight` | AFTER INSERT | Drains battery by 10%, sets IN_DELIVERY, auto-MAINTENANCE if < 20% |
| 8 | `trg_complete_delivery` | AFTER UPDATE | When end_time set: order→DELIVERED, drone→AVAILABLE, operator flights+1 |

---

## Verify in pgAdmin

| What to Check | Where |
|---|---|
| 5 Tables | Schemas → public → Tables |
| 5 ENUM Types | Schemas → public → Types |
| 8 Trigger Functions | Schemas → public → Functions |
| 6 Drone Triggers | Tables → drones → Triggers |
| 2 Flight Triggers | Tables → flight_logs → Triggers |
| 1 VIEW | Schemas → public → Views → `fleet_overview` |
| Foreign Keys | Tables → flight_logs → Constraints |
| UNIQUE Constraint | Tables → operators → Constraints |

---

## Complete Demo Flow (~15 min)

### Phase 1 — Schema Overview (pgAdmin, 2 min)
1. Show 5 tables, 5 ENUMs, 8 trigger functions, 1 VIEW in pgAdmin
2. Show FK constraints, UNIQUE constraint, ON DELETE CASCADE/SET NULL

### Phase 2 — Landing Page + Dashboard (2 min)
3. Open app → watch cinematic preloader with flying drone animation
4. Click "Enter Command Center" → Dashboard loads
5. Point out KPI tiles (each is `SELECT COUNT(*)`)
6. Point out Fleet Distribution panel (`GROUP BY status`)
7. Scroll to **Fleet Overview** table — explain it queries a PostgreSQL VIEW

### Phase 3 — Drones CRUD + Triggers #1, #2, #6 (3 min)
8. Add Drone with battery `150` → trigger clamps to 100
9. Check Maintenance → "Initial Check" auto-created
10. Try adding duplicate drone name → rejected by API
11. Delete a drone → "Drone Deleted" audit log appears

### Phase 4 — Operators + UNIQUE Constraint (1 min)
12. Add operator, then try duplicate license → UNIQUE error

### Phase 5 — Orders + Drone Assignment (2 min)
13. Create order → status = PENDING
14. Assign drone → order = ASSIGNED, drone = IN_DELIVERY
15. Use status filter pills to demonstrate WHERE clause

### Phase 6 — Trigger Simulation (4 min)
16. **Battery Drain**: Insert flight log → battery -10%, drone = IN_DELIVERY
17. **Set Battery**: Drag below 20% → auto-MAINTENANCE
18. **Complete Flight**: End flight → order = DELIVERED, drone = AVAILABLE, confetti 🎉
19. **Block Deletion**: Try deleting IN_DELIVERY drone → SQLSTATE 45000 error

### Phase 7 — Charging System (1 min)
20. Find drone with battery < 30% → click "Charge" → status = CHARGING
21. Click "Ready" → status = AVAILABLE

---

## DBMS Features Checklist (27 Features)

| # | Feature | Where |
|---|---|---|
| 1 | Schema Design (5 normalized tables, 3NF) | pgAdmin |
| 2 | Custom ENUM types (5) | pgAdmin → Types |
| 3 | Primary Keys (SERIAL auto-increment) | Every table |
| 4 | Foreign Keys (referential integrity) | flight_logs, orders, maintenance_records |
| 5 | ON DELETE CASCADE | flight_logs.drone_id, flight_logs.operator_id |
| 6 | ON DELETE SET NULL | orders.assigned_drone_id, maintenance_records.drone_id |
| 7 | DEFAULT values | battery_level=100, status='AVAILABLE', created_at=NOW() |
| 8 | UNIQUE constraints | operators.license_number |
| 9 | NOT NULL constraints | Most columns |
| 10 | CRUD — CREATE (INSERT) | Add Drone, Add Operator, New Order, Log Maintenance |
| 11 | CRUD — READ (SELECT) | All table pages, Dashboard |
| 12 | CRUD — UPDATE (UPDATE) | Assign Drone, Complete Flight, Set Battery, Charge |
| 13 | CRUD — DELETE (DELETE) | Delete buttons on every table |
| 14 | Aggregate Queries (COUNT, GROUP BY) | Dashboard stats + Fleet Distribution |
| 15 | Filtering (WHERE) | Orders status filter, Flights filter |
| 16 | Ordering (ORDER BY DESC) | Orders, Maintenance (newest first) |
| 17 | JOIN (LEFT JOIN) | fleet_overview VIEW |
| 18 | PostgreSQL VIEW | fleet_overview — visible on Dashboard |
| 19 | BEFORE INSERT Trigger | before_insert_drone (battery clamp) |
| 20 | AFTER INSERT Trigger | after_insert_drone (auto maintenance) |
| 21 | BEFORE UPDATE Trigger | before_update_drone (validate + auto-maint) |
| 22 | AFTER UPDATE Trigger | after_update_drone (audit log) |
| 23 | BEFORE DELETE Trigger | before_delete_drone (block active deletion) |
| 24 | AFTER DELETE Trigger | after_delete_drone (deletion audit) |
| 25 | AFTER INSERT on flight_logs | trg_battery_drain_on_flight |
| 26 | AFTER UPDATE on flight_logs | trg_complete_delivery |
| 27 | PL/pgSQL Stored Functions (8) | All trigger functions |
| 28 | SQLSTATE Error Handling | 45000 errors surfaced as HTTP 400 |
| 29 | RETURNING clause | All INSERT/UPDATE/DELETE return affected rows |
| 30 | API-level Validation | Duplicate drone name prevention |
