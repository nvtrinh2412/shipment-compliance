import { useQuery } from '@tanstack/react-query';
import { fetchShipments } from '../api/apiClient';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import { Show } from '../components/Show';
import { ShipmentStatus } from '../types/enums';

export default function Dashboard() {
  const { data: shipments, isLoading, error } = useQuery({
    queryKey: ['shipments'],
    queryFn: fetchShipments
  });

  return (
    <Show 
      when={!isLoading} 
      fallback={<div className="text-center py-20 text-slate-400">Loading shipments...</div>}
    >
      <Show 
        when={!error}
        fallback={<div className="text-red-400 bg-red-400/10 p-4 rounded-xl">Failed to load shipments</div>}
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Compliance Overview</h2>
              <p className="text-slate-500 text-sm mt-1">Review recent shipments and their validation status.</p>
            </div>
            <Link to="/ingest" className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm shadow-primary/10 border border-primary/10">
              Ingest Shipment
            </Link>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-slate-500">Reference</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-slate-500">Exporter</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-slate-500">Status</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-slate-500">Issues</th>
                  <th className="p-4 font-semibold text-[11px] uppercase tracking-wider text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <Show 
                  when={shipments?.length > 0} 
                  fallback={
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 text-sm">No shipments found.</td>
                    </tr>
                  }
                >
                  {shipments?.map((shipment: any) => (
                    <tr key={shipment.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="p-4 font-semibold text-primary hover:text-primary-hover hover:underline text-sm">
                        <Link to={`/shipments/${shipment.id}`}>{shipment.reference}</Link>
                      </td>
                      <td className="p-4 text-slate-600 text-sm">
                        <Show when={!!shipment.exporter} fallback={<span className="text-slate-400 italic">Unknown</span>}>
                          {shipment.exporter}
                        </Show>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={shipment.status} />
                      </td>
                      <td className="p-4 text-slate-500 text-sm">
                        {shipment.issues?.length || 0} issues
                      </td>
                      <td className="p-4 text-sm">
                        <Link to={`/shipments/${shipment.id}`} className="inline-flex items-center gap-1 text-slate-500 hover:text-primary transition-colors font-medium">
                          View <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </Show>
              </tbody>
            </table>
          </div>
        </div>
      </Show>
    </Show>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Show 
      when={status === ShipmentStatus.READY}
      fallback={
        <Show 
          when={status === ShipmentStatus.ISSUES_FOUND}
          fallback={
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
              <Clock size={13} /> {status.replace(/_/g, ' ')}
            </span>
          }
        >
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80">
            <AlertCircle size={13} /> Issues Found
          </span>
        </Show>
      }
    >
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
        <CheckCircle2 size={13} /> Ready
      </span>
    </Show>
  );
}
