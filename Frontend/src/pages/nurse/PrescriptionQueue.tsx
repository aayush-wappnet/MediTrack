import { useState, useEffect } from 'react';
import { FaEye, FaCheck } from 'react-icons/fa';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import ConfirmBox from '../../components/common/ConfirmBox';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { getPrescriptionQueue, getPrescriptionById, fulfillPrescription } from '../../api/endpoints/prescriptions';
import { type Prescription, PrescriptionStatus } from '../../api/types/prescriptions.types';

function PrescriptionQueue() {
  const { isAllowed } = useRoleGuard(['nurse']);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [viewingPrescription, setViewingPrescription] = useState<Prescription | null>(null);
  const [fulfillingPrescriptionId, setFulfillingPrescriptionId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const prescriptionsPerPage = 10;

  useEffect(() => {
    if (isAllowed) {
      fetchPrescriptionQueue();
    }
  }, [isAllowed]);

  const fetchPrescriptionQueue = async () => {
    try {
      setIsLoading(true);
      const data = await getPrescriptionQueue();
      console.log('Fetched prescription queue:', data);
      setPrescriptions(data);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch prescription queue', type: 'error' });
    } finally {
      setIsLoading(false);
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

  const handleFulfill = (id: string) => {
    setFulfillingPrescriptionId(id);
  };

  const confirmFulfill = async () => {
    if (!fulfillingPrescriptionId) return;
    try {
      const updatedPrescription = await fulfillPrescription(fulfillingPrescriptionId);
      setPrescriptions(prescriptions.filter(p => p.id !== fulfillingPrescriptionId));
      setShowToast({ message: 'Prescription fulfilled successfully', type: 'success' });
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fulfill prescription', type: 'error' });
    } finally {
      setFulfillingPrescriptionId(null);
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
      render: (pres: Prescription) => (
        <div className="flex space-x-2">
          {pres.status === PrescriptionStatus.ISSUED && (
            <button
              onClick={() => handleFulfill(pres.id)}
              className="text-green-600 hover:text-green-800"
              title="Fulfill"
            >
              <FaCheck />
            </button>
          )}
        </div>
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
        <h1 className="text-2xl font-bold">Prescription Fulfillment Queue</h1>
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
        isOpen={!!fulfillingPrescriptionId}
        message="Are you sure you want to mark this prescription as fulfilled?"
        onConfirm={confirmFulfill}
        onCancel={() => setFulfillingPrescriptionId(null)}
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

export default PrescriptionQueue;