import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription, PrescriptionStatus } from './entities/prescription.entity';
import { Medication } from './entities/medication.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { PatientsService } from '../patients/patients.service';
import { DoctorsService } from '../doctors/doctors.service';
import { NursesService } from '../nurses/nurses.service';
import { AppointmentsService } from '../appointments/appointments.service';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private prescriptionsRepository: Repository<Prescription>,
    @InjectRepository(Medication)
    private medicationsRepository: Repository<Medication>,
    private patientsService: PatientsService,
    private doctorsService: DoctorsService,
    private nursesService: NursesService,
    private appointmentsService: AppointmentsService,
  ) {}

  async create(createPrescriptionDto: CreatePrescriptionDto): Promise<Prescription> {
    const { patientId, doctorId, nurseId, appointmentId, medications, ...prescriptionData } = createPrescriptionDto;
    
    // Get patient and doctor
    const patient = await this.patientsService.findOne(patientId);
    const doctor = await this.doctorsService.findOne(doctorId);
    
    // Get nurse if provided
    let nurse = null;
    if (nurseId) {
      nurse = await this.nursesService.findOne(nurseId);
    }
    
    // Get appointment if provided
    let appointment = null;
    if (appointmentId) {
      appointment = await this.appointmentsService.findOne(appointmentId);
    }
    
    // Create prescription without medications first
    const prescription = this.prescriptionsRepository.create({
      ...prescriptionData,
      patient,
      doctor,
      nurse,
      appointment,
      medications: [],
    });
    
    // Save prescription to get an ID
    const savedPrescription = await this.prescriptionsRepository.save(prescription);
    
    // Create and save medications
    const medicationEntities = medications.map(medicationDto => {
      return this.medicationsRepository.create({
        ...medicationDto,
        prescription: savedPrescription,
      });
    });
    
    savedPrescription.medications = await this.medicationsRepository.save(medicationEntities);
    
    return savedPrescription;
  }

  async findAll(): Promise<Prescription[]> {
    return this.prescriptionsRepository.find({
      relations: ['patient', 'doctor', 'nurse', 'appointment', 'medications', 'patient.user', 'doctor.user', 'nurse.user'],
    });
  }

  async findOne(id: string): Promise<Prescription> {
    const prescription = await this.prescriptionsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'nurse', 'appointment', 'medications', 'patient.user', 'doctor.user', 'nurse.user'],
    });
    
    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }
    
    return prescription;
  }

  async findByPatient(patientId: string): Promise<Prescription[]> {
    return this.prescriptionsRepository.find({
      where: { patient: { id: patientId } },
      relations: ['patient', 'doctor', 'nurse', 'appointment', 'medications', 'patient.user', 'doctor.user', 'nurse.user'],
    });
  }

  async findByDoctor(doctorId: string): Promise<Prescription[]> {
    return this.prescriptionsRepository.find({
      where: { doctor: { id: doctorId } },
      relations: ['patient', 'doctor', 'nurse', 'appointment', 'medications', 'patient.user', 'doctor.user', 'nurse.user'],
    });
  }
  
  async findByNurse(nurseId: string): Promise<Prescription[]> {
    return this.prescriptionsRepository.find({
      where: { nurse: { id: nurseId } },
      relations: ['patient', 'doctor', 'nurse', 'appointment', 'medications', 'patient.user', 'doctor.user', 'nurse.user'],
    });
  }

  async findByStatus(status: PrescriptionStatus): Promise<Prescription[]> {
    return this.prescriptionsRepository.find({
      where: { status },
      relations: ['patient', 'doctor', 'nurse', 'appointment', 'medications', 'patient.user', 'doctor.user', 'nurse.user'],
    });
  }

  async update(id: string, updatePrescriptionDto: UpdatePrescriptionDto): Promise<Prescription> {
    const prescription = await this.findOne(id);
    
    // Check if prescription is already fulfilled
    if (
      prescription.status === PrescriptionStatus.FULFILLED && 
      updatePrescriptionDto.status && 
      updatePrescriptionDto.status !== PrescriptionStatus.FULFILLED
    ) {
      throw new BadRequestException('Cannot modify a prescription that has already been fulfilled');
    }
    
    // Handle patient change
    if (updatePrescriptionDto.patientId) {
      const patient = await this.patientsService.findOne(updatePrescriptionDto.patientId);
      prescription.patient = patient;
    }
    
    // Handle doctor change
    if (updatePrescriptionDto.doctorId) {
      const doctor = await this.doctorsService.findOne(updatePrescriptionDto.doctorId);
      prescription.doctor = doctor;
    }
    
    // Handle nurse change
    if (updatePrescriptionDto.nurseId) {
      const nurse = await this.nursesService.findOne(updatePrescriptionDto.nurseId);
      prescription.nurse = nurse;
    }
    
    // Handle appointment change
    if (updatePrescriptionDto.appointmentId) {
      const appointment = await this.appointmentsService.findOne(updatePrescriptionDto.appointmentId);
      prescription.appointment = appointment;
    }
    
    // Handle status change to fulfilled
    if (
      updatePrescriptionDto.status === PrescriptionStatus.FULFILLED && 
      prescription.status !== PrescriptionStatus.FULFILLED
    ) {
      prescription.fulfilledDate = new Date();
    }
    
    // Update medications if provided
    if (updatePrescriptionDto.medications && updatePrescriptionDto.medications.length > 0) {
      // Remove existing medications
      await this.medicationsRepository.remove(prescription.medications);
      
      // Create new medications
      const medicationEntities = updatePrescriptionDto.medications.map(medicationDto => {
        return this.medicationsRepository.create({
          ...medicationDto,
          prescription,
        });
      });
      
      prescription.medications = await this.medicationsRepository.save(medicationEntities);
    }
    
    // Update other fields
    const fieldsToUpdate = [
      'instructions', 'status', 'notes', 'isRefillable', 
      'refillsRemaining', 'fulfilledDate', 'isPrinted'
    ];
    
    fieldsToUpdate.forEach(field => {
      if (updatePrescriptionDto[field] !== undefined) {
        prescription[field] = updatePrescriptionDto[field];
      }
    });
    
    return this.prescriptionsRepository.save(prescription);
  }

  async remove(id: string): Promise<void> {
    const prescription = await this.findOne(id);
    
    // Check if prescription is already fulfilled
    if (prescription.status === PrescriptionStatus.FULFILLED) {
      throw new BadRequestException('Cannot delete a prescription that has already been fulfilled');
    }
    
    await this.prescriptionsRepository.remove(prescription);
  }
}