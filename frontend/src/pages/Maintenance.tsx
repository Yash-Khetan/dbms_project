import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMaintenance } from "@/api/maintenance";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Timeline } from "@/components/ui/Timeline";
import { formatDate } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

export function Maintenance() {
  const [selectedDroneId, setSelectedDroneId] = useState<number | null>(null);

  const { data: records, isLoading } = useQuery({
    queryKey: ['maintenance'],
    queryFn: fetchMaintenance,
  });

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
    </div>
  );
}
