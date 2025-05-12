import { Controller, Get, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('audit-logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth('JWT')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all audit logs' })
  @ApiResponse({ status: 200, description: 'Return all audit logs' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll() {
    return this.auditLogsService.findAll();
  }

  @Get('user')
  @ApiOperation({ summary: 'Get audit logs by user ID' })
  @ApiQuery({ name: 'userId', required: true, description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Return audit logs for a user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findByUser(@Query('userId', ParseUUIDPipe) userId: string) {
    return this.auditLogsService.findByUser(userId);
  }

  @Get('action')
  @ApiOperation({ summary: 'Get audit logs by action' })
  @ApiQuery({ name: 'action', required: true, description: 'Action (e.g., GET, POST, PUT, DELETE)' })
  @ApiResponse({ status: 200, description: 'Return audit logs for an action' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findByAction(@Query('action') action: string) {
    return this.auditLogsService.findByAction(action);
  }

  @Get('resource')
  @ApiOperation({ summary: 'Get audit logs by resource' })
  @ApiQuery({ name: 'resource', required: true, description: 'Resource path (e.g., /api/users)' })
  @ApiResponse({ status: 200, description: 'Return audit logs for a resource' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findByResource(@Query('resource') resource: string) {
    return this.auditLogsService.findByResource(resource);
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Get audit logs by date range' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: true, description: 'End date (ISO format)' })
  @ApiResponse({ status: 200, description: 'Return audit logs within date range' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.auditLogsService.findByDateRange(start, end);
  }
}