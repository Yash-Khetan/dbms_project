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
import { Zap, CheckCircle2, BatteryWarning, ShieldPlus, Activity, Trash2, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

type TabId = "beforeInsert" | "afterInsert" | "beforeUpdate" | "afterUpdate" | "beforeDelete" | "afterDelete" | "drain" | "complete";

const TABS: { id: TabId; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "beforeInsert", label: "Before Insert", icon: <ShieldPlus size={14} />, color: "text-emerald-400" },
  { id: "afterInsert", label: "After Insert", icon: <FileText size={14} />, color: "text-green-400" },
  { id: "beforeUpdate", label: "Before Update", icon: <BatteryWarning size={14} />, color: "text-amber-400" },
  { id: "afterUpdate", label: "After Update", icon: <Activity size={14} />, color: "text-orange-400" },
  { id: "beforeDelete", label: "Before Delete", icon: <Trash2 size={14} />, color: "text-red-400" },
  { id: "afterDelete", label: "After Delete", icon: <FileText size={14} />, color: "text-rose-400" },
  { id: "drain", label: "Flight Battery Drain", icon: <Zap size={14} />, color: "text-cyan-400" },
  { id: "complete", label: "Flight Complete", icon: <CheckCircle2 size={14} />, color: "text-yellow-400" },
];

