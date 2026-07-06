import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ShipmentsModule } from './shipments/shipments.module';
import { AuditModule } from './audit/audit.module';
import { ValidationModule } from './validation/validation.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ShipmentsModule, AuditModule, ValidationModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
