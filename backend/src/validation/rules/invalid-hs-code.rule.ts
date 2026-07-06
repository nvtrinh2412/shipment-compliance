import { ValidationRule, ShipmentWithRelations, ValidationIssueInput } from './validation-rule.interface';
import { Severity } from '@prisma/client';
import { DbService } from '../../db/db.service';
import { ValidationIssueType, ValidationRuleName } from '../validation.constants';

export class InvalidHSCodeRule implements ValidationRule {
  name = ValidationRuleName.INVALID_HS_CODE_RULE;

  async validate(shipment: ShipmentWithRelations, dbService: DbService): Promise<ValidationIssueInput[] | null> {
    if (!shipment.hsCode) return null;

    // HS code standard is 6 digits, optionally up to 10 digits, sometimes formatted with dots e.g., 8413.70
    const cleanHs = shipment.hsCode.replace(/\./g, '');
    const isValidFormat = /^\d{6,10}$/.test(cleanHs);

    if (!isValidFormat) {
      return [{
        issueType: ValidationIssueType.INVALID_HS_CODE_FORMAT,
        severity: Severity.HIGH,
        fieldInvolved: 'hsCode',
        explanation: `The HS code '${shipment.hsCode}' does not match the standard 6 to 10 digit format.`,
        suggestedAction: 'Verify the HS code against the WCO Harmonized System and correct the formatting.',
      }];
    }
    return null;
  }
}
