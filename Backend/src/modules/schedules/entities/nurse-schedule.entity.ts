import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Nurse } from '../../nurses/entities/nurse.entity';
import { ApiProperty } from '@nestjs/swagger';
import { DayOfWeek, Shift } from './schedule.types'; // Use a shared types file

@Entity('nurse_schedules')
export class NurseSchedule {
  @ApiProperty({ description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

   // Link to Nurse (mandatory)
  @ManyToOne(() => Nurse, nurse => nurse.schedules, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nurseId' })
  nurse: Nurse;

  @ApiProperty({ description: 'ID of the associated nurse' })
  @Column({ type: 'uuid', nullable: false })
  nurseId: string;

  @ApiProperty({ enum: DayOfWeek, description: 'Day of the week' })
  @Column({ type: 'enum', enum: DayOfWeek })
  dayOfWeek: DayOfWeek;

  @ApiProperty({ enum: Shift, description: 'Shift' })
  @Column({ type: 'enum', enum: Shift })
  shift: Shift;

  @ApiProperty({ example: '07:00', description: 'Start time (HH:MM)' })
  @Column({ type: 'varchar', length: 5 })
  startTime: string;

  @ApiProperty({ example: '15:00', description: 'End time (HH:MM)' })
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
