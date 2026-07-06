import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async logAction(
    shipmentId: string,
    action: AuditAction,
    actor: string,
    details: any,
  ) {
    return this.prisma.auditLog.create({
      data: {
        shipmentId,
        action,
        actor,
        details,
      },
    });
  }
}
