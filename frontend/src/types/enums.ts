export const ShipmentStatus = {
  DRAFT: 'DRAFT',
  PENDING_REVIEW: 'PENDING_REVIEW',
  READY: 'READY',
  ISSUES_FOUND: 'ISSUES_FOUND',
} as const;
export type ShipmentStatus = typeof ShipmentStatus[keyof typeof ShipmentStatus];

export const Severity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;
export type Severity = typeof Severity[keyof typeof Severity];

export const AuditAction = {
  SHIPMENT_CREATED: 'SHIPMENT_CREATED',
  DOCUMENT_INGESTED: 'DOCUMENT_INGESTED',
  FIELD_UPDATED: 'FIELD_UPDATED',
  VALIDATION_RUN: 'VALIDATION_RUN',
  READINESS_REPORT_GENERATED: 'READINESS_REPORT_GENERATED',
  STATUS_CHANGED: 'STATUS_CHANGED',
} as const;
export type AuditAction = typeof AuditAction[keyof typeof AuditAction];

export const DetailTab = {
  ISSUES: 'issues',
  RAW: 'raw',
  AUDIT: 'audit',
} as const;
export type DetailTab = typeof DetailTab[keyof typeof DetailTab];
