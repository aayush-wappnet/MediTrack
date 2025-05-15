import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Toast from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import ConfirmBox from '../../components/common/ConfirmBox';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { useAuth } from '../../hooks/useAuth';
import { getAppointments, updateAppointment, deleteAppointment, approveAppointment, rejectAppointment, getAppointmentById } from '../../api/endpoints/appointments';
import { getPatients } from '../../api/endpoints/patients';
import { getDoctors } from '../../api/endpoints/doctors';
import { type Appointment, AppointmentStatus, type UpdateAppointmentDto, type RejectAppointmentDto } from '../../api/types/appointments.types';
import { type Patient } from '../../api/types/patients.types';
import { type Doctor } from '../../api/types/doctors.types';

function Appointments() {
  const { isAllowed } = useRoleGuard(['admin', 'doctor']);
  const { user, profileId } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [deletingAppointmentId, setDeletingAppointmentId] = useState<string | null>(null);
  const [approvingAppointmentId, setApprovingAppointmentId] = useState<string | null>(null);
  const [rejectingAppointmentId, setRejectingAppointmentId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [formData, setFormData] = useState<Partial<UpdateAppointmentDto> & { cancelReason?: string }>({});
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const appointmentsPerPage = 10;

  useEffect(() => {
    if (isAllowed) {
      fetchAppointments();
      fetchPatients();
      fetchDoctors();
    }
  }, [isAllowed]);

  useEffect(() => {
    const filtered = statusFilter
      ? appointments.filter((appt) => appt.status === statusFilter)
      : appointments;
    setFilteredAppointments(filtered);
    setCurrentPage(1);
  }, [appointments, statusFilter]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const data = await getAppointments();
      setAppointments(data);
      setFilteredAppointments(data);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch appointments', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch patients', type: 'error' });
    }
  };

  const fetchDoctors = async () => {
    try {
      const data = await getDoctors();
      setDoctors(data);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch doctors', type: 'error' });
    }
  };

  const handleEdit = async (appointment: Appointment) => {
    try {
      const appointmentData = await getAppointmentById(appointment.id);
      setEditingAppointment(appointmentData);
      setFormData({
        patientId: appointmentData.patient.id,
        doctorId: appointmentData.doctor.id,
        date: new Date(appointmentData.date),
        startTime: appointmentData.startTime,
        endTime: appointmentData.endTime,
        status: appointmentData.status as AppointmentStatus,
        reason: appointmentData.reason,
        notes: appointmentData.notes,
        isFirstVisit: appointmentData.isFirstVisit,
        isVirtual: appointmentData.isVirtual,
        virtualMeetingLink: appointmentData.virtualMeetingLink,
      });
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch appointment', type: 'error' });
    }
  };

  const handleViewDetails = (appointment: Appointment) => {
    setViewingAppointment(appointment);
  };

  const handleUpdate = async () => {
    if (!editingAppointment) return;
    try {
      const updatedData: UpdateAppointmentDto = {
        ...formData,
        date: formData.date ? new Date(formData.date) : undefined,
        doctorId: user?.role === 'doctor' ? profileId! : formData.doctorId,
        status: formData.status ? formData.status as AppointmentStatus : undefined,
      };
      const updatedAppointment = await updateAppointment(editingAppointment.id, updatedData);
      setAppointments(appointments.map((appt) => (appt.id === updatedAppointment.id ? updatedAppointment : appt)));
      setFilteredAppointments(filteredAppointments.map((appt) => (appt.id === updatedAppointment.id ? updatedAppointment : appt)));
      setEditingAppointment(null);
      setFormData({});
      setShowToast({ message: 'Appointment updated successfully', type: 'success' });
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to update appointment', type: 'error' });
    }
  };

  const handleApprove = async () => {
    if (!approvingAppointmentId) return;
    try {
      const approvedAppointment = await approveAppointment(approvingAppointmentId);
      setAppointments(appointments.map((appt) => (appt.id === approvedAppointment.id ? approvedAppointment : appt)));
      setFilteredAppointments(filteredAppointments.map((appt) => (appt.id === approvedAppointment.id ? approvedAppointment : appt)));
      setApprovingAppointmentId(null);
      setShowToast({ message: 'Appointment approved successfully', type: 'success' });
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to approve appointment', type: 'error' });
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingAppointmentId) return;
    setRejectingAppointmentId(null); // Close confirmation box
    // Open rejection reason modal
    setRejectingAppointmentId(rejectingAppointmentId);
  };

  const handleReject = async () => {
    if (!rejectingAppointmentId || !rejectionReason) return;
    try {
      const rejectData: RejectAppointmentDto = { rejectionReason };
      const rejectedAppointment = await rejectAppointment(rejectingAppointmentId, rejectData);
      setAppointments(appointments.map((appt) => (appt.id === rejectedAppointment.id ? rejectedAppointment : appt)));
      setFilteredAppointments(filteredAppointments.map((appt) => (appt.id === rejectedAppointment.id ? rejectedAppointment : appt)));
      setRejectingAppointmentId(null);
      setRejectionReason('');
      setShowToast({ message: 'Appointment rejected successfully', type: 'success' });
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to reject appointment', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingAppointmentId(id);
  };

  const confirmDelete = async () => {
    if (!deletingAppointmentId) return;
    try {
      await deleteAppointment(deletingAppointmentId);
      setAppointments(appointments.filter((appt) => appt.id !== deletingAppointmentId));
      setFilteredAppointments(filteredAppointments.filter((appt) => appt.id !== deletingAppointmentId));
      setShowToast({ message: 'Appointment deleted successfully', type: 'success' });
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to delete appointment', type: 'error' });
    } finally {
      setDeletingAppointmentId(null);
    }
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
      key: 'approval',
      header: 'Approval',
      render: (appt: Appointment) => {
        if (appt.status !== AppointmentStatus.PENDING_APPROVAL || user?.role !== 'doctor') {
          return '-';
        }
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => setApprovingAppointmentId(appt.id)}
              className="text-green-600 hover:text-green-800"
              title="Approve"
            >
              <FaCheck />
            </button>
            <button
              onClick={() => setRejectingAppointmentId(appt.id)}
              className="text-red-600 hover:text-red-800"
              title="Reject"
            >
              <FaTimes />
            </button>
          </div>
        );
      },
    },
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
    {
      key: 'actions',
      header: 'Delete (Actions)',
      render: (appt: Appointment) => {
        if (!(user?.role === 'admin' || user?.role === 'doctor')) {
          return '-';
        }
        return (
          <div className="flex space-x-2">
            {user?.role === 'admin' && (
              <button
                onClick={() => handleEdit(appt)}
                className="text-blue-600 hover:text-blue-800"
                title="Edit"
              >
                <FaEdit />
              </button>
            )}
            <button
              onClick={() => handleDelete(appt.id)}
              className="text-red-600 hover:text-red-800"
              title="Delete"
            >
              <FaTrash />
            </button>
          </div>
        );
      },
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
        <h1 className="text-2xl font-bold">Appointment Management</h1>
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
        isOpen={!!editingAppointment}
        onClose={() => {
          setEditingAppointment(null);
          setFormData({});
        }}
        title="Edit Appointment"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Patient"
            options={patients.map((patient) => ({
              value: patient.id,
              label: `${patient.firstName} ${patient.lastName}`,
            }))}
            value={formData.patientId || ''}
            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
          />
          <Select
            label="Doctor"
            options={doctors.map((doctor) => ({
              value: doctor.id,
              label: `${doctor.firstName} ${doctor.lastName}`,
            }))}
            value={formData.doctorId || ''}
            onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
          />
          <Input
            label="Date"
            type="date"
            value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
            onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
          />
          <Input
            label="Start Time (HH:MM)"
            type="time"
            value={formData.startTime || ''}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          />
          <Input
            label="End Time (HH:MM)"
            type="time"
            value={formData.endTime || ''}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          />
          <Select
            label="Status"
            options={Object.values(AppointmentStatus).map((status) => ({
              value: status,
              label: status
                .split('_')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' '),
            }))}
            value={formData.status || AppointmentStatus.PENDING_APPROVAL}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as AppointmentStatus })}
          />
          <Input
            label="Reason"
            type="text"
            value={formData.reason || ''}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          />
          <Input
            label="Notes"
            type="text"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
          <Select
            label="First Visit"
            options={[
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' },
            ]}
            value={formData.isFirstVisit ? 'true' : 'false'}
            onChange={(e) => setFormData({ ...formData, isFirstVisit: e.target.value === 'true' })}
          />
          <Select
            label="Virtual Appointment"
            options={[
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' },
            ]}
            value={formData.isVirtual ? 'true' : 'false'}
            onChange={(e) => setFormData({ ...formData, isVirtual: e.target.value === 'true' })}
          />
        </div>
        {formData.isVirtual && (
          <div className="mt-4">
            <Input
              label="Virtual Meeting Link"
              type="text"
              value={formData.virtualMeetingLink || ''}
              onChange={(e) => setFormData({ ...formData, virtualMeetingLink: e.target.value })}
            />
          </div>
        )}
        {editingAppointment && formData.status === AppointmentStatus.CANCELLED && (
          <div className="mt-4">
            <Input
              label="Cancel Reason"
              type="text"
              value={formData.cancelReason || ''}
              onChange={(e) => setFormData({ ...formData, cancelReason: e.target.value })}
            />
          </div>
        )}
        <div className="mt-6 flex space-x-4">
          <Button onClick={handleUpdate}>Save</Button>
          <Button
            onClick={() => {
              setEditingAppointment(null);
              setFormData({});
            }}
            className="bg-gray-500 hover:bg-gray-600"
          >
            Cancel
          </Button>
        </div>
      </Modal>
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
      <Modal
        isOpen={!!rejectingAppointmentId && !approvingAppointmentId}
        onClose={() => {
          setRejectingAppointmentId(null);
          setRejectionReason('');
        }}
        title="Reject Appointment"
      >
        <div className="space-y-4">
          <Input
            label="Rejection Reason"
            type="text"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter reason for rejection"
          />
          <div className="flex space-x-4">
            <Button onClick={handleReject}>Reject</Button>
            <Button
              onClick={() => {
                setRejectingAppointmentId(null);
                setRejectionReason('');
              }}
              className="bg-gray-500 hover:bg-gray-600"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
      <ConfirmBox
        isOpen={!!approvingAppointmentId}
        message="Are you sure you want to approve this appointment?"
        onConfirm={handleApprove}
        onCancel={() => setApprovingAppointmentId(null)}
      />
      <ConfirmBox
        isOpen={!!rejectingAppointmentId && !approvingAppointmentId}
        message="Are you sure you want to reject this appointment?"
        onConfirm={handleRejectConfirm}
        onCancel={() => setRejectingAppointmentId(null)}
      />
      <ConfirmBox
        isOpen={!!deletingAppointmentId}
        message="Are you sure you want to delete this appointment?"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingAppointmentId(null)}
      />
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

export default Appointments;