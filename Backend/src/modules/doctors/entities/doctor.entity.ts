import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Prescription } from '../../prescriptions/entities/prescription.entity';
import { Diagnosis } from '../../diagnoses/entities/diagnosis.entity';
import { DoctorSchedule } from '../../schedules/entities/doctor-schedule.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  specialization: string;

  @Column({ nullable: true })
  licenseNumber: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  yearsOfExperience: number;

  @Column({ nullable: true })
  education: string;

  @Column({ nullable: true })
  bio: string;

  @OneToMany(() => Appointment, appointment => appointment.doctor)
  appointments: Appointment[];

  @OneToMany(() => Prescription, prescription => prescription.doctor)
  prescriptions: Prescription[];

  @OneToMany(() => Diagnosis, diagnosis => diagnosis.doctor)
  diagnoses: Diagnosis[];

  @OneToMany(() => DoctorSchedule, schedule => schedule.doctor)
  schedules: DoctorSchedule[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}