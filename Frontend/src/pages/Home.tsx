import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaUserMd, FaUsers, FaUser, FaChartBar, FaHospitalUser, FaUserNurse, FaStethoscope, FaFlask } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { getAppointments } from '../api/endpoints/appointments';
import { getDashboardStats } from '../api/endpoints/dashboard';
import { type Appointment } from '../api/types/appointments.types';
import { type DashboardStats } from '../api/types/dashboard.types';
import Toast from '../components/common/Toast';
import Loader from '../components/common/Loader';
import { type JSX } from 'react';
import type { AdminStats, DoctorStats, NurseStats, PatientStats } from '../api/types/dashboard.types';

function Home() {
  const { user, profileId } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (user || profileId) {
      fetchAppointments();
      fetchStats();
    }
  }, [user, profileId]);

  const fetchAppointments = async () => {
    try {
      setIsLoadingAppointments(true);
      const data = await getAppointments();
      const upcoming = data
        .filter((appt) => {
          const apptDate = new Date(appt.date);
          const today = new Date('2025-05-21T10:14:00+05:30'); // Current date
          return apptDate >= today;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setAppointments(upcoming);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch appointments', type: 'error' });
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch stats', type: 'error' });
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Role-specific quick links
  const quickLinks: { [key: string]: { path: string; label: string; icon: JSX.Element }[] } = {
    admin: [
      { path: '/users', label: 'Manage Users', icon: <FaUsers /> },
      { path: '/reports', label: 'View Reports', icon: <FaChartBar /> },
    ],
    doctor: [
      { path: '/appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
      { path: '/patients', label: 'View Patients', icon: <FaUserMd /> },
    ],
    nurse: [
      { path: '/nurse-appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
      { path: '/lab-report-queue', label: 'Lab Report Queue', icon: <FaFlask /> },
      { path: '/prescription-queue', label: 'Prescription Queue', icon: <FaStethoscope /> },
    ],
    patient: [
      { path: '/patient-appointments', label: 'Book Appointment', icon: <FaCalendarAlt /> },
      { path: '/profile', label: 'View Profile', icon: <FaUser /> },
    ],
  };

  // Role-specific colors
  const roleStyles: { [key: string]: { gradient: string; iconColor: string } } = {
    admin: { gradient: 'from-purple-500 to-purple-600', iconColor: 'text-purple-600' },
    doctor: { gradient: 'from-blue-500 to-blue-600', iconColor: 'text-blue-600' },
    nurse: { gradient: 'from-teal-500 to-teal-600', iconColor: 'text-teal-600' },
    patient: { gradient: 'from-teal-500 to-teal-600', iconColor: 'text-teal-600' },
  };

  // Role-specific stats rendering
  const renderStats = () => {
    if (!stats) return null;

    const statItems: { label: string; value: string; icon: JSX.Element }[] = [];
    switch (user?.role) {
      case 'admin':
        const adminStats = stats as AdminStats;
        statItems.push(
          { label: 'Total Patients', value: adminStats.users.totalPatients.toString(), icon: <FaHospitalUser /> },
          { label: 'Total Doctors', value: adminStats.users.totalDoctors.toString(), icon: <FaUserMd /> },
          { label: 'Total Nurses', value: adminStats.users.totalNurses.toString(), icon: <FaUserNurse /> },
          { label: 'Total Appointments', value: adminStats.appointments.total.toString(), icon: <FaCalendarAlt /> },
          { label: 'Pending Appointments', value: adminStats.appointments.pending.toString(), icon: <FaCalendarAlt /> },
          { label: 'Completed Appointments', value: adminStats.appointments.completed.toString(), icon: <FaCalendarAlt /> },
          { label: 'Cancelled Appointments', value: adminStats.appointments.cancelled.toString(), icon: <FaCalendarAlt /> },
        );
        break;
      case 'doctor':
        const doctorStats = stats as DoctorStats;
        statItems.push(
          { label: 'Total Patients', value: doctorStats.patients.total.toString(), icon: <FaHospitalUser /> },
          { label: 'Total Appointments', value: doctorStats.appointments.total.toString(), icon: <FaCalendarAlt /> },
          { label: 'Pending Appointments', value: doctorStats.appointments.pending.toString(), icon: <FaCalendarAlt /> },
          { label: 'Today\'s Appointments', value: doctorStats.appointments.today.toString(), icon: <FaCalendarAlt /> },
        );
        break;
      case 'nurse':
        const nurseStats = stats as NurseStats;
        statItems.push(
          { label: 'Total Appointments', value: nurseStats.appointments.total.toString(), icon: <FaCalendarAlt /> },
          { label: 'Today\'s Appointments', value: nurseStats.appointments.today.toString(), icon: <FaCalendarAlt /> },
        );
        break;
      case 'patient':
        const patientStats = stats as PatientStats;
        statItems.push(
          { label: 'Total Appointments', value: patientStats.appointments.total.toString(), icon: <FaCalendarAlt /> },
          { label: 'Upcoming Appointments', value: patientStats.appointments.upcoming.toString(), icon: <FaCalendarAlt /> },
          { label: 'Completed Appointments', value: patientStats.appointments.completed.toString(), icon: <FaCalendarAlt /> },
          { label: 'Doctors Visited', value: patientStats.doctors.visited.toString(), icon: <FaUserMd /> },
        );
        break;
    }

    return statItems.map((stat, index) => (
      <div
        key={index}
        className={`p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 ${currentRoleStyles.iconColor.replace('text', 'border')} hover:bg-gray-200 transition-all duration-200 flex items-center space-x-3`}
      >
        <span className={`${currentRoleStyles.iconColor} text-xl`}>{stat.icon}</span>
        <div>
          <p className="text-gray-600 text-sm">{stat.label}</p>
          <p className="text-xl font-semibold text-gray-800">{stat.value}</p>
        </div>
      </div>
    ));
  };

  if (isLoadingAppointments || isLoadingStats) {
    return <Loader />;
  }

  if (!user?.role) {
    return <div>Access Denied</div>;
  }

  const currentRoleStyles = roleStyles[user.role] || roleStyles.patient;

  return (
    <div className="space-y-8 p-6">
      {/* Dashboard Header */}
      <div className={`bg-gradient-to-r ${currentRoleStyles.gradient} p-8 rounded-xl shadow-lg text-white animate-fade-in`}>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-lg mt-2 opacity-90">
          Welcome back, {user.firstName || user.role}! Here's an overview of your activities.
        </p>
      </div>

      {/* Role-Specific Stats */}
      <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Overview</h2>
        {isLoadingStats ? (
          <p className="text-gray-600">Loading stats...</p>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {renderStats()}
          </div>
        ) : (
          <p className="text-gray-600">Failed to load stats.</p>
        )}
      </div>

      {/* Quick Links */}
      <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks[user.role].map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 hover:scale-105 transition-all duration-200"
            >
              <span className={`${currentRoleStyles.iconColor} mr-3 text-xl`}>{link.icon}</span>
              <span className="text-gray-800 font-medium">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>
        {appointments.length === 0 ? (
          <p className="text-gray-600">No upcoming appointments found.</p>
        ) : (
          <div className="space-y-4">
            {appointments.slice(0, 5).map((appt, index) => (
              <div
                key={appt.id}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <FaCalendarAlt className={`${currentRoleStyles.iconColor} mr-3 text-xl`} />
                <div className="flex-1">
                  <div className="flex items-center">
                    <span
                      className={`w-3 h-3 rounded-full mr-2 ${
                        appt.status === 'APPROVED' ? 'bg-green-500' : appt.status === 'PENDING_APPROVAL' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    />
                    <p className="text-gray-800 font-medium">
                      {user.role === 'patient'
                        ? `With Dr. ${appt.doctor.firstName} ${appt.doctor.lastName}`
                        : `With ${appt.patient.firstName} ${appt.patient.lastName}`}
                    </p>
                  </div>
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
                  className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
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