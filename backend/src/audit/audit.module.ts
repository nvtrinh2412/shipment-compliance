import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AuditService } from './audit.service';
import { AuditProcessor } from './audit.processor';
import { AuditInterceptor } from './interceptors/audit.interceptor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'audit-queue',
    }),
  ],
  providers: [AuditService, AuditProcessor, AuditInterceptor],
  exports: [AuditService, AuditInterceptor],
})
export class AuditModule { }
