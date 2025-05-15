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
import { getPrescriptions, createPrescription, updatePrescription, deletePrescription, getPrescriptionById, type PrescriptionPayload } from '../../api/endpoints/prescriptions';
import { getPatients } from '../../api/endpoints/patients';
import { getAppointments } from '../../api/endpoints/appointments';
import { type Prescription, type Medication, PrescriptionStatus } from '../../api/types/prescriptions.types';
import type { Patient } from '../../api/types/patients.types';
import type { Appointment } from '../../api/types/appointments.types';

interface MedicationFormData {
  medicationName: string;
  dosage: string;
  dosageUnit: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  duration: string;
  instructions?: string;
}

function Prescriptions() {
  const { isAllowed } = useRoleGuard(['doctor']);
  const { user, profileId } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [viewingPrescription, setViewingPrescription] = useState<Prescription | null>(null);
  const [deletingPrescriptionId, setDeletingPrescriptionId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Prescription> & { medicationsForm?: MedicationFormData[] }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const prescriptionsPerPage = 10;

  useEffect(() => {
    if (isAllowed) {
      fetchPrescriptions();
      fetchPatients();
      fetchAppointments();
    }
  }, [isAllowed]);

  const fetchPrescriptions = async () => {
    try {
      setIsLoading(true);
      const data = await getPrescriptions();
      console.log('Fetched prescriptions:', data);
      setPrescriptions(data);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch prescriptions', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const data = await getPatients();
      console.log('Fetched patients:', data);
      setPatients(data);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch patients', type: 'error' });
    }
  };

  const fetchAppointments = async () => {
    try {
      const data = await getAppointments();
      console.log('Fetched appointments:', data);
      setAppointments(data);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch appointments', type: 'error' });
    }
  };

  const handleCreate = () => {
    setEditingPrescription(null);
    setFormData({
      medicationsForm: [{
        medicationName: '',
        dosage: '',
        dosageUnit: '',
        breakfast: '0',
        lunch: '0',
        dinner: '0',
        duration: '',
        instructions: '',
      }],
      isRefillable: false,
      refillsRemaining: 0,
    });
  };

  const handleEdit = async (prescription: Prescription) => {
    try {
      const prescriptionData = await getPrescriptionById(prescription.id);
      setEditingPrescription(prescriptionData);
      setFormData({
        patientId: prescriptionData.patient.id,
        appointmentId: prescriptionData.appointment?.id,
        instructions: prescriptionData.instructions,
        notes: prescriptionData.notes,
        isRefillable: prescriptionData.isRefillable,
        refillsRemaining: prescriptionData.refillsRemaining,
        medicationsForm: prescriptionData.medications.map((med: Medication) => ({
          medicationName: med.medicationName,
          dosage: med.dosage.toString(),
          dosageUnit: med.dosageUnit,
          breakfast: med.breakfast ? '1' : '0',
          lunch: med.lunch ? '1' : '0',
          dinner: med.dinner ? '1' : '0',
          duration: med.duration,
          instructions: med.instructions,
        })),
      });
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch prescription', type: 'error' });
    }
  };

  const handleViewDetails = async (prescription: Prescription) => {
    try {
      const prescriptionData = await getPrescriptionById(prescription.id);
      console.log('Fetched prescription for view:', prescriptionData);
      setViewingPrescription(prescriptionData);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch prescription details', type: 'error' });
    }
  };

  const handleAddMedication = () => {
    setFormData({
      ...formData,
      medicationsForm: [
        ...(formData.medicationsForm || []),
        {
          medicationName: '',
          dosage: '',
          dosageUnit: '',
          breakfast: '0',
          lunch: '0',
          dinner: '0',
          duration: '',
          instructions: '',
        },
      ],
    });
  };

  const handleRemoveMedication = (index: number) => {
    setFormData({
      ...formData,
      medicationsForm: (formData.medicationsForm || []).filter((_, i) => i !== index),
    });
  };

  const handleMedicationChange = (index: number, field: keyof MedicationFormData, value: string) => {
    const updatedMedications = (formData.medicationsForm || []).map((med, i) =>
      i === index ? { ...med, [field]: value } : med
    );
    setFormData({ ...formData, medicationsForm: updatedMedications });
  };

  const handleSave = async () => {
    try {
      // Use Omit<Medication, 'id' | 'prescription'> to create medication objects without id
      const medications = (formData.medicationsForm || []).map((med: MedicationFormData) => ({
        medicationName: med.medicationName,
        dosage: parseFloat(med.dosage),
        dosageUnit: med.dosageUnit,
        breakfast: med.breakfast === '1',
        lunch: med.lunch === '1',
        dinner: med.dinner === '1',
        duration: med.duration,
        instructions: med.instructions || undefined, // Ensure instructions is undefined if empty
      })) as Omit<Medication, 'id' | 'prescription'>[];

      // Use the medications array without the id property
      // TypeScript will handle this correctly with our PrescriptionPayload type in the API

      const data: PrescriptionPayload = {
        patientId: formData.patientId,
        doctorId: user?.role === 'doctor' ? (profileId ?? undefined) : undefined,
        appointmentId: formData.appointmentId,
        instructions: formData.instructions || undefined,
        notes: formData.notes || undefined,
        isRefillable: formData.isRefillable,
        refillsRemaining: formData.refillsRemaining ? parseInt(formData.refillsRemaining.toString()) : 0,
        medications,
      };

      if (editingPrescription) {
        const updatedPrescription = await updatePrescription(editingPrescription.id, data);
        setPrescriptions(prescriptions.map(p => (p.id === updatedPrescription.id ? updatedPrescription : p)));
        setShowToast({ message: 'Prescription updated successfully', type: 'success' });
      } else {
        const newPrescription = await createPrescription(data);
        setPrescriptions([...prescriptions, newPrescription]);
        setShowToast({ message: 'Prescription created successfully', type: 'success' });
      }
      setEditingPrescription(null);
      setFormData({});
    } catch (error: any) {
      setShowToast({ message: error.response?.data?.message?.join(', ') || error.message || 'Failed to save prescription', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingPrescriptionId(id);
  };

  const confirmDelete = async () => {
    if (!deletingPrescriptionId) return;
    try {
      await deletePrescription(deletingPrescriptionId);
      setPrescriptions(prescriptions.filter(p => p.id !== deletingPrescriptionId));
      setShowToast({ message: 'Prescription deleted successfully', type: 'success' });
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to delete prescription', type: 'error' });
    } finally {
      setDeletingPrescriptionId(null);
    }
  };

  const indexOfLastPrescription = currentPage * prescriptionsPerPage;
  const indexOfFirstPrescription = indexOfLastPrescription - prescriptionsPerPage;
  const currentPrescriptions = prescriptions.slice(indexOfFirstPrescription, indexOfLastPrescription);
  const totalPages = Math.ceil(prescriptions.length / prescriptionsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const columns = [
    {
      key: 'patient',
      header: 'Patient',
      render: (pres: Prescription) => `${pres.patient.firstName} ${pres.patient.lastName}`,
    },
    {
      key: 'doctor',
      header: 'Doctor',
      render: (pres: Prescription) => `${pres.doctor.firstName} ${pres.doctor.lastName}`,
    },
    {
      key: 'medications',
      header: 'Medications',
      render: (pres: Prescription) => pres.medications.map(m => m.medicationName).join(', '),
    },
    { key: 'status', header: 'Status' },
    {
      key: 'view',
      header: 'View Details',
      render: (pres: Prescription) => (
        <button
          onClick={() => handleViewDetails(pres)}
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
      render: (pres: Prescription) => {
        const canEdit = pres.status !== PrescriptionStatus.FULFILLED;
        const canDelete = pres.status !== PrescriptionStatus.FULFILLED;
        if (!canEdit && !canDelete) {
          return '-';
        }
        return (
          <div className="flex space-x-2">
            {canEdit && (
              <button
                onClick={() => handleEdit(pres)}
                className="text-blue-600 hover:text-blue-800"
                title="Edit"
              >
                <FaEdit />
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => handleDelete(pres.id)}
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
        <h1 className="text-2xl font-bold">Prescriptions</h1>
        <Button onClick={handleCreate} className="flex items-center">
          <FaPlus className="mr-2" />
          Create Prescription
        </Button>
      </div>
      <Table data={currentPrescriptions} columns={columns} />
      <div className="mt-4 flex justify-between items-center">
        <div>
          Showing {indexOfFirstPrescription + 1} to {Math.min(indexOfLastPrescription, prescriptions.length)} of {prescriptions.length} prescriptions
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
        isOpen={!!editingPrescription || formData.medicationsForm !== undefined}
        onClose={() => {
          setEditingPrescription(null);
          setFormData({});
        }}
        title={editingPrescription ? 'Edit Prescription' : 'Create Prescription'}
      >
        <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[70vh] p-4">
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
            label="Instructions"
            type="text"
            value={formData.instructions || ''}
            onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
          />
          <Input
            label="Notes"
            type="text"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
          <Select
            label="Is Refillable"
            options={[
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' },
            ]}
            value={formData.isRefillable ? 'true' : 'false'}
            onChange={(e) => setFormData({ ...formData, isRefillable: e.target.value === 'true' })}
          />
          <Input
            label="Refills Remaining"
            type="number"
            value={formData.refillsRemaining?.toString() || '0'}
            onChange={(e) => setFormData({ ...formData, refillsRemaining: parseInt(e.target.value) })}
            disabled={!formData.isRefillable}
          />
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-2">Medications</h3>
            {(formData.medicationsForm || []).map((med, index) => (
              <div key={index} className="border p-4 mb-4 rounded-lg relative">
                <button
                  onClick={() => handleRemoveMedication(index)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Medication Name"
                    type="text"
                    value={med.medicationName}
                    onChange={(e) => handleMedicationChange(index, 'medicationName', e.target.value)}
                  />
                  <Input
                    label="Dosage"
                    type="number"
                    value={med.dosage}
                    onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                  />
                  <Input
                    label="Dosage Unit"
                    type="text"
                    value={med.dosageUnit}
                    onChange={(e) => handleMedicationChange(index, 'dosageUnit', e.target.value)}
                  />
                  <Select
                    label="Breakfast"
                    options={[
                      { value: '0', label: 'No' },
                      { value: '1', label: 'Yes' },
                    ]}
                    value={med.breakfast}
                    onChange={(e) => handleMedicationChange(index, 'breakfast', e.target.value)}
                  />
                  <Select
                    label="Lunch"
                    options={[
                      { value: '0', label: 'No' },
                      { value: '1', label: 'Yes' },
                    ]}
                    value={med.lunch}
                    onChange={(e) => handleMedicationChange(index, 'lunch', e.target.value)}
                  />
                  <Select
                    label="Dinner"
                    options={[
                      { value: '0', label: 'No' },
                      { value: '1', label: 'Yes' },
                    ]}
                    value={med.dinner}
                    onChange={(e) => handleMedicationChange(index, 'dinner', e.target.value)}
                  />
                  <Input
                    label="Duration"
                    type="text"
                    value={med.duration}
                    onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                  />
                  <Input
                    label="Instructions"
                    type="text"
                    value={med.instructions || ''}
                    onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                  />
                </div>
              </div>
            ))}
            <Button onClick={handleAddMedication} className="mt-2 bg-green-500 hover:bg-green-600">
              Add Medication
            </Button>
          </div>
        </div>
        <div className="mt-6 flex space-x-4">
          <Button onClick={handleSave}>Save</Button>
          <Button
            onClick={() => {
              setEditingPrescription(null);
              setFormData({});
            }}
            className="bg-gray-500 hover:bg-gray-600"
          >
            Cancel
          </Button>
        </div>
      </Modal>
      <Modal
        isOpen={!!viewingPrescription}
        onClose={() => setViewingPrescription(null)}
        title="Prescription Details"
      >
        {viewingPrescription ? (
          <div className="space-y-4">
            <p><strong>Patient:</strong> {viewingPrescription.patient?.firstName || 'N/A'} {viewingPrescription.patient?.lastName || ''}</p>
            <p><strong>Doctor:</strong> {viewingPrescription.doctor?.firstName || 'N/A'} {viewingPrescription.doctor?.lastName || ''}</p>
            <p><strong>Nurse:</strong> {viewingPrescription.nurse ? `${viewingPrescription.nurse.firstName} ${viewingPrescription.nurse.lastName}` : 'Not assigned'}</p>
            <p><strong>Appointment:</strong> {viewingPrescription.appointment ? `With ${viewingPrescription.appointment.patient.firstName} ${viewingPrescription.appointment.patient.lastName} on ${new Date(viewingPrescription.appointment.date).toLocaleDateString()} at ${viewingPrescription.appointment.startTime}` : 'N/A'}</p>
            <p><strong>Instructions:</strong> {viewingPrescription.instructions || 'N/A'}</p>
            <p><strong>Status:</strong> {viewingPrescription.status}</p>
            <p><strong>Fulfilled Date:</strong> {viewingPrescription.fulfilledDate ? new Date(viewingPrescription.fulfilledDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Notes:</strong> {viewingPrescription.notes || 'N/A'}</p>
            <p><strong>Is Refillable:</strong> {viewingPrescription.isRefillable ? 'Yes' : 'No'}</p>
            <p><strong>Refills Remaining:</strong> {viewingPrescription.refillsRemaining}</p>
            <h3 className="text-lg font-semibold mt-4">Medications</h3>
            {viewingPrescription.medications.map((med, index) => (
              <div key={index} className="border p-2 mb-2 rounded">
                <p><strong>Name:</strong> {med.medicationName}</p>
                <p><strong>Dosage:</strong> {med.dosage} {med.dosageUnit}</p>
                <p><strong>Timing:</strong> Breakfast: {med.breakfast ? 'Yes' : 'No'}, Lunch: {med.lunch ? 'Yes' : 'No'}, Dinner: {med.dinner ? 'Yes' : 'No'}</p>
                <p><strong>Duration:</strong> {med.duration}</p>
                <p><strong>Instructions:</strong> {med.instructions || 'N/A'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No prescription data available.</p>
        )}
        <div className="mt-6">
          <Button onClick={() => setViewingPrescription(null)} className="bg-gray-500 hover:bg-gray-600">
            Close
          </Button>
        </div>
      </Modal>
      <ConfirmBox
        isOpen={!!deletingPrescriptionId}
        message="Are you sure you want to delete this prescription?"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingPrescriptionId(null)}
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

export default Prescriptions;