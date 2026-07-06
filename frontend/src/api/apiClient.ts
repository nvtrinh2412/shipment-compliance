const BASE_URL = 'http://localhost:3000/api';

export const fetchShipments = async () => {
  const res = await fetch(`${BASE_URL}/shipments`);
  if (!res.ok) throw new Error('Failed to fetch shipments');
  return res.json();
};

export const fetchReadiness = async (id: string) => {
  const res = await fetch(`${BASE_URL}/shipments/${id}/readiness`);
  if (!res.ok) throw new Error('Failed to fetch readiness report');
  return res.json();
};

export const ingestShipment = async (payload: any) => {
  const res = await fetch(`${BASE_URL}/shipments/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to ingest document');
  return res.json();
};
