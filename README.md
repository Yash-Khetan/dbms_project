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
