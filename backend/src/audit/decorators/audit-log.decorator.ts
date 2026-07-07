import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '@prisma/client';

export const AUDIT_LOG_ACTION_KEY = 'audit_log_action';


export const AuditLog = (action: AuditAction) =>
  SetMetadata(AUDIT_LOG_ACTION_KEY, { action });
