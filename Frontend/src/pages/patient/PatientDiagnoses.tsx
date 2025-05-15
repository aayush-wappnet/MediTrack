import { useState, useEffect } from 'react';
import { FaEye } from 'react-icons/fa';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { getDiagnoses, getDiagnosisById } from '../../api/endpoints/diagnoses';
import type { Diagnosis } from '../../api/types/diagnoses.types';

function PatientDiagnoses() {
  const { isAllowed } = useRoleGuard(['patient']);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [viewingDiagnosis, setViewingDiagnosis] = useState<Diagnosis | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const diagnosesPerPage = 10;

  useEffect(() => {
    if (isAllowed) {
      fetchDiagnoses();
    }
  }, [isAllowed]);

  const fetchDiagnoses = async () => {
    try {
      setIsLoading(true);
      const data = await getDiagnoses();
      console.log('Fetched diagnoses for patient:', data); // Debug log
      setDiagnoses(data);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch diagnoses', type: 'error' });
    } finally {
      setIsLoading(false);
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
        <h1 className="text-2xl font-bold">My Diagnoses</h1>
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

export default PatientDiagnoses;