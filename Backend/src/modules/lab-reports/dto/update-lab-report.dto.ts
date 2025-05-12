import { PartialType } from '@nestjs/swagger';
import { CreateLabReportDto } from './create-lab-report.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLabReportDto extends PartialType(CreateLabReportDto) {
  @ApiProperty({ description: 'Whether the lab report was printed', required: false })
  @IsOptional()
  @IsBoolean()
  isPrinted?: boolean;
}