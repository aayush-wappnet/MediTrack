import type { User } from "./users.types";

export interface Nurse {
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
  userId: string;
  user?: {
    email: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface NurseUpdate {
  id: string;
  firstName?: string;
  lastName?: string;
  licenseNumber?: string;
  phoneNumber?: string;
  department?: string;
  yearsOfExperience?: number;
  education?: string;
  user?: User;
}
