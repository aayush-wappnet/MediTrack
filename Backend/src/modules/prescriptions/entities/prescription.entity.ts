import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Nurse } from '../../nurses/entities/nurse.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { Medication } from './medication.entity';

export enum PrescriptionStatus {
  ISSUED = 'issued',
  PROCESSING = 'processing',
  FULFILLED = 'fulfilled',
  CANCELLED = 'cancelled',
}

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, patient => patient.prescriptions)
  @JoinColumn()
  patient: Patient;

  @ManyToOne(() => Doctor, doctor => doctor.prescriptions)
  @JoinColumn()
  doctor: Doctor;
  
  @ManyToOne(() => Nurse, nurse => nurse.prescriptions, { nullable: true })
  @JoinColumn()
  nurse: Nurse;
  
  @ManyToOne(() => Appointment, { nullable: true })
  @JoinColumn()
  appointment: Appointment;
  
  @OneToMany(() => Medication, medication => medication.prescription, { cascade: true, eager: true })
  medications: Medication[];

  @Column({ nullable: true })
  instructions: string;

  @Column({
    type: 'enum',
    enum: PrescriptionStatus,
    default: PrescriptionStatus.ISSUED
  })
  status: PrescriptionStatus;

  @Column({ nullable: true })
  fulfilledDate: Date;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: false })
  isPrinted: boolean;

  @Column({ default: false })
  isRefillable: boolean;

  @Column({ default: 0 })
  refillsRemaining: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}