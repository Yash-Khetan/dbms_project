import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import dronesRouter from './routes/drones.js';
import ordersRouter from './routes/orders.js';
import operatorsRouter from './routes/operators.js';
import flightsRouter from './routes/flights.js';
import maintenanceRouter from './routes/maintenance.js';
import simulateRouter from './routes/simulate.js';
import statsRouter from './routes/stats.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ──────────────────────────────────────────
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────
app.use('/api/drones', dronesRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/operators', operatorsRouter);
app.use('/api/flights', flightsRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/simulate', simulateRouter);
app.use('/api/stats', statsRouter);

// ─── Health check ───────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Start ──────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Drone Ops API running at http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});
