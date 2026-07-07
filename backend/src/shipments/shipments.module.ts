import { Module } from '@nestjs/common';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';
import { ValidationModule } from '../validation/validation.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [ValidationModule, AuditModule],
  controllers: [ShipmentsController],
  providers: [ShipmentsService]
})
export class ShipmentsModule {}
