import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsBoolean, IsOptional, IsDate, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LabReportStatus } from '../entities/lab-report.entity';

export class TestParameterDto {
  @ApiProperty({ example: 'WBC', description: 'Name of the test parameter' })
  @IsNotEmpty()
  @IsString()
  parameterName: string;

  @ApiProperty({ example: '8.3', description: 'Result of the test parameter' })
  @IsNotEmpty()
  @IsString()
  result: string;

  @ApiProperty({ example: '4.0-11.0', description: 'Normal range for the test parameter' })
  @IsNotEmpty()
  @IsString()
  normalRange: string;

  @ApiProperty({ example: 'x10^9/L', description: 'Unit of measurement', required: false })
  @IsOptional()
  @IsString()
  unit?: string;
}

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

  @ApiProperty({
    type: [TestParameterDto],
    description: 'Array of test parameters with results, normal ranges, and units',
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestParameterDto)
  testParameters?: TestParameterDto[];

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