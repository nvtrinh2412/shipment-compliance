import { ShipmentWithRelations, ValidationRule, ValidationIssueInput } from './validation-rule.interface';
import { DbService } from '../../db/db.service';

export abstract class BaseValidationRule implements ValidationRule {
  abstract name: string;
  protected nextHandler?: ValidationRule;

  setNext(handler: ValidationRule): ValidationRule {
    this.nextHandler = handler;
    return handler;
  }

  async validate(shipment: ShipmentWithRelations, dbService: DbService): Promise<ValidationIssueInput[] | null> {
    const issues = await this.validateSelf(shipment, dbService);

    // Halt chain execution if shouldHalt is triggered
    if (this.shouldHalt(issues)) {
      return issues;
    }

    if (this.nextHandler) {
      const nextIssues = await this.nextHandler.validate(shipment, dbService);
      if (nextIssues) {
        return [...(issues || []), ...nextIssues];
      }
    }

    return issues;
  }

  protected abstract validateSelf(shipment: ShipmentWithRelations, dbService: DbService): Promise<ValidationIssueInput[] | null>;

  getRuleNames(): string[] {
    const names = [this.name];
    if (this.nextHandler) {
      names.push(...this.nextHandler.getRuleNames());
    }
    return names;
  }

  // By default, rules do not halt the chain
  protected shouldHalt(issues: ValidationIssueInput[] | null): boolean {
    return false;
  }
}
