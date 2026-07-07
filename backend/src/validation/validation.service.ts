import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { ValidationRule, ShipmentWithRelations } from './rules/validation-rule.interface';
import { MissingFieldsRule } from './rules/missing-fields.rule';
import { InvalidHSCodeRule } from './rules/invalid-hs-code.rule';
import { MissingCountryRule } from './rules/missing-country.rule';
import { WeightMismatchRule } from './rules/weight-mismatch.rule';
import { MissingBillOfLadingRule } from './rules/missing-bill-of-lading.rule';
import { InvalidContainerRule } from './rules/invalid-container.rule';
import { SuspiciousInvoiceRule } from './rules/suspicious-invoice.rule';
import { WoodPackagingRule } from './rules/wood-packaging.rule';
import { ArrivalDateRule } from './rules/arrival-date.rule';
import { DuplicateShipmentRule } from './rules/duplicate-shipment.rule';
import { Severity, ShipmentStatus, AuditAction } from '@prisma/client';
import { AuditService, AuditActor } from '../audit/audit.service';

@Injectable()
export class ValidationService {
  private validationChain: ValidationRule;

  constructor(
    private dbService: DbService,
    private auditService: AuditService,
  ) {
    const missingFields = new MissingFieldsRule();
    
    missingFields
      .setNext(new InvalidHSCodeRule())
      .setNext(new MissingCountryRule())
      .setNext(new WeightMismatchRule())
      .setNext(new MissingBillOfLadingRule())
      .setNext(new InvalidContainerRule())
      .setNext(new SuspiciousInvoiceRule())
      .setNext(new WoodPackagingRule())
      .setNext(new ArrivalDateRule())
      .setNext(new DuplicateShipmentRule());

    this.validationChain = missingFields;
  }

  async validateShipment(shipmentId: string) {
    const shipment = await this.dbService.shipment.findUnique({
      where: { id: shipmentId },
      include: { country: true, currency: true, issues: true },
    });

    if (!shipment) throw new Error('Shipment not found');

    const allIssues = [];

    // Clear previous validation issues to regenerate fresh ones
    await this.dbService.validationIssue.deleteMany({
      where: { shipmentId },
    });

    const issues = await this.validationChain.validate(shipment, this.dbService);
    if (issues && issues.length > 0) {
      allIssues.push(...issues);
    }

    // Log validation run event
    await this.auditService.logAction(
      shipmentId,
      AuditAction.VALIDATION_RUN,
      AuditActor.SYSTEM,
      { rulesRun: this.validationChain.getRuleNames(), issuesFound: allIssues.length }
    );

    if (allIssues.length > 0) {
      await this.dbService.validationIssue.createMany({
        data: allIssues.map(i => ({
          issueType: i.issueType,
          severity: i.severity,
          fieldInvolved: i.fieldInvolved || '',
          explanation: i.explanation || '',
          suggestedAction: i.suggestedAction || '',
          shipmentId,
        })),
      });

      await this.dbService.shipment.update({
        where: { id: shipmentId },
        data: { status: ShipmentStatus.ISSUES_FOUND },
      });

      await this.auditService.logAction(
        shipmentId,
        AuditAction.STATUS_CHANGED,
        AuditActor.SYSTEM,
        { from: shipment.status, to: ShipmentStatus.ISSUES_FOUND }
      );
    } else {
      await this.dbService.shipment.update({
        where: { id: shipmentId },
        data: { status: ShipmentStatus.READY },
      });

      await this.auditService.logAction(
        shipmentId,
        AuditAction.STATUS_CHANGED,
        AuditActor.SYSTEM,
        { from: shipment.status, to: ShipmentStatus.READY }
      );
    }

    return allIssues;
  }
}
