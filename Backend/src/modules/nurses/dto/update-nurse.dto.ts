import { PartialType } from '@nestjs/swagger';
import { CreateNurseDto } from './create-nurse.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateNurseDto extends PartialType(CreateNurseDto) {
  @IsOptional()
  @IsUUID()
  userId?: string;
}