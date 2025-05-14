export const AppointmentStatus = {
    SCHEDULED: 'SCHEDULED',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
    NO_SHOW: 'NO_SHOW',
  } as const;
  
  export type AppointmentStatus = typeof AppointmentStatus[keyof typeof AppointmentStatus];
  
  export interface Appointment {
    id: string;
    patient: {
      id: string;
      firstName: string;
      lastName: string;
    };
    doctor: {
      id: string;
    };
    nurse?: {
      id: string;
    };
    date: string;
    startTime: string;
    endTime: string;
    status: AppointmentStatus;
    reason?: string;
    notes?: string;
    isFirstVisit: boolean;
    isVirtual: boolean;
    virtualMeetingLink?: string;
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