import { Drone, updateDrone } from "@/api/drones";
import { StatusBadge } from "./StatusBadge";
import { BatteryBar } from "./BatteryBar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Zap, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

interface DroneCardProps {
  drone: Drone;
}

export function DroneCard({ drone }: DroneCardProps) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: updateDrone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drones'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast.success("Drone status updated");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to update drone");
    }
  });

  return (
    <div className="glass-card p-4 flex flex-col gap-4 min-w-[280px]">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-white">{drone.model}</h3>
          <p className="font-mono text-xs text-slate-400">ID: #{drone.id.toString().padStart(4, '0')}</p>
        </div>
        <StatusBadge status={drone.status} />
      </div>
      <div>
        <BatteryBar level={drone.batteryLevel} />
      </div>
      <div className="flex items-center justify-between text-xs font-mono text-slate-500 mt-auto pt-2 border-t border-white/5">
        <span>Maint: {drone.lastMaintenance ? drone.lastMaintenance : "Never"}</span>
        
        {/* Quick Actions */}
        <div className="flex gap-2">
          {(drone.status === 'AVAILABLE' || drone.status === 'MAINTENANCE') && drone.batteryLevel < 30 && (
            <button
              onClick={() => updateMutation.mutate({ id: drone.id, status: 'CHARGING' })}
              disabled={updateMutation.isPending}
              className="flex items-center gap-1 text-amber-400 hover:text-amber-300 transition-colors bg-amber-400/10 hover:bg-amber-400/20 px-2 py-1 rounded"
              title="Send to Charger"
            >
              <Zap className="w-3 h-3" /> Charge
            </button>
          )}
          {drone.status === 'CHARGING' && (
            <button
              onClick={() => updateMutation.mutate({ id: drone.id, status: 'AVAILABLE' })}
              disabled={updateMutation.isPending}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-400/10 hover:bg-emerald-400/20 px-2 py-1 rounded"
              title="Mark as Available"
            >
              <CheckCircle2 className="w-3 h-3" /> Available
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
