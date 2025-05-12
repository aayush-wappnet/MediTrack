import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { LabReport } from '../../lab-reports/entities/lab-report.entity';
import { NurseSchedule } from '../../schedules/entities/nurse-schedule.entity';

@Entity('nurses')
export class Nurse {
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
  licenseNumber: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  yearsOfExperience: number;

  @Column({ nullable: true })
  education: string;

  @OneToMany(() => Appointment, appointment => appointment.nurse)
  appointments: Appointment[];

  @OneToMany(() => LabReport, labReport => labReport.uploadedBy)
  labReports: LabReport[];

  @OneToMany(() => NurseSchedule, schedule => schedule.nurse)
  schedules: NurseSchedule[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}