import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { AuditAction } from '@prisma/client';

export enum AuditActor {
  SYSTEM = 'System',
  USER = 'User',
}

@Injectable()
export class AuditService {
  constructor(private dbService: DbService) {}

  async logAction(
    shipmentId: string,
    action: AuditAction,
    actor: AuditActor | string,
    details: any,
  ) {
    return this.dbService.auditLog.create({
      data: {
        shipmentId,
        action,
        actor,
        details,
      },
    });
  }
}
