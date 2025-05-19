import { useState, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaFileAlt, FaChartBar, FaCalendarAlt, FaUserMd, FaPrescription, FaDiagnoses, FaFlask, FaHeartbeat, FaUser, FaSignOutAlt, FaBars, FaClinicMedical } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import type { JSX } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems: { [key: string]: { path: string; label: string; icon: JSX.Element }[] } = {
    admin: [
      { path: '/', label: 'Dashboard', icon: <FaTachometerAlt /> },
      { path: '/reports', label: 'Reports', icon: <FaChartBar /> },
      { path: '/users', label: 'Users', icon: <FaUsers /> },
      { path: '/patients', label: 'Patients', icon: <FaUserMd /> },
      { path: '/audit-logs', label: 'Audit Logs', icon: <FaFileAlt /> },
      { path: '/appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
      { path: '/admin-lab-reports', label: 'Lab Reports', icon: <FaFlask /> },
    ],
    doctor: [
      { path: '/', label: 'Dashboard', icon: <FaTachometerAlt /> },
      { path: '/doctor-appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
      { path: '/diagnoses', label: 'Diagnoses', icon: <FaDiagnoses /> },
      { path: '/patients', label: 'Patients', icon: <FaUserMd /> },
      { path: '/prescriptions', label: 'Prescriptions', icon: <FaPrescription /> },
      { path: '/doctor-lab-reports', label: 'Lab Reports', icon: <FaFlask /> },
      { path: '/doctor-profile', label: 'Profile', icon: <FaUser /> },
    ],
    nurse: [
      { path: '/', label: 'Dashboard', icon: <FaTachometerAlt /> },
      { path: '/nurse-appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
      { path: '/nurse-prescriptions', label: 'Prescriptions', icon: <FaPrescription /> },
      { path: '/nurse-lab-reports', label: 'Lab Reports', icon: <FaFlask /> },
      { path: '/vitals', label: 'Vitals', icon: <FaHeartbeat /> },
      { path: '/nurse-profile', label: 'Profile', icon: <FaUser /> },
    ],
    patient: [
      { path: '/', label: 'Dashboard', icon: <FaTachometerAlt /> },
      { path: '/patient-appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
      { path: '/patient-diagnoses', label: 'Diagnoses', icon: <FaDiagnoses /> },
      { path: '/patient-prescriptions', label: 'Prescriptions', icon: <FaPrescription /> },
      { path: '/patient-lab-reports', label: 'Lab Reports', icon: <FaFlask /> },
      { path: '/patient-profile', label: 'Profile', icon: <FaUser /> },
    ],
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Format today's date and day
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    timeZone: 'Asia/Kolkata' 
  });

  // If no user or role, show a loading state
  if (!user?.role) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-30 flex flex-col">
        {/* Brand Name Section (Always Visible) */}
        <div className="w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white p-4 flex items-center border-b border-blue-700">
          <FaClinicMedical className="text-3xl mr-2 animate-pulse" />
          <h1 className="text-2xl font-bold tracking-wide">MediTrack</h1>
        </div>
        {/* Nav Items Section (Toggles on Mobile) */}
        <div
          className={`w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 transition-transform duration-300 ease-in-out shadow-lg flex-1`}
        >
          <nav className="mt-4 flex flex-col justify-between h-[calc(100vh-5rem)]">
            <div>
              {navItems[user.role].map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 my-1 transition-colors duration-200 hover:bg-blue-700 hover:shadow-md ${
                      isActive ? 'bg-blue-900 border-l-4 border-white' : ''
                    }`
                  }
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              ))}
            </div>
            {/* Logout Button at the Bottom of Sidebar */}
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-3 my-1 mb-8 w-full text-left transition-colors duration-200 hover:bg-red-600 hover:shadow-md"
            >
              <FaSignOutAlt className="mr-3" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black opacity-50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Header */}
        <header className="bg-gray-100 shadow-lg p-4 flex justify-between items-center border-b border-gray-200">
          <div className="flex items-center">
            <button
              className="text-gray-600 md:hidden p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
              onClick={() => setIsSidebarOpen(true)}
            >
              <FaBars className="h-6 w-6" />
            </button>
            <h2 className="text-2xl font-semibold ml-4 text-gray-800">Welcome, {user.firstName || user.role || 'User'}</h2>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xl font-semibold text-gray-500">{formattedDate}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;