export const LabReportStatus = {
  ORDERED: 'ordered',
  SAMPLE_COLLECTED: 'sample_collected',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type LabReportStatus = typeof LabReportStatus[keyof typeof LabReportStatus];

export interface TestParameter {
  parameterName: string;
  result: string;
  normalRange: string;
  unit?: string;
}

export interface LabReport {
  id: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    user: {
      email: string;
    };
  };
  orderedBy: {
    id: string;
    firstName: string;
    lastName: string;
    user: {
      email: string;
    };
  };
  uploadedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    user: {
      email: string;
    };
  };
  appointment: {
    id: string;
    date: string | Date;
    startTime: string;
  };
  testName: string;
  testType?: string;
  status: LabReportStatus;
  testParameters: TestParameter[];
  comments?: string;
  doctorNotes?: string;
  testDate?: string | Date;
  resultsDate?: string | Date;
  isUrgent: boolean;
  isPrinted: boolean;
  fileUrl?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateLabReportPayload {
  patientId: string;
  orderedById?: string;
  uploadedById?: string;
  appointmentId: string;
  testName: string;
  testType?: string;
  status?: LabReportStatus;
  testParameters?: TestParameter[];
  comments?: string;
  doctorNotes?: string;
  testDate?: string | Date;
  resultsDate?: string | Date;
  isUrgent?: boolean;
  fileUrl?: string;
}

export interface UpdateLabReportPayload {
  patientId?: string;
  orderedById?: string;
  uploadedById?: string;
  appointmentId?: string;
  testName?: string;
  testType?: string;
  status?: LabReportStatus;
  testParameters?: TestParameter[];
  comments?: string;
  doctorNotes?: string;
  testDate?: string | Date;
  resultsDate?: string | Date;
  isUrgent?: boolean;
  isPrinted?: boolean;
  fileUrl?: string;
}