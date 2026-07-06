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
import { Severity, ShipmentStatus } from '@prisma/client';

@Injectable()
export class ValidationService {
  private rules: ValidationRule[];

  constructor(private dbService: DbService) {
    this.rules = [
      new MissingFieldsRule(),
      new InvalidHSCodeRule(),
      new MissingCountryRule(),
      new WeightMismatchRule(),
      new MissingBillOfLadingRule(),
      new InvalidContainerRule(),
      new SuspiciousInvoiceRule(),
      new WoodPackagingRule(),
      new ArrivalDateRule(),
      new DuplicateShipmentRule(),
    ];
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

    for (const rule of this.rules) {
      const issues = await rule.validate(shipment, this.dbService);
      if (issues && issues.length > 0) {
        allIssues.push(...issues);
      }
    }

    if (allIssues.length > 0) {
      await this.dbService.validationIssue.createMany({
        data: allIssues.map(i => ({
          ...i,
          shipmentId,
        })),
      });

      await this.dbService.shipment.update({
        where: { id: shipmentId },
        data: { status: ShipmentStatus.ISSUES_FOUND },
      });
    } else {
      await this.dbService.shipment.update({
        where: { id: shipmentId },
        data: { status: ShipmentStatus.READY },
      });
    }

    return allIssues;
  }
}
