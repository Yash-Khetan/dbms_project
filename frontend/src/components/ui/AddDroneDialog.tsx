import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDrone } from "@/api/drones";
import toast from "react-hot-toast";

interface AddDroneDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddDroneDialog({ open, onClose }: AddDroneDialogProps) {
  const queryClient = useQueryClient();
  const [model, setModel] = useState("");
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [status, setStatus] = useState<'AVAILABLE' | 'IN_DELIVERY' | 'CHARGING' | 'MAINTENANCE'>("AVAILABLE");

  const addMutation = useMutation({
    mutationFn: createDrone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drones'] });
      toast.success("Drone added successfully");
      setModel("");
      setBatteryLevel(100);
      setStatus("AVAILABLE");
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to add drone");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!model.trim()) {
      toast.error("Model name is required");
      return;
    }
    addMutation.mutate({ model, batteryLevel, status });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass-card max-w-md w-full p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500" />
            <div className="flex gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 text-cyan-400">
                <Plus size={20} />
              </div>
              <div>
                <h3 className="font-syne text-lg font-bold text-white mb-1">Add New Drone</h3>
                <p className="text-sm text-slate-400">Register a new aerospace asset to the fleet.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Model Name</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. DJI Mavic 3 Enterprise"
                  className="w-full bg-background/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Battery Level (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={batteryLevel}
                  onChange={(e) => setBatteryLevel(Number(e.target.value))}
                  className="w-full bg-background/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Initial Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-background/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="IN_DELIVERY">In Delivery</option>
                  <option value="CHARGING">Charging</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={onClose} className="btn-outline text-sm py-1.5" disabled={addMutation.isPending}>Cancel</button>
                <button type="submit" className="btn-primary text-sm py-1.5" disabled={addMutation.isPending}>
                  {addMutation.isPending ? "Adding..." : "Add Drone"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
