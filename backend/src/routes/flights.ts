import { Router } from 'express';
import { db } from '../db/index.js';
import { flightLogs } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

const router = Router();

// GET /api/flights — list all (optional ?droneId= ?operatorId= filters)
router.get('/', async (req, res) => {
  try {
    const { droneId, operatorId } = req.query;
    const conditions = [];

    if (droneId)    conditions.push(eq(flightLogs.droneId, Number(droneId)));
    if (operatorId) conditions.push(eq(flightLogs.operatorId, Number(operatorId)));

    let result;
    if (conditions.length > 0) {
      result = await db.select().from(flightLogs).where(and(...conditions));
    } else {
      result = await db.select().from(flightLogs).orderBy(flightLogs.startTime);
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/flights — create flight log (fires trg_battery_drain_on_flight)
router.post('/', async (req, res) => {
  try {
    const { droneId, operatorId, orderId } = req.body;
    const [created] = await db.insert(flightLogs).values({
      droneId,
      operatorId,
      orderId: orderId ?? null,
    }).returning();
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/flights/:id — update flight (setting endTime fires trg_complete_delivery)
router.put('/:id', async (req, res) => {
  try {
    const { endTime, status, batteryUsed } = req.body;
    const updates: any = {};
    if (endTime !== undefined)     updates.endTime = endTime;
    if (status !== undefined)      updates.status = status;
    if (batteryUsed !== undefined) updates.batteryUsed = batteryUsed;

    const [updated] = await db.update(flightLogs)
      .set(updates)
      .where(eq(flightLogs.id, Number(req.params.id)))
      .returning();

    if (!updated) return res.status(404).json({ error: 'Flight not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
