import { BaseValidationRule } from './base-validation.rule';
import { ShipmentWithRelations, ValidationIssueInput } from './validation-rule.interface';
import { Severity } from '@prisma/client';
import { DbService } from '../../db/db.service';
import { ValidationIssueType, ValidationRuleName } from '../validation.constants';

export class MissingCountryRule extends BaseValidationRule {
  name = ValidationRuleName.MISSING_COUNTRY_RULE;

  protected async validateSelf(shipment: ShipmentWithRelations, dbService: DbService): Promise<ValidationIssueInput[] | null> {
    if (!shipment.countryCode) {
      return [{
        issueType: ValidationIssueType.MISSING_COUNTRY_OF_ORIGIN,
        severity: Severity.HIGH,
        fieldInvolved: 'countryCode',
        explanation: 'Country of origin is missing.',
        suggestedAction: 'Provide a valid ISO 3166-1 alpha-2 country code.',
      }];
    }

    const country = await dbService.isoCountry.findUnique({
      where: { code: shipment.countryCode },
    });

    if (!country) {
      return [{
        issueType: ValidationIssueType.INVALID_COUNTRY_CODE,
        severity: Severity.HIGH,
        fieldInvolved: 'countryCode',
        explanation: `The country code '${shipment.countryCode}' is not a recognized ISO 3166-1 alpha-2 code.`,
        suggestedAction: 'Ensure the country code is exactly 2 letters (e.g. US, CN).',
      }];
    }
    return null;
  }
}
