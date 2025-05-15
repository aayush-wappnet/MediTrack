import type { Patient } from './patients.types';
import type { Doctor } from './doctors.types';
import type { Appointment } from './appointments.types';

export interface Diagnosis {
  id: string;
  patient: Patient;
  patientId?: string;
  doctor: Doctor;
  doctorId?: string;
  appointment: Appointment;
  appointmentId?: string;
  diagnosisName: string;
  diagnosisCode?: string;
  diagnosisType?: string;
  symptoms?: string[];
  notes?: string;
  diagnosisDate: string | Date;
  treatmentPlan?: string;
  followUpInstructions?: string;
  isChronic: boolean;
  createdAt: string;
  updatedAt: string;
}