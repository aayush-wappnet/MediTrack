import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { LabReportsModule } from './modules/lab-reports/lab-reports.module';
import { DiagnosesModule } from './modules/diagnoses/diagnoses.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { PatientsModule } from './modules/patients/patients.module';
import { DoctorsModule } from './modules/doctors/doctors.module';
import { NursesModule } from './modules/nurses/nurses.module';
import { BarcodeModule } from './modules/barcode/barcode.module';
import { ScheduleModule } from './modules/schedules/schedule.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: configService.get('NODE_ENV') === 'development',
      }),
    }),
    UsersModule,
    AuthModule,
    PatientsModule,
    DoctorsModule,
    NursesModule,
    AppointmentsModule,
    PrescriptionsModule,
    LabReportsModule,
    DiagnosesModule,
    AuditLogsModule,
    BarcodeModule,
    ScheduleModule,
  ],
})
export class AppModule {}