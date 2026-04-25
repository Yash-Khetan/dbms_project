import { Router } from 'express';
import { db } from '../db/index.js';
import { orders, drones } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

// GET /api/orders — list all orders (optional ?status= filter)
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    if (status && typeof status === 'string') {
      const filtered = await db.select().from(orders)
        .where(eq(orders.status, status as any));
      return res.json(filtered);
    }
    const all = await db.select().from(orders).orderBy(orders.createdAt);
    res.json(all);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id — get one
router.get('/:id', async (req, res) => {
  try {
    const [order] = await db.select().from(orders).where(eq(orders.id, Number(req.params.id)));
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders — create order
router.post('/', async (req, res) => {
  try {
    const { customerName, deliveryAddress, packageWeightKg, status } = req.body;
    const [created] = await db.insert(orders).values({
      customerName,
      deliveryAddress,
      packageWeightKg,
      status: status ?? 'PENDING',
    }).returning();
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/orders/:id — update order
router.put('/:id', async (req, res) => {
  try {
    const { customerName, deliveryAddress, packageWeightKg, status, assignedDroneId } = req.body;
    const updates: any = {};
    if (customerName !== undefined)    updates.customerName = customerName;
    if (deliveryAddress !== undefined) updates.deliveryAddress = deliveryAddress;
    if (packageWeightKg !== undefined) updates.packageWeightKg = packageWeightKg;
    if (status !== undefined)          updates.status = status;
    if (assignedDroneId !== undefined) updates.assignedDroneId = assignedDroneId;

    const [updated] = await db.update(orders)
      .set(updates)
      .where(eq(orders.id, Number(req.params.id)))
      .returning();

    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/orders/:id — delete order
router.delete('/:id', async (req, res) => {
  try {
    const [deleted] = await db.delete(orders)
      .where(eq(orders.id, Number(req.params.id)))
      .returning();
    if (!deleted) return res.status(404).json({ error: 'Order not found' });
    res.json(deleted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders/:id/assign — assign drone to order
router.post('/:id/assign', async (req, res) => {
  try {
    const { droneId } = req.body;
    if (!droneId) return res.status(400).json({ error: 'droneId is required' });

    // Check if drone is available
    const [drone] = await db.select().from(drones).where(eq(drones.id, droneId));
    if (!drone) return res.status(404).json({ error: 'Drone not found' });
    if (drone.status !== 'AVAILABLE') {
      return res.status(400).json({ error: `Drone is ${drone.status}, not AVAILABLE` });
    }

    const [updated] = await db.update(orders)
      .set({ assignedDroneId: droneId, status: 'ASSIGNED' })
      .where(eq(orders.id, Number(req.params.id)))
      .returning();

    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
