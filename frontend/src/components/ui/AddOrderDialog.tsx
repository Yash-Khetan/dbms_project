import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder } from "@/api/orders";
import toast from "react-hot-toast";

interface AddOrderDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddOrderDialog({ open, onClose }: AddOrderDialogProps) {
  const queryClient = useQueryClient();
  const [customerName, setCustomerName] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [packageWeightKg, setPackageWeightKg] = useState("1.00");

  const addMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success("Order created successfully");
      setCustomerName("");
      setDeliveryAddress("");
      setPackageWeightKg("1.00");
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to create order");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !deliveryAddress.trim()) {
      toast.error("Customer name and delivery address are required");
      return;
    }
    addMutation.mutate({ customerName, deliveryAddress, packageWeightKg });
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
                <h3 className="font-syne text-lg font-bold text-white mb-1">Create New Order</h3>
                <p className="text-sm text-slate-400">Add a new delivery order to the queue.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. John Smith"
                  className="w-full bg-background/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Delivery Address</label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="e.g. 123 Main St, Apt 4B, New York, NY 10001"
                  rows={2}
                  className="w-full bg-background/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Package Weight (kg)</label>
                <input
                  type="number"
                  min="0.01"
                  max="999.99"
                  step="0.01"
                  value={packageWeightKg}
                  onChange={(e) => setPackageWeightKg(e.target.value)}
                  className="w-full bg-background/50 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={onClose} className="btn-outline text-sm py-1.5" disabled={addMutation.isPending}>Cancel</button>
                <button type="submit" className="btn-primary text-sm py-1.5" disabled={addMutation.isPending}>
                  {addMutation.isPending ? "Creating..." : "Create Order"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
