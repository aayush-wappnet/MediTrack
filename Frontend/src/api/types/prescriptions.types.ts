import type { Patient } from './patients.types';
import type { Doctor } from './doctors.types';
import type { Nurse } from './nurses.types';
import type { Appointment } from './appointments.types';

// Define PrescriptionStatus as a union type instead of an enum
export type PrescriptionStatus = 'issued' | 'processing' | 'fulfilled' | 'cancelled';

// Define a constant object for PrescriptionStatus values
export const PrescriptionStatus = {
  ISSUED: 'issued' as const,
  PROCESSING: 'processing' as const,
  FULFILLED: 'fulfilled' as const,
  CANCELLED: 'cancelled' as const,
};

export interface Medication {
  id: string;
  medicationName: string;
  dosage: number;
  dosageUnit: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  duration: string;
  instructions?: string;
  prescription?: Prescription;
}

export interface Prescription {
  id: string;
  patient: Patient;
  patientId?: string;
  doctor: Doctor;
  doctorId?: string;
  nurse: Nurse | null;
  nurseId?: string;
  appointment: Appointment | null;
  appointmentId?: string;
  medications: Medication[];
  instructions?: string;
  status: PrescriptionStatus;
  fulfilledDate?: string | Date;
  notes?: string;
  isPrinted: boolean;
  isRefillable: boolean;
  refillsRemaining: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}