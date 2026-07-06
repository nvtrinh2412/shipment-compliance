import { ValidationRule, ShipmentWithRelations, ValidationIssueInput } from './validation-rule.interface';
import { Severity } from '@prisma/client';
import { DbService } from '../../db/db.service';
import { ValidationIssueType, ValidationRuleName, TIME_CONSTANTS, VALIDATION_THRESHOLDS } from '../validation.constants';

export class ArrivalDateRule implements ValidationRule {
  name = ValidationRuleName.ARRIVAL_DATE_RULE;

  async validate(shipment: ShipmentWithRelations, dbService: DbService): Promise<ValidationIssueInput[] | null> {
    if (!shipment.arrivalDate) return null;

    const arrival = new Date(shipment.arrivalDate);
    const now = new Date();
    
    // Allowed review window is up to 30 days in the past
    const diffTime = Math.abs(now.getTime() - arrival.getTime());
    const diffDays = Math.ceil(diffTime / TIME_CONSTANTS.MS_IN_A_DAY); 
    const isPast = arrival < now;

    if (isPast && diffDays > VALIDATION_THRESHOLDS.STALE_ARRIVAL_DAYS_LIMIT) {
      return [{
        issueType: ValidationIssueType.STALE_ARRIVAL_DATE,
        severity: Severity.MEDIUM,
        fieldInvolved: 'arrivalDate',
        explanation: `Arrival date (${arrival.toISOString().split('T')[0]}) is more than ${VALIDATION_THRESHOLDS.STALE_ARRIVAL_DAYS_LIMIT} days in the past.`,
        suggestedAction: 'Check if this shipment is still active or if the date was entered incorrectly.',
      }];
    }
    return null;
  }
}
