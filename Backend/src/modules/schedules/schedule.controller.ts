import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards, SetMetadata } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DoctorSchedule } from './entities/doctor-schedule.entity';
import { NurseSchedule } from './entities/nurse-schedule.entity';
import { CreateDoctorScheduleDto } from './dto/create-doctor-schedule.dto';
import { UpdateDoctorScheduleDto } from './dto/update-doctor-schedule.dto';
import { CreateNurseScheduleDto } from './dto/create-nurse-schedule.dto';
import { UpdateNurseScheduleDto } from './dto/update-nurse-schedule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@ApiTags('Schedules')
@ApiBearerAuth() // For Swagger UI to show auth input
@Controller('schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  // --- Doctor Schedule Endpoints ---
  @Post('doctors')
  @Roles(Role.ADMIN, Role.DOCTOR) // Only Admin or Doctor can create doctor schedules
  @ApiOperation({ summary: 'Create a new schedule entry for a doctor' })
  @ApiResponse({ status: 201, description: 'Doctor schedule created.', type: DoctorSchedule })
  createDoctorSchedule(@Body() createDoctorScheduleDto: CreateDoctorScheduleDto) {
    return this.scheduleService.createDoctorSchedule(createDoctorScheduleDto);
  }

  @Get('doctors')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE) // All authenticated roles can view doctor schedules
  @ApiOperation({ summary: 'Get all doctor schedule entries' })
  @ApiResponse({ status: 200, description: 'List of doctor schedules', type: [DoctorSchedule] })
  findAllDoctorSchedules() {
    return this.scheduleService.findAllDoctorSchedules();
  }

  @Get('doctors/doctor/:doctorId')
  @Roles(Role.ADMIN, Role.DOCTOR) // Admin or the specific Doctor can view their schedules
  @ApiOperation({ summary: 'Get all schedule entries for a specific doctor' })
  @ApiResponse({ status: 200, description: 'List of schedules for the doctor', type: [DoctorSchedule] })
  findDoctorSchedulesByDoctorId(@Param('doctorId', ParseUUIDPipe) doctorId: string) {
    // TODO: Add logic to ensure a doctor can only fetch their own schedules unless ADMIN
    return this.scheduleService.findDoctorSchedulesByDoctorId(doctorId);
  }

  @Get('doctors/:id')
  @Roles(Role.ADMIN, Role.DOCTOR) // Admin or a Doctor can view a specific doctor schedule entry
  @ApiOperation({ summary: 'Get a specific doctor schedule entry by ID' })
  @ApiResponse({ status: 200, description: 'Doctor schedule details', type: DoctorSchedule })
  findDoctorScheduleById(@Param('id', ParseUUIDPipe) id: string) {
    // TODO: Add logic for doctor to only get their own schedule if not admin
    return this.scheduleService.findDoctorScheduleById(id);
  }

  @Patch('doctors/:id')
  @Roles(Role.ADMIN, Role.DOCTOR) // Admin or the specific Doctor can update their schedule
  @ApiOperation({ summary: 'Update a doctor schedule entry' })
  @ApiResponse({ status: 200, description: 'Doctor schedule updated.', type: DoctorSchedule })
  updateDoctorSchedule(@Param('id', ParseUUIDPipe) id: string, @Body() updateDoctorScheduleDto: UpdateDoctorScheduleDto) {
    // TODO: Add logic for doctor to only update their own schedule if not admin
    return this.scheduleService.updateDoctorSchedule(id, updateDoctorScheduleDto);
  }

  @Delete('doctors/:id')
  @Roles(Role.ADMIN, Role.DOCTOR) // Admin or the specific Doctor can delete their schedule
  @ApiOperation({ summary: 'Delete a doctor schedule entry' })
  @ApiResponse({ status: 204, description: 'Doctor schedule deleted.' })
  removeDoctorSchedule(@Param('id', ParseUUIDPipe) id: string) {
    // TODO: Add logic for doctor to only delete their own schedule if not admin
    return this.scheduleService.removeDoctorSchedule(id);
  }

  // --- Nurse Schedule Endpoints ---
  @Post('nurses')
  @Roles(Role.ADMIN, Role.NURSE) // Only Admin or Nurse can create nurse schedules
  @ApiOperation({ summary: 'Create a new schedule entry for a nurse' })
  @ApiResponse({ status: 201, description: 'Nurse schedule created.', type: NurseSchedule })
  createNurseSchedule(@Body() createNurseScheduleDto: CreateNurseScheduleDto) {
    return this.scheduleService.createNurseSchedule(createNurseScheduleDto);
  }

  @Get('nurses')
  @Roles(Role.ADMIN, Role.DOCTOR, Role.NURSE) // All authenticated can view nurse schedules
  @ApiOperation({ summary: 'Get all nurse schedule entries' })
  @ApiResponse({ status: 200, description: 'List of nurse schedules', type: [NurseSchedule] })
  findAllNurseSchedules() {
    return this.scheduleService.findAllNurseSchedules();
  }

  @Get('nurses/nurse/:nurseId')
  @Roles(Role.ADMIN, Role.NURSE) // Admin or the specific Nurse can view their schedules
  @ApiOperation({ summary: 'Get all schedule entries for a specific nurse' })
  @ApiResponse({ status: 200, description: 'List of schedules for the nurse', type: [NurseSchedule] })
  findNurseSchedulesByNurseId(@Param('nurseId', ParseUUIDPipe) nurseId: string) {
    // TODO: Add logic to ensure a nurse can only fetch their own schedules unless ADMIN
    return this.scheduleService.findNurseSchedulesByNurseId(nurseId);
  }

  @Get('nurses/:id')
  @Roles(Role.ADMIN, Role.NURSE) // Admin or a Nurse can view a specific nurse schedule entry
  @ApiOperation({ summary: 'Get a specific nurse schedule entry by ID' })
  @ApiResponse({ status: 200, description: 'Nurse schedule details', type: NurseSchedule })
  findNurseScheduleById(@Param('id', ParseUUIDPipe) id: string) {
    // TODO: Add logic for nurse to only get their own schedule if not admin
    return this.scheduleService.findNurseScheduleById(id);
  }

  @Patch('nurses/:id')
  @Roles(Role.ADMIN, Role.NURSE) // Admin or the specific Nurse can update their schedule
  @ApiOperation({ summary: 'Update a nurse schedule entry' })
  @ApiResponse({ status: 200, description: 'Nurse schedule updated.', type: NurseSchedule })
  updateNurseSchedule(@Param('id', ParseUUIDPipe) id: string, @Body() updateNurseScheduleDto: UpdateNurseScheduleDto) {
    // TODO: Add logic for nurse to only update their own schedule if not admin
    return this.scheduleService.updateNurseSchedule(id, updateNurseScheduleDto);
  }

  @Delete('nurses/:id')
  @Roles(Role.ADMIN, Role.NURSE) // Admin or the specific Nurse can delete their schedule
  @ApiOperation({ summary: 'Delete a nurse schedule entry' })
  @ApiResponse({ status: 204, description: 'Nurse schedule deleted.' })
  removeNurseSchedule(@Param('id', ParseUUIDPipe) id: string) {
    // TODO: Add logic for nurse to only delete their own schedule if not admin
    return this.scheduleService.removeNurseSchedule(id);
  }
}
