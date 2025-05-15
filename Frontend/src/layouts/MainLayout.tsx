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
      { path: '/users', label: 'Users', icon: <FaUsers /> },
      { path: '/audit-logs', label: 'Audit Logs', icon: <FaFileAlt /> },
      { path: '/appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
      { path: '/reports', label: 'Reports', icon: <FaChartBar /> },
    ],
    doctor: [
      { path: '/', label: 'Dashboard', icon: <FaTachometerAlt /> },
      { path: '/doctor-appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
      { path: '/patients', label: 'Patients', icon: <FaUserMd /> },
      { path: '/prescriptions', label: 'Prescriptions', icon: <FaPrescription /> },
      { path: '/diagnoses', label: 'Diagnoses', icon: <FaDiagnoses /> },
      { path: '/lab-requests', label: 'Lab Requests', icon: <FaFlask /> },
    ],
    nurse: [
      { path: '/', label: 'Dashboard', icon: <FaTachometerAlt /> },
      { path: '/nurse-appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
      { path: '/prescriptions', label: 'Prescriptions', icon: <FaPrescription /> },
      { path: '/lab-reports', label: 'Lab Reports', icon: <FaFlask /> },
      { path: '/vitals', label: 'Vitals', icon: <FaHeartbeat /> },
    ],
    patient: [
      { path: '/', label: 'Dashboard', icon: <FaTachometerAlt /> },
      { path: '/patient-appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
      { path: '/prescriptions', label: 'Prescriptions', icon: <FaPrescription /> },
      { path: '/lab-reports', label: 'Lab Reports', icon: <FaFlask /> },
      { path: '/profile', label: 'Profile', icon: <FaUser /> },
    ],
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // If no user or role, show a loading state
  if (!user?.role) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-blue-800 text-white transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 transition-transform duration-200 ease-in-out`}
      >
        <div className="p-4 flex items-center">
          <FaClinicMedical className="text-3xl mr-2" />
          <h1 className="text-2xl font-bold">MediTrack</h1>
        </div>
        <nav className="mt-4">
          {navItems[user.role].map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 my-1 hover:bg-blue-700 ${
                  isActive ? 'bg-blue-900' : ''
                }`
              }
              onClick={() => setIsSidebarOpen(false)}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
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
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <div className="flex items-center">
            <button
              className="text-gray-500 md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <FaBars className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-semibold ml-4">Welcome, {user.firstName || user.role || 'User' }</h2>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center text-red-600 hover:text-red-800"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;