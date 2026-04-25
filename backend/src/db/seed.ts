import 'dotenv/config';
import { db } from './index';
import { drones, operators, orders, maintenanceRecords } from './schema';

async function seed() {
  console.log('🌱 Seeding database...\n');

  // Seed drones
  const droneData = [
    { model: 'DJI Matrice 300 RTK',    batteryLevel: 95,  status: 'AVAILABLE'    as const, lastMaintenance: '2026-04-10' },
    { model: 'Skydio X10',             batteryLevel: 72,  status: 'AVAILABLE'    as const, lastMaintenance: '2026-04-15' },
    { model: 'Wingcopter 198',         batteryLevel: 45,  status: 'IN_DELIVERY'  as const, lastMaintenance: '2026-03-28' },
    { model: 'Zipline P2',             batteryLevel: 18,  status: 'MAINTENANCE'  as const, lastMaintenance: '2026-04-01' },
    { model: 'EHang 216',              batteryLevel: 88,  status: 'CHARGING'     as const, lastMaintenance: '2026-04-20' },
    { model: 'Flytrex F100',           batteryLevel: 60,  status: 'AVAILABLE'    as const, lastMaintenance: '2026-04-12' },
    { model: 'Matternet M2',           batteryLevel: 33,  status: 'IN_DELIVERY'  as const, lastMaintenance: '2026-03-25' },
    { model: 'Volansi VOLY C10',       batteryLevel: 100, status: 'AVAILABLE'    as const, lastMaintenance: '2026-04-22' },
  ];

  await db.insert(drones).values(droneData);
  console.log(`  ✅ Inserted ${droneData.length} drones`);

  // Seed operators
  const operatorData = [
    { name: 'Alex Rivera',    licenseNumber: 'DOP-2024-001', experienceLevel: 'SENIOR'       as const, totalFlights: 142 },
    { name: 'Priya Sharma',   licenseNumber: 'DOP-2024-002', experienceLevel: 'SENIOR'       as const, totalFlights: 98 },
    { name: 'James Chen',     licenseNumber: 'DOP-2024-003', experienceLevel: 'INTERMEDIATE' as const, totalFlights: 56 },
    { name: 'Maria Lopez',    licenseNumber: 'DOP-2024-004', experienceLevel: 'INTERMEDIATE' as const, totalFlights: 41 },
    { name: 'Yuki Tanaka',    licenseNumber: 'DOP-2024-005', experienceLevel: 'JUNIOR'       as const, totalFlights: 12 },
    { name: 'Omar Hassan',    licenseNumber: 'DOP-2024-006', experienceLevel: 'JUNIOR'       as const, totalFlights: 7 },
  ];

  await db.insert(operators).values(operatorData);
  console.log(`  ✅ Inserted ${operatorData.length} operators`);

  // Seed orders
  const orderData = [
    { customerName: 'Sarah Johnson',   deliveryAddress: '742 Evergreen Terrace, Springfield',  packageWeightKg: '2.50', status: 'PENDING'    as const },
    { customerName: 'Michael Brown',   deliveryAddress: '221B Baker Street, London',            packageWeightKg: '1.20', status: 'PENDING'    as const },
    { customerName: 'Emily Davis',     deliveryAddress: '1600 Pennsylvania Ave, Washington DC', packageWeightKg: '3.75', status: 'ASSIGNED'   as const, assignedDroneId: 3 },
    { customerName: 'David Wilson',    deliveryAddress: '350 Fifth Avenue, New York',           packageWeightKg: '0.80', status: 'IN_TRANSIT'  as const, assignedDroneId: 3 },
    { customerName: 'Lisa Anderson',   deliveryAddress: '1 Infinite Loop, Cupertino',           packageWeightKg: '4.20', status: 'DELIVERED'   as const, assignedDroneId: 1 },
    { customerName: 'Robert Taylor',   deliveryAddress: '1 Hacker Way, Menlo Park',             packageWeightKg: '1.60', status: 'DELIVERED'   as const, assignedDroneId: 2 },
    { customerName: 'Jennifer Martin', deliveryAddress: '1 Apple Park Way, Cupertino',          packageWeightKg: '2.10', status: 'CANCELLED'   as const },
    { customerName: 'Kevin Lee',       deliveryAddress: '400 Broad Street, Seattle',            packageWeightKg: '5.00', status: 'PENDING'     as const },
  ];

  await db.insert(orders).values(orderData);
  console.log(`  ✅ Inserted ${orderData.length} orders`);

  // Seed maintenance records
  const maintenanceData = [
    { droneId: 4, maintenanceDate: '2026-04-20', issueReported: 'Battery cell degradation detected',               repairStatus: 'IN_PROGRESS' as const, technicianNotes: 'Replacing battery pack, estimated 2 days' },
    { droneId: 7, maintenanceDate: '2026-04-18', issueReported: 'GPS module intermittent signal loss',              repairStatus: 'PENDING'     as const, technicianNotes: null },
    { droneId: 1, maintenanceDate: '2026-04-10', issueReported: 'Routine 500-hour inspection',                     repairStatus: 'COMPLETED'   as const, technicianNotes: 'All systems nominal, firmware updated' },
    { droneId: 3, maintenanceDate: '2026-03-28', issueReported: 'Propeller motor #3 vibration anomaly',            repairStatus: 'COMPLETED'   as const, technicianNotes: 'Motor replaced, test flight successful' },
    { droneId: 5, maintenanceDate: '2026-04-15', issueReported: 'Obstacle avoidance sensor calibration required',   repairStatus: 'COMPLETED'   as const, technicianNotes: 'Sensors recalibrated, passing all tests' },
  ];

  await db.insert(maintenanceRecords).values(maintenanceData);
  console.log(`  ✅ Inserted ${maintenanceData.length} maintenance records`);

  console.log('\n✨ Database seeded successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
