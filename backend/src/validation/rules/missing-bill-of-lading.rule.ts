import { BaseValidationRule } from './base-validation.rule';
import { ShipmentWithRelations, ValidationIssueInput } from './validation-rule.interface';
import { Severity } from '@prisma/client';
import { DbService } from '../../db/db.service';
import { ValidationIssueType, ValidationRuleName } from '../validation.constants';

export class MissingBillOfLadingRule extends BaseValidationRule {
  name = ValidationRuleName.MISSING_BILL_OF_LADING_RULE;

  protected async validateSelf(shipment: ShipmentWithRelations, dbService: DbService): Promise<ValidationIssueInput[] | null> {
    if (!shipment.billOfLadingNumber) {
      return [{
        issueType: ValidationIssueType.MISSING_BILL_OF_LADING,
        severity: Severity.HIGH,
        fieldInvolved: 'billOfLadingNumber',
        explanation: 'The Bill of Lading (B/L) number is missing.',
        suggestedAction: 'Input the Bill of Lading number from the carrier documentation.',
      }];
    }
    return null;
  }
}
