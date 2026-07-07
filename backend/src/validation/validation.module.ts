import { Module } from '@nestjs/common';
import { ValidationService } from './validation.service';

import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  providers: [ValidationService],
  exports: [ValidationService]
})
export class ValidationModule { }
