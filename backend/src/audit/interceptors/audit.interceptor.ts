import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService, AuditActor } from '../audit.service';
import { AUDIT_LOG_ACTION_KEY } from '../decorators/audit-log.decorator';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const meta = this.reflector.get<{ action: AuditAction }>(
      AUDIT_LOG_ACTION_KEY,
      context.getHandler(),
    );

    if (!meta) {
      return next.handle();
    }

    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();

    return next.handle().pipe(
      tap(async (result) => {
        try {
          await this.processAuditLog(meta.action, request, result);
        } catch (err) {
          // Fail-safe: logging should not impact the main HTTP response flow
          console.error(`AuditInterceptor failed for action ${meta.action}:`, err);
        }
      }),
    );
  }

  private async processAuditLog(action: AuditAction, request: any, result: any): Promise<void> {
    switch (action) {
      case AuditAction.DOCUMENT_INGESTED:
        await this.handleDocumentIngested(request, result);
        break;
      case AuditAction.FIELD_UPDATED:
        await this.handleFieldUpdated(request);
        break;
      case AuditAction.READINESS_REPORT_GENERATED:
        await this.handleReadinessReportGenerated(request);
        break;
      default:
        break;
    }
  }

  private async handleDocumentIngested(request: any, result: any): Promise<void> {
    const shipmentId = result?.shipmentId;
    if (!shipmentId) return;

    // Log both shipment created and document data ingested events
    await this.auditService.logAction(
      shipmentId,
      AuditAction.SHIPMENT_CREATED,
      AuditActor.SYSTEM,
      { reference: result.reference }
    );
    await this.auditService.logAction(
      shipmentId,
      AuditAction.DOCUMENT_INGESTED,
      AuditActor.SYSTEM,
      request.body // Store raw JSON payload
    );
  }

  private async handleFieldUpdated(request: any): Promise<void> {
    const shipmentId = request.params.id;
    if (!shipmentId) return;

    await this.auditService.logAction(
      shipmentId,
      AuditAction.FIELD_UPDATED,
      AuditActor.SYSTEM,
      { updatedFields: Object.keys(request.body) }
    );
  }

  private async handleReadinessReportGenerated(request: any): Promise<void> {
    const shipmentId = request.params.id;
    if (!shipmentId) return;

    await this.auditService.logAction(
      shipmentId,
      AuditAction.READINESS_REPORT_GENERATED,
      AuditActor.SYSTEM,
      { viewTimestamp: new Date().toISOString() }
    );
  }
}
