import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { ApiProperty } from '@nestjs/swagger';
import { DayOfWeek, Shift } from './schedule.types'; // Use a shared types file

@Entity('doctor_schedules')
export class DoctorSchedule {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Link to Doctor (mandatory)
  @ManyToOne(() => Doctor, doctor => doctor.schedules, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @ApiProperty({ description: 'ID of the associated doctor' })
  @Column({ type: 'uuid', nullable: false })
  doctorId: string;

  @ApiProperty({ enum: DayOfWeek, description: 'Day of the week' })
  @Column({ type: 'enum', enum: DayOfWeek })
  dayOfWeek: DayOfWeek;

  @ApiProperty({ enum: Shift, description: 'Shift' })
  @Column({ type: 'enum', enum: Shift })
  shift: Shift;

  @ApiProperty({ example: '09:00', description: 'Start time (HH:MM)' })
  @Column({ type: 'varchar', length: 5 })
  startTime: string;

  @ApiProperty({ example: '17:00', description: 'End time (HH:MM)' })
  @Column({ type: 'varchar', length: 5 })
  endTime: string;

  @ApiProperty({ default: false, description: 'Availability status' })
  @Column({ default: false })
  isAvailable: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;
}
