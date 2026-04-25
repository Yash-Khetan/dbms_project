"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var index_js_1 = require("./index.js");
var schema_js_1 = require("./schema.js");
function seed() {
    return __awaiter(this, void 0, void 0, function () {
        var droneData, operatorData, orderData, maintenanceData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🌱 Seeding database...\n');
                    droneData = [
                        { model: 'DJI Matrice 300 RTK', batteryLevel: 95, status: 'AVAILABLE', lastMaintenance: '2026-04-10' },
                        { model: 'Skydio X10', batteryLevel: 72, status: 'AVAILABLE', lastMaintenance: '2026-04-15' },
                        { model: 'Wingcopter 198', batteryLevel: 45, status: 'IN_DELIVERY', lastMaintenance: '2026-03-28' },
                        { model: 'Zipline P2', batteryLevel: 18, status: 'MAINTENANCE', lastMaintenance: '2026-04-01' },
                        { model: 'EHang 216', batteryLevel: 88, status: 'CHARGING', lastMaintenance: '2026-04-20' },
                        { model: 'Flytrex F100', batteryLevel: 60, status: 'AVAILABLE', lastMaintenance: '2026-04-12' },
                        { model: 'Matternet M2', batteryLevel: 33, status: 'IN_DELIVERY', lastMaintenance: '2026-03-25' },
                        { model: 'Volansi VOLY C10', batteryLevel: 100, status: 'AVAILABLE', lastMaintenance: '2026-04-22' },
                    ];
                    return [4 /*yield*/, index_js_1.db.insert(schema_js_1.drones).values(droneData)];
                case 1:
                    _a.sent();
                    console.log("  \u2705 Inserted ".concat(droneData.length, " drones"));
                    operatorData = [
                        { name: 'Alex Rivera', licenseNumber: 'DOP-2024-001', experienceLevel: 'SENIOR', totalFlights: 142 },
                        { name: 'Priya Sharma', licenseNumber: 'DOP-2024-002', experienceLevel: 'SENIOR', totalFlights: 98 },
                        { name: 'James Chen', licenseNumber: 'DOP-2024-003', experienceLevel: 'INTERMEDIATE', totalFlights: 56 },
                        { name: 'Maria Lopez', licenseNumber: 'DOP-2024-004', experienceLevel: 'INTERMEDIATE', totalFlights: 41 },
                        { name: 'Yuki Tanaka', licenseNumber: 'DOP-2024-005', experienceLevel: 'JUNIOR', totalFlights: 12 },
                        { name: 'Omar Hassan', licenseNumber: 'DOP-2024-006', experienceLevel: 'JUNIOR', totalFlights: 7 },
                    ];
                    return [4 /*yield*/, index_js_1.db.insert(schema_js_1.operators).values(operatorData)];
                case 2:
                    _a.sent();
                    console.log("  \u2705 Inserted ".concat(operatorData.length, " operators"));
                    orderData = [
                        { customerName: 'Sarah Johnson', deliveryAddress: '742 Evergreen Terrace, Springfield', packageWeightKg: '2.50', status: 'PENDING' },
                        { customerName: 'Michael Brown', deliveryAddress: '221B Baker Street, London', packageWeightKg: '1.20', status: 'PENDING' },
                        { customerName: 'Emily Davis', deliveryAddress: '1600 Pennsylvania Ave, Washington DC', packageWeightKg: '3.75', status: 'ASSIGNED', assignedDroneId: 3 },
                        { customerName: 'David Wilson', deliveryAddress: '350 Fifth Avenue, New York', packageWeightKg: '0.80', status: 'IN_TRANSIT', assignedDroneId: 3 },
                        { customerName: 'Lisa Anderson', deliveryAddress: '1 Infinite Loop, Cupertino', packageWeightKg: '4.20', status: 'DELIVERED', assignedDroneId: 1 },
                        { customerName: 'Robert Taylor', deliveryAddress: '1 Hacker Way, Menlo Park', packageWeightKg: '1.60', status: 'DELIVERED', assignedDroneId: 2 },
                        { customerName: 'Jennifer Martin', deliveryAddress: '1 Apple Park Way, Cupertino', packageWeightKg: '2.10', status: 'CANCELLED' },
                        { customerName: 'Kevin Lee', deliveryAddress: '400 Broad Street, Seattle', packageWeightKg: '5.00', status: 'PENDING' },
                    ];
                    return [4 /*yield*/, index_js_1.db.insert(schema_js_1.orders).values(orderData)];
                case 3:
                    _a.sent();
                    console.log("  \u2705 Inserted ".concat(orderData.length, " orders"));
                    maintenanceData = [
                        { droneId: 4, maintenanceDate: '2026-04-20', issueReported: 'Battery cell degradation detected', repairStatus: 'IN_PROGRESS', technicianNotes: 'Replacing battery pack, estimated 2 days' },
                        { droneId: 7, maintenanceDate: '2026-04-18', issueReported: 'GPS module intermittent signal loss', repairStatus: 'PENDING', technicianNotes: null },
                        { droneId: 1, maintenanceDate: '2026-04-10', issueReported: 'Routine 500-hour inspection', repairStatus: 'COMPLETED', technicianNotes: 'All systems nominal, firmware updated' },
                        { droneId: 3, maintenanceDate: '2026-03-28', issueReported: 'Propeller motor #3 vibration anomaly', repairStatus: 'COMPLETED', technicianNotes: 'Motor replaced, test flight successful' },
                        { droneId: 5, maintenanceDate: '2026-04-15', issueReported: 'Obstacle avoidance sensor calibration required', repairStatus: 'COMPLETED', technicianNotes: 'Sensors recalibrated, passing all tests' },
                    ];
                    return [4 /*yield*/, index_js_1.db.insert(schema_js_1.maintenanceRecords).values(maintenanceData)];
                case 4:
                    _a.sent();
                    console.log("  \u2705 Inserted ".concat(maintenanceData.length, " maintenance records"));
                    console.log('\n✨ Database seeded successfully!');
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    });
}
seed().catch(function (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
