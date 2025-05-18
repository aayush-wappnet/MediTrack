import { PartialType } from '@nestjs/swagger';
import { CreateLabReportDto, TestParameterDto } from './create-lab-report.dto';
import { IsOptional, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLabReportDto extends PartialType(CreateLabReportDto) {
  @ApiProperty({ description: 'Whether the lab report was printed', required: false })
  @IsOptional()
  @IsBoolean()
  isPrinted?: boolean;

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
}