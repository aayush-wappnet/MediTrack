export const AppointmentStatus = {
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
} as const;

export type AppointmentStatus = typeof AppointmentStatus[keyof typeof AppointmentStatus];

export interface AppointmentPatient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  phoneNumber: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  allergies: string;
  chronicConditions: string;
  barcodeId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    password: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface AppointmentDoctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  licenseNumber: string;
  phoneNumber: string;
  yearsOfExperience: number;
  education: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    password: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface AppointmentNurse {
  id: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  phoneNumber: string;
  department: string;
  yearsOfExperience: number;
  education: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    password: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

export interface Appointment {
  id: string;
  patient: AppointmentPatient;
  doctor: AppointmentDoctor;
  nurse?: AppointmentNurse;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  reason?: string;
  notes?: string;
  isFirstVisit: boolean;
  isVirtual: boolean;
  virtualMeetingLink?: string;
  cancelReason?: string | null;
  reminderSent?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentDto {
  patientId: string;
  doctorId: string;
  nurseId?: string;
  date: Date;
  startTime: string;
  endTime: string;
  status?: AppointmentStatus;
  reason?: string;
  notes?: string;
  isFirstVisit?: boolean;
  isVirtual?: boolean;
  virtualMeetingLink?: string;
}

export interface UpdateAppointmentDto {
  patientId?: string;
  doctorId?: string;
  nurseId?: string;
  date?: Date;
  startTime?: string;
  endTime?: string;
  status?: AppointmentStatus;
  reason?: string;
  notes?: string;
  isFirstVisit?: boolean;
  isVirtual?: boolean;
  virtualMeetingLink?: string;
  cancelReason?: string;
}

export interface CancelAppointmentDto {
  cancelReason: string;
}

export interface RejectAppointmentDto {
  rejectionReason: string;
}