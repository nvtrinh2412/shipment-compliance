import { ValidationRule, ShipmentWithRelations, ValidationIssueInput } from './validation-rule.interface';
import { Severity } from '@prisma/client';

export class WeightMismatchRule implements ValidationRule {
  name = 'WeightMismatchRule';

  async validate(shipment: ShipmentWithRelations): Promise<ValidationIssueInput[] | null> {
    if (shipment.grossWeightKg === null || shipment.netWeightKg === null) return null;

    if (Number(shipment.grossWeightKg) < Number(shipment.netWeightKg)) {
      return [{
        issueType: 'WEIGHT_MISMATCH',
        severity: Severity.CRITICAL,
        fieldInvolved: 'grossWeightKg',
        explanation: `Gross weight (${shipment.grossWeightKg}kg) cannot be lower than net weight (${shipment.netWeightKg}kg).`,
        suggestedAction: 'Correct the weight values. Gross weight must include packaging and be greater than or equal to net weight.',
      }];
    }
    return null;
  }
}
