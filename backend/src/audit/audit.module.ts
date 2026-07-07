import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AuditService } from './audit.service';
import { AuditProcessor } from './audit.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'audit-queue',
    }),
  ],
  providers: [AuditService, AuditProcessor],
  exports: [AuditService],
})
export class AuditModule { }
