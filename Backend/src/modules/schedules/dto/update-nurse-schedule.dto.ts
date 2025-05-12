import { PartialType } from '@nestjs/swagger';
import { CreateNurseScheduleDto } from './create-nurse-schedule.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdateNurseScheduleDto extends PartialType(CreateNurseScheduleDto) {
    // nurseId cannot be changed during an update of a nurse's schedule entry.
    // To change the nurse, delete this entry and create a new one.
    @IsOptional()
    @IsUUID()
    nurseId?: undefined; // Effectively makes nurseId not updatable through this DTO

}
