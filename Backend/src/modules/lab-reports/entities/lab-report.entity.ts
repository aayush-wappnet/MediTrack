import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Nurse } from '../../nurses/entities/nurse.entity';
import { Appointment } from '../../appointments/entities/appointment.entity'; // Added import

export enum LabReportStatus {
  ORDERED = 'ordered',
  SAMPLE_COLLECTED = 'sample_collected',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('lab_reports')
export class LabReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, patient => patient.labReports)
  @JoinColumn()
  patient: Patient;

  @ManyToOne(() => Doctor)
  @JoinColumn()
  orderedBy: Doctor;

  @ManyToOne(() => Nurse, { nullable: true })
  @JoinColumn()
  uploadedBy: Nurse;

  @ManyToOne(() => Appointment, appointment => appointment.labReports) // Removed { nullable: true }
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @Column()
  testName: string;

  @Column({ nullable: true })
  testType: string;

  @Column({
    type: 'enum',
    enum: LabReportStatus,
    default: LabReportStatus.ORDERED
  })
  status: LabReportStatus;

  @Column({ nullable: true })
  results: string;

  @Column({ nullable: true })
  normalRanges: string;

  @Column({ nullable: true })
  comments: string;

  @Column({ nullable: true })
  doctorNotes: string;

  @Column({ nullable: true })
  testDate: Date;

  @Column({ nullable: true })
  resultsDate: Date;

  @Column({ default: false })
  isUrgent: boolean;

  @Column({ default: false })
  isPrinted: boolean;

  @Column({ nullable: true })
  fileUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}