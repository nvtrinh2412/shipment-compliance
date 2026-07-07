import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { DbService } from '../db/db.service';
import { AuditAction } from '@prisma/client';
import { Logger } from '@nestjs/common';

@Processor('audit-queue')
export class AuditProcessor extends WorkerHost {
  private readonly logger = new Logger(AuditProcessor.name);

  constructor(private readonly dbService: DbService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { shipmentId, action, actor, details } = job.data;
    
    this.logger.log(`Processing async audit log job: ${action} by ${actor}`);

    try {
      await this.dbService.auditLog.create({
        data: {
          shipmentId,
          action: action as AuditAction,
          actor,
          details,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to write audit log to database:`, error);
      throw error; // Let BullMQ handle retry automatically
    }
  }
}
