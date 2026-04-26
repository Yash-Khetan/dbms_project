import { Router } from 'express';
import { db } from '../db/index.js';
import { operators } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

// GET /api/operators — list all
router.get('/', async (_req, res) => {
  try {
    const all = await db.select().from(operators);
    res.json(all);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/operators/:id — get one operator
router.get('/:id', async (req, res) => {
  try {
    const [operator] = await db.select().from(operators).where(eq(operators.id, Number(req.params.id)));
    if (!operator) return res.status(404).json({ error: 'Operator not found' });
    res.json(operator);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/operators — create operator
router.post('/', async (req, res) => {
  try {
    const { name, licenseNumber, experienceLevel } = req.body;
    const [created] = await db.insert(operators).values({
      name,
      licenseNumber,
      experienceLevel: experienceLevel ?? 'JUNIOR',
    }).returning();
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/operators/:id — update
router.put('/:id', async (req, res) => {
  try {
    const { name, licenseNumber, experienceLevel } = req.body;
    const updates: any = {};
    if (name !== undefined)            updates.name = name;
    if (licenseNumber !== undefined)   updates.licenseNumber = licenseNumber;
    if (experienceLevel !== undefined) updates.experienceLevel = experienceLevel;

    const [updated] = await db.update(operators)
      .set(updates)
      .where(eq(operators.id, Number(req.params.id)))
      .returning();

    if (!updated) return res.status(404).json({ error: 'Operator not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/operators/:id — delete
router.delete('/:id', async (req, res) => {
  try {
    const [deleted] = await db.delete(operators)
      .where(eq(operators.id, Number(req.params.id)))
      .returning();
    if (!deleted) return res.status(404).json({ error: 'Operator not found' });
    res.json(deleted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
