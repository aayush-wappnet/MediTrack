import { useState, useEffect, useRef } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { FaUsers, FaCalendarAlt, FaFileCsv, FaFilePdf } from 'react-icons/fa';
import { getDashboardStats } from '../../api/endpoints/dashboard';
import { type AdminStats } from '../../api/types/dashboard.types';
import Toast from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

function Reports() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<any>(null);
  const pieChartRef = useRef<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const data = await getDashboardStats();
      if ('users' in data) {
        setStats(data as AdminStats);
      } else {
        throw new Error('Invalid stats data for admin');
      }
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch stats', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Bar Chart Data: Users (Patients, Doctors, Nurses)
  const barChartData = stats ? {
    labels: ['Patients', 'Doctors', 'Nurses'],
    datasets: [
      {
        label: 'Number of Users',
        data: [stats.users.totalPatients, stats.users.totalDoctors, stats.users.totalNurses],
        backgroundColor: ['#8B5CF6', '#3B82F6', '#10B981'],
        borderColor: ['#7C3AED', '#2563EB', '#059669'],
        borderWidth: 1,
      },
    ],
  } : null;

  // Pie Chart Data: Appointment Status
  const pieChartData = stats ? {
    labels: ['Total', 'Pending', 'Completed', 'Cancelled'],
    datasets: [
      {
        label: 'Appointments',
        data: [
          stats.appointments.total,
          stats.appointments.pending,
          stats.appointments.completed,
          stats.appointments.cancelled,
        ],
        backgroundColor: ['#8B5CF6', '#F59E0B', '#10B981', '#EF4444'],
        borderColor: ['#7C3AED', '#D97706', '#059669', '#DC2626'],
        borderWidth: 1,
      },
    ],
  } : null;

  // Chart Options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 14,
          },
          color: '#374151',
        },
      },
      title: {
        display: true,
        font: {
          size: 16,
        },
        color: '#374151',
      },
    },
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!stats) return;

    const csvRows = [];
    csvRows.push('Category,Value');
    csvRows.push(`Total Patients,${stats.users.totalPatients}`);
    csvRows.push(`Total Doctors,${stats.users.totalDoctors}`);
    csvRows.push(`Total Nurses,${stats.users.totalNurses}`);
    csvRows.push(`Total Appointments,${stats.appointments.total}`);
    csvRows.push(`Pending Appointments,${stats.appointments.pending}`);
    csvRows.push(`Completed Appointments,${stats.appointments.completed}`);
    csvRows.push(`Cancelled Appointments,${stats.appointments.cancelled}`);

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'admin-report.csv');
    setShowToast({ message: 'Data exported to CSV successfully', type: 'success' });
  };

  // Export to PDF
  const exportToPDF = async () => {
    if (!reportRef.current) {
      setShowToast({ message: 'Report content not found', type: 'error' });
      return;
    }

    try {
      setIsExportingPDF(true);
      // Force chart redraw
      if (barChartRef.current) barChartRef.current.update();
      if (pieChartRef.current) pieChartRef.current.update();

      // Add a small delay to ensure charts are fully rendered
      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10;
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - 2 * margin);

      while (heightLeft > 0) {
        pdf.addPage();
        position = margin - heightLeft;
        pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
        heightLeft -= (pageHeight - 2 * margin);
      }

      pdf.save('admin-report.pdf');
      setShowToast({ message: 'Report downloaded as PDF successfully', type: 'success' });
    } catch (error: any) {
      console.error('PDF Generation Error:', error);
      setShowToast({ message: `Failed to generate PDF: ${error.message || 'Unknown error'}`, type: 'error' });
    } finally {
      setIsExportingPDF(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div
        style={{ background: 'linear-gradient(to right, #8B5CF6, #7C3AED)' }}
        className="p-8 rounded-xl shadow-lg text-white animate-fade-in"
      >
        <h1 className="text-4xl font-bold tracking-tight">Reports</h1>
        <p className="text-lg mt-2 opacity-90">
          Visualize and export healthcare data for analysis.
        </p>
      </div>

      {/* Export Buttons */}
      <div className="flex justify-end space-x-4 relative">
        <button
          onClick={exportToCSV}
          style={{ backgroundColor: '#3B82F6' }}
          className="flex items-center px-4 py-2 text-white rounded-md hover:bg-[#2563EB] transition-all duration-200 shadow-md"
          disabled={!stats}
        >
          <FaFileCsv className="mr-2" />
          Export to CSV
        </button>
        <button
          onClick={exportToPDF}
          style={{ backgroundColor: '#EF4444' }}
          className="flex items-center px-4 py-2 text-white rounded-md hover:bg-[#DC2626] transition-all duration-200 shadow-md"
          disabled={!stats || isExportingPDF}
        >
          {isExportingPDF ? (
            <svg
              className="animate-spin mr-2 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
          ) : (
            <FaFilePdf className="mr-2" />
          )}
          {isExportingPDF ? 'Exporting...' : 'Download PDF'}
        </button>
      </div>

      {/* Report Content */}
      <div ref={reportRef}>
        {/* PDF Header */}
        <div
          style={{ background: 'linear-gradient(to right, #8B5CF6, #7C3AED)' }}
          className="p-6 mb-4 text-white"
        >
          <h1 className="text-3xl font-bold">MediTrack</h1>
          <p className="text-sm mt-1 opacity-90">Generated on May 21, 2025</p>
        </div>

        {/* Users Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-[#1F2A44] mb-4 flex items-center">
            <FaUsers style={{ color: '#7C3AED' }} className="mr-2" />
            User Distribution
          </h2>
          <div className="h-80">
            {barChartData && (
              <Bar
                ref={barChartRef}
                data={barChartData}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: { ...chartOptions.plugins.title, text: 'User Distribution' },
                  },
                }}
              />
            )}
          </div>
        </div>

        {/* Appointments Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <h2 className="text-2xl font-semibold text-[#1F2A44] mb-4 flex items-center">
            <FaCalendarAlt style={{ color: '#7C3AED' }} className="mr-2" />
            Appointment Status
          </h2>
          <div className="h-80">
            {pieChartData && (
              <Pie
                ref={pieChartRef}
                data={pieChartData}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: { ...chartOptions.plugins.title, text: 'Appointment Status Distribution' },
                  },
                }}
              />
            )}
          </div>
        </div>

        {/* Stats Table */}
        {stats && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-[#1F2A44] mb-4">Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Users Section */}
              <div>
                <h3 className="text-lg font-medium text-[#1F2A44] mb-2">Users</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: '#E5E7EB' }}>
                      <th className="border border-[#D1D5DB] p-2 text-left text-[#374151]">Category</th>
                      <th className="border border-[#D1D5DB] p-2 text-left text-[#374151]">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-[#D1D5DB] p-2 text-[#374151]">Total Patients</td>
                      <td className="border border-[#D1D5DB] p-2 text-[#374151]">{stats.users.totalPatients}</td>
                    </tr>
                    <tr>
                      <td className="border border-[#D1D5DB] p-2 text-[#374151]">Total Doctors</td>
                      <td className="border border-[#D1D5DB] p-2 text-[#374151]">{stats.users.totalDoctors}</td>
                    </tr>
                    <tr>
                      <td className="border border-[#D1D5DB] p-2 text-[#374151]">Total Nurses</td>
                      <td className="border border-[#D1D5DB] p-2 text-[#374151]">{stats.users.totalNurses}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Appointments Section */}
              <div>
                <h3 className="text-lg font-medium text-[#1F2A44] mb-2">Appointments</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr style={{ backgroundColor: '#E5E7EB' }}>
                      <th className="border border-[#D1D5DB] p-2 text-left text-[#374151]">Category</th>
                      <th className="border border-[#D1D5DB] p-2 text-left text-[#374151]">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-[#D1D5DB] p-2 text-[#374151]">Total Appointments</td>
                      <td className="border border-[#D1D5DB] p-2 text-[#374151]">{stats.appointments.total}</td>
                    </tr>
                    <tr>
                      <td className="border border-[#D1D5DB] p-2 text-[#374151]">Pending Appointments</td>
                      <td className="border border-[#D1D5DB] p-2 text-[#374151]">{stats.appointments.pending}</td>
                    </tr>
                    <tr>
                      <td className="border border-[#D1D5DB] p-2 text-[#374151]">Completed Appointments</td>
                      <td className="border border-[#D1D5DB] p-2 text-[#374151]">{stats.appointments.completed}</td>
                    </tr>
                    <tr>
                      <td className="border border-[#D1D5DB] p-2 text-[#374151]">Cancelled Appointments</td>
                      <td className="border border-[#D1D5DB] p-2 text-[#374151]">{stats.appointments.cancelled}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
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

export default Reports;