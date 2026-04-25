import { apiFetch } from './client';

export interface Operator {
  id: number;
  name: string;
  licenseNumber: string;
  experienceLevel: 'JUNIOR' | 'INTERMEDIATE' | 'SENIOR';
  totalFlights: number;
}

export const fetchOperators = async (): Promise<Operator[]> => {
  return apiFetch<Operator[]>('/operators');
};

export const createOperator = async (operator: Partial<Operator>): Promise<Operator> => {
  return apiFetch<Operator>('/operators', {
    method: 'POST',
    body: JSON.stringify(operator),
  });
};

export const updateOperator = async (operator: Partial<Operator>): Promise<Operator> => {
  return apiFetch<Operator>(`/operators/${operator.id}`, {
    method: 'PUT',
    body: JSON.stringify(operator),
  });
};

export const deleteOperator = async (id: number): Promise<void> => {
  return apiFetch<void>(`/operators/${id}`, {
    method: 'DELETE',
  });
};
