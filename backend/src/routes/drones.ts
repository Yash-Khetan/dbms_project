import { Router } from 'express';
import { db } from '../db/index.js';
import { drones } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

// GET /api/drones — list all drones
router.get('/', async (_req, res) => {
  try {
    const all = await db.select().from(drones);
    res.json(all);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/drones/:id — get one drone
router.get('/:id', async (req, res) => {
  try {
    const [drone] = await db.select().from(drones).where(eq(drones.id, Number(req.params.id)));
    if (!drone) return res.status(404).json({ error: 'Drone not found' });
    res.json(drone);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/drones — create drone
router.post('/', async (req, res) => {
  try {
    const { model, batteryLevel, status, lastMaintenance } = req.body;
    const [created] = await db.insert(drones).values({
      model,
      batteryLevel: batteryLevel ?? 100,
      status: status ?? 'AVAILABLE',
      lastMaintenance: lastMaintenance ?? null,
    }).returning();
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/drones/:id — update drone
router.put('/:id', async (req, res) => {
  try {
    const { model, batteryLevel, status, lastMaintenance } = req.body;
    const updates: any = {};
    if (model !== undefined)           updates.model = model;
    if (batteryLevel !== undefined)    updates.batteryLevel = batteryLevel;
    if (status !== undefined)          updates.status = status;
    if (lastMaintenance !== undefined) updates.lastMaintenance = lastMaintenance;

    const [updated] = await db.update(drones)
      .set(updates)
      .where(eq(drones.id, Number(req.params.id)))
      .returning();

    if (!updated) return res.status(404).json({ error: 'Drone not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/drones/:id — delete drone
router.delete('/:id', async (req, res) => {
  try {
    const [deleted] = await db.delete(drones)
      .where(eq(drones.id, Number(req.params.id)))
      .returning();
    if (!deleted) return res.status(404).json({ error: 'Drone not found' });
    res.json(deleted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
