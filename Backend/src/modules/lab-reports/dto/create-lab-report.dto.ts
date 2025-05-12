import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsBoolean, IsOptional, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { LabReportStatus } from '../entities/lab-report.entity';

export class CreateLabReportDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsNotEmpty()
  @IsUUID()
  patientId: string;

  @ApiProperty({ description: 'Doctor ID who ordered the test' })
  @IsNotEmpty()
  @IsUUID()
  orderedById: string;

  @ApiProperty({ description: 'Nurse ID who uploaded the test results', required: false })
  @IsOptional()
  @IsUUID()
  uploadedById?: string;

  @ApiProperty({ description: 'Appointment ID' })
  @IsNotEmpty()
  @IsUUID()
  appointmentId: string;

  @ApiProperty({ example: 'Complete Blood Count', description: 'Name of the lab test' })
  @IsNotEmpty()
  @IsString()
  testName: string;

  @ApiProperty({ example: 'Hematology', description: 'Type of the lab test', required: false })
  @IsOptional()
  @IsString()
  testType?: string;

  @ApiProperty({ enum: LabReportStatus, default: LabReportStatus.ORDERED, description: 'Lab report status' })
  @IsOptional()
  @IsEnum(LabReportStatus)
  status?: LabReportStatus = LabReportStatus.ORDERED;

  @ApiProperty({ example: 'WBC: 8.3 x10^9/L', description: 'Test results', required: false })
  @IsOptional()
  @IsString()
  results?: string;

  @ApiProperty({ example: 'WBC: 4.0-11.0 x10^9/L', description: 'Normal ranges for the test', required: false })
  @IsOptional()
  @IsString()
  normalRanges?: string;

  @ApiProperty({ example: 'Patient fasting for 12 hours before sample collection', description: 'Comments about the test', required: false })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiProperty({ example: 'Monitor WBC count in next visit', description: 'Doctor\'s notes about the test', required: false })
  @IsOptional()
  @IsString()
  doctorNotes?: string;

  @ApiProperty({ example: '2023-05-15', description: 'Date when the test was performed', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  testDate?: Date;

  @ApiProperty({ example: '2023-05-16', description: 'Date when the results were available', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  resultsDate?: Date;

  @ApiProperty({ example: true, description: 'Whether the test is urgent', required: false })
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean = false;

  @ApiProperty({ example: 'https://example.com/lab-reports/cbc123.pdf', description: 'URL to the lab report file', required: false })
  @IsOptional()
  @IsString()
  fileUrl?: string;
}