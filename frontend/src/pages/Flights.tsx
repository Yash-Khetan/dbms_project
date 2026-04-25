import { useQuery } from "@tanstack/react-query";
import { fetchFlights } from "@/api/flights";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { formatDateTime, calculateDuration } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export function Flights() {
  const { data: flights, isLoading } = useQuery({
    queryKey: ['flights'],
    queryFn: () => fetchFlights(),
  });

  const columns = [
    { header: "Flight ID", accessor: (row: any) => `#${row.id.toString().padStart(4, '0')}` },
    { header: "Drone", accessor: (row: any) => `Drone #${row.droneId}` },
    { header: "Operator", accessor: (row: any) => `Operator #${row.operatorId}` },
    { header: "Order", accessor: (row: any) => row.orderId ? `Order #${row.orderId}` : "—" },
    { header: "Start", accessor: (row: any) => formatDateTime(row.startTime) },
    { header: "End", accessor: (row: any) => formatDateTime(row.endTime) },
    { header: "Duration", accessor: (row: any) => <span className="font-mono text-cyan-400">{calculateDuration(row.startTime, row.endTime)}</span> },
    { header: "Status", accessor: (row: any) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-syne text-2xl font-bold text-white mb-2">Flight Logs</h1>
          <p className="text-slate-400 text-sm font-mono">System-generated records of all flight telemetry and activity.</p>
        </div>
      </div>

      <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-4 py-3 rounded-lg flex items-start gap-3 text-sm">
        <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
        <p>Flight logs are system-generated and read-only. Creating a flight log triggers automatic battery drain calculations. Completing a flight log triggers delivery status updates.</p>
      </div>

      {isLoading ? (
        <LoadingSkeleton className="h-96 w-full" />
      ) : (
        <DataTable data={flights || []} columns={columns} keyExtractor={(f) => f.id} />
      )}
    </div>
  );
}
