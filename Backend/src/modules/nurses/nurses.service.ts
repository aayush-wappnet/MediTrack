import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nurse } from './entities/nurse.entity';
import { CreateNurseDto } from './dto/create-nurse.dto';
import { UpdateNurseDto } from './dto/update-nurse.dto';
import { UsersService } from '../users/users.service';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class NursesService {
  constructor(
    @InjectRepository(Nurse)
    private nursesRepository: Repository<Nurse>,
    private usersService: UsersService,
  ) {}

  async create(createNurseDto: CreateNurseDto): Promise<Nurse> {
    const { userId, ...nurseData } = createNurseDto;
    
    // Get user and verify role
    const user = await this.usersService.findOne(userId);
    if (user.role !== Role.NURSE) {
      throw new BadRequestException('User must have nurse role');
    }
    
    // Check if nurse already exists with this user
    const existingNurse = await this.nursesRepository.findOne({
      where: { user: { id: userId } },
    });
    
    if (existingNurse) {
      throw new BadRequestException('Nurse profile already exists for this user');
    }
    
    // Create new nurse
    const nurse = this.nursesRepository.create({
      ...nurseData,
      user,
    });
    
    return this.nursesRepository.save(nurse);
  }

  async findAll(): Promise<Nurse[]> {
    return this.nursesRepository.find();
  }

  async findOne(id: string): Promise<Nurse> {
    const nurse = await this.nursesRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    
    if (!nurse) {
      throw new NotFoundException(`Nurse with ID ${id} not found`);
    }
    
    return nurse;
  }

  async findByUserId(userId: string): Promise<Nurse> {
    const nurse = await this.nursesRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    
    if (!nurse) {
      throw new NotFoundException(`Nurse with User ID ${userId} not found`);
    }
    
    return nurse;
  }

  async update(id: string, updateNurseDto: UpdateNurseDto): Promise<Nurse> {
    const nurse = await this.findOne(id);
    
    if (updateNurseDto.userId) {
      const user = await this.usersService.findOne(updateNurseDto.userId);
      if (user.role !== Role.NURSE) {
        throw new BadRequestException('User must have nurse role');
      }
      nurse.user = user;
    }
    
    Object.assign(nurse, updateNurseDto);
    return this.nursesRepository.save(nurse);
  }

  async remove(id: string): Promise<void> {
    const nurse = await this.findOne(id);
    await this.nursesRepository.remove(nurse);
  }
}