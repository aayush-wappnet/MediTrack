import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DoctorSchedule } from './entities/doctor-schedule.entity';
import { NurseSchedule } from './entities/nurse-schedule.entity';
import { CreateDoctorScheduleDto } from './dto/create-doctor-schedule.dto';
import { UpdateDoctorScheduleDto } from './dto/update-doctor-schedule.dto';
import { CreateNurseScheduleDto } from './dto/create-nurse-schedule.dto';
import { UpdateNurseScheduleDto } from './dto/update-nurse-schedule.dto';
import { DoctorsService } from '../doctors/doctors.service';
import { NursesService } from '../nurses/nurses.service';
import { DayOfWeek, Shift } from './entities/schedule.types';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(DoctorSchedule)
    private doctorScheduleRepository: Repository<DoctorSchedule>,
    @InjectRepository(NurseSchedule)
    private nurseScheduleRepository: Repository<NurseSchedule>,
    private doctorsService: DoctorsService, // For validating doctorId
    private nursesService: NursesService,   // For validating nurseId
  ) {}

  // --- Doctor Schedule Methods ---
  async createDoctorSchedule(dto: CreateDoctorScheduleDto): Promise<DoctorSchedule> {
    await this.doctorsService.findOne(dto.doctorId); // Validate doctor exists
    // Check for overlapping schedules for the same doctor on the same day/shift (optional but good practice)
    const existing = await this.doctorScheduleRepository.findOne({
      where: {
        doctorId: dto.doctorId,
        dayOfWeek: dto.dayOfWeek,
        shift: dto.shift,
      }
    });
    if (existing) {
      throw new BadRequestException(`Doctor already has a schedule for ${dto.dayOfWeek}, ${dto.shift} shift.`);
    }
    const newSchedule = this.doctorScheduleRepository.create(dto);
    return this.doctorScheduleRepository.save(newSchedule);
  }

  async findAllDoctorSchedules(): Promise<DoctorSchedule[]> {
    return this.doctorScheduleRepository.find({ relations: ['doctor', 'doctor.user'] });
  }

  async findDoctorScheduleById(id: string): Promise<DoctorSchedule> {
    const schedule = await this.doctorScheduleRepository.findOne({ where: { id }, relations: ['doctor', 'doctor.user'] });
    if (!schedule) {
      throw new NotFoundException(`Doctor schedule with ID ${id} not found`);
    }
    return schedule;
  }

  async findDoctorSchedulesByDoctorId(doctorId: string): Promise<DoctorSchedule[]> {
    await this.doctorsService.findOne(doctorId); // Validate doctor exists
    return this.doctorScheduleRepository.find({ where: { doctorId }, relations: ['doctor', 'doctor.user'] });
  }

  async updateDoctorSchedule(id: string, dto: UpdateDoctorScheduleDto): Promise<DoctorSchedule> {
    const schedule = await this.findDoctorScheduleById(id);
    // dto.doctorId is not allowed to be updated here, handled by DTO design
    if (dto.dayOfWeek && dto.shift && (dto.dayOfWeek !== schedule.dayOfWeek || dto.shift !== schedule.shift)){
        const existing = await this.doctorScheduleRepository.findOne({
            where: {
                doctorId: schedule.doctorId,
                dayOfWeek: dto.dayOfWeek,
                shift: dto.shift,
            }
        });
        if (existing && existing.id !== id) {
            throw new BadRequestException(`Doctor already has a schedule for ${dto.dayOfWeek}, ${dto.shift} shift.`);
        }
    }
    this.doctorScheduleRepository.merge(schedule, dto);
    return this.doctorScheduleRepository.save(schedule);
  }

  async removeDoctorSchedule(id: string): Promise<void> {
    const schedule = await this.findDoctorScheduleById(id);
    await this.doctorScheduleRepository.remove(schedule);
  }

  // --- Nurse Schedule Methods ---
  async createNurseSchedule(dto: CreateNurseScheduleDto): Promise<NurseSchedule> {
    await this.nursesService.findOne(dto.nurseId); // Validate nurse exists
    const existing = await this.nurseScheduleRepository.findOne({
      where: {
        nurseId: dto.nurseId,
        dayOfWeek: dto.dayOfWeek,
        shift: dto.shift,
      }
    });
    if (existing) {
      throw new BadRequestException(`Nurse already has a schedule for ${dto.dayOfWeek}, ${dto.shift} shift.`);
    }
    const newSchedule = this.nurseScheduleRepository.create(dto);
    return this.nurseScheduleRepository.save(newSchedule);
  }

  async findAllNurseSchedules(): Promise<NurseSchedule[]> {
    return this.nurseScheduleRepository.find({ relations: ['nurse', 'nurse.user'] });
  }

  async findNurseScheduleById(id: string): Promise<NurseSchedule> {
    const schedule = await this.nurseScheduleRepository.findOne({ where: { id }, relations: ['nurse', 'nurse.user'] });
    if (!schedule) {
      throw new NotFoundException(`Nurse schedule with ID ${id} not found`);
    }
    return schedule;
  }

  async findNurseSchedulesByNurseId(nurseId: string): Promise<NurseSchedule[]> {
    await this.nursesService.findOne(nurseId); // Validate nurse exists
    return this.nurseScheduleRepository.find({ where: { nurseId }, relations: ['nurse', 'nurse.user'] });
  }

  async updateNurseSchedule(id: string, dto: UpdateNurseScheduleDto): Promise<NurseSchedule> {
    const schedule = await this.findNurseScheduleById(id);
    // dto.nurseId is not allowed to be updated here, handled by DTO design
    if (dto.dayOfWeek && dto.shift && (dto.dayOfWeek !== schedule.dayOfWeek || dto.shift !== schedule.shift)){
        const existing = await this.nurseScheduleRepository.findOne({
            where: {
                nurseId: schedule.nurseId,
                dayOfWeek: dto.dayOfWeek,
                shift: dto.shift,
            }
        });
        if (existing && existing.id !== id) {
            throw new BadRequestException(`Nurse already has a schedule for ${dto.dayOfWeek}, ${dto.shift} shift.`);
        }
    }
    this.nurseScheduleRepository.merge(schedule, dto);
    return this.nurseScheduleRepository.save(schedule);
  }

  async removeNurseSchedule(id: string): Promise<void> {
    const schedule = await this.findNurseScheduleById(id);
    await this.nurseScheduleRepository.remove(schedule);
  }
}
