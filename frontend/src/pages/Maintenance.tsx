import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMaintenance, deleteMaintenance } from "@/api/maintenance";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Timeline } from "@/components/ui/Timeline";
import { AddMaintenanceDialog } from "@/components/ui/AddMaintenanceDialog";
import { formatDate } from "@/lib/utils";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export function Maintenance() {
  const queryClient = useQueryClient();
  const [selectedDroneId, setSelectedDroneId] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: records, isLoading } = useQuery({
    queryKey: ['maintenance'],
    queryFn: fetchMaintenance,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      toast.success("Maintenance record deleted");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to delete record");
    }
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this maintenance record?")) {
      deleteMutation.mutate(id);
    }
  };

  const overdueCount = records?.filter(r => {
    if (r.repairStatus !== 'PENDING') return false;
    const diffDays = (new Date().getTime() - new Date(r.maintenanceDate).getTime()) / (1000 * 3600 * 24);
    return diffDays > 7;
  }).length || 0;

  const columns = [
    { header: "ID", accessor: (row: any) => `#${row.id.toString().padStart(4, '0')}` },
    { header: "Drone", accessor: (row: any) => `Drone #${row.droneId}` },
    { header: "Date", accessor: (row: any) => formatDate(row.maintenanceDate) },
    { header: "Issue", accessor: "issueReported" as const },
    { header: "Status", accessor: (row: any) => <StatusBadge status={row.repairStatus} /> },
    { header: "Actions", accessor: (row: any) => (
      <button 
        onClick={() => handleDelete(row.id)}
        disabled={deleteMutation.isPending}
        className="text-slate-400 hover:text-red-400 transition-colors p-1"
        title="Delete Record"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    )},
  ];

  // For timeline
  const uniqueDroneIds = Array.from(new Set(records?.map(r => r.droneId) || []));
  const timelineEvents = selectedDroneId 
    ? records?.filter(r => r.droneId === selectedDroneId).map(r => ({
        id: r.id,
        date: r.maintenanceDate,
        title: r.issueReported,
        description: r.technicianNotes || "",
        status: r.repairStatus
      })) || []
    : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-syne text-2xl font-bold text-white mb-2">Maintenance Records</h1>
          <p className="text-slate-400 text-sm font-mono">Service history and repair logs for fleet assets.</p>
        </div>
        <button 
          onClick={() => setIsAddDialogOpen(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Log Maintenance
        </button>
      </div>

      {overdueCount > 0 && (
        <div className="bg-crimson-500/10 border border-crimson-500/50 text-crimson-400 px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-bold">
          <AlertTriangle size={18} />
          <span>⚠️ {overdueCount} maintenance record(s) are overdue (Pending &gt; 7 days).</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          {isLoading ? (
            <LoadingSkeleton className="h-96 w-full" />
          ) : (
            <DataTable data={records || []} columns={columns} keyExtractor={(r) => r.id} />
          )}
        </div>

        <div className="glass-card p-6 h-fit">
          <h3 className="font-syne text-lg font-bold text-white mb-4">Maintenance Timeline</h3>
          <div className="mb-6">
            <select 
              className="input-field appearance-none cursor-pointer"
              value={selectedDroneId || ""}
              onChange={(e) => setSelectedDroneId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="" disabled>Select Drone to view history</option>
              {uniqueDroneIds.map(id => (
                <option key={id} value={id}>Drone #{id}</option>
              ))}
            </select>
          </div>

          {selectedDroneId ? (
            <Timeline events={timelineEvents} />
          ) : (
            <div className="text-center py-12 text-slate-500 font-mono text-sm border border-dashed border-white/10 rounded-lg">
              Select a drone to view timeline
            </div>
          )}
        </div>
      </div>

      <AddMaintenanceDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
      />
    </div>
  );
}
