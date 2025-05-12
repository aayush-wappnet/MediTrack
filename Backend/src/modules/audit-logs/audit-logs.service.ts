import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogsRepository: Repository<AuditLog>,
  ) {}

  async findAll(): Promise<AuditLog[]> {
    return this.auditLogsRepository.find({
      order: { timestamp: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<AuditLog[]> {
    return this.auditLogsRepository.find({
      where: { userId },
      order: { timestamp: 'DESC' },
    });
  }

  async findByAction(action: string): Promise<AuditLog[]> {
    return this.auditLogsRepository.find({
      where: { action },
      order: { timestamp: 'DESC' },
    });
  }

  async findByResource(resource: string): Promise<AuditLog[]> {
    return this.auditLogsRepository.find({
      where: { resource },
      order: { timestamp: 'DESC' },
    });
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<AuditLog[]> {
    return this.auditLogsRepository
      .createQueryBuilder('audit_log')
      .where('audit_log.timestamp >= :startDate', { startDate })
      .andWhere('audit_log.timestamp <= :endDate', { endDate })
      .orderBy('audit_log.timestamp', 'DESC')
      .getMany();
  }

  async createLog(logData: Partial<AuditLog>): Promise<AuditLog> {
    const log = this.auditLogsRepository.create({
      ...logData,
      timestamp: new Date(),
    });
    return this.auditLogsRepository.save(log);
  }
}