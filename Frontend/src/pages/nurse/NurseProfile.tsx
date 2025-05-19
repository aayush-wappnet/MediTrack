import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { getNurseProfile, updateNurseProfile } from '../../api/endpoints/nurses';
import type { Nurse } from '../../api/types/nurses.types';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import { FaUser } from 'react-icons/fa';

function NurseProfile() {
  const { isAllowed } = useRoleGuard(['nurse']);
  const { user } = useAuth();
  const userId = user?.id;

  const [nurse, setNurse] = useState<Nurse | null>(null);
  const [formData, setFormData] = useState<Partial<Nurse>>({});
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAllowed && userId) {
      fetchNurseProfile();
    }
  }, [isAllowed, userId]);

  const fetchNurseProfile = async () => {
    try {
      setIsLoading(true);
      const nurseData = await getNurseProfile();
      setNurse(nurseData);
      setFormData({
        firstName: nurseData.firstName,
        lastName: nurseData.lastName,
        licenseNumber: nurseData.licenseNumber,
        phoneNumber: nurseData.phoneNumber,
        department: nurseData.department,
        yearsOfExperience: nurseData.yearsOfExperience,
        education: nurseData.education,
      });
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch nurse profile', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'yearsOfExperience' ? parseInt(value) : value });
  };

  const handleSave = async () => {
    try {
      if (!userId) {
        throw new Error('User ID is not available. Please ensure you are logged in.');
      }

      const updatedNurseData = {
        id: nurse?.id,
        userId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        licenseNumber: formData.licenseNumber,
        phoneNumber: formData.phoneNumber,
        department: formData.department,
        yearsOfExperience: formData.yearsOfExperience,
        education: formData.education,
      };

      const updatedNurse = await updateNurseProfile(updatedNurseData as Nurse);
      setNurse(updatedNurse);
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

  if (!nurse) {
    return <div>No nurse data available.</div>;
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
            label="License Number"
            type="text"
            name="licenseNumber"
            value={formData.licenseNumber || ''}
            onChange={handleInputChange}
          />
          <Input
            label="Phone Number"
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber || ''}
            onChange={handleInputChange}
          />
          <Input
            label="Department"
            type="text"
            name="department"
            value={formData.department || ''}
            onChange={handleInputChange}
            placeholder="e.g., Cardiology"
          />
          <Input
            label="Years of Experience"
            type="number"
            name="yearsOfExperience"
            value={formData.yearsOfExperience?.toString() || ''}
            onChange={handleInputChange}
            min="0"
          />
          <Input
            label="Education"
            type="text"
            name="education"
            value={formData.education || ''}
            onChange={handleInputChange}
            placeholder="e.g., Bachelor of Science in Nursing"
          />
        </div>
        <div className="mt-6">
          <p><strong>Email:</strong> {nurse.user?.email}</p>
          <p><strong>Created At:</strong> {new Date(nurse.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}</p>
          <p><strong>Last Updated:</strong> {new Date(nurse.updatedAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}</p>
        </div>
        <div className="mt-6 flex space-x-4">
          <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600">
            Save Changes
          </Button>
          <Button
            onClick={() => setFormData({
              firstName: nurse.firstName,
              lastName: nurse.lastName,
              licenseNumber: nurse.licenseNumber,
              phoneNumber: nurse.phoneNumber,
              department: nurse.department,
              yearsOfExperience: nurse.yearsOfExperience,
              education: nurse.education,
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

export default NurseProfile;