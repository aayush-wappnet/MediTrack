import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaEye, FaPlus } from 'react-icons/fa';
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
import { getDiagnoses, createDiagnosis, updateDiagnosis, deleteDiagnosis, getDiagnosisById } from '../../api/endpoints/diagnoses';
import { getPatients } from '../../api/endpoints/patients';
import { getAppointments } from '../../api/endpoints/appointments';
import type { Diagnosis } from '../../api/types/diagnoses.types';
import type { Patient } from '../../api/types/patients.types';
import type { Appointment } from '../../api/types/appointments.types';

function Diagnoses() {
  const { isAllowed } = useRoleGuard(['admin', 'doctor', 'nurse']); // Exclude patients
  const { user, profileId } = useAuth();
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [editingDiagnosis, setEditingDiagnosis] = useState<Diagnosis | null>(null);
  const [viewingDiagnosis, setViewingDiagnosis] = useState<Diagnosis | null>(null);
  const [deletingDiagnosisId, setDeletingDiagnosisId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Diagnosis> & { symptomsString?: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const diagnosesPerPage = 10;

  useEffect(() => {
    if (isAllowed) {
      fetchDiagnoses();
      fetchPatients();
      fetchAppointments();
    }
  }, [isAllowed]);

  const fetchDiagnoses = async () => {
    try {
      setIsLoading(true);
      const data = await getDiagnoses();
      console.log('Fetched diagnoses:', data); // Debug log
      setDiagnoses(data);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch diagnoses', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const data = await getPatients();
      console.log('Fetched patients:', data); // Debug log
      setPatients(data);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch patients', type: 'error' });
    }
  };

  const fetchAppointments = async () => {
    try {
      const data = await getAppointments();
      console.log('Fetched appointments:', data); // Debug log
      setAppointments(data);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch appointments', type: 'error' });
    }
  };

  const handleCreate = () => {
    setEditingDiagnosis(null);
    setFormData({
      diagnosisDate: new Date().toISOString().split('T')[0],
      isChronic: false,
      symptomsString: '',
    });
  };

  const handleEdit = async (diagnosis: Diagnosis) => {
    try {
      const diagnosisData = await getDiagnosisById(diagnosis.id);
      setEditingDiagnosis(diagnosisData);
      setFormData({
        patientId: diagnosisData.patient.id,
        appointmentId: diagnosisData.appointment.id,
        diagnosisName: diagnosisData.diagnosisName,
        diagnosisCode: diagnosisData.diagnosisCode,
        diagnosisType: diagnosisData.diagnosisType,
        symptomsString: diagnosisData.symptoms?.join(', ') || '',
        notes: diagnosisData.notes,
        diagnosisDate: new Date(diagnosisData.diagnosisDate).toISOString().split('T')[0],
        treatmentPlan: diagnosisData.treatmentPlan,
        followUpInstructions: diagnosisData.followUpInstructions,
        isChronic: diagnosisData.isChronic,
      });
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch diagnosis', type: 'error' });
    }
  };

  const handleViewDetails = async (diagnosis: Diagnosis) => {
    try {
      const diagnosisData = await getDiagnosisById(diagnosis.id);
      console.log('Fetched diagnosis for view:', diagnosisData); // Debug log
      setViewingDiagnosis(diagnosisData);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch diagnosis details', type: 'error' });
    }
  };

  const handleSave = async () => {
    try {
      const data: Partial<Diagnosis> = {
        patientId: formData.patientId,
        doctorId: user?.role === 'doctor' ? (profileId ?? undefined) : undefined, // Convert null to undefined
        appointmentId: formData.appointmentId,
        diagnosisName: formData.diagnosisName,
        diagnosisCode: formData.diagnosisCode,
        diagnosisType: formData.diagnosisType,
        symptoms: formData.symptomsString ? formData.symptomsString.split(',').map((s: string) => s.trim()) : [],
        notes: formData.notes,
        diagnosisDate: formData.diagnosisDate ? new Date(formData.diagnosisDate) : undefined,
        treatmentPlan: formData.treatmentPlan,
        followUpInstructions: formData.followUpInstructions,
        isChronic: formData.isChronic,
      };

      if (editingDiagnosis) {
        // Update existing diagnosis
        const updatedDiagnosis = await updateDiagnosis(editingDiagnosis.id, data);
        setDiagnoses(diagnoses.map(d => (d.id === updatedDiagnosis.id ? updatedDiagnosis : d)));
        setShowToast({ message: 'Diagnosis updated successfully', type: 'success' });
      } else {
        // Create new diagnosis
        const newDiagnosis = await createDiagnosis(data);
        setDiagnoses([...diagnoses, newDiagnosis]);
        setShowToast({ message: 'Diagnosis created successfully', type: 'success' });
      }
      setEditingDiagnosis(null);
      setFormData({});
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to save diagnosis', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingDiagnosisId(id);
  };

  const confirmDelete = async () => {
    if (!deletingDiagnosisId) return;
    try {
      await deleteDiagnosis(deletingDiagnosisId);
      setDiagnoses(diagnoses.filter(d => d.id !== deletingDiagnosisId));
      setShowToast({ message: 'Diagnosis deleted successfully', type: 'success' });
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to delete diagnosis', type: 'error' });
    } finally {
      setDeletingDiagnosisId(null);
    }
  };

  const indexOfLastDiagnosis = currentPage * diagnosesPerPage;
  const indexOfFirstDiagnosis = indexOfLastDiagnosis - diagnosesPerPage;
  const currentDiagnoses = diagnoses.slice(indexOfFirstDiagnosis, indexOfLastDiagnosis);
  const totalPages = Math.ceil(diagnoses.length / diagnosesPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const columns = [
    {
      key: 'patient',
      header: 'Patient',
      render: (diag: Diagnosis) => `${diag.patient.firstName} ${diag.patient.lastName}`,
    },
    {
      key: 'doctor',
      header: 'Doctor',
      render: (diag: Diagnosis) => `${diag.doctor.firstName} ${diag.doctor.lastName}`,
    },
    { key: 'diagnosisName', header: 'Diagnosis Name' },
    {
      key: 'diagnosisDate',
      header: 'Diagnosis Date',
      render: (diag: Diagnosis) => new Date(diag.diagnosisDate).toLocaleDateString(),
    },
    {
      key: 'view',
      header: 'View Details',
      render: (diag: Diagnosis) => (
        <button
          onClick={() => handleViewDetails(diag)}
          className="text-blue-600 hover:text-blue-800"
          title="View Details"
        >
          <FaEye />
        </button>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (diag: Diagnosis) => {
        const canEdit = user?.role === 'admin' || (user?.role === 'doctor' && diag.doctor.id === profileId);
        const canDelete = user?.role === 'admin' || (user?.role === 'doctor' && diag.doctor.id === profileId);
        if (!canEdit && !canDelete) {
          return '-';
        }
        return (
          <div className="flex space-x-2">
            {canEdit && (
              <button
                onClick={() => handleEdit(diag)}
                className="text-blue-600 hover:text-blue-800"
                title="Edit"
              >
                <FaEdit />
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => handleDelete(diag.id)}
                className="text-red-600 hover:text-red-800"
                title="Delete"
              >
                <FaTrash />
              </button>
            )}
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
        <h1 className="text-2xl font-bold">Diagnoses</h1>
        {user?.role === 'doctor' && (
          <Button onClick={handleCreate} className="flex items-center">
            <FaPlus className="mr-2" />
            Create Diagnosis
          </Button>
        )}
      </div>
      <Table data={currentDiagnoses} columns={columns} />
      <div className="mt-4 flex justify-between items-center">
        <div>
          Showing {indexOfFirstDiagnosis + 1} to {Math.min(indexOfLastDiagnosis, diagnoses.length)} of {diagnoses.length} diagnoses
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
        isOpen={!!editingDiagnosis || formData.diagnosisDate !== undefined}
        onClose={() => {
          setEditingDiagnosis(null);
          setFormData({});
        }}
        title={editingDiagnosis ? 'Edit Diagnosis' : 'Create Diagnosis'}
      >
        <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[70vh] p-4">
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
            label="Appointment"
            options={appointments.map((appt) => ({
              value: appt.id,
              label: `With ${appt.patient.firstName} ${appt.patient.lastName} on ${new Date(appt.date).toLocaleDateString()} at ${appt.startTime}`,
            }))}
            value={formData.appointmentId || ''}
            onChange={(e) => setFormData({ ...formData, appointmentId: e.target.value })}
          />
          <Input
            label="Diagnosis Name"
            type="text"
            value={formData.diagnosisName || ''}
            onChange={(e) => setFormData({ ...formData, diagnosisName: e.target.value })}
          />
          <Input
            label="Diagnosis Code"
            type="text"
            value={formData.diagnosisCode || ''}
            onChange={(e) => setFormData({ ...formData, diagnosisCode: e.target.value })}
          />
          <Input
            label="Diagnosis Type"
            type="text"
            value={formData.diagnosisType || ''}
            onChange={(e) => setFormData({ ...formData, diagnosisType: e.target.value })}
          />
          <Input
            label="Symptoms (comma-separated)"
            type="text"
            value={formData.symptomsString || ''}
            onChange={(e) => setFormData({ ...formData, symptomsString: e.target.value })}
          />
          <Input
            label="Notes"
            type="text"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
          <Input
            label="Diagnosis Date"
            type="date"
            value={formData.diagnosisDate ? new Date(formData.diagnosisDate).toISOString().split('T')[0] : ''}
            onChange={(e) => setFormData({ ...formData, diagnosisDate: new Date(e.target.value) })}
          />
          <Input
            label="Treatment Plan"
            type="text"
            value={formData.treatmentPlan || ''}
            onChange={(e) => setFormData({ ...formData, treatmentPlan: e.target.value })}
          />
          <Input
            label="Follow-Up Instructions"
            type="text"
            value={formData.followUpInstructions || ''}
            onChange={(e) => setFormData({ ...formData, followUpInstructions: e.target.value })}
          />
          <Select
            label="Is Chronic"
            options={[
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' },
            ]}
            value={formData.isChronic ? 'true' : 'false'}
            onChange={(e) => setFormData({ ...formData, isChronic: e.target.value === 'true' })}
          />
        </div>
        <div className="mt-6 flex space-x-4">
          <Button onClick={handleSave}>Save</Button>
          <Button
            onClick={() => {
              setEditingDiagnosis(null);
              setFormData({});
            }}
            className="bg-gray-500 hover:bg-gray-600"
          >
            Cancel
          </Button>
        </div>
      </Modal>
      <Modal
        isOpen={!!viewingDiagnosis}
        onClose={() => setViewingDiagnosis(null)}
        title="Diagnosis Details"
      >
        {viewingDiagnosis ? (
          <div className="space-y-4">
            <p><strong>Patient:</strong> {viewingDiagnosis.patient?.firstName || 'N/A'} {viewingDiagnosis.patient?.lastName || ''}</p>
            <p><strong>Doctor:</strong> {viewingDiagnosis.doctor?.firstName || 'N/A'} {viewingDiagnosis.doctor?.lastName || ''}</p>
            <p><strong>Appointment:</strong> With {viewingDiagnosis.appointment?.patient?.firstName || 'N/A'} {viewingDiagnosis.appointment?.patient?.lastName || ''} on {viewingDiagnosis.appointment?.date ? new Date(viewingDiagnosis.appointment.date).toLocaleDateString() : 'N/A'} at {viewingDiagnosis.appointment?.startTime || 'N/A'}</p>
            <p><strong>Diagnosis Name:</strong> {viewingDiagnosis.diagnosisName || 'N/A'}</p>
            <p><strong>Diagnosis Code:</strong> {viewingDiagnosis.diagnosisCode || 'N/A'}</p>
            <p><strong>Diagnosis Type:</strong> {viewingDiagnosis.diagnosisType || 'N/A'}</p>
            <p><strong>Symptoms:</strong> {viewingDiagnosis.symptoms?.join(', ') || 'N/A'}</p>
            <p><strong>Notes:</strong> {viewingDiagnosis.notes || 'N/A'}</p>
            <p><strong>Diagnosis Date:</strong> {viewingDiagnosis.diagnosisDate ? new Date(viewingDiagnosis.diagnosisDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Treatment Plan:</strong> {viewingDiagnosis.treatmentPlan || 'N/A'}</p>
            <p><strong>Follow-Up Instructions:</strong> {viewingDiagnosis.followUpInstructions || 'N/A'}</p>
            <p><strong>Is Chronic:</strong> {viewingDiagnosis.isChronic ? 'Yes' : 'No'}</p>
          </div>
        ) : (
          <p>No diagnosis data available.</p>
        )}
        <div className="mt-6">
          <Button onClick={() => setViewingDiagnosis(null)} className="bg-gray-500 hover:bg-gray-600">
            Close
          </Button>
        </div>
      </Modal>
      <ConfirmBox
        isOpen={!!deletingDiagnosisId}
        message="Are you sure you want to delete this diagnosis?"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingDiagnosisId(null)}
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

export default Diagnoses;