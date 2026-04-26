import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOperator } from "@/api/operators";
import toast from "react-hot-toast";

interface AddOperatorDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddOperatorDialog({ open, onClose }: AddOperatorDialogProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<'JUNIOR' | 'INTERMEDIATE' | 'SENIOR'>("JUNIOR");

  const addMutation = useMutation({
    mutationFn: createOperator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operators'] });
      toast.success("Operator added successfully");
      setName("");
      setLicenseNumber("");
      setExperienceLevel("JUNIOR");
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to add operator");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !licenseNumber.trim()) {
      toast.error("Name and license number are required");
      return;
    }
    addMutation.mutate({ name, licenseNumber, experienceLevel });
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
                <h3 className="font-syne text-lg font-bold text-white mb-1">Add New Operator</h3>
                <p className="text-sm text-slate-400">Register a new remote pilot to the system.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-background/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">License Number</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="e.g. PILOT-12345"
                  className="w-full bg-background/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as any)}
                  className="w-full bg-background/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="JUNIOR">Junior</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="SENIOR">Senior</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={onClose} className="btn-outline text-sm py-1.5" disabled={addMutation.isPending}>Cancel</button>
                <button type="submit" className="btn-primary text-sm py-1.5" disabled={addMutation.isPending}>
                  {addMutation.isPending ? "Adding..." : "Add Operator"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
