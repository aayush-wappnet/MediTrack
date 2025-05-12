import { PartialType } from '@nestjs/swagger';
import { CreateDoctorScheduleDto } from './create-doctor-schedule.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateDoctorScheduleDto extends PartialType(CreateDoctorScheduleDto) {
    // doctorId cannot be changed during an update of a doctor's schedule entry.
    // To change the doctor, delete this entry and create a new one.
    @IsOptional()
    @IsUUID()
    doctorId?: undefined; // Effectively makes doctorId not updatable through this DTO
}
