import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../modules/audit-logs/entities/audit-log.entity';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;
    const userId = user?.id;

    return next.handle().pipe(
      tap(() => {
        // Skip logging for certain routes
        if (url.includes('/api/docs') || method === 'OPTIONS') {
          return;
        }

        const auditLog = new AuditLog();
        auditLog.action = method;
        auditLog.resource = url;
        auditLog.userId = userId;
        auditLog.timestamp = new Date();
        auditLog.ipAddress = request.ip;
        auditLog.userAgent = request.get('user-agent') || 'unknown';

        this.auditLogRepository.save(auditLog).catch((error) => {
          console.error('Failed to save audit log:', error);
        });
      }),
    );
  }
}