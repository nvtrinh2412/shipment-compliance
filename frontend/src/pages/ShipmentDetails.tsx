import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { fetchReadiness } from '../api/apiClient';
import { ArrowLeft, AlertTriangle, XCircle, Info } from 'lucide-react';
import { Show } from '../components/Show';

export default function ShipmentDetails() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ['shipment', id],
    queryFn: () => fetchReadiness(id!)
  });

  return (
    <Show 
      when={!isLoading} 
      fallback={<div className="text-center py-20 text-slate-400">Loading readiness report...</div>}
    >
      <Show 
        when={!!data} 
        fallback={<div className="text-red-400">Not found</div>}
      >
        <div className="space-y-6 max-w-5xl mx-auto">
          <div>
            <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 text-sm">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-slate-100">Shipment {data?.reference}</h2>
              <Show 
                when={data?.status === 'READY'} 
                fallback={
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">ISSUES FOUND</span>
                }
              >
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">READY FOR CUSTOMS</span>
              </Show>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-lg font-semibold mb-4 text-white">Compliance Issues ({data?.issues?.length || 0})</h3>
                <Show 
                  when={data?.issues?.length === 0} 
                  fallback={
                    <div className="space-y-4">
                      {data?.issues?.map((issue: any) => (
                        <div key={issue.id} className={`p-4 rounded-xl border ${issue.severity === 'CRITICAL' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                          <div className="flex gap-3">
                            <div className="mt-0.5">
                              <Show 
                                when={issue.severity === 'CRITICAL'} 
                                fallback={<AlertTriangle className="text-amber-400" size={20} />}
                              >
                                <XCircle className="text-rose-400" size={20} />
                              </Show>
                            </div>
                            <div>
                              <h4 className={`font-semibold ${issue.severity === 'CRITICAL' ? 'text-rose-300' : 'text-amber-300'}`}>
                                {issue.issueType.replace(/_/g, ' ')}
                              </h4>
                              <p className="text-slate-300 text-sm mt-1">{issue.explanation}</p>
                              <div className="mt-3 bg-slate-900/50 p-3 rounded-lg text-sm border border-slate-700/50">
                                <span className="text-slate-400 font-medium">Suggested Action: </span>
                                <span className="text-slate-200">{issue.suggestedAction}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  }
                >
                  <div className="text-emerald-400 bg-emerald-500/10 p-4 rounded-xl flex items-center gap-3 border border-emerald-500/20">
                    <Info size={20} />
                    No compliance issues detected. Safe to proceed.
                  </div>
                </Show>
              </div>
            </div>

            <div className="col-span-1 space-y-6">
              <div className="glass-panel p-6 rounded-2xl">
                <h3 className="text-lg font-semibold mb-4 text-white">Document Data</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-slate-700/50 pb-2">
                    <dt className="text-slate-400">Exporter</dt>
                    <dd className="text-slate-200 font-medium text-right">
                      <Show when={!!data?.exporter} fallback="-">{data?.exporter}</Show>
                    </dd>
                  </div>
                  <div className="flex justify-between border-b border-slate-700/50 pb-2">
                    <dt className="text-slate-400">Importer</dt>
                    <dd className="text-slate-200 font-medium text-right">
                      <Show when={!!data?.importer} fallback="-">{data?.importer}</Show>
                    </dd>
                  </div>
                  <div className="flex justify-between border-b border-slate-700/50 pb-2">
                    <dt className="text-slate-400">HS Code</dt>
                    <dd className="text-slate-200 font-medium text-right">
                      <Show when={!!data?.hsCode} fallback="-">{data?.hsCode}</Show>
                    </dd>
                  </div>
                  <div className="flex justify-between border-b border-slate-700/50 pb-2">
                    <dt className="text-slate-400">Invoice</dt>
                    <dd className="text-slate-200 font-medium text-right">
                      <Show when={!!data?.invoiceValue} fallback="-">${data?.invoiceValue}</Show>
                    </dd>
                  </div>
                  <div className="flex justify-between border-b border-slate-700/50 pb-2">
                    <dt className="text-slate-400">Origin</dt>
                    <dd className="text-slate-200 font-medium text-right">
                      <Show when={!!data?.countryCode} fallback="-">{data?.countryCode}</Show>
                    </dd>
                  </div>
                  <div className="flex justify-between border-b border-slate-700/50 pb-2">
                    <dt className="text-slate-400">Gross Wt</dt>
                    <dd className="text-slate-200 font-medium text-right">
                      <Show when={!!data?.grossWeightKg} fallback="-">{data?.grossWeightKg} kg</Show>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </Show>
    </Show>
  );
}
