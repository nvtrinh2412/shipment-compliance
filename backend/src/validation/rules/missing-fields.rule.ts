import { BaseValidationRule } from './base-validation.rule';
import { ShipmentWithRelations, ValidationIssueInput } from './validation-rule.interface';
import { Severity } from '@prisma/client';
import { DbService } from '../../db/db.service';
import { ValidationIssueType, ValidationRuleName, REQUIRED_SHIPMENT_FIELDS } from '../validation.constants';

export class MissingFieldsRule extends BaseValidationRule {
  name = ValidationRuleName.MISSING_FIELDS_RULE;

  protected async validateSelf(shipment: ShipmentWithRelations, dbService: DbService): Promise<ValidationIssueInput[] | null> {
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

  protected shouldHalt(issues: ValidationIssueInput[] | null): boolean {
    // If there are missing fields, halt the chain so subsequent checks are not run on incomplete data.
    return issues !== null && issues.length > 0;
  }
}
