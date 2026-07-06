import { ValidationRule, ShipmentWithRelations, ValidationIssueInput } from './validation-rule.interface';
import { Severity } from '@prisma/client';
import { DbService } from '../../db/db.service';
import { ValidationIssueType, ValidationRuleName, PACKAGING_KEYWORDS } from '../validation.constants';

export class WoodPackagingRule implements ValidationRule {
  name = ValidationRuleName.WOOD_PACKAGING_RULE;

  async validate(shipment: ShipmentWithRelations, dbService: DbService): Promise<ValidationIssueInput[] | null> {
    if (!shipment.packagingType) return null;

    const lowerPackaging = shipment.packagingType.toLowerCase();
    const isWood = PACKAGING_KEYWORDS.WOOD_INDICATORS.some(keyword => lowerPackaging.includes(keyword));

    if (isWood && shipment.ispm15Certified !== true) {
      return [{
        issueType: ValidationIssueType.WOOD_PACKAGING_UNCERTIFIED,
        severity: Severity.CRITICAL,
        fieldInvolved: 'ispm15Certified',
        explanation: `Packaging type is '${shipment.packagingType}' but ISPM-15 certification is missing or false.`,
        suggestedAction: 'Verify if the wooden packaging is ISPM-15 treated and mark it as certified.',
      }];
    }
    return null;
  }
}
