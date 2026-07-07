import { Controller, Post, Body, Get, Param, UsePipes, Patch, UseInterceptors } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { IngestShipmentDto } from './dto/ingest-shipment.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuditLog } from '../audit/decorators/audit-log.decorator';
import { AuditInterceptor } from '../audit/interceptors/audit.interceptor';
import { AuditAction } from '@prisma/client';

@ApiTags('shipments')
@Controller('api/shipments')
@UseInterceptors(AuditInterceptor)
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post('ingest')
  @AuditLog(AuditAction.DOCUMENT_INGESTED)
  @ApiOperation({ summary: 'Ingest semi-structured OCR shipment data' })
  @ApiResponse({ status: 201, description: 'Shipment ingested and Readiness Report generated.' })
  @UsePipes(new ZodValidationPipe())
  async ingest(@Body() payload: IngestShipmentDto) {
    return this.shipmentsService.ingestDocument(payload);
  }

  @Get(':id/readiness')
  @AuditLog(AuditAction.READINESS_REPORT_GENERATED)
  @ApiOperation({ summary: 'Get Readiness Report for a shipment' })
  @ApiResponse({ status: 200, description: 'Returns the shipment details and validation issues.' })
  async getReadiness(@Param('id') id: string) {
    return this.shipmentsService.getReadinessReport(id);
  }

  @Get()
  @ApiOperation({ summary: 'List recent shipments' })
  async list() {
    return this.shipmentsService.listShipments();
  }

  @Patch(':id')
  @AuditLog(AuditAction.FIELD_UPDATED)
  @ApiOperation({ summary: 'Update shipment fields manually' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.shipmentsService.updateShipment(id, data);
  }
}
