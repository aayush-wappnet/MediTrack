import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { DoctorSchedule } from './entities/doctor-schedule.entity';
import { NurseSchedule } from './entities/nurse-schedule.entity';
import { DoctorsModule } from '../doctors/doctors.module'; // Import DoctorsModule
import { NursesModule } from '../nurses/nurses.module'; // Import NursesModule

@Module({
  imports: [
    TypeOrmModule.forFeature([DoctorSchedule, NurseSchedule]), // Register new entities
    DoctorsModule, // Add DoctorsModule
    NursesModule, // Add NursesModule
  ],
  controllers: [ScheduleController],
  providers: [ScheduleService],
  exports: [ScheduleService], // Export service for use in other modules (like Appointments)
})
export class ScheduleModule {}
