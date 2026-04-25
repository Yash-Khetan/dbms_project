import { apiFetch } from './client';

export interface Drone {
  id: number;
  model: string;
  batteryLevel: number;
  status: 'AVAILABLE' | 'IN_DELIVERY' | 'CHARGING' | 'MAINTENANCE';
  lastMaintenance: string | null;
}

export const fetchDrones = async (): Promise<Drone[]> => {
  return apiFetch<Drone[]>('/drones');
};

export const fetchDrone = async (id: number): Promise<Drone> => {
  return apiFetch<Drone>(`/drones/${id}`);
};

export const createDrone = async (drone: Partial<Drone>): Promise<Drone> => {
  return apiFetch<Drone>('/drones', {
    method: 'POST',
    body: JSON.stringify(drone),
  });
};

export const updateDrone = async (drone: Partial<Drone>): Promise<Drone> => {
  return apiFetch<Drone>(`/drones/${drone.id}`, {
    method: 'PUT',
    body: JSON.stringify(drone),
  });
};

export const deleteDrone = async (id: number): Promise<void> => {
  return apiFetch<void>(`/drones/${id}`, {
    method: 'DELETE',
  });
};
