import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DiagnosesService } from './diagnoses.service';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { PatientsService } from '../patients/patients.service';
import { DoctorsService } from '../doctors/doctors.service';

@ApiTags('diagnoses')
@Controller('diagnoses')
export class DiagnosesController {
  constructor(
    private readonly diagnosesService: DiagnosesService,
    private readonly patientsService: PatientsService,
    private readonly doctorsService: DoctorsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a new diagnosis' })
  @ApiResponse({ status: 201, description: 'Diagnosis created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createDiagnosisDto: CreateDiagnosisDto, @Request() req) {
    // If no doctorId provided, use the current doctor's ID
    if (!createDiagnosisDto.doctorId) {
      const doctor = await this.doctorsService.findByUserId(req.user.id);
      createDiagnosisDto.doctorId = doctor.id;
    }
    
    return this.diagnosesService.create(createDiagnosisDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get all diagnoses (filtered by role)' })
  @ApiResponse({ status: 200, description: 'Return diagnoses' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Request() req) {
    const user = req.user;
    
    // Handle different roles
    if (user.role === Role.ADMIN) {
      return this.diagnosesService.findAll();
    } else if (user.role === Role.DOCTOR) {
      const doctor = await this.doctorsService.findByUserId(user.id);
      return this.diagnosesService.findByDoctor(doctor.id);
    } else if (user.role === Role.PATIENT) {
      const patient = await this.patientsService.findByUserId(user.id);
      return this.diagnosesService.findByPatient(patient.id);
    } else if (user.role === Role.NURSE) {
      // Nurses can see all diagnoses for all patients
      return this.diagnosesService.findAll();
    }
  }

  @Get('patient/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get diagnoses by patient id' })
  @ApiResponse({ status: 200, description: 'Return diagnoses' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  findByPatient(@Param('id', ParseUUIDPipe) id: string) {
    return this.diagnosesService.findByPatient(id);
  }

  @Get('doctor/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get diagnoses by doctor id' })
  @ApiResponse({ status: 200, description: 'Return diagnoses' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  findByDoctor(@Param('id', ParseUUIDPipe) id: string) {
    return this.diagnosesService.findByDoctor(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get diagnosis by id' })
  @ApiResponse({ status: 200, description: 'Return diagnosis' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Diagnosis not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const diagnosis = await this.diagnosesService.findOne(id);
    
    // Check if patient is trying to access diagnosis that isn't theirs
    if (req.user.role === Role.PATIENT) {
      const patient = await this.patientsService.findByUserId(req.user.id);
      if (diagnosis.patient.id !== patient.id) {
        return { message: 'You do not have access to this diagnosis' };
      }
    }
    
    return diagnosis;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update diagnosis by id' })
  @ApiResponse({ status: 200, description: 'Diagnosis updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Diagnosis not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDiagnosisDto: UpdateDiagnosisDto,
    @Request() req
  ) {
    // Doctors can only update diagnoses they created
    const diagnosis = await this.diagnosesService.findOne(id);
    const doctor = await this.doctorsService.findByUserId(req.user.id);
    
    if (diagnosis.doctor.id !== doctor.id) {
      return { message: 'You can only update diagnoses you have created' };
    }
    
    return this.diagnosesService.update(id, updateDiagnosisDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete diagnosis by id' })
  @ApiResponse({ status: 200, description: 'Diagnosis deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Diagnosis not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    // Doctors can only delete diagnoses they created
    const diagnosis = await this.diagnosesService.findOne(id);
    const doctor = await this.doctorsService.findByUserId(req.user.id);
    
    if (diagnosis.doctor.id !== doctor.id) {
      return { message: 'You can only delete diagnoses you have created' };
    }
    
    await this.diagnosesService.remove(id);
    return { message: 'Diagnosis successfully deleted' };
  }
}