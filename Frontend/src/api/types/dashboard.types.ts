export interface AdminStats {
  users: {
    totalPatients: number;
    totalDoctors: number;
    totalNurses: number;
  };
  appointments: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
}

export interface DoctorStats {
  appointments: {
    total: number;
    pending: number;
    today: number;
  };
  patients: {
    total: number;
  };
}

export interface NurseStats {
  appointments: {
    total: number;
    today: number;
  };
}

export interface PatientStats {
  appointments: {
    total: number;
    upcoming: number;
    completed: number;
  };
  doctors: {
    visited: number;
  };
}

export type DashboardStats = AdminStats | DoctorStats | NurseStats | PatientStats;