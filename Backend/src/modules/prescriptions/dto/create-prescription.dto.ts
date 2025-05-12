import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsBoolean, IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { PrescriptionStatus } from '../entities/prescription.entity';

export class CreatePrescriptionDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsNotEmpty()
  @IsUUID()
  patientId: string;

  @ApiProperty({ description: 'Doctor ID' })
  @IsNotEmpty()
  @IsUUID()
  doctorId: string;

  @ApiProperty({ example: 'Amoxicillin', description: 'Medication name' })
  @IsNotEmpty()
  @IsString()
  medicationName: string;

  @ApiProperty({ example: '500mg', description: 'Dosage' })
  @IsNotEmpty()
  @IsString()
  dosage: string;

  @ApiProperty({ example: 'Twice daily', description: 'Frequency' })
  @IsNotEmpty()
  @IsString()
  frequency: string;

  @ApiProperty({ example: '7 days', description: 'Duration' })
  @IsNotEmpty()
  @IsString()
  duration: string;

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