import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Diagnosis } from './entities/diagnosis.entity';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';
import { PatientsService } from '../patients/patients.service';
import { DoctorsService } from '../doctors/doctors.service';
import { AppointmentsService } from '../appointments/appointments.service'; // Added import

@Injectable()
export class DiagnosesService {
  constructor(
    @InjectRepository(Diagnosis)
    private diagnosesRepository: Repository<Diagnosis>,
    private patientsService: PatientsService,
    private doctorsService: DoctorsService,
    private appointmentsService: AppointmentsService, // Added injection
  ) {}

  async create(createDiagnosisDto: CreateDiagnosisDto): Promise<Diagnosis> {
    const { patientId, doctorId, appointmentId, ...diagnosisData } = createDiagnosisDto;
    
    // Get patient and doctor
    const patient = await this.patientsService.findOne(patientId);
    const doctor = await this.doctorsService.findOne(doctorId);

    // Find appointment (now required)
    let appointment = null;
    try {
      appointment = await this.appointmentsService.findOne(appointmentId);
    } catch (error) {
      throw new BadRequestException(`Appointment with ID ${appointmentId} not found`);
    }
    
    // Create diagnosis
    const diagnosis = this.diagnosesRepository.create({
      ...diagnosisData,
      patient,
      doctor,
      appointment, // Assign appointment
    });
    
    return this.diagnosesRepository.save(diagnosis);
  }

  async findAll(): Promise<Diagnosis[]> {
    return this.diagnosesRepository.find({
      relations: ['patient', 'doctor', 'appointment', 'patient.user', 'doctor.user'], // Added 'appointment' relation
    });
  }

  async findOne(id: string): Promise<Diagnosis> {
    const diagnosis = await this.diagnosesRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'appointment', 'patient.user', 'doctor.user'], // Added 'appointment' relation
    });
    
    if (!diagnosis) {
      throw new NotFoundException(`Diagnosis with ID ${id} not found`);
    }
    
    return diagnosis;
  }

  async findByPatient(patientId: string): Promise<Diagnosis[]> {
    return this.diagnosesRepository.find({
      where: { patient: { id: patientId } },
      relations: ['patient', 'doctor', 'appointment', 'patient.user', 'doctor.user'], // Added 'appointment' relation
    });
  }

  async findByDoctor(doctorId: string): Promise<Diagnosis[]> {
    return this.diagnosesRepository.find({
      where: { doctor: { id: doctorId } },
      relations: ['patient', 'doctor', 'appointment', 'patient.user', 'doctor.user'], // Added 'appointment' relation
    });
  }

  async update(id: string, updateDiagnosisDto: UpdateDiagnosisDto): Promise<Diagnosis> {
    const diagnosis = await this.findOne(id);
    
    // Handle patient change
    if (updateDiagnosisDto.patientId) {
      const patient = await this.patientsService.findOne(updateDiagnosisDto.patientId);
      diagnosis.patient = patient;
    }
    
    // Handle doctor change
    if (updateDiagnosisDto.doctorId) {
      const doctor = await this.doctorsService.findOne(updateDiagnosisDto.doctorId);
      diagnosis.doctor = doctor;
    }

    // Handle appointment change
    if (updateDiagnosisDto.appointmentId) { // Cannot be null anymore
      try {
        const appointment = await this.appointmentsService.findOne(updateDiagnosisDto.appointmentId);
        diagnosis.appointment = appointment;
      } catch (error) {
          throw new BadRequestException(`Appointment with ID ${updateDiagnosisDto.appointmentId} not found`);
      }
    }
    
    // Update other fields
    const fieldsToUpdate = [
      'diagnosisName', 'diagnosisCode', 'diagnosisType', 'symptoms', 
      'notes', 'diagnosisDate', 'treatmentPlan', 'followUpInstructions', 
      'isChronic', 'isPrinted'
    ];
    
    fieldsToUpdate.forEach(field => {
      if (updateDiagnosisDto[field] !== undefined) {
        diagnosis[field] = updateDiagnosisDto[field];
      }
    });
    
    return this.diagnosesRepository.save(diagnosis);
  }

  async remove(id: string): Promise<void> {
    const diagnosis = await this.findOne(id);
    await this.diagnosesRepository.remove(diagnosis);
  }
}