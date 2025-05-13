export interface LoginDto {
    email: string;
    password: string;
  }
  
  export interface CreateUserDto {
    email: string;
    password: string;
    role: 'admin' | 'doctor' | 'nurse' | 'patient';
  }
  
  export interface LoginResponse {
    accessToken: string;
  }
  
  export interface RegisterResponse {
    user: {
      id: string;
      email: string;
      role: string;
    };
    message: string;
    accessToken: string;
  }
  
  export interface AuthError {
    statusCode: number;
    message: string;
  }