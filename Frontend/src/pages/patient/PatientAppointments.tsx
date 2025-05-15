import { useState, useEffect } from 'react';
import { FaPlus, FaTimes, FaEye } from 'react-icons/fa';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Toast from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
// import ConfirmBox from '../../components/common/ConfirmBox';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { useAuth } from '../../hooks/useAuth';
import { getAppointments, createAppointment, cancelAppointment } from '../../api/endpoints/appointments';
import { getDoctors } from '../../api/endpoints/doctors';
import { getNurses } from '../../api/endpoints/nurses';
import { type Appointment, AppointmentStatus, type CreateAppointmentDto, type CancelAppointmentDto } from '../../api/types/appointments.types';
import { type Doctor } from '../../api/types/doctors.types';
import { type Nurse } from '../../api/types/nurses.types';

function PatientAppointments() {
  const { isAllowed } = useRoleGuard(['patient']);
  const { profileId } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [cancellingAppointmentId, setCancellingAppointmentId] = useState<string | null>(null);
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [formData, setFormData] = useState<Partial<CreateAppointmentDto>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (isAllowed && profileId) {
      fetchAppointments();
      fetchDoctors();
      fetchNurses();
    }
  }, [isAllowed, profileId]);

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

  const fetchDoctors = async () => {
    try {
      const data = await getDoctors();
      setDoctors(data);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch doctors', type: 'error' });
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
      setShowToast({ message: 'Profile not found', type: 'error' });
      return;
    }
    if (!formData.doctorId) {
      setShowToast({ message: 'Please select a doctor', type: 'error' });
      return;
    }
    if (!formData.startTime || !formData.endTime) {
      setShowToast({ message: 'Please provide start and end times', type: 'error' });
      return;
    }
    try {
      const appointmentData: CreateAppointmentDto = {
        ...formData,
        patientId: profileId,
        doctorId: formData.doctorId!,
        nurseId: formData.nurseId,
        date: formData.date ? new Date(formData.date) : new Date(),
        startTime: formData.startTime!,
        endTime: formData.endTime!,
        isFirstVisit: formData.isFirstVisit || false,
        isVirtual: formData.isVirtual || false,
        status: AppointmentStatus.PENDING_APPROVAL,
      };
      const newAppointment = await createAppointment(appointmentData);
      setAppointments([...appointments, newAppointment]);
      setIsCreating(false);
      setFormData({});
      setShowToast({ message: 'Appointment created successfully', type: 'success' });
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to create appointment', type: 'error' });
    }
  };

  const handleCancel = async () => {
    if (!cancellingAppointmentId || !cancelReason) return;
    try {
      const cancelData: CancelAppointmentDto = { cancelReason };
      const cancelledAppointment = await cancelAppointment(cancellingAppointmentId, cancelData);
      setAppointments(appointments.map((appt) => (appt.id === cancelledAppointment.id ? cancelledAppointment : appt)));
      setCancellingAppointmentId(null);
      setCancelReason('');
      setShowToast({ message: 'Appointment cancelled successfully', type: 'success' });
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to cancel appointment', type: 'error' });
    }
  };

  const handleViewDetails = (appointment: Appointment) => {
    setViewingAppointment(appointment);
  };

  const columns = [
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
      key: 'cancel',
      header: 'Cancel',
      render: (appt: Appointment) => {
        if (appt.status !== AppointmentStatus.PENDING_APPROVAL && appt.status !== AppointmentStatus.APPROVED) {
          return '-';
        }
        return (
          <button
            onClick={() => setCancellingAppointmentId(appt.id)}
            className="text-red-600 hover:text-red-800"
            title="Cancel"
          >
            <FaTimes />
          </button>
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
      <Table data={appointments} columns={columns} />
      <Modal
        isOpen={isCreating}
        onClose={() => {
          setIsCreating(false);
          setFormData({});
        }}
        title="Create Appointment"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Doctor"
            options={doctors.map((doctor) => ({
              value: doctor.id,
              label: `${doctor.firstName} ${doctor.lastName}`,
            }))}
            value={formData.doctorId || ''}
            onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
          />
          <Select
            label="Nurse (Optional)"
            options={[{ value: '', label: 'None' }, ...nurses.map((nurse) => ({
              value: nurse.id,
              label: `${nurse.firstName} ${nurse.lastName}`,
            }))]}
            value={formData.nurseId || ''}
            onChange={(e) => setFormData({ ...formData, nurseId: e.target.value || undefined })}
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
        <div className="mt-6 flex space-x-4">
          <Button onClick={handleCreate}>Create</Button>
          <Button
            onClick={() => {
              setIsCreating(false);
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
        isOpen={!!cancellingAppointmentId}
        onClose={() => {
          setCancellingAppointmentId(null);
          setCancelReason('');
        }}
        title="Cancel Appointment"
      >
        <div className="space-y-4">
          <Input
            label="Cancel Reason"
            type="text"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Enter reason for cancellation"
          />
          <div className="flex space-x-4">
            <Button onClick={handleCancel}>Cancel Appointment</Button>
            <Button
              onClick={() => {
                setCancellingAppointmentId(null);
                setCancelReason('');
              }}
              className="bg-gray-500 hover:bg-gray-600"
            >
              Close
            </Button>
          </div>
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

export default PatientAppointments;