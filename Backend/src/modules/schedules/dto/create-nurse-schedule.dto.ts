import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsEnum, Matches, IsBoolean, IsOptional } from 'class-validator';
import { DayOfWeek, Shift } from '../entities/schedule.types';

export class CreateNurseScheduleDto {
  @ApiProperty({ description: 'ID of the nurse', required: true })
  @IsNotEmpty()
  @IsUUID()
  nurseId: string;

  @ApiProperty({ enum: DayOfWeek, description: 'Day of the week' })
  @IsNotEmpty()
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiProperty({ enum: Shift, description: 'Shift for this schedule slot' })
  @IsNotEmpty()
  @IsEnum(Shift)
  shift: Shift;

  @ApiProperty({ example: '07:00', description: 'Start time in HH:MM format (24-hour)' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be in HH:MM format' })
  startTime: string;

  @ApiProperty({ example: '15:00', description: 'End time in HH:MM format (24-hour)' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime must be in HH:MM format' })
  endTime: string;

  @ApiProperty({ description: 'Availability status', default: true, required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
