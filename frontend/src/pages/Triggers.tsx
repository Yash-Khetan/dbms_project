import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { fetchDrones } from "@/api/drones";
import { fetchFlights } from "@/api/flights";
import { 
  simulateBatteryDrain, 
  simulateCompleteDelivery, 
  simulateSetBattery,
  fetchTriggerSQL
} from "@/api/simulate";
import { BatteryGauge } from "@/components/ui/BatteryGauge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Zap, CheckCircle2, BatteryWarning } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export function Triggers() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"drain" | "complete" | "lowBat">("drain");

  // Fetch base data
  const { data: drones } = useQuery({ queryKey: ['drones'], queryFn: fetchDrones });
  const { data: flights } = useQuery({ queryKey: ['flights'], queryFn: () => fetchFlights() });
  const { data: sqlData } = useQuery({ queryKey: ['triggerSQL'], queryFn: fetchTriggerSQL });

  // Panel 1: Battery Drain
  const [drainDroneId, setDrainDroneId] = useState<number | "">("");
  const drainDrone = drones?.find(d => d.id === drainDroneId);
  const drainMut = useMutation({
    mutationFn: simulateBatteryDrain,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['drones'] });
      if (data.triggerFired) {
        toast.error("TRIGGER FIRED: Drone auto-flagged for maintenance");
      } else {
        toast.success("Flight log inserted, battery drained by 10%");
      }
    }
  });

  // Panel 2: Complete Delivery
  const inProgressFlights = flights?.filter(f => f.status === 'IN_PROGRESS' || !f.endTime) || [];
  const [completeFlightId, setCompleteFlightId] = useState<number | "">("");
  const completeFlight = inProgressFlights.find(f => f.id === completeFlightId);
  const completeMut = useMutation({
    mutationFn: simulateCompleteDelivery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drones'] });
      queryClient.invalidateQueries({ queryKey: ['flights'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setCompleteFlightId("");
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00D4FF', '#00E396']
      });
      toast.success("Flight completed, trigger updated status");
    }
  });

  // Panel 3: Set Battery
  const [batDroneId, setBatDroneId] = useState<number | "">("");
  const batDrone = drones?.find(d => d.id === batDroneId);
  const [sliderVal, setSliderVal] = useState<number>(100);
  
  useEffect(() => {
    if (batDrone) setSliderVal(batDrone.batteryLevel);
  }, [batDroneId, batDrone?.batteryLevel]);

  const batMut = useMutation({
    mutationFn: (lvl: number) => simulateSetBattery(Number(batDroneId), lvl),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['drones'] });
      if (data.triggerFired) {
        toast.error("TRIGGER FIRED: Low battery, status changed to MAINTENANCE");
      }
    }
  });

  // Debounced slider change
  useEffect(() => {
    if (!batDroneId || sliderVal === batDrone?.batteryLevel) return;
    const timer = setTimeout(() => {
      batMut.mutate(sliderVal);
    }, 400);
    return () => clearTimeout(timer);
  }, [sliderVal, batDroneId]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-syne text-3xl font-bold text-white mb-2 uppercase tracking-widest">Database Trigger Simulation</h1>
        <p className="text-slate-400 text-sm font-mono max-w-2xl">
          Live demonstration of PostgreSQL PL/pgSQL triggers. Actions here directly mutate the database, and the UI immediately re-fetches the real state.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-4">
        {[
          { id: "drain", label: "Battery Drain (AFTER INSERT)", icon: <Zap size={16} /> },
          { id: "complete", label: "Delivery Complete (AFTER UPDATE)", icon: <CheckCircle2 size={16} /> },
          { id: "lowBat", label: "Auto-Maintenance (BEFORE UPDATE)", icon: <BatteryWarning size={16} /> }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
              activeTab === t.id 
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/50" 
                : "bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10"
            )}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Panel 1 */}
        {activeTab === "drain" && (
          <>
            <div className="glass-card p-6 border-t-4 border-t-cyan-500">
              <h2 className="font-syne text-xl font-bold text-white mb-6">Simulate Flight Log Insert</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-2">TARGET DRONE</label>
                  <select 
                    className="input-field" 
                    value={drainDroneId} 
                    onChange={e => setDrainDroneId(Number(e.target.value))}
                  >
                    <option value="" disabled>Select a drone</option>
                    {drones?.map(d => <option key={d.id} value={d.id}>{d.model} (ID: {d.id})</option>)}
                  </select>
                </div>
                
                {drainDrone && (
                  <div className="flex justify-center py-4 relative">
                    <BatteryGauge level={drainDrone.batteryLevel} size={200} />
                    {drainMut.isPending && (
                      <div className="absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-sm z-10">
                        <span className="animate-pulse font-mono text-cyan-500 font-bold">EXECUTING...</span>
                      </div>
                    )}
                  </div>
                )}
                
                <button 
                  className="btn-primary w-full py-4 text-lg"
                  disabled={!drainDroneId || drainMut.isPending}
                  onClick={() => drainMut.mutate(Number(drainDroneId))}
                >
                  INSERT FLIGHT LOG
                </button>
              </div>
            </div>
            <div className="h-full">
              <CodeBlock code={sqlData?.batteryDrain || "-- Loading SQL..."} />
            </div>
          </>
        )}

        {/* Panel 2 */}
        {activeTab === "complete" && (
          <>
            <div className="glass-card p-6 border-t-4 border-t-amber-500">
              <h2 className="font-syne text-xl font-bold text-white mb-6">Complete Delivery Flight</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-2">ACTIVE FLIGHTS</label>
                  <select 
                    className="input-field" 
                    value={completeFlightId} 
                    onChange={e => setCompleteFlightId(Number(e.target.value))}
                  >
                    <option value="" disabled>Select an IN_PROGRESS flight</option>
                    {inProgressFlights.map(f => <option key={f.id} value={f.id}>Flight #{f.id} (Drone #{f.droneId})</option>)}
                  </select>
                </div>
                
                {completeFlight && (
                  <div className="p-6 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-8">
                    <div className="text-center">
                      <div className="text-xs font-mono text-slate-500 mb-2">Flight Status</div>
                      <StatusBadge status={completeFlight.status} className="text-sm px-4 py-1" />
                    </div>
                  </div>
                )}
                
                <button 
                  className={cn("btn-primary w-full py-4 text-lg !bg-amber-500 hover:!bg-amber-400 text-black", !completeFlightId && "opacity-50")}
                  disabled={!completeFlightId || completeMut.isPending}
                  onClick={() => completeMut.mutate(Number(completeFlightId))}
                >
                  COMPLETE FLIGHT (SET end_time)
                </button>
              </div>
            </div>
            <div className="h-full">
              <CodeBlock code={sqlData?.completeDelivery || "-- Loading SQL..."} />
            </div>
          </>
        )}

        {/* Panel 3 */}
        {activeTab === "lowBat" && (
          <>
            <div className="glass-card p-6 border-t-4 border-t-crimson-500 relative overflow-hidden">
              <h2 className="font-syne text-xl font-bold text-white mb-6">Auto-Maintenance Threshold</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-2">TARGET DRONE</label>
                  <select 
                    className="input-field" 
                    value={batDroneId} 
                    onChange={e => setBatDroneId(Number(e.target.value))}
                  >
                    <option value="" disabled>Select a drone</option>
                    {drones?.map(d => <option key={d.id} value={d.id}>{d.model} (ID: {d.id})</option>)}
                  </select>
                </div>
                
                {batDrone && (
                  <div className="flex flex-col items-center gap-6 py-4">
                    <BatteryGauge level={sliderVal} size={200} />
                    <div className="w-full px-8">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={sliderVal}
                        onChange={(e) => setSliderVal(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                    </div>
                    <div className="flex gap-4 items-center">
                      <span className="text-slate-400 font-mono text-sm">Status:</span>
                      <StatusBadge status={batDrone.status} />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="h-full">
              <CodeBlock code={sqlData?.lowBattery || "-- Loading SQL..."} />
            </div>
          </>
        )}
      </div>

      {/* Trigger Summary Table */}
      <div className="glass-card overflow-hidden mt-8">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>Trigger Name</th>
              <th>Timing & Event</th>
              <th>Table</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-bold text-cyan-400">trg_battery_drain_on_flight</td>
              <td>AFTER INSERT</td>
              <td>flight_logs</td>
              <td>Drains drone battery by 10% when a new flight starts. Auto-flags for maintenance if below 20%.</td>
            </tr>
            <tr>
              <td className="font-bold text-amber-400">trg_complete_delivery</td>
              <td>AFTER UPDATE</td>
              <td>flight_logs</td>
              <td>When end_time is set, automatically marks the order as DELIVERED and frees the drone.</td>
            </tr>
            <tr>
              <td className="font-bold text-crimson-400">trg_low_battery_auto_maintenance</td>
              <td>BEFORE UPDATE</td>
              <td>drones</td>
              <td>Intercepts battery level updates. If dropping below 20%, forces drone status to MAINTENANCE.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
