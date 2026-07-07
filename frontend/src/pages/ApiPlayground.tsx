import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  fetchShipments,
  createShipmentRecord,
  getShipmentRecord,
  ingestMockDocumentData,
  validateShipmentRecord,
  getShipmentIssues,
  getShipmentReadiness,
  getShipmentAuditLog
} from '../api/apiClient';
import { Terminal, Send, Play, RefreshCw, FileCode, CheckCircle, AlertTriangle, List, FolderPlus, FileSpreadsheet, ShieldAlert, FileSearch } from 'lucide-react';
import { Show } from '../components/Show';

const PRESET_DOC = `{
  "shipment_reference": "REF-PLAY-100",
  "exporter_details": "Tech Corp USA",
  "importer_details": "Logistics Asia Co",
  "invoice_no": "INV-PLAY-100",
  "invoice_amount": 75000,
  "currency": "USD",
  "goods_desc": "Smart Sensors",
  "hs_code": "8542.31",
  "weight_gross": 500,
  "weight_net": 480,
  "pkg_count": 2,
  "pkg_type": "Wooden Crates",
  "ispm_15": true,
  "container_id": "MSCU7654321",
  "bl_no": "BOLPLAY123",
  "origin_country": "US",
  "destination_country": "VN",
  "arrival_date": "2026-09-01"
}`;

enum PlaygroundTab {
  CREATION = 'CREATION',
  INGESTION = 'INGESTION',
  VALIDATION = 'VALIDATION',
  REPORTS = 'REPORTS'
}

