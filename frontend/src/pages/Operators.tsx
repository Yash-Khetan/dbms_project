import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchOperators, deleteOperator } from "@/api/operators";
import { DataTable } from "@/components/ui/DataTable";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { Shield, Plus, Trash2 } from "lucide-react";
import { AddOperatorDialog } from "@/components/ui/AddOperatorDialog";
import toast from "react-hot-toast";

export function Operators() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: operators, isLoading } = useQuery({
    queryKey: ['operators'],
    queryFn: fetchOperators,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOperator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operators'] });
      toast.success("Operator deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to delete operator");
    }
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this operator?")) {
      deleteMutation.mutate(id);
    }
  };

  const getExperienceColor = (level: string) => {
    switch(level) {
      case 'JUNIOR': return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
      case 'INTERMEDIATE': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'SENIOR': return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10 shadow-[inset_0_0_10px_rgba(0,212,255,0.2)]';
      default: return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
    }
  };

  const columns = [
    { header: "ID", accessor: (row: any) => `#${row.id.toString().padStart(4, '0')}` },
    { header: "Name", accessor: (row: any) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-white">
          {row.name.split(' ').map((n: string) => n[0]).join('')}
        </div>
        <span className="font-medium text-white">{row.name}</span>
      </div>
    )},
    { header: "License", accessor: (row: any) => <span className="font-mono text-slate-300"><Shield className="inline w-3 h-3 mr-1 text-slate-500"/>{row.licenseNumber}</span> },
    { header: "Experience", accessor: (row: any) => (
      <span className={`px-2 py-1 rounded text-xs font-mono border ${getExperienceColor(row.experienceLevel)}`}>
        {row.experienceLevel}
      </span>
    )},
    { header: "Total Flights", accessor: (row: any) => <span className="font-mono">{row.totalFlights}</span> },
    { header: "Actions", accessor: (row: any) => (
      <button 
        onClick={() => handleDelete(row.id)}
        disabled={deleteMutation.isPending}
        className="text-slate-400 hover:text-red-400 transition-colors p-1"
        title="Delete Operator"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-syne text-2xl font-bold text-white mb-2">Operators</h1>
          <p className="text-slate-400 text-sm font-mono">Licensed remote pilots and dispatch personnel.</p>
        </div>
        <button 
          onClick={() => setIsAddDialogOpen(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Add Operator
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton className="h-96 w-full" />
      ) : (
        <DataTable data={operators || []} columns={columns} keyExtractor={(o) => o.id} />
      )}

      <AddOperatorDialog 
        open={isAddDialogOpen} 
        onClose={() => setIsAddDialogOpen(false)} 
      />
    </div>
  );
}
