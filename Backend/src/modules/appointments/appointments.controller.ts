import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseUUIDPipe, Query, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { PatientsService } from '../patients/patients.service';
import { DoctorsService } from '../doctors/doctors.service';
import { NursesService } from '../nurses/nurses.service';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly patientsService: PatientsService,
    private readonly doctorsService: DoctorsService,
    private readonly nursesService: NursesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PATIENT)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req) {
    return this.appointmentsService.createAppointmentForPatient(createAppointmentDto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get all appointments (filtered by role)' })
  @ApiResponse({ status: 200, description: 'Return appointments' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Request() req) {
    const user = req.user;
    
    // Handle different roles
    if (user.role === Role.ADMIN) {
      return this.appointmentsService.findAll();
    } else if (user.role === Role.DOCTOR) {
      const doctor = await this.doctorsService.findByUserId(user.id);
      return this.appointmentsService.findByDoctor(doctor.id);
    } else if (user.role === Role.NURSE) {
      const nurse = await this.nursesService.findByUserId(user.id);
      return this.appointmentsService.findByNurse(nurse.id);
    } else if (user.role === Role.PATIENT) {
      const patient = await this.patientsService.findByUserId(user.id);
      return this.appointmentsService.findByPatient(patient.id);
    }
  }

  @Get('patient/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get appointments by patient id' })
  @ApiResponse({ status: 200, description: 'Return appointments' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  findByPatient(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentsService.findByPatient(id);
  }

  @Get('doctor/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get appointments by doctor id' })
  @ApiResponse({ status: 200, description: 'Return appointments' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Doctor not found' })
  findByDoctor(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentsService.findByDoctor(id);
  }

  @Get('nurse/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get appointments by nurse id' })
  @ApiResponse({ status: 200, description: 'Return appointments' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Nurse not found' })
  findByNurse(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentsService.findByNurse(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Get appointment by id' })
  @ApiResponse({ status: 200, description: 'Return appointment' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const appointment = await this.appointmentsService.findOne(id);
    
    // Check if patient is trying to access appointment that isn't theirs
    if (req.user.role === Role.PATIENT) {
      const patient = await this.patientsService.findByUserId(req.user.id);
      if (appointment.patient.id !== patient.id) {
        return { message: 'You do not have access to this appointment' };
      }
    }
    
    return appointment;
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Approve an appointment (Doctor only)' })
  @ApiResponse({ status: 200, description: 'Appointment approved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not authorized' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async approveAppointment(
    @Param('id') id: string,
    @Request() req,
  ) {
    const doctor = await this.doctorsService.findByUserId(req.user.id);
    return this.appointmentsService.approveAppointment(id, doctor.id);
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DOCTOR)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Reject an appointment (Doctor only)' })
  @ApiResponse({ status: 200, description: 'Appointment rejected successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not authorized' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async rejectAppointment(
    @Param('id') id: string,
    @Body('rejectionReason') rejectionReason: string,
    @Request() req,
  ) {
    const doctor = await this.doctorsService.findByUserId(req.user.id);
    return this.appointmentsService.rejectAppointment(id, doctor.id, rejectionReason);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PATIENT)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Cancel appointment (Patient only)' })
  @ApiResponse({ status: 200, description: 'Appointment cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Cannot cancel within 24 hours' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not your appointment' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async cancelAppointment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('cancelReason') cancelReason: string,
    @Request() req,
  ) {
    return this.appointmentsService.cancelAppointment(id, req.user.id, cancelReason);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Update appointment by id (Admin only)' })
  @ApiResponse({ status: 200, description: 'Appointment updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.DOCTOR)
  @ApiBearerAuth('JWT')
  @ApiOperation({ summary: 'Delete appointment by id' })
  @ApiResponse({ status: 200, description: 'Appointment deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.appointmentsService.remove(id);
  }
}