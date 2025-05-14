import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { PatientsService } from '../patients/patients.service';
import { DoctorsService } from '../doctors/doctors.service';
import { NursesService } from '../nurses/nurses.service';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    private patientsService: PatientsService,
    private doctorsService: DoctorsService,
    private nursesService: NursesService,
  ) {}

  async createAppointmentForPatient(createAppointmentDto: CreateAppointmentDto, patientUserId: string): Promise<Appointment> {
    const { doctorId, nurseId, ...appointmentData } = createAppointmentDto;
    
    // Get patient by user ID
    const patient = await this.patientsService.findByUserId(patientUserId);
    if (!patient) {
      throw new BadRequestException('Patient not found');
    }

    // Get doctor
    const doctor = await this.doctorsService.findOne(doctorId);
    if (!doctor) {
      throw new BadRequestException('Doctor not found');
    }
    
    // Check for time conflict for doctor
    const doctorConflict = await this.checkTimeConflict(
      doctorId, 
      appointmentData.date, 
      appointmentData.startTime, 
      appointmentData.endTime
    );
    
    if (doctorConflict) {
      throw new BadRequestException('Doctor already has an appointment at this time');
    }
    
    // Create appointment
    const appointment = this.appointmentsRepository.create({
      ...appointmentData,
      patient,
      doctor,
      status: AppointmentStatus.PENDING_APPROVAL // Ensure status is set to pending
    });
    
    // Add nurse if provided
    if (nurseId) {
      const nurse = await this.nursesService.findOne(nurseId);
      if (!nurse) {
        throw new BadRequestException('Nurse not found');
      }
      
      // Check for time conflict for nurse
      const nurseConflict = await this.checkTimeConflict(
        nurseId, 
        appointmentData.date, 
        appointmentData.startTime, 
        appointmentData.endTime,
        'nurse'
      );
      
      if (nurseConflict) {
        throw new BadRequestException('Nurse already has an appointment at this time');
      }
      
      appointment.nurse = nurse;
    }
    
    return this.appointmentsRepository.save(appointment);
  }

  // Public create method for use by other services
  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const { patientId, doctorId, nurseId, ...appointmentData } = createAppointmentDto;
    
    const patient = await this.patientsService.findOne(patientId);
    if (!patient) {
      throw new BadRequestException('Patient not found');
    }

    const doctor = await this.doctorsService.findOne(doctorId);
    if (!doctor) {
      throw new BadRequestException('Doctor not found');
    }
    
    // Check for time conflicts
    const doctorConflict = await this.checkTimeConflict(
      doctorId,
      appointmentData.date,
      appointmentData.startTime,
      appointmentData.endTime
    );
    
    if (doctorConflict) {
      throw new BadRequestException('Doctor already has an appointment at this time');
    }

    const appointment = this.appointmentsRepository.create({
      ...appointmentData,
      patient,
      doctor,
      status: AppointmentStatus.PENDING_APPROVAL
    });
    
    if (nurseId) {
      const nurse = await this.nursesService.findOne(nurseId);
      if (!nurse) {
        throw new BadRequestException('Nurse not found');
      }

      // Check for nurse time conflicts
      const nurseConflict = await this.checkTimeConflict(
        nurseId,
        appointmentData.date,
        appointmentData.startTime,
        appointmentData.endTime,
        'nurse'
      );
      
      if (nurseConflict) {
        throw new BadRequestException('Nurse already has an appointment at this time');
      }

      appointment.nurse = nurse;
    }
    
    return this.appointmentsRepository.save(appointment);
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      relations: ['patient', 'doctor', 'nurse', 'patient.user', 'doctor.user', 'nurse.user'],
    });
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'nurse', 'patient.user', 'doctor.user', 'nurse.user'],
    });
    
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    
    return appointment;
  }

  async findByPatient(patientId: string): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      where: { patient: { id: patientId } },
      relations: ['patient', 'doctor', 'nurse', 'patient.user', 'doctor.user', 'nurse.user'],
    });
  }

  async findByDoctor(doctorId: string): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      where: { doctor: { id: doctorId } },
      relations: ['patient', 'doctor', 'nurse', 'patient.user', 'doctor.user', 'nurse.user'],
    });
  }

  async approveAppointment(id: string, doctorId: string): Promise<Appointment> {
    const appointment = await this.findOne(id);
    
    if (appointment.status !== AppointmentStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Only pending appointments can be approved');
    }

    if (appointment.doctor.id !== doctorId) {
      throw new BadRequestException('You can only approve appointments assigned to you');
    }

    return this.appointmentsRepository.save({
      ...appointment,
      status: AppointmentStatus.APPROVED,
    });
  }

  async rejectAppointment(id: string, doctorId: string, rejectionReason: string): Promise<Appointment> {
    const appointment = await this.findOne(id);
    
    if (appointment.status !== AppointmentStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Only pending appointments can be rejected');
    }

    if (appointment.doctor.id !== doctorId) {
      throw new BadRequestException('You can only reject appointments assigned to you');
    }

    if (!rejectionReason) {
      throw new BadRequestException('Rejection reason is required');
    }

    return this.appointmentsRepository.save({
      ...appointment,
      status: AppointmentStatus.REJECTED,
      notes: `Rejected: ${rejectionReason}` // Prefix the rejection reason
    });
  }

  async cancelAppointment(id: string, patientUserId: string, cancelReason?: string): Promise<Appointment> {
    const appointment = await this.findOne(id);
    const patient = await this.patientsService.findByUserId(patientUserId);

    if (!patient) {
      throw new BadRequestException('Patient not found');
    }

    if (appointment.patient.id !== patient.id) {
      throw new BadRequestException('You can only cancel your own appointments');
    }

    // Check if appointment can be cancelled
    if (![AppointmentStatus.PENDING_APPROVAL, AppointmentStatus.APPROVED].includes(appointment.status)) {
      throw new BadRequestException('Only pending or approved appointments can be cancelled');
    }

    // If appointment is within 24 hours, don't allow cancellation
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.startTime}`);
    const now = new Date();
    const hoursDifference = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDifference < 24) {
      throw new BadRequestException('Appointments cannot be cancelled within 24 hours of the scheduled time');
    }

    return this.appointmentsRepository.save({
      ...appointment,
      status: AppointmentStatus.CANCELLED,
      notes: cancelReason ? `Cancelled by patient: ${cancelReason}` : 'Cancelled by patient'
    });
  }

  async findByNurse(nurseId: string): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      where: { nurse: { id: nurseId } },
      relations: ['patient', 'doctor', 'nurse', 'patient.user', 'doctor.user', 'nurse.user'],
    });
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);
    
    // Handle patient change
    if (updateAppointmentDto.patientId) {
      const patient = await this.patientsService.findOne(updateAppointmentDto.patientId);
      appointment.patient = patient;
    }
    
    // Handle doctor change
    if (updateAppointmentDto.doctorId) {
      const doctor = await this.doctorsService.findOne(updateAppointmentDto.doctorId);
      
      // Check for time conflict if date/time is not being changed
      const date = updateAppointmentDto.date || appointment.date;
      const startTime = updateAppointmentDto.startTime || appointment.startTime;
      const endTime = updateAppointmentDto.endTime || appointment.endTime;
      
      const doctorConflict = await this.checkTimeConflict(
        updateAppointmentDto.doctorId, 
        date, 
        startTime, 
        endTime, 
        'doctor',
        id
      );
      
      if (doctorConflict) {
        throw new BadRequestException('Doctor already has an appointment at this time');
      }
      
      appointment.doctor = doctor;
    }
    
    // Handle nurse change
    if (updateAppointmentDto.nurseId) {
      const nurse = await this.nursesService.findOne(updateAppointmentDto.nurseId);
      
      // Check for time conflict if date/time is not being changed
      const date = updateAppointmentDto.date || appointment.date;
      const startTime = updateAppointmentDto.startTime || appointment.startTime;
      const endTime = updateAppointmentDto.endTime || appointment.endTime;
      
      const nurseConflict = await this.checkTimeConflict(
        updateAppointmentDto.nurseId, 
        date, 
        startTime, 
        endTime, 
        'nurse',
        id
      );
      
      if (nurseConflict) {
        throw new BadRequestException('Nurse already has an appointment at this time');
      }
      
      appointment.nurse = nurse;
    }
    
    // Handle cancellation reason
    if (updateAppointmentDto.status === AppointmentStatus.CANCELLED && updateAppointmentDto.cancelReason) {
      appointment.cancelReason = updateAppointmentDto.cancelReason;
    }
    
    // Update other fields
    const fieldsToUpdate = [
      'date', 'startTime', 'endTime', 'status', 'reason', 
      'notes', 'isFirstVisit', 'isVirtual', 'virtualMeetingLink'
    ];
    
    fieldsToUpdate.forEach(field => {
      if (updateAppointmentDto[field] !== undefined) {
        appointment[field] = updateAppointmentDto[field];
      }
    });
    
    return this.appointmentsRepository.save(appointment);
  }

  async remove(id: string): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentsRepository.remove(appointment);
  }

  private async checkTimeConflict(
    personId: string, 
    date: Date, 
    startTime: string, 
    endTime: string, 
    personType: 'doctor' | 'nurse' = 'doctor',
    excludeAppointmentId?: string
  ): Promise<boolean> {
    // Convert date strings to Date objects for comparison
    const appointmentDate = new Date(date);
    const dateString = appointmentDate.toISOString().split('T')[0];
    
    let query = this.appointmentsRepository
      .createQueryBuilder('appointment')
      .where(`appointment.${personType}Id = :personId`, { personId })
      .andWhere(`DATE(appointment.date) = :date`, { date: dateString })
      .andWhere(`
        (appointment.startTime <= :endTime AND appointment.endTime >= :startTime)
      `, { startTime, endTime });
    
    // Exclude current appointment for updates
    if (excludeAppointmentId) {
      query = query.andWhere('appointment.id != :excludeId', { excludeId: excludeAppointmentId });
    }
    
    const conflicts = await query.getCount();
    return conflicts > 0;
  }
}