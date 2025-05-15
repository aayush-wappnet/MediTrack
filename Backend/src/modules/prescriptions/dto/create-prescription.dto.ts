import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsBoolean, IsOptional, IsInt, Min, Max, IsEnum, IsArray, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { PrescriptionStatus } from '../entities/prescription.entity';
import { MedicationDto } from './medication.dto';

export class CreatePrescriptionDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsNotEmpty()
  @IsUUID()
  patientId: string;

  @ApiProperty({ description: 'Doctor ID' })
  @IsNotEmpty()
  @IsUUID()
  doctorId: string;
  
  @ApiProperty({ description: 'Nurse ID', required: false })
  @IsOptional()
  @IsUUID()
  nurseId?: string;
  
  @ApiProperty({ description: 'Appointment ID', required: false })
  @IsOptional()
  @IsUUID()
  appointmentId?: string;
  
  @ApiProperty({ type: [MedicationDto], description: 'List of medications' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MedicationDto)
  medications: MedicationDto[];

  @ApiProperty({ example: 'Take with food', description: 'Instructions for taking medication', required: false })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiProperty({ enum: PrescriptionStatus, default: PrescriptionStatus.ISSUED, description: 'Prescription status' })
  @IsOptional()
  @IsEnum(PrescriptionStatus)
  status?: PrescriptionStatus = PrescriptionStatus.ISSUED;

  @ApiProperty({ example: 'Patient is allergic to penicillin', description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: false, description: 'Whether prescription is refillable', required: false })
  @IsOptional()
  @IsBoolean()
  isRefillable?: boolean = false;

  @ApiProperty({ example: 0, description: 'Number of refills remaining (if refillable)', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(12)
  refillsRemaining?: number = 0;
}