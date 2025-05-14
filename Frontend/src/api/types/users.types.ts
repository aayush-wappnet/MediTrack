export interface User {
    id: string;
    email: string;
    role: 'admin' | 'doctor' | 'nurse' | 'patient';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface UpdateUserDto {
    email?: string;
    role?: 'admin' | 'doctor' | 'nurse' | 'patient';
    isActive?: boolean;
  }