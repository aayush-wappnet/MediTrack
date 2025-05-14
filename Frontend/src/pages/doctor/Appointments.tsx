import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
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
import { getAppointments, createAppointment, updateAppointment, deleteAppointment, getAppointmentById } from '../../api/endpoints/appointments';
import { getPatients } from '../../api/endpoints/patients';
import { getNurses } from '../../api/endpoints/nurses';
import { AppointmentStatus } from '../../api/types/appointments.types';
import type { Appointment, CreateAppointmentDto, UpdateAppointmentDto } from '../../api/types/appointments.types';
import type { Patient } from '../../api/types/patients.types';
import type { Nurse } from '../../api/types/nurses.types';

function Appointments() {
  const { isAllowed } = useRoleGuard(['admin', 'doctor', 'nurse']);
  const { user, profileId } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deletingAppointmentId, setDeletingAppointmentId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CreateAppointmentDto> & { cancelReason?: string }>({});
  const [isCreating, setIsCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const appointmentsPerPage = 10;

  useEffect(() => {
    if (isAllowed) {
      fetchAppointments();
      fetchPatients();
      fetchNurses();
    }
  }, [isAllowed]);

  useEffect(() => {
    // Apply status filter
    const filtered = statusFilter
      ? appointments.filter((appt) => appt.status === statusFilter)
      : appointments;
    setFilteredAppointments(filtered);
    setCurrentPage(1); // Reset to first page on filter change
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

  const fetchNurses = async () => {
    try {
      const data = await getNurses();
      setNurses(data);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch nurses', type: 'error' });
    }
  };

  const handleCreate = async () => {
    if (!profileId) {
      setShowToast({ message: 'Doctor profile not found', type: 'error' });
      return;
    }
    if (!formData.patientId) {
      setShowToast({ message: 'Please select a patient', type: 'error' });
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      setShowToast({ message: 'Please provide start and end times', type: 'error' });
      return;
    }
    try {
      const appointmentData: CreateAppointmentDto = {
        ...formData,
        patientId: formData.patientId,
        doctorId: profileId,
        date: formData.date ? new Date(formData.date) : new Date(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        isFirstVisit: formData.isFirstVisit || false,
        isVirtual: formData.isVirtual || false,
      };
      const newAppointment = await createAppointment(appointmentData);
      setAppointments([...appointments, newAppointment]);
      setFilteredAppointments([...filteredAppointments, newAppointment]);
      setIsCreating(false);
      setFormData({});
      setShowToast({ message: 'Appointment created successfully', type: 'success' });
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to create appointment', type: 'error' });
    }
  };

  const handleEdit = async (appointment: Appointment) => {
    try {
      const appointmentData = await getAppointmentById(appointment.id);
      setEditingAppointment(appointmentData);
      setFormData({
        patientId: appointmentData.patient.id,
        nurseId: appointmentData.nurse?.id,
        date: new Date(appointmentData.date),
        startTime: appointmentData.startTime,
        endTime: appointmentData.endTime,
        status: appointmentData.status,
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

  const handleUpdate = async () => {
    if (!editingAppointment) return;
    try {
      const updatedData: UpdateAppointmentDto = {
        ...formData,
        date: formData.date ? new Date(formData.date) : undefined,
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

  // Pagination logic
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
    { key: 'date', header: 'Date', render: (appt: Appointment) => new Date(appt.date).toLocaleDateString() },
    { key: 'startTime', header: 'Start Time' },
    { key: 'endTime', header: 'End Time' },
    { key: 'status', header: 'Status' },
    { key: 'reason', header: 'Reason' },
    {
      key: 'actions',
      header: 'Actions',
      render: (appt: Appointment) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(appt)}
            className="text-blue-600 hover:text-blue-800"
            title="Edit"
          >
            <FaEdit />
          </button>
          {(user?.role === 'admin' || user?.role === 'doctor') && (
            <button
              onClick={() => handleDelete(appt.id)}
              className="text-red-600 hover:text-red-800"
              title="Delete"
            >
              <FaTrash />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (!isAllowed) {
    return null;
  }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Appointment Management</h1>
        <Button
          onClick={() => {
            setIsCreating(true);
            setFormData({});
          }}
          className="flex items-center space-x-2"
        >
          <FaPlus />
          <span>Create Appointment</span>
        </Button>
      </div>
      <div className="mb-4">
        <Select
          label="Filter by Status"
          options={[
            { value: '', label: 'All Statuses' },
            { value: AppointmentStatus.SCHEDULED, label: 'Scheduled' },
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
      {/* Pagination Controls */}
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
      {/* Create/Edit Modal */}
      <Modal
        isOpen={isCreating || !!editingAppointment}
        onClose={() => {
          setIsCreating(false);
          setEditingAppointment(null);
          setFormData({});
        }}
        title={isCreating ? 'Create Appointment' : 'Edit Appointment'}
      >
        <Select
          label="Patient"
          options={patients.map((patient) => ({
            value: patient.id,
            label: `${patient.firstName} ${patient.lastName}`,
          }))}
          value={formData.patientId || ''}
          onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
          className="mb-4"
        />
        <Select
          label="Nurse (Optional)"
          options={[{ value: '', label: 'None' }, ...nurses.map((nurse) => ({
            value: nurse.id,
            label: `${nurse.firstName} ${nurse.lastName}`,
          }))]}
          value={formData.nurseId || ''}
          onChange={(e) => setFormData({ ...formData, nurseId: e.target.value || undefined })}
          className="mb-4"
        />
        <Input
          label="Date"
          type="date"
          value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
          onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
          className="mb-4"
        />
        <Input
          label="Start Time (HH:MM)"
          type="time"
          value={formData.startTime || ''}
          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          className="mb-4"
        />
        <Input
          label="End Time (HH:MM)"
          type="time"
          value={formData.endTime || ''}
          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          className="mb-4"
        />
        <Select
          label="Status"
          options={Object.keys(AppointmentStatus).map((status) => ({
            value: AppointmentStatus[status as keyof typeof AppointmentStatus],
            label: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
          }))}
          value={formData.status || AppointmentStatus.SCHEDULED}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as AppointmentStatus })}
          className="mb-4"
        />
        <Input
          label="Reason"
          type="text"
          value={formData.reason || ''}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          className="mb-4"
        />
        <Input
          label="Notes"
          type="text"
          value={formData.notes || ''}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="mb-4"
        />
        <Select
          label="First Visit"
          options={[
            { value: 'true', label: 'Yes' },
            { value: 'false', label: 'No' },
          ]}
          value={formData.isFirstVisit ? 'true' : 'false'}
          onChange={(e) => setFormData({ ...formData, isFirstVisit: e.target.value === 'true' })}
          className="mb-4"
        />
        <Select
          label="Virtual Appointment"
          options={[
            { value: 'true', label: 'Yes' },
            { value: 'false', label: 'No' },
          ]}
          value={formData.isVirtual ? 'true' : 'false'}
          onChange={(e) => setFormData({ ...formData, isVirtual: e.target.value === 'true' })}
          className="mb-4"
        />
        {formData.isVirtual && (
          <Input
            label="Virtual Meeting Link"
            type="text"
            value={formData.virtualMeetingLink || ''}
            onChange={(e) => setFormData({ ...formData, virtualMeetingLink: e.target.value })}
            className="mb-4"
          />
        )}
        {editingAppointment && formData.status === AppointmentStatus.CANCELLED && (
          <Input
            label="Cancel Reason"
            type="text"
            value={formData.cancelReason || ''}
            onChange={(e) => setFormData({ ...formData, cancelReason: e.target.value })}
            className="mb-4"
          />
        )}
        <div className="flex space-x-4">
          <Button onClick={isCreating ? handleCreate : handleUpdate}>
            {isCreating ? 'Create' : 'Save'}
          </Button>
          <Button
            onClick={() => {
              setIsCreating(false);
              setEditingAppointment(null);
              setFormData({});
            }}
            className="bg-gray-500 hover:bg-gray-600"
          >
            Cancel
          </Button>
        </div>
      </Modal>
      {/* Delete Confirmation */}
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