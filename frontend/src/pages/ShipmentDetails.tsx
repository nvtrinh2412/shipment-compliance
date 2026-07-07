import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchReadiness } from '../api/apiClient';
import { ArrowLeft, AlertTriangle, XCircle, Info, History, FileText } from 'lucide-react';
import { Show } from '../components/Show';
import { ShipmentStatus, Severity, AuditAction, DetailTab } from '../types/enums';

export default function ShipmentDetails() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ['shipment', id],
    queryFn: () => fetchReadiness(id!)
  });

  const [activeTab, setActiveTab] = useState<DetailTab>(DetailTab.ISSUES);
  const isReady = data?.status === ShipmentStatus.READY;
  const ingestLog = data?.auditLogs?.find((l: any) => l.action === AuditAction.DOCUMENT_INGESTED);

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
            <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-4 text-sm font-semibold">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-slate-900">Shipment {data?.reference}</h2>
              <Show
                when={isReady}
                fallback={
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">ISSUES FOUND</span>
                }
              >
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">READY FOR CUSTOMS</span>
              </Show>
            </div>
          </div>

          <Show when={!!data?.report}>
            <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-primary/5 to-emerald-500/5 border border-primary/10 space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Customs Compliance Readiness Report</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{data?.report?.summary}</p>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Critical Blockers</div>
                  <div className="text-xl font-extrabold text-rose-600 mt-0.5">{data?.report?.blockers?.length || 0}</div>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Warnings</div>
                  <div className="text-xl font-extrabold text-amber-600 mt-0.5">{data?.report?.warnings?.length || 0}</div>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Validation Issues</div>
                  <div className="text-xl font-extrabold text-slate-700 mt-0.5">{data?.report?.issuesCount || 0}</div>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Human Review</div>
                  <div className="text-xl font-extrabold text-primary mt-0.5">{data?.report?.humanReviewRequired ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>
          </Show>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              {/* Tab Selector */}
              <div className="flex gap-2 border-b border-slate-200/80 pb-px">
                <button
                  onClick={() => setActiveTab(DetailTab.ISSUES)}
                  className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 -mb-px cursor-pointer ${activeTab === DetailTab.ISSUES ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-350'}`}
                >
                  Compliance Issues ({data?.issues?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab(DetailTab.RAW)}
                  className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 -mb-px cursor-pointer ${activeTab === DetailTab.RAW ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-350'}`}
                >
                  Raw Ingested Data
                </button>
                <button
                  onClick={() => setActiveTab(DetailTab.AUDIT)}
                  className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 -mb-px cursor-pointer ${activeTab === DetailTab.AUDIT ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-350'}`}
                >
                  Audit History ({data?.auditLogs?.length || 0})
                </button>
              </div>

              <Show when={activeTab === DetailTab.ISSUES}>
                <div className="glass-panel p-6 rounded-2xl border border-slate-100">
                  <h3 className="text-lg font-bold mb-4 text-slate-800">Active Compliance Violations</h3>
                  <Show
                    when={data?.issues?.length === 0}
                    fallback={
                      <div className="space-y-4">
                        {data?.issues?.map((issue: any) => (
                          <div key={issue.id} className={`p-4 rounded-xl border ${issue.severity === Severity.CRITICAL ? 'bg-rose-50 border-rose-100/80' : 'bg-amber-50 border-amber-100/80'}`}>
                            <div className="flex gap-3">
                              <div className="mt-0.5">
                                <Show
                                  when={issue.severity === Severity.CRITICAL}
                                  fallback={<AlertTriangle className="text-amber-500" size={18} />}
                                >
                                  <XCircle className="text-rose-500" size={18} />
                                </Show>
                              </div>
                              <div>
                                <h4 className={`font-bold text-sm ${issue.severity === Severity.CRITICAL ? 'text-rose-900' : 'text-amber-900'}`}>
                                  {issue.issueType.replace(/_/g, ' ')}
                                </h4>
                                <p className="text-slate-600 text-sm mt-1 leading-relaxed">{issue.explanation}</p>
                                <div className="mt-3 bg-white/80 p-3.5 rounded-xl text-sm border border-slate-200/60 shadow-sm">
                                  <span className="text-slate-500 font-bold">Suggested Action: </span>
                                  <span className="text-slate-700 font-medium">{issue.suggestedAction}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    }
                  >
                    <div className="text-emerald-800 bg-emerald-50 p-4 rounded-xl flex items-center gap-3 border border-emerald-100 text-sm font-semibold">
                      <Info size={18} className="text-emerald-600" />
                      No compliance issues detected. Safe to proceed.
                    </div>
                  </Show>
                </div>
              </Show>

              <Show when={activeTab === DetailTab.RAW}>
                <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-100">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <FileText size={20} className="text-primary" />
                      Original Document OCR Extract
                    </h3>
                  </div>
                  <Show when={!!ingestLog} fallback={<div className="text-slate-500 text-sm italic">No raw data found.</div>}>
                    <pre className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-800 overflow-auto max-h-[500px] shadow-inner">
                      {JSON.stringify(ingestLog?.details, null, 2)}
                    </pre>
                  </Show>
                </div>
              </Show>

              <Show when={activeTab === DetailTab.AUDIT}>
                <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <History size={20} className="text-primary" />
                    Audit Trail Timeline
                  </h3>
                  <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {data?.auditLogs?.map((log: any) => (
                      <div key={log.id} className="flex gap-4 relative">
                        <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center z-10 text-[9px] text-primary font-bold shadow-sm">
                          LOG
                        </div>
                        <div className="flex-1 bg-slate-50/40 border border-slate-100 hover:bg-slate-50/80 p-4 rounded-xl transition-all duration-200">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-slate-800">{log.action.replace(/_/g, ' ')}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">Actor: <span className="text-slate-700 font-semibold">{log.actor}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Show>
            </div>

            <div className="col-span-1 space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-slate-100">
                <h3 className="text-lg font-bold mb-4 text-slate-800 border-b border-slate-100 pb-2">Document Data</h3>
                <dl className="space-y-3.5 text-sm">
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <dt className="text-slate-500 font-medium">Exporter</dt>
                    <dd className="text-slate-800 font-bold text-right">
                      <Show when={!!data?.exporter} fallback={<span className="text-slate-400 italic font-normal">-</span>}>{data?.exporter}</Show>
                    </dd>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <dt className="text-slate-500 font-medium">Importer</dt>
                    <dd className="text-slate-800 font-bold text-right">
                      <Show when={!!data?.importer} fallback={<span className="text-slate-400 italic font-normal">-</span>}>{data?.importer}</Show>
                    </dd>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <dt className="text-slate-500 font-medium">HS Code</dt>
                    <dd className="text-slate-800 font-bold text-right">
                      <Show when={!!data?.hsCode} fallback={<span className="text-slate-400 italic font-normal">-</span>}>{data?.hsCode}</Show>
                    </dd>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <dt className="text-slate-500 font-medium">Invoice</dt>
                    <dd className="text-slate-800 font-bold text-right">
                      <Show when={!!data?.invoiceValue} fallback={<span className="text-slate-400 italic font-normal">-</span>}>${data?.invoiceValue?.toLocaleString()}</Show>
                    </dd>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <dt className="text-slate-500 font-medium">Origin</dt>
                    <dd className="text-slate-800 font-bold text-right">
                      <Show when={!!data?.countryCode} fallback={<span className="text-slate-400 italic font-normal">-</span>}>{data?.countryCode}</Show>
                    </dd>
                  </div>
                  <div className="flex justify-between border-b border-slate-50 pb-2">
                    <dt className="text-slate-500 font-medium">Gross Wt</dt>
                    <dd className="text-slate-800 font-bold text-right">
                      <Show when={!!data?.grossWeightKg} fallback={<span className="text-slate-400 italic font-normal">-</span>}>{data?.grossWeightKg?.toLocaleString()} kg</Show>
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
