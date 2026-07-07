import { DbService } from '../../db/db.service';
import { Prisma, Severity } from '@prisma/client';

export type ShipmentWithRelations = Prisma.ShipmentGetPayload<{
  include: { country: true; currency: true; issues: true };
}>;

export interface ValidationIssueInput {
  issueType: string;
  severity: Severity;
  fieldInvolved: string;
  explanation: string;
  suggestedAction: string;
}

export interface ValidationRule {
  name: string;
  setNext(next: ValidationRule): ValidationRule;
  validate(shipment: ShipmentWithRelations, dbService: DbService): Promise<ValidationIssueInput[] | null>;
  getRuleNames(): string[];
}
