const BASE_URL = 'http://localhost:3000/api';

export const fetchShipments = async () => {
  const res = await fetch(`${BASE_URL}/shipments`);
  if (!res.ok) throw new Error('Failed to fetch shipments');
  return res.json();
};

export const fetchReadiness = async (id: string) => {
  const res = await fetch(`${BASE_URL}/shipments/${id}/readiness-report`);
  if (!res.ok) throw new Error('Failed to fetch readiness report');
  return res.json();
};

export const createShipmentRecord = async (reference: string) => {
  const res = await fetch(`${BASE_URL}/shipments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reference }),
  });
  if (!res.ok) throw new Error('Failed to create shipment record');
  return res.json();
};

export const getShipmentRecord = async (id: string) => {
  const res = await fetch(`${BASE_URL}/shipments/${id}`);
  if (!res.ok) throw new Error('Failed to fetch shipment details');
  return res.json();
};

export const ingestMockDocumentData = async (id: string, payload: any) => {
  const res = await fetch(`${BASE_URL}/shipments/${id}/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to ingest document data');
  return res.json();
};

export const validateShipmentRecord = async (id: string) => {
  const res = await fetch(`${BASE_URL}/shipments/${id}/validate`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to validate shipment');
  return res.json();
};

export const getShipmentIssues = async (id: string) => {
  const res = await fetch(`${BASE_URL}/shipments/${id}/issues`);
  if (!res.ok) throw new Error('Failed to fetch validation issues');
  return res.json();
};

export const getShipmentReadiness = async (id: string) => {
  const res = await fetch(`${BASE_URL}/shipments/${id}/readiness-report`);
  if (!res.ok) throw new Error('Failed to fetch readiness report');
  return res.json();
};

export const getShipmentAuditLog = async (id: string) => {
  const res = await fetch(`${BASE_URL}/shipments/${id}/audit-log`);
  if (!res.ok) throw new Error('Failed to fetch audit log');
  return res.json();
};

// Orchestrated ingestion flow for the original UI pages
export const ingestShipment = async (payload: any) => {
  // Step 1: Create a shipment record
  const ref = payload.shipment_reference || `REF-${Date.now()}`;
  const shipment = await createShipmentRecord(ref);
  
  // Step 2: Ingest mock document data
  await ingestMockDocumentData(shipment.id, payload);

  // Step 3: Run validation
  await validateShipmentRecord(shipment.id);
  
  return { shipmentId: shipment.id };
};
