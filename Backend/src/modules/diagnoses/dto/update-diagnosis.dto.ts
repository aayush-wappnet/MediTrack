import { PartialType } from '@nestjs/swagger';
import { CreateDiagnosisDto } from './create-diagnosis.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDiagnosisDto extends PartialType(CreateDiagnosisDto) {
  @ApiProperty({ description: 'Whether the diagnosis was printed', required: false })
  @IsOptional()
  @IsBoolean()
  isPrinted?: boolean;
}