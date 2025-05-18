import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Nurse } from '../../nurses/entities/nurse.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';

export enum LabReportStatus {
  ORDERED = 'ordered',
  SAMPLE_COLLECTED = 'sample_collected',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface TestParameter {
  parameterName: string;
  result: string;
  normalRange: string;
  unit?: string;
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

  @ManyToOne(() => Appointment, appointment => appointment.labReports)
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

  @Column({ type: 'jsonb', nullable: true })
  testParameters: TestParameter[];

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