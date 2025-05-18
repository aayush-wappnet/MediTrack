import { useState, useEffect } from 'react';
import { FaEye, FaTrash, FaUserMd } from 'react-icons/fa';
import Table from '../components/common/Table';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Toast from '../components/common/Toast';
import Loader from '../components/common/Loader';
import Modal from '../components/common/Modal';
import ConfirmBox from '../components/common/ConfirmBox';
import { useRoleGuard } from '../hooks/useRoleGuard';
import { getPatients, getPatientById, deletePatient } from '../api/endpoints/patients';
import { type Patient } from '../api/types/patients.types';
import { useAuth } from '../hooks/useAuth';

function Patients() {
  const { isAllowed } = useRoleGuard(['doctor', 'admin']);
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [deletingPatientId, setDeletingPatientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const patientsPerPage = 10;

  useEffect(() => {
    if (isAllowed) {
      fetchPatients();
    }
  }, [isAllowed]);

  useEffect(() => {
    // Filter patients based on search query
    const filtered = patients.filter((patient) =>
      `${patient.firstName} ${patient.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    setFilteredPatients(filtered);
    setCurrentPage(1); // Reset to first page when search query changes
  }, [searchQuery, patients]);

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const data = await getPatients();
      console.log('Fetched patients:', data);
      setPatients(data);
      setFilteredPatients(data);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch patients', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (patient: Patient) => {
    try {
      const patientData = await getPatientById(patient.id);
      console.log('Fetched patient for view:', patientData);
      setViewingPatient(patientData);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch patient details', type: 'error' });
    }
  };

  const handleDelete = (id: string) => {
    setDeletingPatientId(id);
  };

  const confirmDelete = async () => {
    if (!deletingPatientId) return;
    try {
      await deletePatient(deletingPatientId);
      setPatients(patients.filter(p => p.id !== deletingPatientId));
      setFilteredPatients(filteredPatients.filter(p => p.id !== deletingPatientId));
      setShowToast({ message: 'Patient deleted successfully', type: 'success' });
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to delete patient', type: 'error' });
    } finally {
      setDeletingPatientId(null);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (patient: Patient) => `${patient.firstName} ${patient.lastName}`,
    },
    { key: 'dateOfBirth', header: 'Date of Birth', render: (patient: Patient) => new Date(patient.dateOfBirth).toLocaleDateString() },
    { key: 'gender', header: 'Gender' },
    { key: 'phoneNumber', header: 'Phone Number' },
    {
      key: 'view',
      header: 'View Details',
      render: (patient: Patient) => (
        <button
          onClick={() => handleViewDetails(patient)}
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
      render: (patient: Patient) => {
        const isAdmin = user?.role === 'admin';
        if (!isAdmin) return '-';
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => handleDelete(patient.id)}
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
      <div className="flex items-center mb-4">
        <FaUserMd className="mr-2 size-6"/>
        <h1 className="text-3xl font-bold">Patients</h1>
        <div className="w-1/3 ml-auto">
          
          <Input
            label="Search Patients"
            type="text"
            value={searchQuery}
            onChange={handleSearch}
            placeholder="🔍 Search by name..."
          />
        </div>
      </div>
      <Table data={currentPatients} columns={columns} />
      <div className="mt-4 flex justify-between items-center">
        <div>
          Showing {indexOfFirstPatient + 1} to {Math.min(indexOfLastPatient, filteredPatients.length)} of {filteredPatients.length} patients
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
        isOpen={!!viewingPatient}
        onClose={() => setViewingPatient(null)}
        title="Patient Details"
      >
        {viewingPatient ? (
          <div className="space-y-4">
            <p><strong>Name:</strong> {viewingPatient.firstName} {viewingPatient.lastName}</p>
            <p><strong>Date of Birth:</strong> {new Date(viewingPatient.dateOfBirth).toLocaleDateString()}</p>
            <p><strong>Gender:</strong> {viewingPatient.gender}</p>
            <p><strong>Blood Type:</strong> {viewingPatient.bloodType}</p>
            <p><strong>Phone Number:</strong> {viewingPatient.phoneNumber}</p>
            <p><strong>Address:</strong> {viewingPatient.address}</p>
            <p><strong>Emergency Contact:</strong> {viewingPatient.emergencyContactName} ({viewingPatient.emergencyContactPhone})</p>
            <p><strong>Allergies:</strong> {viewingPatient.allergies || 'None'}</p>
            <p><strong>Chronic Conditions:</strong> {viewingPatient.chronicConditions || 'None'}</p>
            <p><strong>Barcode ID:</strong> {viewingPatient.barcodeId}</p>
            <p><strong>Email:</strong> {viewingPatient.user.email}</p>
            <p><strong>Created At:</strong> {new Date(viewingPatient.createdAt).toLocaleString()}</p>
            <p><strong>Updated At:</strong> {new Date(viewingPatient.updatedAt).toLocaleString()}</p>
          </div>
        ) : (
          <p>No patient data available.</p>
        )}
        <div className="mt-6">
          <Button onClick={() => setViewingPatient(null)} className="bg-gray-500 hover:bg-gray-600">
            Close
          </Button>
        </div>
      </Modal>
      <ConfirmBox
        isOpen={!!deletingPatientId}
        message="Are you sure you want to delete this patient?"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingPatientId(null)}
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

export default Patients;