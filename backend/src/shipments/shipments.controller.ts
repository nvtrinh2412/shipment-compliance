import { Controller, Post, Body, Get, Param, UsePipes, Patch, UseInterceptors } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { IngestShipmentDto } from './dto/ingest-shipment.dto';
import { CreateShipmentDto } from './dto/create-shipment.dto';
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

  @Post()
  @AuditLog(AuditAction.SHIPMENT_CREATED)
  @ApiOperation({ summary: 'Create a new draft shipment record' })
  @UsePipes(new ZodValidationPipe())
  async create(@Body() payload: CreateShipmentDto) {
    return this.shipmentsService.createShipment(payload);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get shipment details by ID' })
  async get(@Param('id') id: string) {
    return this.shipmentsService.getShipment(id);
  }

  @Post(':id/documents')
  @AuditLog(AuditAction.DOCUMENT_INGESTED)
  @ApiOperation({ summary: 'Ingest mock document OCR data for a shipment' })
  async ingestMockDocument(@Param('id') id: string, @Body() payload: any) {
    return this.shipmentsService.ingestMockDocument(id, payload);
  }

  @Post(':id/validate')
  @ApiOperation({ summary: 'Run the validation engine on a shipment' })
  async validate(@Param('id') id: string) {
    return this.shipmentsService.runValidation(id);
  }

  @Get(':id/issues')
  @ApiOperation({ summary: 'Get active validation issues for a shipment' })
  async getIssues(@Param('id') id: string) {
    return this.shipmentsService.getIssues(id);
  }

  @Get(':id/readiness-report')
  @AuditLog(AuditAction.READINESS_REPORT_GENERATED)
  @ApiOperation({ summary: 'Get customs compliance readiness report' })
  async getReadinessReport(@Param('id') id: string) {
    return this.shipmentsService.getReadinessReport(id);
  }

  @Get(':id/audit-log')
  @ApiOperation({ summary: 'Get the audit history timeline for a shipment' })
  async getAuditLog(@Param('id') id: string) {
    return this.shipmentsService.getAuditLog(id);
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
