import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsBoolean, IsOptional, IsDate, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDiagnosisDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsNotEmpty()
  @IsUUID()
  patientId: string;

  @ApiProperty({ description: 'Doctor ID' })
  @IsNotEmpty()
  @IsUUID()
  doctorId: string;

  @ApiProperty({ description: 'Appointment ID' })
  @IsNotEmpty()
  @IsUUID()
  appointmentId: string;

  @ApiProperty({ example: 'Hypertension', description: 'Diagnosis name' })
  @IsNotEmpty()
  @IsString()
  diagnosisName: string;

  @ApiProperty({ example: 'I10', description: 'ICD-10 diagnosis code', required: false })
  @IsOptional()
  @IsString()
  diagnosisCode?: string;

  @ApiProperty({ example: 'Cardiovascular', description: 'Type of diagnosis', required: false })
  @IsOptional()
  @IsString()
  diagnosisType?: string;

  @ApiProperty({ example: ['Headache', 'Dizziness', 'High blood pressure'], description: 'Symptoms associated with diagnosis', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  symptoms?: string[];

  @ApiProperty({ example: 'Patient has family history of hypertension', description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: '2023-05-15', description: 'Date of diagnosis' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  diagnosisDate: Date;

  @ApiProperty({ example: 'Lifestyle changes, prescription medication', description: 'Treatment plan', required: false })
  @IsOptional()
  @IsString()
  treatmentPlan?: string;

  @ApiProperty({ example: 'Follow up in 3 months', description: 'Follow-up instructions', required: false })
  @IsOptional()
  @IsString()
  followUpInstructions?: string;

  @ApiProperty({ example: true, description: 'Whether the diagnosis is chronic', required: false })
  @IsOptional()
  @IsBoolean()
  isChronic?: boolean = false;
}