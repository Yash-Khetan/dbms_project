import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDrones, deleteDrone } from "@/api/drones";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { BatteryBar } from "@/components/ui/BatteryBar";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { AddDroneDialog } from "@/components/ui/AddDroneDialog";
import { Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";

export function Drones() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [droneToDelete, setDroneToDelete] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: drones, isLoading } = useQuery({
    queryKey: ['drones'],
    queryFn: fetchDrones,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDrone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drones'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      toast.success("Drone deleted successfully. Check Maintenance for audit log.");
      setDroneToDelete(null);
    },
    onError: (err: any) => {
      setDroneToDelete(null);
      const msg = err.response?.data?.error || "Failed to delete drone";
      toast.error(msg, { duration: 5000 });
    }
  });

  const filteredDrones = drones?.filter(d => 
    statusFilter === "ALL" || d.status === statusFilter
  ) || [];

  const columns = [
    { header: "ID", accessor: (row: any) => `#${row.id.toString().padStart(4, '0')}` },
    { header: "Model", accessor: "model" as const },
    { header: "Battery", accessor: (row: any) => <div className="w-32"><BatteryBar level={row.batteryLevel} /></div> },
    { header: "Status", accessor: (row: any) => <StatusBadge status={row.status} /> },
    { header: "Last Maint.", accessor: (row: any) => row.lastMaintenance || "Never" },
    { header: "Actions", accessor: (row: any) => (
      <button 
        onClick={() => setDroneToDelete(row.id)}
        className="p-1.5 rounded text-slate-400 hover:text-crimson-500 hover:bg-crimson-500/10 transition-colors"
        title="Delete"
      >
        <Trash2 size={16} />
      </button>
    )},
  ];

  const statuses = ["ALL", "AVAILABLE", "IN_DELIVERY", "CHARGING", "MAINTENANCE"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-syne text-2xl font-bold text-white mb-2">Drone Fleet</h1>
          <p className="text-slate-400 text-sm font-mono">Manage and monitor all active aerospace assets.</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} /> Add Drone
        </button>
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

      {isLoading ? (
        <LoadingSkeleton className="h-96 w-full" />
      ) : (
        <DataTable data={filteredDrones} columns={columns} keyExtractor={(d) => d.id} />
      )}

      <ConfirmDialog
        open={droneToDelete !== null}
        onClose={() => setDroneToDelete(null)}
        onConfirm={() => {
          if (droneToDelete) deleteMutation.mutate(droneToDelete);
        }}
        title="Delete Drone"
        message="Are you sure you want to delete this drone? This action cannot be undone and will remove all associated flight logs and maintenance records."
      />

      <AddDroneDialog
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
