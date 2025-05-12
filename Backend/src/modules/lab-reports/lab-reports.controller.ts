import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseUUIDPipe, Query, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LabReportsService } from './lab-reports.service';
import { CreateLabReportDto } from './dto/create-lab-report.dto';
import { UpdateLabReportDto } from './dto/update-lab-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { PatientsService } from '../patients/patients.service';
import { DoctorsService } from '../doctors/doctors.service';
import { NursesService } from '../nurses/nurses.service';
import { LabReportStatus } from './entities/lab-report.entity';

@ApiTags('lab-reports')
@Controller('lab-reports')
export class LabReportsController {
  constructor(
    private readonly labReportsService: LabReportsService,
    private readonly patientsService: PatientsService,
    private readonly doctorsService: DoctorsService,
    private readonly nursesService: NursesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a new lab report' })
  @ApiResponse({ status: 201, description: 'Lab report created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createLabReportDto: CreateLabReportDto, @Request() req) {
    // If no orderedById provided, use the current doctor's ID
    if (!createLabReportDto.orderedById) {
      const doctor = await this.doctorsService.findByUserId(req.user.id);
      createLabReportDto.orderedById = doctor.id;
    }
    
    return this.labReportsService.create(createLabReportDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get all lab reports (filtered by role and optional status)' })
  @ApiQuery({ name: 'status', enum: LabReportStatus, required: false })
  @ApiResponse({ status: 200, description: 'Return lab reports' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Request() req, @Query('status') status?: LabReportStatus) {
    const user = req.user;
    let labReports = [];
    
    // Filter by status if provided
    if (status) {
      labReports = await this.labReportsService.findByStatus(status);
    } else {
      // Handle different roles
      if (user.role === Role.ADMIN) {
        labReports = await this.labReportsService.findAll();
      } else if (user.role === Role.DOCTOR) {
        const doctor = await this.doctorsService.findByUserId(user.id);
        labReports = await this.labReportsService.findByDoctor(doctor.id);
      } else if (user.role === Role.NURSE) {
        const nurse = await this.nursesService.findByUserId(user.id);
        labReports = await this.labReportsService.findByNurse(nurse.id);
      } else if (user.role === Role.PATIENT) {
        const patient = await this.patientsService.findByUserId(user.id);
        labReports = await this.labReportsService.findByPatient(patient.id);
      }
    }
    
    // If user is a nurse or admin, and status filter is applied, respect that
    if (status && (user.role === Role.ADMIN || user.role === Role.NURSE)) {
      return labReports;
    }
    
    // Further filter by role-specific access
    if (user.role === Role.PATIENT) {
      const patient = await this.patientsService.findByUserId(user.id);
      return labReports.filter(lr => lr.patient.id === patient.id);
    } else if (user.role === Role.DOCTOR) {
      const doctor = await this.doctorsService.findByUserId(user.id);
      return labReports.filter(lr => lr.orderedBy.id === doctor.id);
    }
    
    return labReports;
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR, Role.NURSE)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get pending lab reports' })
  @ApiResponse({ status: 200, description: 'Return pending lab reports' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findPending() {
    return this.labReportsService.findByStatus(LabReportStatus.ORDERED);
  }

  @Get('patient/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get lab reports by patient id' })
  @ApiResponse({ status: 200, description: 'Return lab reports' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  findByPatient(@Param('id', ParseUUIDPipe) id: string) {
    return this.labReportsService.findByPatient(id);
  }

  @Get('doctor/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get lab reports ordered by doctor id' })
  @ApiResponse({ status: 200, description: 'Return lab reports' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  findByDoctor(@Param('id', ParseUUIDPipe) id: string) {
    return this.labReportsService.findByDoctor(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get lab report by id' })
  @ApiResponse({ status: 200, description: 'Return lab report' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Lab report not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const labReport = await this.labReportsService.findOne(id);
    
    // Check if patient is trying to access lab report that isn't theirs
    if (req.user.role === Role.PATIENT) {
      const patient = await this.patientsService.findByUserId(req.user.id);
      if (labReport.patient.id !== patient.id) {
        return { message: 'You do not have access to this lab report' };
      }
    }
    
    return labReport;
  }

  @Patch(':id/upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.NURSE)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Upload lab report results' })
  @ApiResponse({ status: 200, description: 'Lab report updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Lab report not found' })
  async uploadResults(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLabReportDto: UpdateLabReportDto,
    @Request() req
  ) {
    const nurse = await this.nursesService.findByUserId(req.user.id);
    
    // Make sure required fields are provided
    if (!updateLabReportDto.results) {
      throw new BadRequestException('Results are required');
    }
    
    // Update with nurse info and status
    updateLabReportDto.uploadedById = nurse.id;
    updateLabReportDto.status = LabReportStatus.COMPLETED;
    updateLabReportDto.resultsDate = new Date();
    
    return this.labReportsService.update(id, updateLabReportDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update lab report by id' })
  @ApiResponse({ status: 200, description: 'Lab report updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Lab report not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLabReportDto: UpdateLabReportDto,
    @Request() req
  ) {
    // Check permissions for the specific role
    const labReport = await this.labReportsService.findOne(id);
    
    if (req.user.role === Role.DOCTOR) {
      const doctor = await this.doctorsService.findByUserId(req.user.id);
      
      // Doctors can only update lab reports they ordered or add doctor notes
      if (labReport.orderedBy.id !== doctor.id && Object.keys(updateLabReportDto).length > 1 && !updateLabReportDto.doctorNotes) {
        return { message: 'You can only add notes to lab reports you did not order' };
      }
    } else if (req.user.role === Role.NURSE) {
      // Nurses can only update certain fields
      const allowedFields = ['status', 'results', 'testDate', 'resultsDate', 'comments', 'fileUrl', 'uploadedById'];
      const providedFields = Object.keys(updateLabReportDto);
      
      const hasDisallowedFields = providedFields.some(field => !allowedFields.includes(field));
      
      if (hasDisallowedFields) {
        return { message: 'You can only update results, status, dates, comments, and file URL' };
      }
      
      // If updating results, set the nurse as the uploader
      if (updateLabReportDto.results || updateLabReportDto.status === LabReportStatus.COMPLETED) {
        const nurse = await this.nursesService.findByUserId(req.user.id);
        updateLabReportDto.uploadedById = nurse.id;
      }
    }
    
    return this.labReportsService.update(id, updateLabReportDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete lab report by id' })
  @ApiResponse({ status: 200, description: 'Lab report deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Lab report not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    // Doctors can only delete lab reports they ordered
    const labReport = await this.labReportsService.findOne(id);
    const doctor = await this.doctorsService.findByUserId(req.user.id);
    
    if (labReport.orderedBy.id !== doctor.id) {
      return { message: 'You can only delete lab reports you have ordered' };
    }
    
    await this.labReportsService.remove(id);
    return { message: 'Lab report successfully deleted' };
  }
}