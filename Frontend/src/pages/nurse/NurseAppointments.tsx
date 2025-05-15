import { useState, useEffect } from 'react';
import { FaEye } from 'react-icons/fa';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Toast from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { useAuth } from '../../hooks/useAuth';
import { getAppointments } from '../../api/endpoints/appointments';
import { type Appointment, AppointmentStatus } from '../../api/types/appointments.types';

function NurseAppointments() {
  const { isAllowed } = useRoleGuard(['nurse']);
  const { profileId } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const appointmentsPerPage = 10;

  useEffect(() => {
    if (isAllowed && profileId) {
      fetchAppointments();
    }
  }, [isAllowed, profileId]);

  useEffect(() => {
    let filtered = appointments;
    // Filter by nurseId
    filtered = filtered.filter((appt) => appt.nurse?.id === profileId);
    // Filter by status if selected
    if (statusFilter) {
      filtered = filtered.filter((appt) => appt.status === statusFilter);
    }
    setFilteredAppointments(filtered);
    setCurrentPage(1);
  }, [appointments, statusFilter, profileId]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const data = await getAppointments();
      setAppointments(data);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch appointments', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (appointment: Appointment) => {
    setViewingAppointment(appointment);
  };

  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const columns = [
    {
      key: 'patient',
      header: 'Patient',
      render: (appt: Appointment) => `${appt.patient.firstName} ${appt.patient.lastName}`,
    },
    {
      key: 'doctor',
      header: 'Doctor',
      render: (appt: Appointment) => `${appt.doctor.firstName} ${appt.doctor.lastName}`,
    },
    {
      key: 'date',
      header: 'Date',
      render: (appt: Appointment) => new Date(appt.date).toLocaleDateString(),
    },
    { key: 'startTime', header: 'Start Time' },
    { key: 'endTime', header: 'End Time' },
    {
      key: 'status',
      header: 'Status',
      render: (appt: Appointment) =>
        appt.status
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' '),
    },
    { key: 'reason', header: 'Reason' },
    {
      key: 'view',
      header: 'View Details',
      render: (appt: Appointment) => (
        <button
          onClick={() => handleViewDetails(appt)}
          className="text-blue-600 hover:text-blue-800"
          title="View Details"
        >
          <FaEye />
        </button>
      ),
    },
  ];

  if (!isAllowed) {
    return <div>Access Denied</div>;
  }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">My Appointments</h1>
      </div>
      <div className="mb-4">
        <Select
          label="Filter by Status"
          options={[
            { value: '', label: 'All Statuses' },
            { value: AppointmentStatus.PENDING_APPROVAL, label: 'Pending Approval' },
            { value: AppointmentStatus.APPROVED, label: 'Approved' },
            { value: AppointmentStatus.REJECTED, label: 'Rejected' },
            { value: AppointmentStatus.COMPLETED, label: 'Completed' },
            { value: AppointmentStatus.CANCELLED, label: 'Cancelled' },
            { value: AppointmentStatus.NO_SHOW, label: 'No Show' },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-48"
        />
      </div>
      <Table data={currentAppointments} columns={columns} />
      <div className="mt-4 flex justify-between items-center">
        <div>
          Showing {indexOfFirstAppointment + 1} to {Math.min(indexOfLastAppointment, filteredAppointments.length)} of {filteredAppointments.length} appointments
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              onClick={() => paginate(page)}
              className={`px-3 py-1 ${
                currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {page}
            </Button>
          ))}
          <Button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
          >
            Next
          </Button>
        </div>
      </div>
      <Modal
        isOpen={!!viewingAppointment}
        onClose={() => setViewingAppointment(null)}
        title="Appointment Details"
      >
        {viewingAppointment && (
          <div className="space-y-4">
            <p><strong>Patient:</strong> {viewingAppointment.patient.firstName} {viewingAppointment.patient.lastName}</p>
            <p><strong>Doctor:</strong> {viewingAppointment.doctor.firstName} {viewingAppointment.doctor.lastName}</p>
            {viewingAppointment.nurse && (
              <p><strong>Nurse:</strong> {viewingAppointment.nurse.firstName} {viewingAppointment.nurse.lastName}</p>
            )}
            <p><strong>Date:</strong> {new Date(viewingAppointment.date).toLocaleDateString()}</p>
            <p><strong>Start Time:</strong> {viewingAppointment.startTime}</p>
            <p><strong>End Time:</strong> {viewingAppointment.endTime}</p>
            <p><strong>Status:</strong> {viewingAppointment.status
              .split('_')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ')}</p>
            <p><strong>Reason:</strong> {viewingAppointment.reason || 'N/A'}</p>
            <p><strong>Notes:</strong> {viewingAppointment.notes || 'N/A'}</p>
            <p><strong>First Visit:</strong> {viewingAppointment.isFirstVisit ? 'Yes' : 'No'}</p>
            <p><strong>Virtual:</strong> {viewingAppointment.isVirtual ? 'Yes' : 'No'}</p>
            {viewingAppointment.isVirtual && (
              <p><strong>Meeting Link:</strong> <a href={viewingAppointment.virtualMeetingLink} target="_blank" rel="noopener noreferrer">{viewingAppointment.virtualMeetingLink}</a></p>
            )}
          </div>
        )}
        <div className="mt-6">
          <Button onClick={() => setViewingAppointment(null)} className="bg-gray-500 hover:bg-gray-600">
            Close
          </Button>
        </div>
      </Modal>
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

export default NurseAppointments;