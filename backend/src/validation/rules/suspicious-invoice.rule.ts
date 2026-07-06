import { ValidationRule, ShipmentWithRelations, ValidationIssueInput } from './validation-rule.interface';
import { Severity } from '@prisma/client';
import { DbService } from '../../db/db.service';
import { ValidationIssueType, ValidationRuleName, VALIDATION_THRESHOLDS } from '../validation.constants';

export class SuspiciousInvoiceRule implements ValidationRule {
  name = ValidationRuleName.SUSPICIOUS_INVOICE_RULE;

  async validate(shipment: ShipmentWithRelations, dbService: DbService): Promise<ValidationIssueInput[] | null> {
    const issues: ValidationIssueInput[] = [];

    if (!shipment.invoiceValue) {
      issues.push({
        issueType: ValidationIssueType.MISSING_INVOICE_VALUE,
        severity: Severity.HIGH,
        fieldInvolved: 'invoiceValue',
        explanation: 'The commercial invoice value is missing.',
        suggestedAction: 'Provide the total invoice value.',
      });
      return issues;
    }

    const value = Number(shipment.invoiceValue);
    if (value <= 0) {
      issues.push({
        issueType: ValidationIssueType.SUSPICIOUS_INVOICE_VALUE,
        severity: Severity.CRITICAL,
        fieldInvolved: 'invoiceValue',
        explanation: `Invoice value (${value}) cannot be zero or negative.`,
        suggestedAction: 'Verify the commercial invoice amount.',
      });
    } else if (value > VALIDATION_THRESHOLDS.SUSPICIOUS_INVOICE_MAX) {
      issues.push({
        issueType: ValidationIssueType.SUSPICIOUS_INVOICE_VALUE,
        severity: Severity.MEDIUM,
        fieldInvolved: 'invoiceValue',
        explanation: `Invoice value (${value}) is unusually high (>$10M) and requires manual review.`,
        suggestedAction: 'Double-check the invoice value and currency.',
      });
    }

    return issues.length > 0 ? issues : null;
  }
}
