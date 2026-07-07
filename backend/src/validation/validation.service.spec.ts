import { Test, TestingModule } from '@nestjs/testing';
import { ValidationService } from './validation.service';
import { DbService } from '../db/db.service';
import { ShipmentStatus } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

describe('ValidationService', () => {
  let service: ValidationService;
  let dbService: jest.Mocked<DbService>;

  beforeEach(async () => {
    const dbServiceMock = {
      shipment: {
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      validationIssue: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
      },
      isoCountry: {
        findUnique: jest.fn(),
      }
    };

    const auditServiceMock = {
      logAction: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidationService,
        { provide: DbService, useValue: dbServiceMock },
        { provide: AuditService, useValue: auditServiceMock },
      ],
    }).compile();

    service = module.get<ValidationService>(ValidationService);
    dbService = module.get(DbService);
  });

  it('should update status to READY if no issues found', async () => {
    dbService.shipment.findUnique.mockResolvedValue({
      id: 'ship-123',
      exporter: 'Apple',
      importer: 'Foxconn',
      commercialInvoiceNumber: 'INV-123',
      goodsDescription: 'Electronics',
      hsCode: '8471.30',
      countryCode: 'US',
      grossWeightKg: 10,
      netWeightKg: 9,
      billOfLadingNumber: 'BL123',
      containerNumber: 'MSCU1234567',
      invoiceValue: 1000,
      packagingType: 'carton',
      arrivalDate: new Date(),
    } as any);

    (dbService as any).isoCountry.findUnique.mockResolvedValue({ code: 'US' });
    (dbService as any).shipment.count.mockResolvedValue(0);

    const issues = await service.validateShipment('ship-123');

    expect(issues.length).toBe(0);
    expect(dbService.shipment.update).toHaveBeenCalledWith({
      where: { id: 'ship-123' },
      data: { status: ShipmentStatus.READY }
    });
  });

  it('should update status to ISSUES_FOUND if rule fails', async () => {
    dbService.shipment.findUnique.mockResolvedValue({
      id: 'ship-456',
      exporter: '', // Missing exporter triggers CRITICAL error
      importer: 'Foxconn',
      commercialInvoiceNumber: 'INV-123',
      goodsDescription: 'Electronics',
    } as any);

    const issues = await service.validateShipment('ship-456');

    expect(issues.length).toBeGreaterThan(0);
    expect(dbService.shipment.update).toHaveBeenCalledWith({
      where: { id: 'ship-456' },
      data: { status: ShipmentStatus.ISSUES_FOUND }
    });
  });
});
