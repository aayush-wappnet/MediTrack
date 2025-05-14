import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Nurse } from '../nurses/entities/nurse.entity';
import { PatientsModule } from '../patients/patients.module';
import { DoctorsModule } from '../doctors/doctors.module';
import { NursesModule } from '../nurses/nurses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Patient, Doctor, Nurse]),
    PatientsModule,
    DoctorsModule,
    NursesModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule {}
