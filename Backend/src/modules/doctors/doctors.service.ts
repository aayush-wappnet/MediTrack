import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { UsersService } from '../users/users.service';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private doctorsRepository: Repository<Doctor>,
    private usersService: UsersService,
  ) {}

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    const { userId, ...doctorData } = createDoctorDto;
    
    // Get user and verify role
    const user = await this.usersService.findOne(userId);
    if (user.role !== Role.DOCTOR) {
      throw new BadRequestException('User must have doctor role');
    }
    
    // Check if doctor already exists with this user
    const existingDoctor = await this.doctorsRepository.findOne({
      where: { user: { id: userId } },
    });
    
    if (existingDoctor) {
      throw new BadRequestException('Doctor profile already exists for this user');
    }
    
    // Create new doctor
    const doctor = this.doctorsRepository.create({
      ...doctorData,
      user,
    });
    
    return this.doctorsRepository.save(doctor);
  }

  async findAll(): Promise<Doctor[]> {
    return this.doctorsRepository.find();
  }

  async findOne(id: string): Promise<Doctor> {
    const doctor = await this.doctorsRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    
    return doctor;
  }

  async findByUserId(userId: string): Promise<Doctor> {
    const doctor = await this.doctorsRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    
    if (!doctor) {
      throw new NotFoundException(`Doctor with User ID ${userId} not found`);
    }
    
    return doctor;
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    const doctor = await this.findOne(id);
    
    if (updateDoctorDto.userId) {
      const user = await this.usersService.findOne(updateDoctorDto.userId);
      if (user.role !== Role.DOCTOR) {
        throw new BadRequestException('User must have doctor role');
      }
      doctor.user = user;
    }
    
    Object.assign(doctor, updateDoctorDto);
    return this.doctorsRepository.save(doctor);
  }

  async remove(id: string): Promise<void> {
    const doctor = await this.findOne(id);
    await this.doctorsRepository.remove(doctor);
  }
}