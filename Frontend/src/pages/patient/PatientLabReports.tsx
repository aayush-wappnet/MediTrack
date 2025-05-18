import { useState, useEffect } from 'react';
import { FaEye, FaDownload } from 'react-icons/fa';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { getLabReports, getLabReportById } from '../../api/endpoints/lab-reports';
import { type LabReport, type TestParameter } from '../../api/types/lab-reports.types';
import jsPDF from 'jspdf';

function PatientLabReports() {
  const { isAllowed } = useRoleGuard(['patient']);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
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

  const handleViewDetails = async (labReport: LabReport) => {
    try {
      const labReportData = await getLabReportById(labReport.id);
      setViewingLabReport(labReportData);
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch lab report details', type: 'error' });
    }
  };

  const handleDownloadPDF = (labReport: LabReport) => {
    const doc = new jsPDF();
    
    doc.setProperties({
      title: `Lab Report - ${labReport.testName}`,
      author: 'Medical System',
      creator: 'Patient Portal',
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
    doc.setTextColor(

150);
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
        <h1 className="text-2xl font-bold">My Lab Reports</h1>
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

export default PatientLabReports;