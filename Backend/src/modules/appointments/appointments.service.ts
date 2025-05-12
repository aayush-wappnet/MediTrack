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

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const { patientId, doctorId, nurseId, ...appointmentData } = createAppointmentDto;
    
    // Get patient and doctor
    const patient = await this.patientsService.findOne(patientId);
    const doctor = await this.doctorsService.findOne(doctorId);
    
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
    });
    
    // Add nurse if provided
    if (nurseId) {
      const nurse = await this.nursesService.findOne(nurseId);
      
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