import { Router } from 'express';
import { db } from '../db/index.js';
import { maintenanceRecords } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

// GET /api/maintenance — list all
router.get('/', async (_req, res) => {
  try {
    const all = await db.select().from(maintenanceRecords).orderBy(maintenanceRecords.maintenanceDate);
    res.json(all);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/maintenance — create
router.post('/', async (req, res) => {
  try {
    const { droneId, maintenanceDate, issueReported, repairStatus, technicianNotes } = req.body;
    const [created] = await db.insert(maintenanceRecords).values({
      droneId,
      maintenanceDate: maintenanceDate ?? new Date().toISOString().split('T')[0],
      issueReported,
      repairStatus: repairStatus ?? 'PENDING',
      technicianNotes: technicianNotes ?? null,
    }).returning();
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/maintenance/:id — update
router.put('/:id', async (req, res) => {
  try {
    const { droneId, maintenanceDate, issueReported, repairStatus, technicianNotes } = req.body;
    const updates: any = {};
    if (droneId !== undefined)         updates.droneId = droneId;
    if (maintenanceDate !== undefined) updates.maintenanceDate = maintenanceDate;
    if (issueReported !== undefined)   updates.issueReported = issueReported;
    if (repairStatus !== undefined)    updates.repairStatus = repairStatus;
    if (technicianNotes !== undefined) updates.technicianNotes = technicianNotes;

    const [updated] = await db.update(maintenanceRecords)
      .set(updates)
      .where(eq(maintenanceRecords.id, Number(req.params.id)))
      .returning();

    if (!updated) return res.status(404).json({ error: 'Maintenance record not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/maintenance/:id — delete
router.delete('/:id', async (req, res) => {
  try {
    const [deleted] = await db.delete(maintenanceRecords)
      .where(eq(maintenanceRecords.id, Number(req.params.id)))
      .returning();
    if (!deleted) return res.status(404).json({ error: 'Maintenance record not found' });
    res.json(deleted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
