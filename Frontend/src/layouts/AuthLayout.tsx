import type { ReactNode } from 'react';
import { FaClinicMedical } from 'react-icons/fa';

interface AuthLayoutProps {
  children: ReactNode;
}

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://www.freepik.com/free-vector/abstract-medical-wallpaper-template-design_3439406.htm#from_element=cross_selling__vector')] opacity-50" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6 py-8">
        {/* Branding */}
        <div className="flex items-center mb-8">
          <FaClinicMedical className="text-4xl text-blue-600 mr-3 animate-pulse" />
          <h1 className="text-3xl font-bold text-gray-800 tracking-wide">MediTrack</h1>
        </div>

        {/* Card for Children */}
        <div className="w-full bg-white shadow-xl rounded-lg p-8 transform transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;