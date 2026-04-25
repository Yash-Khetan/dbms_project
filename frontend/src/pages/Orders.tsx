import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchOrders, assignDrone } from "@/api/orders";
import { fetchDrones } from "@/api/drones";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { SlideOver } from "@/components/ui/SlideOver";
import { formatDateTime } from "@/lib/utils";
import toast from "react-hot-toast";

export function Orders() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [assigningOrder, setAssigningOrder] = useState<number | null>(null);

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => fetchOrders(),
  });

  const { data: drones } = useQuery({
    queryKey: ['drones'],
    queryFn: fetchDrones,
  });

  const assignMutation = useMutation({
    mutationFn: assignDrone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['drones'] });
      setAssigningOrder(null);
      toast.success("Drone assigned successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to assign drone");
    }
  });

  const filteredOrders = orders?.filter(o => 
    statusFilter === "ALL" || o.status === statusFilter
  ) || [];

  const availableDrones = drones?.filter(d => d.status === "AVAILABLE") || [];

  const columns = [
    { header: "Order ID", accessor: (row: any) => `#${row.id.toString().padStart(4, '0')}` },
    { header: "Customer", accessor: "customerName" as const },
    { header: "Address", accessor: (row: any) => <span className="truncate block max-w-[200px]" title={row.deliveryAddress}>{row.deliveryAddress}</span> },
    { header: "Weight", accessor: (row: any) => `${row.packageWeightKg} kg` },
    { header: "Status", accessor: (row: any) => <StatusBadge status={row.status} /> },
    { header: "Created", accessor: (row: any) => formatDateTime(row.createdAt) },
    { header: "Actions", accessor: (row: any) => (
      row.status === 'PENDING' ? (
        <button 
          onClick={() => setAssigningOrder(row.id)}
          className="text-xs btn-outline py-1 px-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
        >
          Assign Drone
        </button>
      ) : (
        <span className="text-xs text-slate-500 font-mono">
          {row.assignedDroneId ? `Drone #${row.assignedDroneId}` : '—'}
        </span>
      )
    )},
  ];

  const statuses = ["ALL", "PENDING", "ASSIGNED", "IN_TRANSIT", "DELIVERED", "CANCELLED"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-syne text-2xl font-bold text-white mb-2">Delivery Orders</h1>
          <p className="text-slate-400 text-sm font-mono">Manage customer delivery queue and dispatch logistics.</p>
        </div>
      </div>

      <div className="flex gap-2">
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-colors ${
              statusFilter === s 
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50" 
                : "bg-transparent text-slate-400 border-white/10 hover:border-white/30"
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {ordersLoading ? (
        <LoadingSkeleton className="h-96 w-full" />
      ) : (
        <DataTable data={filteredOrders} columns={columns} keyExtractor={(o) => o.id} />
      )}

      <SlideOver 
        open={assigningOrder !== null} 
        onClose={() => setAssigningOrder(null)} 
        title={`Assign Drone to Order #${assigningOrder?.toString().padStart(4, '0')}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400 mb-4">Select an available drone for dispatch.</p>
          
          {availableDrones.length === 0 ? (
            <div className="p-4 rounded border border-amber-500/50 bg-amber-500/10 text-amber-400 text-sm">
              No available drones. Wait for a drone to complete delivery or charging.
            </div>
          ) : (
            <div className="grid gap-3">
              {availableDrones.map(drone => (
                <button
                  key={drone.id}
                  onClick={() => assignMutation.mutate({ orderId: assigningOrder!, droneId: drone.id })}
                  disabled={assignMutation.isPending}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-colors text-left"
                >
                  <div>
                    <div className="font-bold text-white">{drone.model}</div>
                    <div className="text-xs font-mono text-slate-400">ID: #{drone.id}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${drone.batteryLevel < 40 ? 'text-crimson-400' : 'text-emerald-400'}`}>
                      {drone.batteryLevel}% Bat
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </SlideOver>
    </div>
  );
}
