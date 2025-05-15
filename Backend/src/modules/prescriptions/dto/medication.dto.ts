import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsNumber } from 'class-validator';

export class MedicationDto {
  @ApiProperty({ example: 'Amoxicillin', description: 'Medication name' })
  @IsNotEmpty()
  @IsString()
  medicationName: string;

  @ApiProperty({ example: 500, description: 'Dosage amount' })
  @IsNotEmpty()
  @IsNumber()
  dosage: number;

  @ApiProperty({ example: 'mg', description: 'Dosage unit' })
  @IsNotEmpty()
  @IsString()
  dosageUnit: string;

  @ApiProperty({ example: true, description: 'Take with breakfast' })
  @IsBoolean()
  breakfast: boolean;

  @ApiProperty({ example: false, description: 'Take with lunch' })
  @IsBoolean()
  lunch: boolean;

  @ApiProperty({ example: true, description: 'Take with dinner' })
  @IsBoolean()
  dinner: boolean;

  @ApiProperty({ example: '7 days', description: 'Duration' })
  @IsNotEmpty()
  @IsString()
  duration: string;

  @ApiProperty({ example: 'Take with food', description: 'Instructions for taking medication', required: false })
  @IsOptional()
  @IsString()
  instructions?: string;
}
