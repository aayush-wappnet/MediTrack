export interface User {
  id: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
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
  userId: string;
  user: User;
}