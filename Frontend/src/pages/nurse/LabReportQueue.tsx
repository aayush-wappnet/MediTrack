import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { FaEye, FaCheck } from 'react-icons/fa';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Toast from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import ConfirmBox from '../../components/common/ConfirmBox';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { getPendingLabReports, getLabReportById, updateLabReport, uploadLabReportResults, LabReportStatus } from '../../api/endpoints/lab-reports';
import { type LabReport, type TestParameter } from '../../api/types/lab-reports.types';

interface TestParameterFormData {
  parameterName: string;
  result: string;
  normalRange: string;
  unit?: string;
}

interface FormData {
  comments?: string;
  testParametersForm?: TestParameterFormData[];
}

function LabReportQueue() {
  const { isAllowed } = useRoleGuard(['nurse']);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [viewingLabReport, setViewingLabReport] = useState<LabReport | null>(null);
  const [updatingLabReport, setUpdatingLabReport] = useState<LabReport | null>(null);
  const [confirmingAction, setConfirmingAction] = useState<{ id: string; action: 'upload' | 'status'; status?: LabReportStatus } | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const labReportsPerPage = 10;

  useEffect(() => {
    if (isAllowed) {
      fetchPendingLabReports();
    }
  }, [isAllowed]);

  const fetchPendingLabReports = async () => {
    try {
      setIsLoading(true);
      const data = await getPendingLabReports();
      setLabReports(data);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch pending lab reports', type: 'error' });
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

  const handleUpdateStatus = (labReport: LabReport, status: LabReportStatus) => {
    setConfirmingAction({ id: labReport.id, action: 'status', status });
  };

  const handleUploadResults = (labReport: LabReport) => {
    const labReportData = labReport;
    setUpdatingLabReport(labReportData);
    setFormData({
      testParametersForm: labReportData.testParameters?.map((param) => ({
        parameterName: param.parameterName,
        result: param.result,
        normalRange: param.normalRange,
        unit: param.unit || '',
      })) || [{
        parameterName: '',
        result: '',
        normalRange: '',
        unit: '',
      }],
      comments: labReportData.comments,
    });
  };

  const handleAddParameter = () => {
    setFormData({
      ...formData,
      testParametersForm: [
        ...(formData.testParametersForm || []),
        {
          parameterName: '',
          result: '',
          normalRange: '',
          unit: '',
        },
      ],
    });
  };

  const handleRemoveParameter = (index: number) => {
    setFormData({
      ...formData,
      testParametersForm: (formData.testParametersForm || []).filter((_: TestParameterFormData, i: number) => i !== index),
    });
  };

  const handleParameterChange = (index: number, field: keyof TestParameterFormData, value: string) => {
    const updatedParameters = (formData.testParametersForm || []).map((param: TestParameterFormData, i: number) =>
      i === index ? { ...param, [field]: value } : param
    );
    setFormData({ ...formData, testParametersForm: updatedParameters });
  };

  const handleConfirmAction = async () => {
    if (!confirmingAction) return;
    try {
      if (confirmingAction.action === 'status') {
        const updatedLabReport = await updateLabReport(confirmingAction.id, { status: confirmingAction.status });
        setLabReports(labReports.map(lr => (lr.id === updatedLabReport.id ? updatedLabReport : lr)));
        setShowToast({ message: 'Lab report status updated successfully', type: 'success' });
      } else if (confirmingAction.action === 'upload') {
        const testParameters = (formData.testParametersForm || []).map((param: TestParameterFormData) => ({
          parameterName: param.parameterName,
          result: param.result,
          normalRange: param.normalRange,
          unit: param.unit || undefined,
        }));
        const data = {
          testParameters,
          comments: formData.comments,
          status: LabReportStatus.COMPLETED,
        };
        const updatedLabReport = await uploadLabReportResults(confirmingAction.id, data);
        setLabReports(labReports.filter(lr => lr.id !== updatedLabReport.id));
        setShowToast({ message: 'Lab report results uploaded successfully', type: 'success' });
        setUpdatingLabReport(null);
        setFormData({});
      }
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to perform action', type: 'error' });
    } finally {
      setConfirmingAction(null);
    }
  };

  const indexOfLastLabReport = currentPage * labReportsPerPage;
  const indexOfFirstLabReport = indexOfLastLabReport - labReportsPerPage;
  const currentLabReports = labReports.slice(indexOfFirstLabReport, indexOfLastLabReport);
  const totalPages = Math.ceil(labReports.length / labReportsPerPage);

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
    {
      key: 'actions',
      header: 'Actions',
      render: (lr: LabReport) => (
        <div className="flex space-x-2">
          <Select
            label="Status"
            options={[
              { value: LabReportStatus.SAMPLE_COLLECTED, label: 'Sample Collected' },
              { value: LabReportStatus.PROCESSING, label: 'Processing' },
              { value: LabReportStatus.COMPLETED, label: 'Completed' },
            ]}
            value={lr.status}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => handleUpdateStatus(lr, e.target.value as LabReportStatus)}
            className="text-sm"
          />
          {lr.status !== LabReportStatus.COMPLETED && (
            <button
              onClick={() => handleUploadResults(lr)}
              className="text-green-600 hover:text-green-800"
              title="Upload Results"
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
        <h1 className="text-2xl font-bold">Lab Report Queue</h1>
      </div>
      <Table data={currentLabReports} columns={columns} />
      <div className="mt-4 flex justify-between items-center">
        <div>
          Showing {indexOfFirstLabReport + 1} to {Math.min(indexOfLastLabReport, labReports.length)} of {labReports.length} lab reports
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
      <Modal
        isOpen={!!updatingLabReport}
        onClose={() => {
          setUpdatingLabReport(null);
          setFormData({});
        }}
        title="Upload Lab Report Results"
      >
        <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[70vh] p-4">
          <Input
            label="Comments"
            type="text"
            value={formData.comments || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, comments: e.target.value })}
          />
          <div className="col-span-2">
            <h3 className="text-lg font-semibold mb-2">Test Parameters</h3>
            {(formData.testParametersForm || []).map((param: TestParameterFormData, index: number) => (
              <div key={index} className="border p-4 mb-4 rounded-lg relative">
                <button
                  onClick={() => handleRemoveParameter(index)}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Parameter Name"
                    type="text"
                    value={param.parameterName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleParameterChange(index, 'parameterName', e.target.value)}
                  />
                  <Input
                    label="Result"
                    type="text"
                    value={param.result}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleParameterChange(index, 'result', e.target.value)}
                  />
                  <Input
                    label="Normal Range"
                    type="text"
                    value={param.normalRange}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleParameterChange(index, 'normalRange', e.target.value)}
                  />
                  <Input
                    label="Unit"
                    type="text"
                    value={param.unit || ''}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleParameterChange(index, 'unit', e.target.value)}
                  />
                </div>
              </div>
            ))}
            <Button onClick={handleAddParameter} className="mt-2 bg-green-500 hover:bg-green-600">
              Add Parameter
            </Button>
          </div>
        </div>
        <div className="mt-6 flex space-x-4">
          <Button onClick={() => setConfirmingAction({ id: updatingLabReport!.id, action: 'upload' })}>
            Upload Results
          </Button>
          <Button
            onClick={() => {
              setUpdatingLabReport(null);
              setFormData({});
            }}
            className="bg-gray-500 hover:bg-gray-600"
          >
            Cancel
          </Button>
        </div>
      </Modal>
      <ConfirmBox
        isOpen={!!confirmingAction}
        message={
          confirmingAction?.action === 'status'
            ? `Are you sure you want to update the status to ${confirmingAction.status}?`
            : 'Are you sure you want to upload these lab report results?'
        }
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmingAction(null)}
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

export default LabReportQueue;