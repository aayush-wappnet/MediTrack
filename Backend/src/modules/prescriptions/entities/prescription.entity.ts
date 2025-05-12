import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';

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

  @Column()
  medicationName: string;

  @Column()
  dosage: string;

  @Column()
  frequency: string;

  @Column()
  duration: string;

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
  fulfilledBy: string;

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