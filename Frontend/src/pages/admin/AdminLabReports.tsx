import { useState, useEffect } from 'react';
import { type ChangeEvent } from 'react';
import { FaEye } from 'react-icons/fa';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Toast from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { getLabReports, getLabReportById, LabReportStatus } from '../../api/endpoints/lab-reports';
import { type LabReport, type TestParameter } from '../../api/types/lab-reports.types';

function AdminLabReports() {
  const { isAllowed } = useRoleGuard(['admin']);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [filteredLabReports, setFilteredLabReports] = useState<LabReport[]>([]);
  const [statusFilter, setStatusFilter] = useState<LabReportStatus | ''>('');
  const [viewingLabReport, setViewingLabReport] = useState<LabReport | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const labReportsPerPage = 10;

  useEffect(() => {
    if (isAllowed) {
      fetchLabReports();
    }
  }, [isAllowed]);

  useEffect(() => {
    if (statusFilter) {
      setFilteredLabReports(labReports.filter(lr => lr.status === statusFilter));
    } else {
      setFilteredLabReports(labReports);
    }
    setCurrentPage(1);
  }, [statusFilter, labReports]);

  const fetchLabReports = async () => {
    try {
      setIsLoading(true);
      const data = await getLabReports();
      setLabReports(data);
      setFilteredLabReports(data);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch lab reports', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (labReport: LabReport) => {
    try {
      const labReportData = await getLabReportById(labReport.id);
      setViewingLabReport(labReportData);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch lab report details', type: 'error' });
    }
  };

  const indexOfLastLabReport = currentPage * labReportsPerPage;
  const indexOfFirstLabReport = indexOfLastLabReport - labReportsPerPage;
  const currentLabReports = filteredLabReports.slice(indexOfFirstLabReport, indexOfLastLabReport);
  const totalPages = Math.ceil(filteredLabReports.length / labReportsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const columns = [
    {
      key: 'patient',
      header: 'Patient',
      render: (lr: LabReport) => `${lr.patient.firstName} ${lr.patient.lastName}`,
    },
    { key: 'testName', header: 'Test Name' },
    { key: 'testType', header: 'Test Type', render: (lr: LabReport) => lr.testType || 'N/A' },
    { key: 'status', header: 'Status' },
    {
      key: 'view',
      header: 'View Details',
      render: (lr: LabReport) => (
        <button
          onClick={() => handleViewDetails(lr)}
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
        <h1 className="text-2xl font-bold">Lab Reports</h1>
        <div className="w-1/4">
          <Select
            label="Filter by Status"
            options={[
              { value: '', label: 'All' },
              { value: LabReportStatus.ORDERED, label: 'Ordered' },
              { value: LabReportStatus.SAMPLE_COLLECTED, label: 'Sample Collected' },
              { value: LabReportStatus.PROCESSING, label: 'Processing' },
              { value: LabReportStatus.COMPLETED, label: 'Completed' },
              { value: LabReportStatus.CANCELLED, label: 'Cancelled' },
            ]}
            value={statusFilter}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as LabReportStatus)}
          />
        </div>
      </div>
      <Table data={currentLabReports} columns={columns} />
      <div className="mt-4 flex justify-between items-center">
        <div>
          Showing {indexOfFirstLabReport + 1} to {Math.min(indexOfLastLabReport, filteredLabReports.length)} of {filteredLabReports.length} lab reports
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_: unknown, i: number) => i + 1).map((page: number) => (
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
        isOpen={!!viewingLabReport}
        onClose={() => setViewingLabReport(null)}
        title="Lab Report Details"
      >
        {viewingLabReport ? (
          <div className="space-y-4">
            <p><strong>Patient:</strong> {viewingLabReport.patient?.firstName} {viewingLabReport.patient?.lastName}</p>
            <p><strong>Ordered By:</strong> {viewingLabReport.orderedBy?.firstName} {viewingLabReport.orderedBy?.lastName}</p>
            <p><strong>Uploaded By:</strong> {viewingLabReport.uploadedBy ? `${viewingLabReport.uploadedBy.firstName} ${viewingLabReport.uploadedBy.lastName}` : 'Not uploaded'}</p>
            <p><strong>Appointment:</strong> On {new Date(viewingLabReport.appointment.date).toLocaleDateString()} at {viewingLabReport.appointment.startTime}</p>
            <p><strong>Test Name:</strong> {viewingLabReport.testName}</p>
            <p><strong>Test Type:</strong> {viewingLabReport.testType || 'N/A'}</p>
            <p><strong>Status:</strong> {viewingLabReport.status}</p>
            <p><strong>Test Date:</strong> {viewingLabReport.testDate ? new Date(viewingLabReport.testDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Results Date:</strong> {viewingLabReport.resultsDate ? new Date(viewingLabReport.resultsDate).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Is Urgent:</strong> {viewingLabReport.isUrgent ? 'Yes' : 'No'}</p>
            <p><strong>Is Printed:</strong> {viewingLabReport.isPrinted ? 'Yes' : 'No'}</p>
            <p><strong>Comments:</strong> {viewingLabReport.comments || 'N/A'}</p>
            <p><strong>Doctor Notes:</strong> {viewingLabReport.doctorNotes || 'N/A'}</p>
            <h3 className="text-lg font-semibold mt-4">Test Parameters</h3>
            {viewingLabReport.testParameters?.length ? (
              viewingLabReport.testParameters.map((param: TestParameter, index: number) => (
                <div key={index} className="border p-2 mb-2 rounded">
                  <p><strong>Parameter:</strong> {param.parameterName}</p>
                  <p><strong>Result:</strong> {param.result} {param.unit || ''}</p>
                  <p><strong>Normal Range:</strong> {param.normalRange}</p>
                </div>
              ))
            ) : (
              <p>No test parameters available.</p>
            )}
            {viewingLabReport.fileUrl && (
              <p><strong>File:</strong> <a href={viewingLabReport.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Report</a></p>
            )}
          </div>
        ) : (
          <p>No lab report data available.</p>
        )}
        <div className="mt-6">
          <Button onClick={() => setViewingLabReport(null)} className="bg-gray-500 hover:bg-gray-600">
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

export default AdminLabReports;