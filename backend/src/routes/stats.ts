import { Router } from 'express';
import { db } from '../db/index.js';
import { drones, orders, flightLogs } from '../db/schema.js';
import { eq, sql, count } from 'drizzle-orm';

const router = Router();

// GET /api/stats/dashboard — aggregate dashboard stats
router.get('/dashboard', async (_req, res) => {
  try {
    // Total drones
    const [{ value: totalDrones }] = await db
      .select({ value: count() })
      .from(drones);

    // Active deliveries (drones with IN_DELIVERY status)
    const [{ value: activeDeliveries }] = await db
      .select({ value: count() })
      .from(drones)
      .where(eq(drones.status, 'IN_DELIVERY'));

    // Pending orders
    const [{ value: pendingOrders }] = await db
      .select({ value: count() })
      .from(orders)
      .where(eq(orders.status, 'PENDING'));

    // Critical battery (battery < 20)
    const [{ value: criticalBatteryAlerts }] = await db
      .select({ value: count() })
      .from(drones)
      .where(sql`${drones.batteryLevel} < 20`);

    // Drones by status
    const statusCounts = await db
      .select({
        status: drones.status,
        count: count(),
      })
      .from(drones)
      .groupBy(drones.status);

    const dronesByStatus: Record<string, number> = {
      AVAILABLE: 0,
      IN_DELIVERY: 0,
      CHARGING: 0,
      MAINTENANCE: 0,
    };

    for (const row of statusCounts) {
      dronesByStatus[row.status] = Number(row.count);
    }

    res.json({
      totalDrones: Number(totalDrones),
      activeDeliveries: Number(activeDeliveries),
      pendingOrders: Number(pendingOrders),
      criticalBatteryAlerts: Number(criticalBatteryAlerts),
      dronesByStatus,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
// GET /api/stats/fleet-overview — query the fleet_overview VIEW
router.get('/fleet-overview', async (_req, res) => {
  try {
    const rows = await db.execute(sql`SELECT * FROM fleet_overview`);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
