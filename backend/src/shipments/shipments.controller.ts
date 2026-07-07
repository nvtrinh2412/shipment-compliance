import { Controller, Post, Body, Get, Param, UsePipes, Patch } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { IngestShipmentDto } from './dto/ingest-shipment.dto';
import { ZodValidationPipe } from 'nestjs-zod';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('shipments')
@Controller('api/shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post('ingest')
  @ApiOperation({ summary: 'Ingest semi-structured OCR shipment data' })
  @ApiResponse({ status: 201, description: 'Shipment ingested and Readiness Report generated.' })
  @UsePipes(new ZodValidationPipe())
  async ingest(@Body() payload: IngestShipmentDto) {
    return this.shipmentsService.ingestDocument(payload);
  }

  @Get(':id/readiness')
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
  @ApiOperation({ summary: 'Update shipment fields manually' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.shipmentsService.updateShipment(id, data);
  }
}
