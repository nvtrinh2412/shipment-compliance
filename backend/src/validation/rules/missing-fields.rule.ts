import { ValidationRule, ShipmentWithRelations, ValidationIssueInput } from './validation-rule.interface';
import { Severity } from '@prisma/client';
import { DbService } from '../../db/db.service';
import { ValidationIssueType, ValidationRuleName, REQUIRED_SHIPMENT_FIELDS } from '../validation.constants';

export class MissingFieldsRule implements ValidationRule {
  name = ValidationRuleName.MISSING_FIELDS_RULE;

  async validate(shipment: ShipmentWithRelations, dbService: DbService): Promise<ValidationIssueInput[] | null> {
    const issues: ValidationIssueInput[] = [];
    const requiredFields = REQUIRED_SHIPMENT_FIELDS;

    for (const field of requiredFields) {
      if (!shipment[field as keyof ShipmentWithRelations]) {
        issues.push({
          issueType: ValidationIssueType.MISSING_REQUIRED_FIELD,
          severity: Severity.CRITICAL,
          fieldInvolved: field,
          explanation: `The required field '${field}' is missing from the shipment record.`,
          suggestedAction: `Provide a valid value for '${field}'.`,
        });
      }
    }
    return issues.length > 0 ? issues : null;
  }
}
