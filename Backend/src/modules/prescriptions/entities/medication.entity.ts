import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Prescription } from './prescription.entity';

@Entity('medications')
export class Medication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Prescription, prescription => prescription.medications, { onDelete: 'CASCADE' })
  @JoinColumn()
  prescription: Prescription;

  @Column()
  medicationName: string;

  @Column('float')
  dosage: number;

  @Column()
  dosageUnit: string;

  @Column('boolean', { default: false })
  breakfast: boolean;

  @Column('boolean', { default: false })
  lunch: boolean;

  @Column('boolean', { default: false })
  dinner: boolean;

  @Column()
  duration: string;

  @Column({ nullable: true })
  instructions: string;
}
