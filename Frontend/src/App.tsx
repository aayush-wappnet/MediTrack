import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { JSX } from 'react';
import { store, persistor } from './store';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import CompleteProfile from './pages/auth/CompleteProfile';
import Users from './pages/admin/Users';
import NotFound from './pages/NotFound';
import MainLayout from './layouts/MainLayout';
import { useAuth } from './hooks/useAuth';
import Home from './pages/Home';
import PatientAppointments from './pages/patient/PatientAppointments';
import NurseAppointments from './pages/nurse/NurseAppointments';
import Diagnoses from './pages/doctor/Diagnoses';
import PatientDiagnoses from './pages/patient/PatientDiagnoses';
import Prescriptions from './pages/doctor/Prescriptions';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';
import PrescriptionQueue from './pages/nurse/PrescriptionQueue';
import Patients from './pages/Patient';
import Appointments from './pages/doctor/Appointments';
import LabReports from './pages/doctor/LabReports';
import LabReportQueue from './pages/nurse/LabReportQueue';
import PatientLabReports from './pages/patient/PatientLabReports';
import AdminLabReports from './pages/admin/AdminLabReports';
import PatientProfile from './pages/patient/PatientProfile';
import NurseProfile from './pages/nurse/NurseProfile';
import DoctorProfile from './pages/doctor/DoctorProfile';
import Reports from './pages/admin/Reports';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Home />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          {/* Admin Routes */}
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Users />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="p-4">Audit Logs (Placeholder)</div>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Reports />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-lab-reports"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AdminLabReports />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          {/* Doctor Routes */}
          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Appointments />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Patients />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/prescriptions"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Prescriptions />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/diagnoses"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Diagnoses />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor-lab-reports"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <LabReports />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor-profile"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <DoctorProfile />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          {/* Nurse Routes */}
          <Route
            path="/nurse-lab-reports"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <LabReportQueue />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/vitals"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="p-4">Vitals (Placeholder)</div>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/nurse-appointments"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <NurseAppointments />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/nurse-prescriptions"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PrescriptionQueue />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/nurse-profile"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <NurseProfile />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          {/* Patient Routes */}
          <Route
            path="/patient-profile"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PatientProfile />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient-appointments"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PatientAppointments />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient-diagnoses"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PatientDiagnoses />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient-prescriptions"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PatientPrescriptions />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient-lab-reports"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PatientLabReports />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;