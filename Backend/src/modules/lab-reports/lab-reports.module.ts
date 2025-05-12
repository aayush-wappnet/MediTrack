import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabReportsService } from './lab-reports.service';
import { LabReportsController } from './lab-reports.controller';
import { LabReport } from './entities/lab-report.entity';
import { PatientsModule } from '../patients/patients.module';
import { DoctorsModule } from '../doctors/doctors.module';
import { NursesModule } from '../nurses/nurses.module';
import { AppointmentsModule } from '../appointments/appointments.module'; // Added import

@Module({
  imports: [
    TypeOrmModule.forFeature([LabReport]),
    PatientsModule,
    DoctorsModule,
    NursesModule,
    AppointmentsModule, // Added module
  ],
  controllers: [LabReportsController],
  providers: [LabReportsService],
  exports: [LabReportsService],
})
export class LabReportsModule {}