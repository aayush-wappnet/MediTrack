import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsDate, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { AppointmentStatus } from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsNotEmpty()
  @IsUUID()
  patientId: string;

  @ApiProperty({ description: 'Doctor ID' })
  @IsNotEmpty()
  @IsUUID()
  doctorId: string;

  @ApiProperty({ description: 'Nurse ID (optional)', required: false })
  @IsOptional()
  @IsUUID()
  nurseId?: string;

  @ApiProperty({ example: '2023-05-15', description: 'Appointment date' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiProperty({ example: '09:00', description: 'Start time (HH:MM)' })
  @IsNotEmpty()
  @IsString()
  startTime: string;

  @ApiProperty({ example: '09:30', description: 'End time (HH:MM)' })
  @IsNotEmpty()
  @IsString()
  endTime: string;

  @ApiProperty({ enum: AppointmentStatus, default: AppointmentStatus.SCHEDULED, description: 'Appointment status' })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus = AppointmentStatus.SCHEDULED;

  @ApiProperty({ example: 'Annual checkup', description: 'Reason for visit', required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ example: 'Patient requires wheelchair access', description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: false, description: 'Whether this is a first-time visit', required: false })
  @IsOptional()
  @IsBoolean()
  isFirstVisit?: boolean = false;

  @ApiProperty({ example: false, description: 'Whether this is a virtual appointment', required: false })
  @IsOptional()
  @IsBoolean()
  isVirtual?: boolean = false;

  @ApiProperty({ example: 'https://meet.example.com/room123', description: 'Virtual meeting link (if virtual)', required: false })
  @IsOptional()
  @IsString()
  virtualMeetingLink?: string;
}