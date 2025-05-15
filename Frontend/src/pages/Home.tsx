import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaUserMd, FaUsers, FaHeartbeat, FaUser, FaChartBar } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { getAppointments } from '../api/endpoints/appointments';
import { type Appointment } from '../api/types/appointments.types';
import Toast from '../components/common/Toast';
import Loader from '../components/common/Loader';
import { type JSX } from 'react';

function Home() {
  const { user, profileId } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (user || profileId) {
      fetchAppointments();
    }
  }, [user, profileId]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const data = await getAppointments();
      // Filter upcoming appointments (future dates) and sort by date
      const upcoming = data
        .filter((appt) => {
          const apptDate = new Date(appt.date);
          const today = new Date('2025-05-15T11:24:00+05:30'); // Current date
          return apptDate >= today;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setAppointments(upcoming);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch appointments', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Role-specific quick links
  const quickLinks: { [key: string]: { path: string; label: string; icon: JSX.Element }[] } = {
    admin: [
      { path: '/users', label: 'Manage Users', icon: <FaUsers /> },
      { path: '/reports', label: 'View Reports', icon: <FaChartBar /> },
    ],
    doctor: [
      { path: '/doctor-appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
      { path: '/patients', label: 'View Patients', icon: <FaUserMd /> },
    ],
    nurse: [
      { path: '/nurse-appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
      { path: '/vitals', label: 'Record Vitals', icon: <FaHeartbeat /> },
    ],
    patient: [
      { path: '/patient-appointments', label: 'Book Appointment', icon: <FaCalendarAlt /> },
      { path: '/profile', label: 'View Profile', icon: <FaUser /> },
    ],
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!user?.role) {
    return <div>Access Denied</div>;
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {user.firstName || user.role}! Here's an overview of your activities.
        </p>
      </div>

      {/* Quick Links */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks[user.role].map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
            >
              <span className="text-blue-600 mr-3 text-xl">{link.icon}</span>
              <span className="text-gray-800 font-medium">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>
        {appointments.length === 0 ? (
          <p className="text-gray-600">No upcoming appointments found.</p>
        ) : (
          <div className="space-y-4">
            {appointments.slice(0, 5).map((appt) => (
              <div
                key={appt.id}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <FaCalendarAlt className="text-blue-600 mr-3 text-xl" />
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">
                    {user.role === 'patient'
                      ? `With Dr. ${appt.doctor.firstName} ${appt.doctor.lastName}`
                      : `With ${appt.patient.firstName} ${appt.patient.lastName}`}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {new Date(appt.date).toLocaleDateString()} at {appt.startTime}
                  </p>
                </div>
                <Link
                  to={
                    user.role === 'patient'
                      ? '/patient-appointments'
                      : user.role === 'nurse'
                      ? '/nurse-appointments'
                      : '/doctor-appointments'
                  }
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {showToast && (
        <Toast
          message={showToast.message}
          type={showToast.type}
          onClose={() => setShowToast(null)}
        />
      )}
    </div>
  );
}

export default Home;