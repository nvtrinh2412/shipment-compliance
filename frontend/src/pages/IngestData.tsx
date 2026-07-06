import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ingestShipment } from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
import { Show } from '../components/Show';

const DEFAULT_JSON = `{
  "shipment_reference": "OCR-99120",
  "exporter_details": "",
  "importer_details": "Logistics LLC",
  "invoice_no": "INV-10023",
  "invoice_amount": 15000000,
  "currency": "USD",
  "goods_desc": "Electronic components",
  "hs_code": "84713",
  "weight_gross": 1500,
  "weight_net": 2000,
  "pkg_count": 12,
  "pkg_type": "Wooden Pallets",
  "ispm_15": false,
  "container_id": "INVALID123",
  "bl_no": "BL998877",
  "origin_country": "US",
  "destination_country": "VN",
  "arrival_date": "2023-01-01"
}`;

export default function IngestData() {
  const [jsonText, setJsonText] = useState(DEFAULT_JSON);
  const [errorStr, setErrorStr] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ingestShipment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      navigate(`/shipments/${data.shipmentId}`);
    },
    onError: (err: any) => {
      setErrorStr(err.message || 'An error occurred during ingestion.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStr('');
    try {
      const payload = JSON.parse(jsonText);
      mutation.mutate(payload);
    } catch (e) {
      setErrorStr('Invalid JSON format. Please check your syntax.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Simulate OCR Ingestion</h2>
        <p className="text-slate-400 mt-1">Paste raw JSON data extracted from a document to trigger the compliance rules engine.</p>
      </div>

      <Show when={!!errorStr}>
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl">
          {errorStr}
        </div>
      </Show>

      <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Raw JSON Payload</label>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full h-96 bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-sm font-mono text-emerald-400 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-y"
            spellCheck="false"
          />
        </div>
        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={mutation.isPending}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/25 flex items-center gap-2"
          >
            <Show when={mutation.isPending} fallback="Run Validation Engine">
              Processing Engine...
            </Show>
          </button>
        </div>
      </form>
    </div>
  );
}
