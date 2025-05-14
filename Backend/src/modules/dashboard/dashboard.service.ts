import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Patient } from '../patients/entities/patient.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Nurse } from '../nurses/entities/nurse.entity';
import { AppointmentStatus } from '../appointments/entities/appointment.entity';
import { Role } from '../../common/enums/role.enum';
import { PatientsService } from '../patients/patients.service';
import { DoctorsService } from '../doctors/doctors.service';
import { NursesService } from '../nurses/nurses.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    @InjectRepository(Doctor)
    private doctorsRepository: Repository<Doctor>,
    @InjectRepository(Nurse)
    private nursesRepository: Repository<Nurse>,
    private patientsService: PatientsService,
    private doctorsService: DoctorsService,
    private nursesService: NursesService,
  ) {}

  async getDashboardStats(userId: string, role: Role) {
    switch (role) {
      case Role.ADMIN:
        return this.getAdminStats();
      case Role.DOCTOR:
        return this.getDoctorStats(userId);
      case Role.NURSE:
        return this.getNurseStats(userId);
      case Role.PATIENT:
        return this.getPatientStats(userId);
      default:
        throw new BadRequestException('Invalid role');
    }
  }

  private async getAdminStats() {
    const [totalPatients, totalDoctors, totalNurses] = await Promise.all([
      this.patientsRepository.count(),
      this.doctorsRepository.count(),
      this.nursesRepository.count(),
    ]);

    const appointments = await this.appointmentsRepository.find();
    const totalAppointments = appointments.length;
    const pendingAppointments = appointments.filter(a => a.status === AppointmentStatus.PENDING_APPROVAL).length;
    const completedAppointments = appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length;
    const cancelledAppointments = appointments.filter(a => a.status === AppointmentStatus.CANCELLED).length;

    return {
      users: {
        totalPatients,
        totalDoctors,
        totalNurses,
      },
      appointments: {
        total: totalAppointments,
        pending: pendingAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
      },
    };
  }

  private async getDoctorStats(userId: string) {
    const doctor = await this.doctorsService.findByUserId(userId);
    const appointments = await this.appointmentsRepository.find({
      where: { doctor: { id: doctor.id } },
      relations: ['patient'],
    });

    const totalPatients = new Set(appointments.map(a => a.patient.id)).size;
    const pendingAppointments = appointments.filter(a => a.status === AppointmentStatus.PENDING_APPROVAL).length;
    const todayAppointments = appointments.filter(a => {
      const today = new Date().toISOString().split('T')[0];
      return new Date(a.date).toISOString().split('T')[0] === today;
    }).length;

    return {
      appointments: {
        total: appointments.length,
        pending: pendingAppointments,
        today: todayAppointments,
      },
      patients: {
        total: totalPatients,
      },
    };
  }

  private async getNurseStats(userId: string) {
    const nurse = await this.nursesService.findByUserId(userId);
    const appointments = await this.appointmentsRepository.find({
      where: { nurse: { id: nurse.id } },
    });

    const todayAppointments = appointments.filter(a => {
      const today = new Date().toISOString().split('T')[0];
      return new Date(a.date).toISOString().split('T')[0] === today;
    }).length;

    return {
      appointments: {
        total: appointments.length,
        today: todayAppointments,
      },
    };
  }

  private async getPatientStats(userId: string) {
    const patient = await this.patientsService.findByUserId(userId);
    const appointments = await this.appointmentsRepository.find({
      where: { patient: { id: patient.id } },
      relations: ['doctor'],
    });

    const upcomingAppointments = appointments.filter(a => {
      const appointmentDate = new Date(a.date);
      const today = new Date();
      return appointmentDate >= today && a.status === AppointmentStatus.APPROVED;
    });

    const completedAppointments = appointments.filter(a => a.status === AppointmentStatus.COMPLETED);
    const uniqueDoctors = new Set(appointments.map(a => a.doctor.id)).size;

    return {
      appointments: {
        total: appointments.length,
        upcoming: upcomingAppointments.length,
        completed: completedAppointments.length,
      },
      doctors: {
        visited: uniqueDoctors,
      },
    };
  }
}
