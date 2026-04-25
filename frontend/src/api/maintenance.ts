import { apiFetch } from './client';

export interface MaintenanceRecord {
  id: number;
  droneId: number;
  maintenanceDate: string;
  issueReported: string;
  repairStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  technicianNotes: string | null;
}

export const fetchMaintenance = async (): Promise<MaintenanceRecord[]> => {
  return apiFetch<MaintenanceRecord[]>('/maintenance');
};

export const createMaintenance = async (record: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> => {
  return apiFetch<MaintenanceRecord>('/maintenance', {
    method: 'POST',
    body: JSON.stringify(record),
  });
};

export const updateMaintenance = async (record: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> => {
  return apiFetch<MaintenanceRecord>(`/maintenance/${record.id}`, {
    method: 'PUT',
    body: JSON.stringify(record),
  });
};

export const deleteMaintenance = async (id: number): Promise<void> => {
  return apiFetch<void>(`/maintenance/${id}`, {
    method: 'DELETE',
  });
};
