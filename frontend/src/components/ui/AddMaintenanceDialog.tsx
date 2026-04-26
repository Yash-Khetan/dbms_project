import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMaintenance } from "@/api/maintenance";
import { fetchDrones } from "@/api/drones";
import toast from "react-hot-toast";

interface AddMaintenanceDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddMaintenanceDialog({ open, onClose }: AddMaintenanceDialogProps) {
  const queryClient = useQueryClient();
  const [droneId, setDroneId] = useState<number | "">("");
  const [issueReported, setIssueReported] = useState("");
  const [technicianNotes, setTechnicianNotes] = useState("");

  const { data: drones } = useQuery({
    queryKey: ['drones'],
    queryFn: fetchDrones,
  });

  const addMutation = useMutation({
    mutationFn: createMaintenance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      toast.success("Maintenance record created");
      setDroneId("");
      setIssueReported("");
      setTechnicianNotes("");
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to create record");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!droneId || !issueReported.trim()) {
      toast.error("Drone and issue description are required");
      return;
    }
    addMutation.mutate({
      droneId: Number(droneId),
      issueReported,
      technicianNotes: technicianNotes || null,
    });
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
                <h3 className="font-syne text-lg font-bold text-white mb-1">Log Maintenance</h3>
                <p className="text-sm text-slate-400">Record a new maintenance issue for a drone.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Drone</label>
                <select
                  value={droneId}
                  onChange={(e) => setDroneId(e.target.value ? Number(e.target.value) : "")}
                  className="w-full bg-background/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  required
                >
                  <option value="" disabled>Select a drone</option>
                  {drones?.map(d => (
                    <option key={d.id} value={d.id}>#{d.id} — {d.model}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Issue Reported</label>
                <textarea
                  value={issueReported}
                  onChange={(e) => setIssueReported(e.target.value)}
                  placeholder="e.g. Motor 3 vibration anomaly detected"
                  rows={2}
                  className="w-full bg-background/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Technician Notes (optional)</label>
                <textarea
                  value={technicianNotes}
                  onChange={(e) => setTechnicianNotes(e.target.value)}
                  placeholder="e.g. Scheduled for bearing replacement"
                  rows={2}
                  className="w-full bg-background/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={onClose} className="btn-outline text-sm py-1.5" disabled={addMutation.isPending}>Cancel</button>
                <button type="submit" className="btn-primary text-sm py-1.5" disabled={addMutation.isPending}>
                  {addMutation.isPending ? "Logging..." : "Log Record"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
