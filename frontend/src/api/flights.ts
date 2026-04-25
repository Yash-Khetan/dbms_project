import { apiFetch } from './client';

export interface FlightLog {
  id: number;
  droneId: number;
  operatorId: number;
  orderId: number | null;
  startTime: string;
  endTime: string | null;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABORTED';
  batteryUsed: number | null;
}

export const fetchFlights = async (filters?: { droneId?: number; operatorId?: number }): Promise<FlightLog[]> => {
  const params = new URLSearchParams();
  if (filters?.droneId) params.append('droneId', filters.droneId.toString());
  if (filters?.operatorId) params.append('operatorId', filters.operatorId.toString());
  
  const queryString = params.toString();
  const url = queryString ? `/flights?${queryString}` : '/flights';
  
  return apiFetch<FlightLog[]>(url);
};

export const createFlight = async (flight: Partial<FlightLog>): Promise<FlightLog> => {
  return apiFetch<FlightLog>('/flights', {
    method: 'POST',
    body: JSON.stringify(flight),
  });
};

export const updateFlight = async (flight: Partial<FlightLog>): Promise<FlightLog> => {
  return apiFetch<FlightLog>(`/flights/${flight.id}`, {
    method: 'PUT',
    body: JSON.stringify(flight),
  });
};
