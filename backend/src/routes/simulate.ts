import { Router } from 'express';
import { db } from '../db/index.js';
import { drones, flightLogs, orders, operators } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { batteryDrainSQL, completeDeliverySQL, lowBatterySQL } from '../triggers.js';

const router = Router();

// POST /api/simulate/battery-drain
// Insert a flight_log row → triggers trg_battery_drain_on_flight
router.post('/battery-drain', async (req, res) => {
  try {
    const { droneId } = req.body;
    if (!droneId) return res.status(400).json({ error: 'droneId is required' });

    // We need a valid operator — get first one
    const allOperators = await db.select().from(operators).limit(1);
    if (allOperators.length === 0) {
      return res.status(400).json({ error: 'No operators exist — create one first' });
    }

    // Insert flight log — this fires the battery drain trigger
    await db.insert(flightLogs).values({
      droneId: Number(droneId),
      operatorId: allOperators[0].id,
    });

    // Re-fetch drone to get updated state
    const [drone] = await db.select().from(drones).where(eq(drones.id, Number(droneId)));
    if (!drone) return res.status(404).json({ error: 'Drone not found' });

    res.json({
      drone,
      triggerFired: drone.batteryLevel < 20,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/simulate/complete-delivery
// Update flight_logs set endTime = NOW() → triggers trg_complete_delivery
router.post('/complete-delivery', async (req, res) => {
  try {
    const { flightId } = req.body;
    if (!flightId) return res.status(400).json({ error: 'flightId is required' });

    // Update flight with end time
    const [flight] = await db.update(flightLogs)
      .set({ endTime: new Date(), status: 'COMPLETED' })
      .where(eq(flightLogs.id, Number(flightId)))
      .returning();

    if (!flight) return res.status(404).json({ error: 'Flight not found' });

    // Re-fetch related records
    const [drone] = await db.select().from(drones).where(eq(drones.id, flight.droneId));
    const [operator] = await db.select().from(operators).where(eq(operators.id, flight.operatorId));
    let order = null;
    if (flight.orderId) {
      const [o] = await db.select().from(orders).where(eq(orders.id, flight.orderId));
      order = o ?? null;
    }

    res.json({ flight, drone, operator, order });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/simulate/set-battery
// Update drones set batteryLevel → triggers trg_low_battery_auto_maintenance
router.post('/set-battery', async (req, res) => {
  try {
    const { droneId, batteryLevel } = req.body;
    if (!droneId || batteryLevel === undefined) {
      return res.status(400).json({ error: 'droneId and batteryLevel are required' });
    }

    // Update battery level — the BEFORE UPDATE trigger may flip status
    await db.update(drones)
      .set({ batteryLevel: Number(batteryLevel) })
      .where(eq(drones.id, Number(droneId)));

    // Re-fetch to get trigger-modified state
    const [drone] = await db.select().from(drones).where(eq(drones.id, Number(droneId)));
    if (!drone) return res.status(404).json({ error: 'Drone not found' });

    res.json({
      drone,
      triggerFired: drone.status === 'MAINTENANCE',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/simulate/trigger-sql — return trigger SQL for frontend code blocks
router.get('/trigger-sql', (_req, res) => {
  res.json({
    batteryDrain: batteryDrainSQL,
    completeDelivery: completeDeliverySQL,
    lowBattery: lowBatterySQL,
  });
});

export default router;
