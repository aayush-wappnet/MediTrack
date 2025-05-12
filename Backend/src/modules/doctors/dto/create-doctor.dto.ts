import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDoctorDto {
  @ApiProperty({ description: 'User ID associated with this doctor' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 'John', description: 'First name', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Smith', description: 'Last name', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: 'Cardiology', description: 'Medical specialization', required: false })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiProperty({ example: 'MD12345', description: 'Medical license number', required: false })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ example: 10, description: 'Years of professional experience', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  yearsOfExperience?: number;

  @ApiProperty({ example: 'MD from Harvard Medical School', description: 'Educational background', required: false })
  @IsOptional()
  @IsString()
  education?: string;

  @ApiProperty({ example: 'Specialized in treating cardiovascular diseases', description: 'Professional biography', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: 'Mon-Fri: 9am-5pm', description: 'Office hours', required: false })
  @IsOptional()
  @IsString()
  officeHours?: string;
}