import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { ValidationService } from '../validation/validation.service';
import { DocumentMapper } from './document-mapper';
import { IngestShipmentDto } from './dto/ingest-shipment.dto';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { ShipmentStatus, Severity } from '@prisma/client';

@Injectable()
export class ShipmentsService {
  constructor(
    private readonly dbService: DbService,
    private readonly validationService: ValidationService,
  ) { }

  async createShipment(dto: CreateShipmentDto) {
    const shipment = await this.dbService.shipment.create({
      data: {
        reference: dto.reference,
        exporter: '',
        importer: '',
        commercialInvoiceNumber: '',
        goodsDescription: '',
        hsCode: '',
        containerNumber: '',
        billOfLadingNumber: '',
        packagingType: '',
        countryCode: 'US',
        currencyCode: 'USD',
        invoiceValue: 0,
        grossWeightKg: 0,
        netWeightKg: 0,
        numberOfPackages: 0,
        arrivalDate: new Date(),
        status: ShipmentStatus.DRAFT,
      }
    });
    return shipment;
  }

  async getShipment(id: string) {
    const shipment = await this.dbService.shipment.findUnique({
      where: { id },
    });
    if (!shipment) throw new NotFoundException('Shipment not found');
    return shipment;
  }

  async ingestMockDocument(id: string, payload: any) {
    const shipment = await this.dbService.shipment.findUnique({ where: { id } });
    if (!shipment) throw new NotFoundException('Shipment not found');

    const mappedData = DocumentMapper.mapToShipment(payload);

    // Default mapped fields if missing to prevent SQL failures on non-nullable columns.
    if (!mappedData.exporter) mappedData.exporter = '';
    if (!mappedData.importer) mappedData.importer = '';
    if (!mappedData.commercialInvoiceNumber) mappedData.commercialInvoiceNumber = '';
    if (!mappedData.goodsDescription) mappedData.goodsDescription = '';
    if (!mappedData.hsCode) mappedData.hsCode = '';
    if (!mappedData.containerNumber) mappedData.containerNumber = '';
    if (!mappedData.billOfLadingNumber) mappedData.billOfLadingNumber = '';
    if (!mappedData.packagingType) mappedData.packagingType = '';
    if (!mappedData.countryCode) mappedData.countryCode = 'US';
    if (!mappedData.currencyCode) mappedData.currencyCode = 'USD';
    if (!mappedData.invoiceValue) mappedData.invoiceValue = 0;
    if (!mappedData.grossWeightKg) mappedData.grossWeightKg = 0;
    if (!mappedData.netWeightKg) mappedData.netWeightKg = 0;
    if (!mappedData.numberOfPackages || !mappedData.numberOfPackages) mappedData.numberOfPackages = 0;
    if (!mappedData.arrivalDate) mappedData.arrivalDate = new Date();

    const updated = await this.dbService.shipment.update({
      where: { id },
      data: {
        ...(mappedData as any),
        status: ShipmentStatus.PENDING_REVIEW,
      }
    });

    return updated;
  }

  async runValidation(id: string) {
    const shipment = await this.dbService.shipment.findUnique({ where: { id } });
    if (!shipment) throw new NotFoundException('Shipment not found');

    const issues = await this.validationService.validateShipment(id);
    return issues;
  }

  async getIssues(id: string) {
    const shipment = await this.dbService.shipment.findUnique({ where: { id } });
    if (!shipment) throw new NotFoundException('Shipment not found');

    return this.dbService.validationIssue.findMany({
      where: { shipmentId: id }
    });
  }

  async getAuditLog(id: string) {
    const shipment = await this.dbService.shipment.findUnique({ where: { id } });
    if (!shipment) throw new NotFoundException('Shipment not found');

    return this.dbService.auditLog.findMany({
      where: { shipmentId: id },
      orderBy: { timestamp: 'desc' }
    });
  }

  // Deprecated helper. Keeps legacy controller endpoints happy.
  async ingestDocument(payload: IngestShipmentDto) {
    const mappedData = DocumentMapper.mapToShipment(payload);
    mappedData.reference = payload.shipment_reference || `REF-${Date.now()}`;

    if (!mappedData.exporter) mappedData.exporter = '';
    if (!mappedData.importer) mappedData.importer = '';
    if (!mappedData.commercialInvoiceNumber) mappedData.commercialInvoiceNumber = '';
    if (!mappedData.goodsDescription) mappedData.goodsDescription = '';
    if (!mappedData.hsCode) mappedData.hsCode = '';
    if (!mappedData.containerNumber) mappedData.containerNumber = '';
    if (!mappedData.billOfLadingNumber) mappedData.billOfLadingNumber = '';
    if (!mappedData.packagingType) mappedData.packagingType = '';
    if (!mappedData.countryCode) mappedData.countryCode = 'US';
    if (!mappedData.currencyCode) mappedData.currencyCode = 'USD';
    if (!mappedData.invoiceValue) mappedData.invoiceValue = 0;
    if (!mappedData.grossWeightKg) mappedData.grossWeightKg = 0;
    if (!mappedData.netWeightKg) mappedData.netWeightKg = 0;
    if (mappedData.numberOfPackages === undefined || mappedData.numberOfPackages === null) mappedData.numberOfPackages = 0;
    if (!mappedData.arrivalDate) mappedData.arrivalDate = new Date();

    const shipment = await this.dbService.shipment.create({
      data: {
        ...(mappedData as any),
        status: ShipmentStatus.PENDING_REVIEW,
      }
    });

    const issues = await this.validationService.validateShipment(shipment.id);
    const updated = await this.dbService.shipment.findUnique({ where: { id: shipment.id } });

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
        auditLogs: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    if (!shipment) throw new NotFoundException('Shipment not found');

    const issues = shipment.issues || [];
    const blockers = issues.filter(i => i.severity === Severity.CRITICAL || i.severity === Severity.HIGH);
    const warnings = issues.filter(i => i.severity === Severity.MEDIUM || i.severity === Severity.LOW);
    const suggestedActions = issues
      .map(i => i.suggestedAction)
      .filter(Boolean);

    return {
      ...shipment,
      report: {
        summary: `Shipment from ${shipment.exporter || 'Unknown'} to ${shipment.importer || 'Unknown'} containing ${shipment.goodsDescription || 'no goods description'}.`,
        status: shipment.status,
        issuesCount: issues.length,
        blockers,
        warnings,
        suggestedActions,
        humanReviewRequired: shipment.status !== ShipmentStatus.READY,
      }
    };
  }

  async listShipments() {
    return this.dbService.shipment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { issues: true }
    });
  }

  async updateShipment(id: string, data: any) {
    const updated = await this.dbService.shipment.update({
      where: { id },
      data,
    });

    await this.validationService.validateShipment(id);
    return this.getReadinessReport(id);
  }
}