export function Triggers() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>("beforeInsert");

  // Fetch base data
  const { data: drones } = useQuery({ queryKey: ['drones'], queryFn: fetchDrones });
  const { data: flights } = useQuery({ queryKey: ['flights'], queryFn: () => fetchFlights() });
  const { data: sqlData } = useQuery({ queryKey: ['triggerSQL'], queryFn: fetchTriggerSQL });

  // Panel: Battery Drain (flight trigger)
  const [drainDroneId, setDrainDroneId] = useState<number | "">("");
  const drainDrone = drones?.find(d => d.id === drainDroneId);
  const drainMut = useMutation({
    mutationFn: simulateBatteryDrain,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['drones'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      if (data.triggerFired) {
        toast.error("TRIGGER FIRED: Drone auto-flagged for maintenance");
      } else {
        toast.success("Flight log inserted, battery drained by 10%");
      }
    }
  });

  // Panel: Complete Delivery (flight trigger)
  const inProgressFlights = flights?.filter(f => f.status === 'IN_PROGRESS' || !f.endTime) || [];
  const [completeFlightId, setCompleteFlightId] = useState<number | "">("");
  const completeFlight = inProgressFlights.find(f => f.id === completeFlightId);
  const completeMut = useMutation({
    mutationFn: simulateCompleteDelivery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drones'] });
      queryClient.invalidateQueries({ queryKey: ['flights'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
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

  // Panel: Set Battery (before update trigger)
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
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      if (data.triggerFired) {
        toast.error("TRIGGER FIRED: Low battery, status changed to MAINTENANCE");
      }
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || "Failed to set battery";
      toast.error(msg, { duration: 5000 });
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

  const getSqlForTab = (tab: TabId): string => {
    if (!sqlData) return "-- Loading SQL...";
    const map: Record<TabId, string> = {
      beforeInsert: sqlData.beforeInsertDrone,
      afterInsert: sqlData.afterInsertDrone,
      beforeUpdate: sqlData.beforeUpdateDrone,
      afterUpdate: sqlData.afterUpdateDrone,
      beforeDelete: sqlData.beforeDeleteDrone,
      afterDelete: sqlData.afterDeleteDrone,
      drain: sqlData.batteryDrain,
      complete: sqlData.completeDelivery,
    };
    return map[tab] || "-- No SQL available";
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-syne text-3xl font-bold text-white mb-2 uppercase tracking-widest">Database Trigger Simulation</h1>
        <p className="text-slate-400 text-sm font-mono max-w-2xl">
          Live demonstration of 8 PostgreSQL PL/pgSQL triggers — 6 on the <span className="text-cyan-400">drones</span> table and 2 on <span className="text-cyan-400">flight_logs</span>. Actions here directly mutate the database.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
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
        
        {/* ─── BEFORE INSERT ─── */}
        {activeTab === "beforeInsert" && (
          <>
            <div className="glass-card p-6 border-t-4 border-t-emerald-500">
              <h2 className="font-syne text-xl font-bold text-white mb-2">1. Before Insert — Sanitize Battery</h2>
              <p className="text-slate-400 text-sm mb-6">Clamps battery level to 0–100 range on drone creation. Try adding a drone with battery &gt; 100 or &lt; 0 from the Drones page — the DB will auto-correct it.</p>
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm font-mono">
                <p className="font-bold mb-2">✅ How to test:</p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Go to <span className="text-white font-bold">Drone Fleet</span> page</li>
                  <li>Click <span className="text-white font-bold">Add Drone</span></li>
                  <li>Set battery to <span className="text-white font-bold">150</span> or <span className="text-white font-bold">-20</span></li>
                  <li>Submit — the DB will clamp it to 100 or 0</li>
                </ol>
              </div>
            </div>
            <div className="h-full">
              <CodeBlock code={getSqlForTab("beforeInsert")} />
            </div>
          </>
        )}

        {/* ─── AFTER INSERT ─── */}
        {activeTab === "afterInsert" && (
          <>
            <div className="glass-card p-6 border-t-4 border-t-green-500">
              <h2 className="font-syne text-xl font-bold text-white mb-2">2. After Insert — Auto Maintenance Record</h2>
              <p className="text-slate-400 text-sm mb-6">When a new drone is added, the trigger automatically creates a maintenance record with <code className="text-green-400">'Initial Check'</code> and status <code className="text-green-400">'COMPLETED'</code>. Zero extra API calls needed.</p>
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm font-mono">
                <p className="font-bold mb-2">✅ How to test:</p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Go to <span className="text-white font-bold">Drone Fleet</span> → <span className="text-white font-bold">Add Drone</span></li>
                  <li>Submit any drone</li>
                  <li>Go to <span className="text-white font-bold">Maintenance Records</span></li>
                  <li>You'll see an <span className="text-white font-bold">"Initial Check"</span> record auto-created!</li>
                </ol>
              </div>
            </div>
            <div className="h-full">
              <CodeBlock code={getSqlForTab("afterInsert")} />
            </div>
          </>
        )}

        {/* ─── BEFORE UPDATE ─── */}
        {activeTab === "beforeUpdate" && (
          <>
            <div className="glass-card p-6 border-t-4 border-t-amber-500 relative overflow-hidden">
              <h2 className="font-syne text-xl font-bold text-white mb-2">3. Before Update — Validate Battery + Auto-Maintenance</h2>
              <p className="text-slate-400 text-sm mb-6">Validates battery on update (throws error if &gt; 100). Also auto-sets status to MAINTENANCE if battery drops below 20%.</p>
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
              <CodeBlock code={getSqlForTab("beforeUpdate")} />
            </div>
          </>
        )}

        {/* ─── AFTER UPDATE ─── */}
        {activeTab === "afterUpdate" && (
          <>
            <div className="glass-card p-6 border-t-4 border-t-orange-500">
              <h2 className="font-syne text-xl font-bold text-white mb-2">4. After Update — Audit Status Changes</h2>
              <p className="text-slate-400 text-sm mb-6">When a drone's status changes (e.g. AVAILABLE → IN_DELIVERY), the trigger auto-inserts a maintenance record documenting the transition. Creates an audit trail.</p>
              <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-400 text-sm font-mono">
                <p className="font-bold mb-2">✅ How to test:</p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Use the <span className="text-white font-bold">Before Update</span> tab to change a drone's battery below 20%</li>
                  <li>This changes status AVAILABLE → MAINTENANCE</li>
                  <li>Go to <span className="text-white font-bold">Maintenance Records</span></li>
                  <li>You'll see <span className="text-white font-bold">"Status changed: AVAILABLE → MAINTENANCE"</span> auto-logged!</li>
                </ol>
              </div>
            </div>
            <div className="h-full">
              <CodeBlock code={getSqlForTab("afterUpdate")} />
            </div>
          </>
        )}

        {/* ─── BEFORE DELETE ─── */}
        {activeTab === "beforeDelete" && (
          <>
            <div className="glass-card p-6 border-t-4 border-t-red-500">
              <h2 className="font-syne text-xl font-bold text-white mb-2">5. Before Delete — Block Active Drone Deletion</h2>
              <p className="text-slate-400 text-sm mb-6">Prevents deletion of any drone with status <code className="text-red-400">IN_DELIVERY</code>. The database throws a <code className="text-red-400">SQLSTATE 45000</code> error, which the backend returns as a 400 response with a clear message.</p>
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm font-mono">
                <p className="font-bold mb-2">✅ How to test:</p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Use <span className="text-white font-bold">Flight Battery Drain</span> tab to set a drone to IN_DELIVERY</li>
                  <li>Go to <span className="text-white font-bold">Drone Fleet</span></li>
                  <li>Try deleting that IN_DELIVERY drone</li>
                  <li>You'll see an error: <span className="text-white font-bold">"Cannot delete drone while status is IN_DELIVERY"</span></li>
                </ol>
              </div>
            </div>
            <div className="h-full">
              <CodeBlock code={getSqlForTab("beforeDelete")} />
            </div>
          </>
        )}

        {/* ─── AFTER DELETE ─── */}
        {activeTab === "afterDelete" && (
          <>
            <div className="glass-card p-6 border-t-4 border-t-rose-500">
              <h2 className="font-syne text-xl font-bold text-white mb-2">6. After Delete — Audit Log on Deletion</h2>
              <p className="text-slate-400 text-sm mb-6">After a drone is successfully deleted, the trigger inserts a final maintenance record with <code className="text-rose-400">'Drone Deleted — ID: X, Model: Y'</code>. Preserves history even after the row is gone.</p>
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-sm font-mono">
                <p className="font-bold mb-2">✅ How to test:</p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Go to <span className="text-white font-bold">Drone Fleet</span></li>
                  <li>Delete any non-IN_DELIVERY drone</li>
                  <li>Go to <span className="text-white font-bold">Maintenance Records</span></li>
                  <li>You'll see <span className="text-white font-bold">"Drone Deleted — ID: X, Model: Y"</span> logged!</li>
                </ol>
              </div>
            </div>
            <div className="h-full">
              <CodeBlock code={getSqlForTab("afterDelete")} />
            </div>
          </>
        )}

        {/* ─── FLIGHT: BATTERY DRAIN ─── */}
        {activeTab === "drain" && (
          <>
            <div className="glass-card p-6 border-t-4 border-t-cyan-500">
              <h2 className="font-syne text-xl font-bold text-white mb-6">Flight Trigger: Battery Drain (AFTER INSERT on flight_logs)</h2>
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
              <CodeBlock code={getSqlForTab("drain")} />
            </div>
          </>
        )}

        {/* ─── FLIGHT: COMPLETE DELIVERY ─── */}
        {activeTab === "complete" && (
          <>
            <div className="glass-card p-6 border-t-4 border-t-yellow-500">
              <h2 className="font-syne text-xl font-bold text-white mb-6">Flight Trigger: Complete Delivery (AFTER UPDATE on flight_logs)</h2>
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
                  className={cn("btn-primary w-full py-4 text-lg !bg-yellow-500 hover:!bg-yellow-400 text-black", !completeFlightId && "opacity-50")}
                  disabled={!completeFlightId || completeMut.isPending}
                  onClick={() => completeMut.mutate(Number(completeFlightId))}
                >
                  COMPLETE FLIGHT (SET end_time)
                </button>
              </div>
            </div>
            <div className="h-full">
              <CodeBlock code={getSqlForTab("complete")} />
            </div>
          </>
        )}
      </div>

      {/* Trigger Summary Table */}
      <div className="glass-card overflow-hidden mt-8">
        <table className="w-full data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Trigger Name</th>
              <th>Timing & Event</th>
              <th>Table</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="font-mono text-slate-500">1</td>
              <td className="font-bold text-emerald-400">before_insert_drone</td>
              <td>BEFORE INSERT</td>
              <td>drones</td>
              <td>Clamps battery_level to 0–100 range. Negative → 0, above 100 → 100.</td>
            </tr>
            <tr>
              <td className="font-mono text-slate-500">2</td>
              <td className="font-bold text-green-400">after_insert_drone</td>
              <td>AFTER INSERT</td>
              <td>drones</td>
              <td>Auto-creates a maintenance record with "Initial Check" status COMPLETED.</td>
            </tr>
            <tr>
              <td className="font-mono text-slate-500">3</td>
              <td className="font-bold text-amber-400">before_update_drone</td>
              <td>BEFORE UPDATE</td>
              <td>drones</td>
              <td>Validates battery (error if &gt; 100). Auto-sets MAINTENANCE if battery &lt; 20%.</td>
            </tr>
            <tr>
              <td className="font-mono text-slate-500">4</td>
              <td className="font-bold text-orange-400">after_update_drone</td>
              <td>AFTER UPDATE</td>
              <td>drones</td>
              <td>Logs status transitions as audit records in maintenance_records.</td>
            </tr>
            <tr>
              <td className="font-mono text-slate-500">5</td>
              <td className="font-bold text-red-400">before_delete_drone</td>
              <td>BEFORE DELETE</td>
              <td>drones</td>
              <td>Blocks deletion if drone status is IN_DELIVERY. Throws SQLSTATE 45000 error.</td>
            </tr>
            <tr>
              <td className="font-mono text-slate-500">6</td>
              <td className="font-bold text-rose-400">after_delete_drone</td>
              <td>AFTER DELETE</td>
              <td>drones</td>
              <td>Inserts a final audit record "Drone Deleted — ID: X, Model: Y" into maintenance_records.</td>
            </tr>
            <tr>
              <td className="font-mono text-slate-500">7</td>
              <td className="font-bold text-cyan-400">trg_battery_drain_on_flight</td>
              <td>AFTER INSERT</td>
              <td>flight_logs</td>
              <td>Drains drone battery by 10% when a new flight starts. Auto-flags for maintenance if below 20%.</td>
            </tr>
            <tr>
              <td className="font-mono text-slate-500">8</td>
              <td className="font-bold text-yellow-400">trg_complete_delivery</td>
              <td>AFTER UPDATE</td>
              <td>flight_logs</td>
              <td>When end_time is set, marks order DELIVERED, drone AVAILABLE, increments operator flights.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
