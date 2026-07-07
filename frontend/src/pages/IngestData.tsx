import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ingestShipment } from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
import { Show } from '../components/Show';
import { FileCode } from 'lucide-react';

const PRESETS = {
  COMPLIANT: {
    name: '🟢 Fully Compliant Shipment',
    description: 'Passes all 10 compliance rules successfully.',
    json: `{
  "shipment_reference": "REF-OK-2026",
  "exporter_details": "Tech Corp USA",
  "importer_details": "Logistics Asia Co",
  "invoice_no": "INV-10101",
  "invoice_amount": 500000,
  "currency": "USD",
  "goods_desc": "Industrial Machinery",
  "hs_code": "8413.70",
  "weight_gross": 2500,
  "weight_net": 2400,
  "pkg_count": 5,
  "pkg_type": "Cardboard Boxes",
  "ispm_15": true,
  "container_id": "MSCU1234567",
  "bl_no": "BOL998877",
  "origin_country": "US",
  "destination_country": "VN",
  "arrival_date": "2026-08-01"
}`
  },
  MULTIPLE_ISSUES: {
    name: '🔴 Multiple Violations',
    description: 'Fails gross vs net weight, invalid HS format, missing exporter, etc.',
    json: `{
  "shipment_reference": "REF-FAIL-990",
  "exporter_details": "",
  "importer_details": "Logistics Asia Co",
  "invoice_no": "INV-20202",
  "invoice_amount": 2500,
  "currency": "USD",
  "goods_desc": "Electronic parts",
  "hs_code": "INVALID_HS",
  "weight_gross": 1000,
  "weight_net": 1200,
  "pkg_count": 8,
  "pkg_type": "Wooden Pallets",
  "ispm_15": false,
  "container_id": "ABC1234567",
  "bl_no": "",
  "origin_country": "XX",
  "destination_country": "VN",
  "arrival_date": "2023-01-01"
}`
  },
  SUSPICIOUS_VALUATION: {
    name: '🟡 Suspicious Valuation (> $10M)',
    description: 'Triggers blocker warning on invoice valuation exceeding threshold.',
    json: `{
  "shipment_reference": "REF-SUSPICIOUS-INV",
  "exporter_details": "AeroTech LLC",
  "importer_details": "Global Import Co",
  "invoice_no": "INV-99099",
  "invoice_amount": 12000000,
  "currency": "USD",
  "goods_desc": "Aircraft Engines",
  "hs_code": "8803.30",
  "weight_gross": 15000,
  "weight_net": 14500,
  "pkg_count": 2,
  "pkg_type": "Steel Crates",
  "ispm_15": true,
  "container_id": "MEDU9988776",
  "bl_no": "BL554433",
  "origin_country": "US",
  "destination_country": "JP",
  "arrival_date": "2026-10-15"
}`
  }
};

export default function IngestData() {
  const [jsonText, setJsonText] = useState(PRESETS.COMPLIANT.json);
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
    } catch (err) {
      setErrorStr('Invalid JSON format. Please check your syntax.');
    }
  };

  const loadPreset = (presetJson: string) => {
    setErrorStr('');
    try {
      const payload = JSON.parse(presetJson);
      // Automatically randomize reference to avoid DUPLICATE_SHIPMENT_REFERENCE error
      payload.shipment_reference = `${payload.shipment_reference}-${Math.floor(Math.random() * 9000) + 1000}`;
      setJsonText(JSON.stringify(payload, null, 2));
    } catch (err) {
      setJsonText(presetJson);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Simulate OCR Ingestion</h2>
        <p className="text-slate-500 text-sm mt-1">Paste raw JSON data extracted from a document to trigger the compliance rules engine.</p>
      </div>

      {/* Preset Quick Select List */}
      <div className="glass-panel p-5 rounded-2xl space-y-3 border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <FileCode size={16} className="text-primary" />
          Quick Load Preset Templates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => loadPreset(PRESETS.COMPLIANT.json)}
            className="text-left p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50/70 transition-all duration-200 cursor-pointer"
          >
            <div className="text-xs font-bold text-emerald-800">{PRESETS.COMPLIANT.name}</div>
            <div className="text-[10px] text-slate-500 mt-1">{PRESETS.COMPLIANT.description}</div>
          </button>
          <button
            onClick={() => loadPreset(PRESETS.MULTIPLE_ISSUES.json)}
            className="text-left p-3.5 rounded-xl border border-rose-100 bg-rose-50/30 hover:bg-rose-50/70 transition-all duration-200 cursor-pointer"
          >
            <div className="text-xs font-bold text-rose-800">{PRESETS.MULTIPLE_ISSUES.name}</div>
            <div className="text-[10px] text-slate-500 mt-1">{PRESETS.MULTIPLE_ISSUES.description}</div>
          </button>
          <button
            onClick={() => loadPreset(PRESETS.SUSPICIOUS_VALUATION.json)}
            className="text-left p-3.5 rounded-xl border border-amber-100 bg-amber-50/30 hover:bg-amber-50/70 transition-all duration-200 cursor-pointer"
          >
            <div className="text-xs font-bold text-amber-800">{PRESETS.SUSPICIOUS_VALUATION.name}</div>
            <div className="text-[10px] text-slate-500 mt-1">{PRESETS.SUSPICIOUS_VALUATION.description}</div>
          </button>
        </div>
      </div>

      <Show when={!!errorStr}>
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm font-medium">
          {errorStr}
        </div>
      </Show>

      <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl space-y-6 border border-slate-100">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Raw JSON Payload</label>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full h-96 bg-slate-50/40 border border-slate-200 rounded-xl p-4 text-sm font-mono text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y shadow-inner"
            spellCheck="false"
          />
        </div>
        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={mutation.isPending}
            className="bg-primary hover:bg-primary-hover disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm border border-primary/10 flex items-center gap-2 cursor-pointer"
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
