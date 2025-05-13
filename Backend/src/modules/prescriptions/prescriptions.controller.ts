import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { PatientsService } from '../patients/patients.service';
import { DoctorsService } from '../doctors/doctors.service';
import { PrescriptionStatus } from './entities/prescription.entity';

@ApiTags('prescriptions')
@Controller('prescriptions')
export class PrescriptionsController {
  constructor(
    private readonly prescriptionsService: PrescriptionsService,
    private readonly patientsService: PatientsService,
    private readonly doctorsService: DoctorsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a new prescription' })
  @ApiResponse({ status: 201, description: 'Prescription created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createPrescriptionDto: CreatePrescriptionDto, @Request() req) {
    // If no doctorId provided, use the current doctor's ID
    if (!createPrescriptionDto.doctorId) {
      const doctor = await this.doctorsService.findByUserId(req.user.id);
      createPrescriptionDto.doctorId = doctor.id;
    }
    
    return this.prescriptionsService.create(createPrescriptionDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get all prescriptions (filtered by role and optional status)' })
  @ApiQuery({ name: 'status', enum: PrescriptionStatus, required: false })
  @ApiResponse({ status: 200, description: 'Return prescriptions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Request() req, @Query('status') status?: PrescriptionStatus) {
    const user = req.user;
    let prescriptions = [];
    
    // Filter by status if provided
    if (status) {
      prescriptions = await this.prescriptionsService.findByStatus(status);
    } else {
      // Handle different roles
      if (user.role === Role.ADMIN || user.role === Role.NURSE) {
        prescriptions = await this.prescriptionsService.findAll();
      } else if (user.role === Role.DOCTOR) {
        const doctor = await this.doctorsService.findByUserId(user.id);
        prescriptions = await this.prescriptionsService.findByDoctor(doctor.id);
      } else if (user.role === Role.PATIENT) {
        const patient = await this.patientsService.findByUserId(user.id);
        prescriptions = await this.prescriptionsService.findByPatient(patient.id);
      }
    }
    
    // If user is a nurse or admin, and status filter is applied, respect that
    if (status && (user.role === Role.ADMIN || user.role === Role.NURSE)) {
      return prescriptions;
    }
    
    // Further filter by role-specific access
    if (user.role === Role.PATIENT) {
      const patient = await this.patientsService.findByUserId(user.id);
      return prescriptions.filter(p => p.patient.id === patient.id);
    } else if (user.role === Role.DOCTOR) {
      const doctor = await this.doctorsService.findByUserId(user.id);
      return prescriptions.filter(p => p.doctor.id === doctor.id);
    }
    
    return prescriptions;
  }

  @Get('queue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.NURSE)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get prescriptions in fulfillment queue' })
  @ApiResponse({ status: 200, description: 'Return prescriptions in queue' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findQueue() {
    return this.prescriptionsService.findByStatus(PrescriptionStatus.ISSUED);
  }

  @Get('patient/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get prescriptions by patient id' })
  @ApiResponse({ status: 200, description: 'Return prescriptions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  findByPatient(@Param('id', ParseUUIDPipe) id: string) {
    return this.prescriptionsService.findByPatient(id);
  }

  @Get('doctor/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get prescriptions by doctor id' })
  @ApiResponse({ status: 200, description: 'Return prescriptions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  findByDoctor(@Param('id', ParseUUIDPipe) id: string) {
    return this.prescriptionsService.findByDoctor(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get prescription by id' })
  @ApiResponse({ status: 200, description: 'Return prescription' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const prescription = await this.prescriptionsService.findOne(id);
    
    // Check if patient is trying to access prescription that isn't theirs
    if (req.user.role === Role.PATIENT) {
      const patient = await this.patientsService.findByUserId(req.user.id);
      if (prescription.patient.id !== patient.id) {
        return { message: 'You do not have access to this prescription' };
      }
    }
    
    // Check if doctor is trying to access prescription they didn't issue
    if (req.user.role === Role.DOCTOR) {
      const doctor = await this.doctorsService.findByUserId(req.user.id);
      if (prescription.doctor.id !== doctor.id) {
        return { message: 'You do not have access to this prescription' };
      }
    }
    
    return prescription;
  }

  @Patch(':id/fulfill')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.NURSE)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Mark prescription as fulfilled' })
  @ApiResponse({ status: 200, description: 'Prescription fulfilled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  async fulfill(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const updateDto: UpdatePrescriptionDto = {
      status: PrescriptionStatus.FULFILLED,
      fulfilledBy: req.user.email,
      fulfilledDate: new Date(),
    };
    
    return this.prescriptionsService.update(id, updateDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update prescription by id' })
  @ApiResponse({ status: 200, description: 'Prescription updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updatePrescriptionDto: UpdatePrescriptionDto,
    @Request() req
  ) {
    // Check permissions for the specific role
    const prescription = await this.prescriptionsService.findOne(id);
    
    if (req.user.role === Role.DOCTOR) {
      const doctor = await this.doctorsService.findByUserId(req.user.id);
      
      // Doctors can only update their own prescriptions
      if (prescription.doctor.id !== doctor.id) {
        return { message: 'You can only update prescriptions you have issued' };
      }
      
      // Doctors cannot update prescriptions that are already fulfilled
      if (prescription.status === PrescriptionStatus.FULFILLED) {
        return { message: 'Cannot update a prescription that has already been fulfilled' };
      }
    }
    
    return this.prescriptionsService.update(id, updatePrescriptionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete prescription by id' })
  @ApiResponse({ status: 200, description: 'Prescription deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Prescription not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    // Doctors can only delete their own prescriptions
    const prescription = await this.prescriptionsService.findOne(id);
    const doctor = await this.doctorsService.findByUserId(req.user.id);
    
    if (prescription.doctor.id !== doctor.id) {
      return { message: 'You can only delete prescriptions you have issued' };
    }
    
    await this.prescriptionsService.remove(id);
    return { message: 'Prescription successfully deleted' };
  }
}