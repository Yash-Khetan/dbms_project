import { apiFetch } from './client';

export interface Order {
  id: number;
  customerName: string;
  deliveryAddress: string;
  packageWeightKg: string;
  status: 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  assignedDroneId: number | null;
  createdAt: string;
}

export const fetchOrders = async (status?: string): Promise<Order[]> => {
  const url = status ? `/orders?status=${encodeURIComponent(status)}` : '/orders';
  return apiFetch<Order[]>(url);
};

export const createOrder = async (order: Partial<Order>): Promise<Order> => {
  return apiFetch<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  });
};

export const updateOrder = async (order: Partial<Order>): Promise<Order> => {
  return apiFetch<Order>(`/orders/${order.id}`, {
    method: 'PUT',
    body: JSON.stringify(order),
  });
};

export const assignDrone = async ({ orderId, droneId }: { orderId: number; droneId: number }): Promise<Order> => {
  return apiFetch<Order>(`/orders/${orderId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ droneId }),
  });
};

export const deleteOrder = async (id: number): Promise<void> => {
  return apiFetch<void>(`/orders/${id}`, {
    method: 'DELETE',
  });
};
