import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {type ChangeEvent } from 'react';
import { FaEye, FaTrash, FaPlus, FaDownload } from 'react-icons/fa';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Toast from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import ConfirmBox from '../../components/common/ConfirmBox';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { getLabReports, getLabReportById, createLabReport, updateLabReport, deleteLabReport, LabReportStatus } from '../../api/endpoints/lab-reports';
import { getPatients } from '../../api/endpoints/patients';
import { getAppointments } from '../../api/endpoints/appointments';
import { type LabReport, type TestParameter } from '../../api/types/lab-reports.types';
import type { Patient } from '../../api/types/patients.types';
import type { Appointment } from '../../api/types/appointments.types';

import jsPDF from 'jspdf';

interface TestParameterFormData {
  parameterName: string;
  result: string;
  normalRange: string;
  unit?: string;
}

interface FormData {
  patientId?: string;
  appointmentId?: string;
  testName?: string;
  testType?: string;
  comments?: string;
  doctorNotes?: string;
  testDate?: string | Date;
  resultsDate?: string | Date;
  isUrgent?: boolean;
  testParametersForm?: TestParameterFormData[];
}

function LabReports() {
  const { isAllowed } = useRoleGuard(['doctor']);
  const { profileId } = useAuth();
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [editingLabReport, setEditingLabReport] = useState<LabReport | null>(null);
  const [viewingLabReport, setViewingLabReport] = useState<LabReport | null>(null);
  const [deletingLabReportId, setDeletingLabReportId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [doctorNotes, setDoctorNotes] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const labReportsPerPage = 10;

  useEffect(() => {
    if (isAllowed) {
      fetchLabReports();
      fetchPatients();
      fetchAppointments();
    }
  }, [isAllowed]);

  const fetchLabReports = async () => {
    try {
      setIsLoading(true);
      const data = await getLabReports();
      setLabReports(data);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch lab reports', type: 'error' });
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

  const fetchAppointments = async () => {
    try {
      const data = await getAppointments();
      setAppointments(data);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch appointments', type: 'error' });
    }
  };

  const handleCreate = () => {
    setEditingLabReport(null);
    setFormData({
      testParametersForm: [{
        parameterName: '',
        result: '',
        normalRange: '',
        unit: '',
      }],
      isUrgent: false,
    });
  };

  const handleViewDetails = async (labReport: LabReport) => {
    try {
      const labReportData = await getLabReportById(labReport.id);
      setViewingLabReport(labReportData);
      setDoctorNotes(labReportData.doctorNotes || '');
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch lab report details', type: 'error' });
    }
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

  const handleSave = async () => {
    try {
      if (!profileId) {
        throw new Error('Doctor profile ID is not available. Please ensure you are logged in.');
      }

      const testParameters = (formData.testParametersForm || []).map((param: TestParameterFormData) => ({
        parameterName: param.parameterName,
        result: param.result,
        normalRange: param.normalRange,
        unit: param.unit || undefined,
      }));

      const data = {
        patientId: formData.patientId!,
        orderedById: profileId,
        appointmentId: formData.appointmentId!,
        testName: formData.testName!,
        testType: formData.testType,
        comments: formData.comments,
        doctorNotes: formData.doctorNotes,
        testDate: formData.testDate,
        resultsDate: formData.resultsDate,
        isUrgent: formData.isUrgent,
        testParameters: testParameters.length > 0 ? testParameters : undefined,
      };

      if (editingLabReport) {
        const updatedLabReport = await updateLabReport(editingLabReport.id, data);
        setLabReports(labReports.map(lr => (lr.id === updatedLabReport.id ? updatedLabReport : lr)));
        setShowToast({ message: 'Lab report updated successfully', type: 'success' });
      } else {
        const newLabReport = await createLabReport(data);
        setLabReports([...labReports, newLabReport]);
        setShowToast({ message: 'Lab report created successfully', type: 'success' });
      }
      setEditingLabReport(null);
      setFormData({});
    } catch (error: any) {
      setShowToast({ message: error.response?.data?.message?.join(', ') || error.message || 'Failed to save lab report', type: 'error' });
    }
  };

  const handleAddDoctorNotes = async () => {
    if (!viewingLabReport) return;
    try {
      const updatedLabReport = await updateLabReport(viewingLabReport.id, { doctorNotes });
      setLabReports(labReports.map(lr => (lr.id === updatedLabReport.id ? updatedLabReport : lr)));
      setViewingLabReport(updatedLabReport);
      setShowToast({ message: 'Doctor notes updated successfully', type: 'success' });
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to update doctor notes', type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingLabReportId(id);
  };

  const confirmDelete = async () => {
    if (!deletingLabReportId) return;
    try {
      await deleteLabReport(deletingLabReportId);
      setLabReports(labReports.filter(lr => lr.id !== deletingLabReportId));
      setShowToast({ message: 'Lab report deleted successfully', type: 'success' });
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to delete lab report', type: 'error' });
    } finally {
      setDeletingLabReportId(null);
    }
  };

  const handleDownloadPDF = (labReport: LabReport) => {
    const doc = new jsPDF();
    
    doc.setProperties({
      title: `Lab Report - ${labReport.testName}`,
      author: 'Medical System',
      creator: 'Doctor Portal',
    });

    doc.setFontSize(18);
    doc.text('Lab Report', 20, 20);

    doc.setFontSize(14);
    doc.text(`Test: ${labReport.testName}`, 20, 30);

    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    doc.setFontSize(12);
    let yPosition = 45;

    const details = [
      `Patient: ${labReport.patient?.firstName} ${labReport.patient?.lastName}`,
      `Ordered By: ${labReport.orderedBy?.firstName} ${labReport.orderedBy?.lastName}`,
      `Uploaded By: ${labReport.uploadedBy ? `${labReport.uploadedBy.firstName} ${labReport.uploadedBy.lastName}` : 'Not uploaded'}`,
      `Appointment: On ${new Date(labReport.appointment.date).toLocaleDateString()} at ${labReport.appointment.startTime}`,
      `Test Type: ${labReport.testType || 'N/A'}`,
      `Status: ${labReport.status}`,
      `Test Date: ${labReport.testDate ? new Date(labReport.testDate).toLocaleDateString() : 'N/A'}`,
      `Results Date: ${labReport.resultsDate ? new Date(labReport.resultsDate).toLocaleDateString() : 'N/A'}`,
      `Is Urgent: ${labReport.isUrgent ? 'Yes' : 'No'}`,
      `Is Printed: ${labReport.isPrinted ? 'Yes' : 'No'}`,
      `Comments: ${labReport.comments || 'N/A'}`,
      `Doctor Notes: ${labReport.doctorNotes || 'N/A'}`,
    ];

    details.forEach((line) => {
      doc.text(line, 20, yPosition);
      yPosition += 10;
    });

    yPosition += 5;
    doc.setFontSize(14);
    doc.text('Test Parameters', 20, yPosition);
    yPosition += 5;
    doc.setLineWidth(0.2);
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 5;

    doc.setFontSize(12);
    if (labReport.testParameters?.length) {
      labReport.testParameters.forEach((param: TestParameter, index: number) => {
        const paramText = [
          `Parameter ${index + 1}:`,
          `  Name: ${param.parameterName}`,
          `  Result: ${param.result} ${param.unit || ''}`,
          `  Normal Range: ${param.normalRange}`,
        ];
        paramText.forEach((line) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, 20, yPosition);
          yPosition += 7;
        });
        yPosition += 3;
      });
    } else {
      doc.text('No test parameters available.', 20, yPosition);
      yPosition += 10;
    }

    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      `Generated on: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}`,
      20,
      280
    );

    doc.save(`lab-report-${labReport.id}.pdf`);
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
      key: 'download',
      header: 'Download PDF',
      render: (lr: LabReport) => (
        <button
          onClick={() => handleDownloadPDF(lr)}
          className="text-blue-600 hover:text-blue-800"
          title="Download PDF"
        >
          <FaDownload />
        </button>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (lr: LabReport) => {
        const canDelete = lr.status !== LabReportStatus.COMPLETED;
        return (
          <div className="flex space-x-2">
            {canDelete && (
              <button
                onClick={() => handleDelete(lr.id)}
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
        <h1 className="text-2xl font-bold">Lab Reports</h1>
        <Button onClick={handleCreate} className="flex items-center">
          <FaPlus className="mr-2" />
          Create Lab Report
        </Button>
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
        isOpen={!!editingLabReport || formData.testParametersForm !== undefined}
        onClose={() => {
          setEditingLabReport(null);
          setFormData({});
        }}
        title={editingLabReport ? 'Edit Lab Report' : 'Create Lab Report'}
      >
        <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[70vh] p-4">
          <Select
            label="Patient"
            options={patients.map((patient) => ({
              value: patient.id,
              label: `${patient.firstName} ${patient.lastName}`,
            }))}
            value={formData.patientId || ''}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, patientId: e.target.value })}
          />
          <Select
            label="Appointment"
            options={appointments.map((appt) => ({
              value: appt.id,
              label: `With ${appt.patient.firstName} ${appt.patient.lastName} on ${new Date(appt.date).toLocaleDateString()} at ${appt.startTime}`,
            }))}
            value={formData.appointmentId || ''}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, appointmentId: e.target.value })}
          />
          <Input
            label="Test Name"
            type="text"
            value={formData.testName || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, testName: e.target.value })}
          />
          <Input
            label="Test Type"
            type="text"
            value={formData.testType || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, testType: e.target.value })}
          />
          <Input
            label="Comments"
            type="text"
            value={formData.comments || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, comments: e.target.value })}
          />
          <Input
            label="Doctor Notes"
            type="text"
            value={formData.doctorNotes || ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, doctorNotes: e.target.value })}
          />
          <Input
            label="Test Date"
            type="date"
            value={formData.testDate ? new Date(formData.testDate).toISOString().split('T')[0] : ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, testDate: e.target.value })}
          />
          <Input
            label="Results Date"
            type="date"
            value={formData.resultsDate ? new Date(formData.resultsDate).toISOString().split('T')[0] : ''}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, resultsDate: e.target.value })}
          />
          <Select
            label="Is Urgent"
            options={[
              { value: 'true', label: 'Yes' },
              { value: 'false', label: 'No' },
            ]}
            value={formData.isUrgent ? 'true' : 'false'}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, isUrgent: e.target.value === 'true' })}
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
          <Button onClick={handleSave}>Save</Button>
          <Button
            onClick={() => {
              setEditingLabReport(null);
              setFormData({});
            }}
            className="bg-gray-500 hover:bg-gray-600"
          >
            Cancel
          </Button>
        </div>
      </Modal>
      <Modal
        isOpen={!!viewingLabReport}
        onClose={() => setViewingLabReport(null)}
        title="Lab Report Details"
      >
        {viewingLabReport ? (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => handleDownloadPDF(viewingLabReport)}
                className="text-blue-600 hover:text-blue-800 flex items-center"
                title="Download PDF"
              >
                <FaDownload className="mr-2" />
                Download PDF
              </button>
            </div>
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
            <div>
              <strong>Doctor Notes:</strong>
              <Input
                label="Doctor Notes"
                type="text"
                value={doctorNotes}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setDoctorNotes(e.target.value)}
                placeholder="Add doctor notes..."
                className="w-full mt-2"
              />
              <Button onClick={handleAddDoctorNotes} className="mt-2 bg-blue-500 hover:bg-blue-600">
                Save Notes
              </Button>
            </div>
            <h3 className="text-lg font-semibold mt-4">Test Parameters</h3>
            {viewingLabReport.testParameters?.length ? (
              viewingLabReport.testParameters.map((param: TestParameter, index: number) => (
                <div key={index} className="border p-2 mb-2 rounded">
                  <p><strong>Parameter:</strong> {param.parameterName}</p>
                  <p><strong>Result:</strong> {param.result} ${param.unit || ''}</p>
                  <p><strong>Normal Range:</strong> ${param.normalRange}</p>
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
      <ConfirmBox
        isOpen={!!deletingLabReportId}
        message="Are you sure you want to delete this lab report?"
        onConfirm={confirmDelete}
        onCancel={() => setDeletingLabReportId(null)}
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

export default LabReports;