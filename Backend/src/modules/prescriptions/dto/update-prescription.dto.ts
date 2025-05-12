import { PartialType } from '@nestjs/swagger';
import { CreatePrescriptionDto } from './create-prescription.dto';
import { IsOptional, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdatePrescriptionDto extends PartialType(CreatePrescriptionDto) {
  @ApiProperty({ description: 'Who fulfilled the prescription', required: false })
  @IsOptional()
  fulfilledBy?: string;

  @ApiProperty({ description: 'When the prescription was fulfilled', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fulfilledDate?: Date;

  @ApiProperty({ description: 'Whether the prescription was printed', required: false })
  @IsOptional()
  isPrinted?: boolean;
}