import { useQuery } from '@tanstack/react-query';
import { fetchShipments } from '../api/apiClient';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Clock, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const { data: shipments, isLoading, error } = useQuery({
    queryKey: ['shipments'],
    queryFn: fetchShipments
  });

  if (isLoading) return <div className="text-center py-20 text-slate-400">Loading shipments...</div>;
  if (error) return <div className="text-red-400 bg-red-400/10 p-4 rounded-xl">Failed to load shipments</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Compliance Overview</h2>
          <p className="text-slate-400 mt-1">Review recent shipments and their validation status.</p>
        </div>
        <Link to="/ingest" className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/25">
          Ingest Shipment
        </Link>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700/50 bg-slate-800/30">
              <th className="p-4 font-medium text-slate-300">Reference</th>
              <th className="p-4 font-medium text-slate-300">Exporter</th>
              <th className="p-4 font-medium text-slate-300">Status</th>
              <th className="p-4 font-medium text-slate-300">Issues</th>
              <th className="p-4 font-medium text-slate-300">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {shipments?.map((shipment: any) => (
              <tr key={shipment.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="p-4 font-medium text-blue-400">{shipment.reference}</td>
                <td className="p-4 text-slate-300">{shipment.exporter || 'Unknown'}</td>
                <td className="p-4">
                  <StatusBadge status={shipment.status} />
                </td>
                <td className="p-4 text-slate-400">
                  {shipment.issues?.length || 0} issues
                </td>
                <td className="p-4">
                  <Link to={`/shipments/${shipment.id}`} className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
                    View <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </td>
              </tr>
            ))}
            {shipments?.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No shipments found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'READY') {
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><CheckCircle2 size={14} /> Ready</span>;
  }
  if (status === 'ISSUES_FOUND') {
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20"><AlertCircle size={14} /> Issues Found</span>;
  }
  return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"><Clock size={14} /> {status}</span>;
}
