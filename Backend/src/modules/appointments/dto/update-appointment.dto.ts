import { PartialType } from '@nestjs/swagger';
import { CreateAppointmentDto } from './create-appointment.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @ApiProperty({ example: 'Patient requested reschedule', description: 'Reason for cancellation (if cancelled)', required: false })
  @IsOptional()
  @IsString()
  cancelReason?: string;
}