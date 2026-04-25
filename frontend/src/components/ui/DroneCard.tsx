import { Drone } from "@/api/drones";
import { StatusBadge } from "./StatusBadge";
import { BatteryBar } from "./BatteryBar";

interface DroneCardProps {
  drone: Drone;
}

export function DroneCard({ drone }: DroneCardProps) {
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
      <div className="text-xs font-mono text-slate-500 mt-auto pt-2 border-t border-white/5">
        Maint: {drone.lastMaintenance ? drone.lastMaintenance : "Never"}
      </div>
    </div>
  );
}