export default function ApiPlayground() {
  const { data: shipments, refetch: refetchShipments, isLoading: loadingShipments } = useQuery({
    queryKey: ['shipments-playground'],
    queryFn: fetchShipments
  });

  const [activeTab, setActiveTab] = useState<PlaygroundTab>(PlaygroundTab.CREATION);
  const [shipmentId, setShipmentId] = useState('');
  const [reference, setReference] = useState('REF-NEW-' + Math.floor(Math.random() * 10000));
  const [docJson, setDocJson] = useState(PRESET_DOC);
  
  // Console logging state
  const [consoleLogs, setConsoleLogs] = useState<{
    method: string;
    url: string;
    status: number;
    requestBody: any;
    responseBody: any;
    timestamp: string;
  }[]>([]);

  const logCall = (method: string, url: string, status: number, reqBody: any, respBody: any) => {
    setConsoleLogs(prev => [
      {
        method,
        url,
        status,
        requestBody: reqBody,
        responseBody: respBody,
        timestamp: new Date().toLocaleTimeString()
      },
      ...prev
    ]);
  };

  const handleAction = async (
    name: string,
    apiCall: () => Promise<any>,
    method: string,
    url: string,
    reqBody?: any
  ) => {
    try {
      const data = await apiCall();
      logCall(method, url, 200, reqBody || null, data);
      
      if (name === 'CREATE' && data?.id) {
        setShipmentId(data.id);
        refetchShipments();
      }
    } catch (err: any) {
      logCall(method, url, err.status || 500, reqBody || null, { error: err.message || 'An error occurred' });
    }
  };

  // Helper selector rendered in tabs that require a shipment ID
  const renderIdSelector = () => (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="flex-1">
        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 flex justify-between items-center">
          Active Test Target (Shipment ID)
          <button 
            type="button"
            onClick={() => refetchShipments()} 
            className="text-[10px] text-primary hover:underline flex items-center gap-1 font-bold cursor-pointer"
          >
            <RefreshCw size={10} className={loadingShipments ? 'animate-spin' : ''} /> Sync Shipments
          </button>
        </label>
        <select
          value={shipmentId}
          onChange={(e) => setShipmentId(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary text-slate-800 font-semibold"
        >
          <option value="">-- Choose Existing Shipment --</option>
          {shipments?.map((s: any) => (
            <option key={s.id} value={s.id}>
              {s.reference} ({s.status}) - {s.id.substring(0, 8)}...
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 md:max-w-[200px]">
        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Selected ID</label>
        <input 
          type="text" 
          value={shipmentId}
          onChange={(e) => setShipmentId(e.target.value)}
          placeholder="Or paste UUID"
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-600 focus:outline-none focus:border-primary"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Terminal className="text-primary" /> API Compliance Playground
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Directly execute and test individual REST endpoints in sequence to inspect backend schemas and audit logs.
        </p>
      </div>

      {/* Tab Selectors */}
      <div className="flex gap-2 border-b border-slate-200/80 pb-px">
        <button
          onClick={() => setActiveTab(PlaygroundTab.CREATION)}
          className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 -mb-px flex items-center gap-2 cursor-pointer ${activeTab === PlaygroundTab.CREATION ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <FolderPlus size={16} /> 1. Creation & Dashboard
        </button>
        <button
          onClick={() => setActiveTab(PlaygroundTab.INGESTION)}
          className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 -mb-px flex items-center gap-2 cursor-pointer ${activeTab === PlaygroundTab.INGESTION ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <FileSpreadsheet size={16} /> 2. Document Ingestion
        </button>
        <button
          onClick={() => setActiveTab(PlaygroundTab.VALIDATION)}
          className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 -mb-px flex items-center gap-2 cursor-pointer ${activeTab === PlaygroundTab.VALIDATION ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <ShieldAlert size={16} /> 3. Validation & Issues
        </button>
        <button
          onClick={() => setActiveTab(PlaygroundTab.REPORTS)}
          className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 -mb-px flex items-center gap-2 cursor-pointer ${activeTab === PlaygroundTab.REPORTS ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <FileSearch size={16} /> 4. Reports & Timeline
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Tab Screen */}
        <div className="lg:col-span-7 space-y-6">
          
          <Show when={activeTab === PlaygroundTab.CREATION}>
            <div className="space-y-6">
              {/* Endpoint A: POST /api/shipments */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 shadow-sm">POST</span>
                  <span className="text-sm font-bold text-slate-800">/api/shipments</span>
                </div>
                <p className="text-xs text-slate-500">
                  Creates a new shipment record initialized in `DRAFT` status. Required non-nullable database columns are populated with standard blank defaults.
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">New Shipment Reference</label>
                  <input 
                    type="text" 
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary text-slate-800 font-semibold"
                  />
                </div>
                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleAction(
                      'CREATE',
                      () => createShipmentRecord(reference),
                      'POST',
                      '/api/shipments',
                      { reference }
                    )}
                    className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm shadow-primary/10 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send size={13} /> Create Shipment
                  </button>
                </div>
              </div>

              {/* Endpoint B: GET /api/shipments */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 shadow-sm">GET</span>
                  <span className="text-sm font-bold text-slate-800">/api/shipments</span>
                </div>
                <p className="text-xs text-slate-500">
                  Lists up to 50 of the most recently created or modified shipments, including active issues.
                </p>
                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleAction(
                      'LIST_SHIPMENTS',
                      () => fetchShipments(),
                      'GET',
                      '/api/shipments'
                    )}
                    className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play size={13} /> Fetch Shipments List
                  </button>
                </div>
              </div>
            </div>
          </Show>

          <Show when={activeTab === PlaygroundTab.INGESTION}>
            <div className="space-y-6">
              {renderIdSelector()}

              {/* Endpoint C: POST /api/shipments/:id/documents */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 shadow-sm">POST</span>
                  <span className="text-sm font-bold text-slate-800">/api/shipments/:id/documents</span>
                </div>
                <p className="text-xs text-slate-500">
                  Ingests raw OCR data, maps details using the [DocumentMapper], updates the shipment record columns, and marks status as `PENDING_REVIEW`.
                </p>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-500">Unstructured Document Body (OCR)</label>
                    <button 
                      type="button"
                      onClick={() => setDocJson(PRESET_DOC)}
                      className="text-[10px] text-primary hover:underline flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <FileCode size={11} /> Reset Preset
                    </button>
                  </div>
                  <textarea 
                    value={docJson}
                    onChange={(e) => setDocJson(e.target.value)}
                    className="w-full h-44 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-850 focus:outline-none focus:border-primary resize-y"
                  />
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    disabled={!shipmentId}
                    onClick={() => {
                      try {
                        const payload = JSON.parse(docJson);
                        handleAction(
                          'INGEST_DOC',
                          () => ingestMockDocumentData(shipmentId, payload),
                          'POST',
                          `/api/shipments/${shipmentId}/documents`,
                          payload
                        );
                      } catch (e) {
                        alert('Invalid input JSON structure');
                      }
                    }}
                    className="bg-primary hover:bg-primary-hover disabled:opacity-40 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm shadow-primary/10 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send size={13} /> Ingest Document Payload
                  </button>
                </div>
              </div>
            </div>
          </Show>

          <Show when={activeTab === PlaygroundTab.VALIDATION}>
            <div className="space-y-6">
              {renderIdSelector()}

              {/* Endpoint D: POST /api/shipments/:id/validate */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 shadow-sm">POST</span>
                  <span className="text-sm font-bold text-slate-800">/api/shipments/:id/validate</span>
                </div>
                <p className="text-xs text-slate-500">
                  Executes the extensible compliance validation ruleset (e.g. weight checks, HS codes, ISPM-15, etc.) and transitions status.
                </p>
                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    disabled={!shipmentId}
                    onClick={() => handleAction(
                      'VALIDATE',
                      () => validateShipmentRecord(shipmentId),
                      'POST',
                      `/api/shipments/${shipmentId}/validate`
                    )}
                    className="bg-primary hover:bg-primary-hover disabled:opacity-40 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm shadow-primary/10 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send size={13} /> Execute Validation Engine
                  </button>
                </div>
              </div>

              {/* Endpoint E: GET /api/shipments/:id/issues */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 shadow-sm">GET</span>
                  <span className="text-sm font-bold text-slate-800">/api/shipments/:id/issues</span>
                </div>
                <p className="text-xs text-slate-500">
                  Queries and lists the active validation issues generated during the validation run.
                </p>
                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    disabled={!shipmentId}
                    onClick={() => handleAction(
                      'GET_ISSUES',
                      () => getShipmentIssues(shipmentId),
                      'GET',
                      `/api/shipments/${shipmentId}/issues`
                    )}
                    className="bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play size={13} /> Get Active Issues
                  </button>
                </div>
              </div>
            </div>
          </Show>

          <Show when={activeTab === PlaygroundTab.REPORTS}>
            <div className="space-y-6">
              {renderIdSelector()}

              {/* Endpoint F: GET /api/shipments/:id/readiness-report */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 shadow-sm">GET</span>
                  <span className="text-sm font-bold text-slate-800">/api/shipments/:id/readiness-report</span>
                </div>
                <p className="text-xs text-slate-500">
                  Generates the compliance summary report including warning levels, blocker flags, and suggested follow-up actions.
                </p>
                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    disabled={!shipmentId}
                    onClick={() => handleAction(
                      'GET_READINESS',
                      () => getShipmentReadiness(shipmentId),
                      'GET',
                      `/api/shipments/${shipmentId}/readiness-report`
                    )}
                    className="bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play size={13} /> Compile Readiness Report
                  </button>
                </div>
              </div>

              {/* Endpoint G: GET /api/shipments/:id/audit-log */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 shadow-sm">GET</span>
                  <span className="text-sm font-bold text-slate-800">/api/shipments/:id/audit-log</span>
                </div>
                <p className="text-xs text-slate-500">
                  Retrieves the historical timeline of operations executed against this shipment record.
                </p>
                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    disabled={!shipmentId}
                    onClick={() => handleAction(
                      'GET_AUDIT',
                      () => getShipmentAuditLog(shipmentId),
                      'GET',
                      `/api/shipments/${shipmentId}/audit-log`
                    )}
                    className="bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play size={13} /> Fetch Audit Log
                  </button>
                </div>
              </div>

              {/* Endpoint H: GET /api/shipments/:id */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 shadow-sm">GET</span>
                  <span className="text-sm font-bold text-slate-800">/api/shipments/:id</span>
                </div>
                <p className="text-xs text-slate-500">
                  Fetches the raw database model representing the shipment details directly.
                </p>
                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    disabled={!shipmentId}
                    onClick={() => handleAction(
                      'GET_RAW_SHIPMENT',
                      () => getShipmentRecord(shipmentId),
                      'GET',
                      `/api/shipments/${shipmentId}`
                    )}
                    className="bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play size={13} /> Fetch Raw Record
                  </button>
                </div>
              </div>
            </div>
          </Show>

        </div>

        {/* Live Output Console Panel */}
        <div className="lg:col-span-5 flex flex-col h-[750px] bg-slate-950 text-slate-200 rounded-2xl p-5 border border-slate-800/80 shadow-2xl font-mono text-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span>
              <span className="font-bold text-[11px] text-slate-400 uppercase tracking-wider">HTTP Request Console</span>
            </div>
            <button 
              type="button"
              onClick={() => setConsoleLogs([])}
              className="text-[10px] text-slate-400 hover:text-white border border-slate-800 hover:border-slate-600 px-2 py-1 rounded cursor-pointer"
            >
              Clear
            </button>
          </div>

          <div className="flex-1 overflow-auto space-y-5 pr-1">
            <Show 
              when={consoleLogs.length > 0}
              fallback={
                <div className="h-full flex flex-col items-center justify-center text-slate-650 italic text-center py-20">
                  <Terminal size={32} className="mb-2 text-slate-700" />
                  No requests sent yet.
                  <div className="text-[10px] mt-1">Execute an endpoint inside a workflow stage tab above to inspect.</div>
                </div>
              }
            >
              {consoleLogs.map((log, idx) => (
                <div key={idx} className="border-b border-slate-900 pb-4 space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded font-extrabold ${log.method === 'GET' ? 'bg-blue-900/40 text-blue-300' : 'bg-emerald-900/40 text-emerald-300'}`}>
                        {log.method}
                      </span>
                      <span className="text-slate-400 font-semibold">{log.url}</span>
                    </div>
                    <span className="text-slate-600 font-medium">{log.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500">STATUS:</span>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-extrabold text-[10px] ${log.status === 200 ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-450'}`}>
                      {log.status === 200 ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                      {log.status}
                    </span>
                  </div>

                  <Show when={!!log.requestBody}>
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-500 font-bold">Request Payload:</div>
                      <pre className="p-2.5 bg-slate-900 rounded-lg text-[11px] overflow-auto max-h-36 border border-slate-800 text-slate-350 shadow-inner">
                        {JSON.stringify(log.requestBody, null, 2)}
                      </pre>
                    </div>
                  </Show>

                  <div className="space-y-1">
                    <div className="text-[10px] text-slate-500 font-bold">Response Body:</div>
                    <pre className="p-2.5 bg-slate-900 rounded-lg text-[11px] overflow-auto max-h-52 border border-slate-850 text-slate-300 shadow-inner">
                      {JSON.stringify(log.responseBody, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </Show>
          </div>
        </div>

      </div>
    </div>
  );
}
