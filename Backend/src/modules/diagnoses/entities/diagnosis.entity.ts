import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Appointment } from '../../appointments/entities/appointment.entity'; // Added import

@Entity('diagnoses')
export class Diagnosis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, patient => patient.diagnoses)
  @JoinColumn()
  patient: Patient;

  @ManyToOne(() => Doctor, doctor => doctor.diagnoses)
  @JoinColumn()
  doctor: Doctor;

  @ManyToOne(() => Appointment, appointment => appointment.diagnoses) // Removed { nullable: true }
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @Column()
  diagnosisName: string;

  @Column({ nullable: true })
  diagnosisCode: string;

  @Column({ nullable: true })
  diagnosisType: string;

  @Column({ nullable: true })
  symptoms: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ type: 'date' })
  diagnosisDate: Date;

  @Column({ nullable: true })
  treatmentPlan: string;

  @Column({ nullable: true })
  followUpInstructions: string;

  @Column({ default: false })
  isChronic: boolean;

  @Column({ default: false })
  isPrinted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}