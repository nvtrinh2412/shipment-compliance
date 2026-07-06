import { ValidationRule, ShipmentWithRelations, ValidationIssueInput } from './validation-rule.interface';
import { Severity } from '@prisma/client';
import { DbService } from '../../db/db.service';
import { ValidationIssueType, ValidationRuleName } from '../validation.constants';

export class DuplicateShipmentRule implements ValidationRule {
  name = ValidationRuleName.DUPLICATE_SHIPMENT_RULE;

  async validate(shipment: ShipmentWithRelations, dbService: DbService): Promise<ValidationIssueInput[] | null> {
    if (!shipment.reference) return null;

    const duplicates = await dbService.shipment.count({
      where: {
        reference: shipment.reference,
        id: { not: shipment.id },
      },
    });

    if (duplicates > 0) {
      return [{
        issueType: ValidationIssueType.DUPLICATE_SHIPMENT_REFERENCE,
        severity: Severity.CRITICAL,
        fieldInvolved: 'reference',
        explanation: `Another shipment with the reference '${shipment.reference}' already exists in the system.`,
        suggestedAction: 'Ensure this is not a duplicate entry. Change the reference if it belongs to a different shipment.',
      }];
    }
    return null;
  }
}
