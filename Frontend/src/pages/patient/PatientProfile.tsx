import { useState, useEffect } from 'react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import type { ChangeEvent } from 'react';
import { getPatientProfile, updatePatientProfile } from '../../api/endpoints/patients';
import type { Patient } from '../../api/types/patients.types';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';
import { FaUser } from 'react-icons/fa';

function PatientProfile() {
  const { isAllowed } = useRoleGuard(['patient']);
  const { user } = useAuth();
  const userId = user?.id;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<Partial<Patient>>({});
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAllowed && userId) {
      fetchPatientProfile();
    }
  }, [isAllowed, userId]);

  const fetchPatientProfile = async () => {
    try {
      setIsLoading(true);
      const patientData = await getPatientProfile();
      setPatient(patientData);
      setFormData({
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        dateOfBirth: patientData.dateOfBirth ? new Date(patientData.dateOfBirth).toISOString().split('T')[0] : '',
        gender: patientData.gender,
        bloodType: patientData.bloodType,
        phoneNumber: patientData.phoneNumber,
        address: patientData.address,
        emergencyContactName: patientData.emergencyContactName,
        emergencyContactPhone: patientData.emergencyContactPhone,
        allergies: patientData.allergies,
        chronicConditions: patientData.chronicConditions,
      });
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch patient profile', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    try {
      if (!userId) {
        throw new Error('User ID is not available. Please ensure you are logged in.');
      }

      const updatedPatientData = {
        userId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodType: formData.bloodType,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        allergies: formData.allergies,
        chronicConditions: formData.chronicConditions,
      };

      const updatedPatient = await updatePatientProfile(updatedPatientData as unknown as Patient);
      setPatient(updatedPatient);
      setShowToast({ message: 'Profile updated successfully', type: 'success' });
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to update profile', type: 'error' });
    }
  };

  if (!isAllowed) {
    return <div>Access Denied</div>;
  }

  if (isLoading) {
    return <Loader />;
  }

  if (!patient) {
    return <div>No patient data available.</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-4 justify-center space-x-2">
        <FaUser className="text-2xl font-bold mb-4" />
        <h1 className="text-2xl font-bold mb-4"> My Profile</h1>
      </div>

      <div className="bg-gray-200 shadow-md rounded-lg p-6 max-w-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            name="firstName"
            value={formData.firstName || ''}
            onChange={handleInputChange}
          />
          <Input
            label="Last Name"
            type="text"
            name="lastName"
            value={formData.lastName || ''}
            onChange={handleInputChange}
          />
          <Input
            label="Date of Birth"
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth || ''}
            onChange={handleInputChange}
          />
          <Select
            label="Gender"
            name="gender"
            value={formData.gender || ''}
            onChange={handleInputChange}
            options={[
              { value: '', label: 'Select Gender' },
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' },
            ]}
          />
          <Select
            label="Blood Type"
            name="bloodType"
            value={formData.bloodType || ''}
            onChange={handleInputChange}
            options={[
              { value: '', label: 'Select Blood Type' },
              { value: 'A+', label: 'A+' },
              { value: 'A-', label: 'A-' },
              { value: 'B+', label: 'B+' },
              { value: 'B-', label: 'B-' },
              { value: 'AB+', label: 'AB+' },
              { value: 'AB-', label: 'AB-' },
              { value: 'O+', label: 'O+' },
              { value: 'O-', label: 'O-' },
            ]}
          />
          <Input
            label="Phone Number"
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber || ''}
            onChange={handleInputChange}
          />
          <Input
            label="Address"
            type="text"
            name="address"
            value={formData.address || ''}
            onChange={handleInputChange}
          />
          <Input
            label="Emergency Contact Name"
            type="text"
            name="emergencyContactName"
            value={formData.emergencyContactName || ''}
            onChange={handleInputChange}
          />
          <Input
            label="Emergency Contact Phone"
            type="tel"
            name="emergencyContactPhone"
            value={formData.emergencyContactPhone || ''}
            onChange={handleInputChange}
          />
          <Input
            label="Allergies"
            type="text"
            name="allergies"
            value={formData.allergies || ''}
            onChange={handleInputChange}
            placeholder="e.g., Penicillin"
          />
          <Input
            label="Chronic Conditions"
            type="text"
            name="chronicConditions"
            value={formData.chronicConditions || ''}
            onChange={handleInputChange}
            placeholder="e.g., Hypertension"
          />
        </div>
        <div className="mt-6">
          <p><strong>Email:</strong> {patient.user.email}</p>
          <p><strong>Barcode ID:</strong> {patient.barcodeId}</p>
          <p><strong>Created At:</strong> {new Date(patient.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}</p>
          <p><strong>Last Updated:</strong> {new Date(patient.updatedAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}</p>
        </div>
        <div className="mt-6 flex space-x-4">
          <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600">
            Save Changes
          </Button>
          <Button
            onClick={() => setFormData({
              firstName: patient.firstName,
              lastName: patient.lastName,
              dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
              gender: patient.gender,
              bloodType: patient.bloodType,
              phoneNumber: patient.phoneNumber,
              address: patient.address,
              emergencyContactName: patient.emergencyContactName,
              emergencyContactPhone: patient.emergencyContactPhone,
              allergies: patient.allergies,
              chronicConditions: patient.chronicConditions,
            })}
            className="bg-gray-500 hover:bg-gray-600"
          >
            Reset
          </Button>
        </div>
      </div>
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

export default PatientProfile;