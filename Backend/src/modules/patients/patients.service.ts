import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { UsersService } from '../users/users.service';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    private usersService: UsersService,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    const { userId, ...patientData } = createPatientDto;
    
    // Get user and verify role
    const user = await this.usersService.findOne(userId);
    if (user.role !== Role.PATIENT) {
      throw new BadRequestException('User must have patient role');
    }
    
    // Check if patient already exists with this user
    const existingPatient = await this.patientsRepository.findOne({
      where: { user: { id: userId } },
    });
    
    if (existingPatient) {
      throw new BadRequestException('Patient profile already exists for this user');
    }
    
    // Create new patient
    const patient = this.patientsRepository.create({
      ...patientData,
      user,
    });
    
    return this.patientsRepository.save(patient);
  }

  async findAll(): Promise<Patient[]> {
    return this.patientsRepository.find();
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    
    return patient;
  }

  async findByUserId(userId: string): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    
    if (!patient) {
      throw new NotFoundException(`Patient with User ID ${userId} not found`);
    }
    
    return patient;
  }

  async findByBarcodeId(barcodeId: string): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { barcodeId },
      relations: ['user'],
    });
    
    if (!patient) {
      throw new NotFoundException(`Patient with Barcode ID ${barcodeId} not found`);
    }
    
    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
    const patient = await this.findOne(id);
    
    if (updatePatientDto.userId) {
      const user = await this.usersService.findOne(updatePatientDto.userId);
      if (user.role !== Role.PATIENT) {
        throw new BadRequestException('User must have patient role');
      }
      patient.user = user;
    }
    
    Object.assign(patient, updatePatientDto);
    return this.patientsRepository.save(patient);
  }

  async remove(id: string): Promise<void> {
    const patient = await this.findOne(id);
    await this.patientsRepository.remove(patient);
  }

  async updateBarcodeId(id: string, barcodeId: string): Promise<Patient> {
    const patient = await this.findOne(id);
    patient.barcodeId = barcodeId;
    return this.patientsRepository.save(patient);
  }
}