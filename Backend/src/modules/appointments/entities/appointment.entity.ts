import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm'; // Added OneToMany
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Nurse } from '../../nurses/entities/nurse.entity';
import { Diagnosis } from '../../diagnoses/entities/diagnosis.entity'; // Added import
import { LabReport } from '../../lab-reports/entities/lab-report.entity'; // Added import

export enum AppointmentStatus {
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, patient => patient.appointments)
  @JoinColumn()
  patient: Patient;

  @ManyToOne(() => Doctor, doctor => doctor.appointments)
  @JoinColumn()
  doctor: Doctor;

  @ManyToOne(() => Nurse, nurse => nurse.appointments, { nullable: true })
  @JoinColumn()
  nurse: Nurse;

  @Column()
  date: Date;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING_APPROVAL
  })
  status: AppointmentStatus;

  @Column({ nullable: true })
  reason: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: false })
  isFirstVisit: boolean;

  @Column({ nullable: true })
  virtualMeetingLink: string;

  @Column({ default: false })
  isVirtual: boolean;

  @Column({ nullable: true })
  cancelReason: string;

  @Column({ nullable: true })
  reminderSent: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Diagnosis, diagnosis => diagnosis.appointment) // Added relation
  diagnoses: Diagnosis[]; // Added relation

  @OneToMany(() => LabReport, labReport => labReport.appointment) // Added relation
  labReports: LabReport[]; // Added relation
}