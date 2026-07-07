import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ShipmentsModule } from './shipments/shipments.module';
import { AuditModule } from './audit/audit.module';
import { ValidationModule } from './validation/validation.module';
import { DbModule } from './db/db.module';
import { BullModule } from '@nestjs/bullmq';
import { config } from './config';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: config.redis.host,
        port: config.redis.port,
      },
    }),
    ShipmentsModule,
    AuditModule,
    ValidationModule,
    DbModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
