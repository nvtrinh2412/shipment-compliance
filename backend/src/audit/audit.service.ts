import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AuditAction } from '@prisma/client';

export enum AuditActor {
  SYSTEM = 'System',
  USER = 'User',
}

@Injectable()
export class AuditService {
  constructor(@InjectQueue('audit-queue') private auditQueue: Queue) { }

  async logAction(
    shipmentId: string,
    action: AuditAction,
    actor: AuditActor | string,
    details: any,
  ) {
    // Asynchronously push to the queue
    await this.auditQueue.add('log', {
      shipmentId,
      action,
      actor,
      details,
    });
  }
}
