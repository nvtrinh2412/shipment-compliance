import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchReadiness } from '../api/apiClient';
import { ArrowLeft, AlertTriangle, XCircle, Info, History, FileText } from 'lucide-react';
import { Show } from '../components/Show';

export default function ShipmentDetails() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ['shipment', id],
    queryFn: () => fetchReadiness(id!)
  });

  const [activeTab, setActiveTab] = useState<'issues' | 'raw' | 'audit'>('issues');
  const isReady = data?.status === 'READY';
  const ingestLog = data?.auditLogs?.find((l: any) => l.action === 'DOCUMENT_INGESTED');

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
                when={isReady}
                fallback={
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">ISSUES FOUND</span>
                }
              >
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">READY FOR CUSTOMS</span>
              </Show>
            </div>
          </div>

          <Show when={!!data?.report}>
            <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/20 space-y-4">
              <h3 className="text-lg font-semibold text-white">Customs Compliance Readiness Report</h3>
              <p className="text-slate-300 text-sm">{data?.report?.summary}</p>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                  <div className="text-xs text-slate-400">Critical Blockers</div>
                  <div className="text-lg font-bold text-rose-400 mt-1">{data?.report?.blockers?.length || 0}</div>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                  <div className="text-xs text-slate-400">Warnings</div>
                  <div className="text-lg font-bold text-amber-400 mt-1">{data?.report?.warnings?.length || 0}</div>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                  <div className="text-xs text-slate-400">Validation Issues</div>
                  <div className="text-lg font-bold text-slate-300 mt-1">{data?.report?.issuesCount || 0}</div>
                </div>
                <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
                  <div className="text-xs text-slate-400">Human Review Required</div>
                  <div className="text-lg font-bold text-blue-400 mt-1">{data?.report?.humanReviewRequired ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
          </Show>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              {/* Tab Selector */}
              <div className="flex gap-2 border-b border-slate-700/50 pb-px">
                <button
                  onClick={() => setActiveTab('issues')}
                  className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 -mb-px ${activeTab === 'issues' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                >
                  Compliance Issues ({data?.issues?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('raw')}
                  className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 -mb-px ${activeTab === 'raw' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                >
                  Raw Ingested Data
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`pb-3 px-4 text-sm font-semibold transition-all border-b-2 -mb-px ${activeTab === 'audit' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                >
                  Audit History ({data?.auditLogs?.length || 0})
                </button>
              </div>

              <Show when={activeTab === 'issues'}>
                <div className="glass-panel p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold mb-4 text-white">Active Compliance Violations</h3>
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
              </Show>

              <Show when={activeTab === 'raw'}>
                <div className="glass-panel p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <FileText size={20} className="text-blue-400" />
                      Original Document OCR Extract
                    </h3>
                  </div>
                  <Show when={!!ingestLog} fallback={<div className="text-slate-400 text-sm">No raw data found.</div>}>
                    <pre className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-xs font-mono text-emerald-400 overflow-auto max-h-[500px]">
                      {JSON.stringify(ingestLog?.details, null, 2)}
                    </pre>
                  </Show>
                </div>
              </Show>

              <Show when={activeTab === 'audit'}>
                <div className="glass-panel p-6 rounded-2xl space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2 border-b border-slate-700/50 pb-3">
                    <History size={20} className="text-blue-400" />
                    Audit Trail Timeline
                  </h3>
                  <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700/50">
                    {data?.auditLogs?.map((log: any) => (
                      <div key={log.id} className="flex gap-4 relative">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center z-10 text-[10px] text-blue-400 font-bold shadow-lg shadow-blue-500/5">
                          Log
                        </div>
                        <div className="flex-1 bg-slate-900/30 border border-slate-800 p-4 rounded-xl">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-semibold text-slate-200">{log.action.replace(/_/g, ' ')}</span>
                            <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-1">Actor: <span className="text-slate-300">{log.actor}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Show>
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
