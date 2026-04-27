import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";

export function Layout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 relative overflow-y-auto overflow-x-hidden h-screen">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="max-w-[calc(100vw-18rem)] mx-auto"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
