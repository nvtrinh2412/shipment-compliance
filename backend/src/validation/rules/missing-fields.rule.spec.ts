import { MissingFieldsRule } from './missing-fields.rule';
import { ShipmentWithRelations } from './validation-rule.interface';
import { ValidationIssueType } from '../validation.constants';
import { Severity } from '@prisma/client';

describe('MissingFieldsRule', () => {
  let rule: MissingFieldsRule;
  let mockDbService: any;

  beforeEach(() => {
    rule = new MissingFieldsRule();
    mockDbService = {} as any; // DbService not required for this specific rule
  });

  it('should return no issues if all required fields are present', async () => {
    const shipment = {
      exporter: 'Tech Corp',
      importer: 'Logistics Co',
      commercialInvoiceNumber: 'INV-456',
      goodsDescription: 'Laptops',
    } as ShipmentWithRelations;

    const result = await rule.validate(shipment, mockDbService);
    expect(result).toBeNull();
  });

  it('should return CRITICAL issues for missing fields', async () => {
    const shipment = {
      exporter: '', // Missing
      importer: 'Logistics Co',
      commercialInvoiceNumber: null, // Missing
      goodsDescription: 'Laptops',
    } as unknown as ShipmentWithRelations;

    const result = await rule.validate(shipment, mockDbService);
    expect(result).not.toBeNull();
    expect(result?.length).toBe(2);
    expect(result![0].fieldInvolved).toBe('exporter');
    expect(result![1].fieldInvolved).toBe('commercialInvoiceNumber');
    expect(result![0].issueType).toBe(ValidationIssueType.MISSING_REQUIRED_FIELD);
    expect(result![0].severity).toBe(Severity.CRITICAL);
  });
});
