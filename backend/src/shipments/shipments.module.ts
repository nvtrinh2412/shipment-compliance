import { Module } from '@nestjs/common';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';
import { ValidationModule } from '../validation/validation.module';

@Module({
  imports: [ValidationModule],
  controllers: [ShipmentsController],
  providers: [ShipmentsService]
})
export class ShipmentsModule {}
