import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { ValidationService } from '../validation/validation.service';
import { DocumentMapper } from './document-mapper';
import { IngestShipmentDto } from './dto/ingest-shipment.dto';
import { ShipmentStatus } from '@prisma/client';

@Injectable()
export class ShipmentsService {
  constructor(
    private readonly dbService: DbService,
    private readonly validationService: ValidationService,
  ) {}

  async ingestDocument(payload: IngestShipmentDto) {
    // 1. Map semi-structured document to standard schema
    const mappedData = DocumentMapper.mapToShipment(payload);
    
    // Extract reference from DTO explicitly
    mappedData.reference = payload.shipment_reference || `REF-${Date.now()}`;
    
    // Fill in placeholders for missing string fields so DB insert doesn't fail on NOT NULL constraints.
    // The validation rules will catch these as 'MISSING_REQUIRED_FIELD' later.
    if (!mappedData.exporter) mappedData.exporter = '';
    if (!mappedData.importer) mappedData.importer = '';
    if (!mappedData.commercialInvoiceNumber) mappedData.commercialInvoiceNumber = '';
    if (!mappedData.goodsDescription) mappedData.goodsDescription = '';
    if (!mappedData.hsCode) mappedData.hsCode = '';
    if (!mappedData.containerNumber) mappedData.containerNumber = '';
    if (!mappedData.billOfLadingNumber) mappedData.billOfLadingNumber = '';
    if (!mappedData.currencyCode) mappedData.currencyCode = 'USD'; // default
    if (!mappedData.invoiceValue) mappedData.invoiceValue = 0;
    if (!mappedData.grossWeightKg) mappedData.grossWeightKg = 0;
    if (!mappedData.netWeightKg) mappedData.netWeightKg = 0;
    
    // 2. Insert mapped data into the database
    const shipment = await this.dbService.shipment.create({
      data: {
        ...(mappedData as any),
        status: ShipmentStatus.PENDING_REVIEW,
      }
    });

    // 3. Run validation rules on the newly created shipment
    const issues = await this.validationService.validateShipment(shipment.id);

    // 4. Fetch updated status
    const updated = await this.dbService.shipment.findUnique({ where: { id: shipment.id }});

    return {
      shipmentId: shipment.id,
      reference: shipment.reference,
      status: updated?.status || ShipmentStatus.ISSUES_FOUND,
      issuesFound: issues.length,
      issues: issues,
    };
  }

  async getReadinessReport(id: string) {
    const shipment = await this.dbService.shipment.findUnique({
      where: { id },
      include: {
        issues: true,
        country: true,
        currency: true,
      }
    });

    if (!shipment) throw new NotFoundException('Shipment not found');

    return shipment;
  }

  async listShipments() {
    return this.dbService.shipment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { issues: true }
    });
  }
}
