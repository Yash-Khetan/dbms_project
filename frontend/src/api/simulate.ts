import { apiFetch } from './client';
import { Drone } from './drones';
import { FlightLog } from './flights';
import { Operator } from './operators';
import { Order } from './orders';

export const simulateBatteryDrain = async (droneId: number): Promise<{ drone: Drone; triggerFired: boolean }> => {
  return apiFetch<{ drone: Drone; triggerFired: boolean }>('/simulate/battery-drain', {
    method: 'POST',
    body: JSON.stringify({ droneId }),
  });
};

export const simulateCompleteDelivery = async (flightId: number): Promise<{
  flight: FlightLog;
  drone: Drone;
  operator: Operator;
  order: Order | null;
}> => {
  return apiFetch<{
    flight: FlightLog;
    drone: Drone;
    operator: Operator;
    order: Order | null;
  }>('/simulate/complete-delivery', {
    method: 'POST',
    body: JSON.stringify({ flightId }),
  });
};

export const simulateSetBattery = async (droneId: number, batteryLevel: number): Promise<{ drone: Drone; triggerFired: boolean }> => {
  return apiFetch<{ drone: Drone; triggerFired: boolean }>('/simulate/set-battery', {
    method: 'POST',
    body: JSON.stringify({ droneId, batteryLevel }),
  });
};

export interface TriggerSQLData {
  beforeInsertDrone: string;
  afterInsertDrone: string;
  beforeUpdateDrone: string;
  afterUpdateDrone: string;
  beforeDeleteDrone: string;
  afterDeleteDrone: string;
  batteryDrain: string;
  completeDelivery: string;
}

export const fetchTriggerSQL = async (): Promise<TriggerSQLData> => {
  return apiFetch<TriggerSQLData>('/simulate/trigger-sql');
};

