import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription, PrescriptionStatus } from './entities/prescription.entity';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { UpdatePrescriptionDto } from './dto/update-prescription.dto';
import { PatientsService } from '../patients/patients.service';
import { DoctorsService } from '../doctors/doctors.service';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private prescriptionsRepository: Repository<Prescription>,
    private patientsService: PatientsService,
    private doctorsService: DoctorsService,
  ) {}

  async create(createPrescriptionDto: CreatePrescriptionDto): Promise<Prescription> {
    const { patientId, doctorId, ...prescriptionData } = createPrescriptionDto;
    
    // Get patient and doctor
    const patient = await this.patientsService.findOne(patientId);
    const doctor = await this.doctorsService.findOne(doctorId);
    
    // Create prescription
    const prescription = this.prescriptionsRepository.create({
      ...prescriptionData,
      patient,
      doctor,
    });
    
    return this.prescriptionsRepository.save(prescription);
  }

  async findAll(): Promise<Prescription[]> {
    return this.prescriptionsRepository.find({
      relations: ['patient', 'doctor', 'patient.user', 'doctor.user'],
    });
  }

  async findOne(id: string): Promise<Prescription> {
    const prescription = await this.prescriptionsRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'patient.user', 'doctor.user'],
    });
    
    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }
    
    return prescription;
  }

  async findByPatient(patientId: string): Promise<Prescription[]> {
    return this.prescriptionsRepository.find({
      where: { patient: { id: patientId } },
      relations: ['patient', 'doctor', 'patient.user', 'doctor.user'],
    });
  }

  async findByDoctor(doctorId: string): Promise<Prescription[]> {
    return this.prescriptionsRepository.find({
      where: { doctor: { id: doctorId } },
      relations: ['patient', 'doctor', 'patient.user', 'doctor.user'],
    });
  }

  async findByStatus(status: PrescriptionStatus): Promise<Prescription[]> {
    return this.prescriptionsRepository.find({
      where: { status },
      relations: ['patient', 'doctor', 'patient.user', 'doctor.user'],
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
    
    // Handle status change to fulfilled
    if (
      updatePrescriptionDto.status === PrescriptionStatus.FULFILLED && 
      prescription.status !== PrescriptionStatus.FULFILLED
    ) {
      prescription.fulfilledDate = new Date();
    }
    
    // Update other fields
    const fieldsToUpdate = [
      'medicationName', 'dosage', 'frequency', 'duration', 
      'instructions', 'status', 'notes', 'isRefillable', 
      'refillsRemaining', 'fulfilledBy', 'fulfilledDate', 'isPrinted'
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