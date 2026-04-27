import { Router } from 'express';
import { db } from '../db/index.js';
import { drones } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

/**
 * Helper: detect PostgreSQL trigger errors (SQLSTATE 45000)
 * and return user-friendly HTTP 400 responses.
 */
function handleDbError(err: any, res: any) {
  // PostgreSQL RAISE EXCEPTION with ERRCODE = '45000'
  if (err.code === '45000' || err.message?.includes('45000')) {
    // Extract the clean message from the error
    const msg = err.message?.replace(/^.*ERROR:\s*/, '').split('\n')[0] || err.message;
    return res.status(400).json({ error: `⚠️ Trigger Error: ${msg}` });
  }
  return res.status(500).json({ error: err.message });
}

// GET /api/drones — list all drones
router.get('/', async (_req, res) => {
  try {
    const all = await db.select().from(drones);
    res.json(all);
  } catch (err: any) {
    handleDbError(err, res);
  }
});

// GET /api/drones/:id — get one drone
router.get('/:id', async (req, res) => {
  try {
    const [drone] = await db.select().from(drones).where(eq(drones.id, Number(req.params.id)));
    if (!drone) return res.status(404).json({ error: 'Drone not found' });
    res.json(drone);
  } catch (err: any) {
    handleDbError(err, res);
  }
});

// POST /api/drones — create drone
// Trigger: before_insert_drone clamps battery to 0-100
// Trigger: after_insert_drone auto-creates maintenance record
router.post('/', async (req, res) => {
  try {
    const { model, batteryLevel, status, lastMaintenance } = req.body;
    
    // Check if drone with same model already exists
    const [existingDrone] = await db.select().from(drones).where(eq(drones.model, model));
    if (existingDrone) {
      return res.status(400).json({ error: 'A drone with this name already exists in the fleet' });
    }

    const [created] = await db.insert(drones).values({
      model,
      batteryLevel: batteryLevel ?? 100,
      status: status ?? 'AVAILABLE',
      lastMaintenance: lastMaintenance ?? null,
    }).returning();
    res.status(201).json(created);
  } catch (err: any) {
    handleDbError(err, res);
  }
});

// PUT /api/drones/:id — update drone
// Trigger: before_update_drone validates battery & auto-maintenance
// Trigger: after_update_drone logs status changes
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
    handleDbError(err, res);
  }
});

// DELETE /api/drones/:id — delete drone
// Trigger: before_delete_drone blocks if IN_DELIVERY
// Trigger: after_delete_drone logs audit record
router.delete('/:id', async (req, res) => {
  try {
    const [deleted] = await db.delete(drones)
      .where(eq(drones.id, Number(req.params.id)))
      .returning();
    if (!deleted) return res.status(404).json({ error: 'Drone not found' });
    res.json(deleted);
  } catch (err: any) {
    handleDbError(err, res);
  }
});

export default router;
