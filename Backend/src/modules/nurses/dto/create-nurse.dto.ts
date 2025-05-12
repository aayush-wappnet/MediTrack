import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNurseDto {
  @ApiProperty({ description: 'User ID associated with this nurse' })
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 'Jane', description: 'First name', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe', description: 'Last name', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: 'RN12345', description: 'Nursing license number', required: false })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiProperty({ example: '+1234567890', description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ example: 'Emergency', description: 'Department', required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ example: 5, description: 'Years of professional experience', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  yearsOfExperience?: number;

  @ApiProperty({ example: 'BSN from University of Nursing', description: 'Educational background', required: false })
  @IsOptional()
  @IsString()
  education?: string;
}