import { ValidationRule, ShipmentWithRelations, ValidationIssueInput } from './validation-rule.interface';
import { Severity } from '@prisma/client';

export class InvalidContainerRule implements ValidationRule {
  name = 'InvalidContainerRule';

  async validate(shipment: ShipmentWithRelations): Promise<ValidationIssueInput[] | null> {
    if (!shipment.containerNumber) return null;

    // Standard ISO 6346: 3 letters (owner code), 1 letter (equipment category), 6 digits (serial), 1 digit (check)
    // So 4 letters followed by 7 digits.
    const isValid = /^[A-Z]{4}\d{7}$/.test(shipment.containerNumber.toUpperCase());

    if (!isValid) {
      return [{
        issueType: 'INVALID_CONTAINER_NUMBER',
        severity: Severity.MEDIUM,
        fieldInvolved: 'containerNumber',
        explanation: `The container number '${shipment.containerNumber}' does not match the ISO 6346 standard (4 letters followed by 7 digits).`,
        suggestedAction: 'Check the container number for typos and ensure it matches standard format (e.g., MSCU1234567).',
      }];
    }
    return null;
  }
}
