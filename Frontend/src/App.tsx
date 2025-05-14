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
import Appointments from './pages/doctor/Appointments';

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
                  <div className="p-4">Dashboard (Placeholder)</div>
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
                  <div className="p-4">Reports (Placeholder)</div>
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
                  <div className="p-4">Patients (Placeholder)</div>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/prescriptions"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="p-4">Prescriptions (Placeholder)</div>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/diagnoses"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="p-4">Diagnoses (Placeholder)</div>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/lab-requests"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="p-4">Lab Requests (Placeholder)</div>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          {/* Nurse Routes */}
          <Route
            path="/lab-reports"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="p-4">Lab Reports (Placeholder)</div>
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
          {/* Patient Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="p-4">Profile (Placeholder)</div>
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