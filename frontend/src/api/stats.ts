import { apiFetch } from './client';

export interface DashboardStats {
  totalDrones: number;
  activeDeliveries: number;
  pendingOrders: number;
  criticalBatteryAlerts: number;
  dronesByStatus: {
    AVAILABLE: number;
    IN_DELIVERY: number;
    CHARGING: number;
    MAINTENANCE: number;
    [key: string]: number;
  };
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  return apiFetch<DashboardStats>('/stats/dashboard');
};
