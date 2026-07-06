import { ValidationRule, ShipmentWithRelations, ValidationIssueInput } from './validation-rule.interface';
import { Severity } from '@prisma/client';

export class MissingFieldsRule implements ValidationRule {
  name = 'MissingFieldsRule';

  async validate(shipment: ShipmentWithRelations): Promise<ValidationIssueInput[] | null> {
    const issues: ValidationIssueInput[] = [];
    const requiredFields = [
      'exporter', 'importer', 'commercialInvoiceNumber', 'goodsDescription'
    ];

    for (const field of requiredFields) {
      if (!shipment[field as keyof ShipmentWithRelations]) {
        issues.push({
          issueType: 'MISSING_REQUIRED_FIELD',
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
