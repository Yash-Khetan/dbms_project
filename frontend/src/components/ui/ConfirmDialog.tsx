import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message }: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card max-w-md w-full p-6 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-crimson-500" />
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-crimson-500/20 flex items-center justify-center flex-shrink-0 text-crimson-500">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="font-syne text-lg font-bold text-white mb-2">{title}</h3>
                  <p className="text-sm text-slate-400 mb-6">{message}</p>
                  <div className="flex gap-3 justify-end">
                    <button onClick={onClose} className="btn-outline text-sm py-1.5">Cancel</button>
                    <button onClick={() => { onConfirm(); onClose(); }} className="btn-danger text-sm py-1.5">Confirm</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
