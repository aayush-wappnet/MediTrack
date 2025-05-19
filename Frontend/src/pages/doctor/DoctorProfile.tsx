import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { useRoleGuard } from '../../hooks/useRoleGuard';
import { getDoctorProfile, updateDoctorProfile } from '../../api/endpoints/doctors';
import type { Doctor } from '../../api/types/doctors.types';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';
import { FaUser } from 'react-icons/fa';

function DoctorProfile() {
  const { isAllowed } = useRoleGuard(['doctor']);
  const { user } = useAuth();
  const userId = user?.id;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState<Partial<Doctor>>({});
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAllowed && userId) {
      fetchDoctorProfile();
    }
  }, [isAllowed, userId]);

  const fetchDoctorProfile = async () => {
    try {
      setIsLoading(true);
      const doctorData = await getDoctorProfile();
      setDoctor(doctorData);
      setFormData({
        firstName: doctorData.firstName,
        lastName: doctorData.lastName,
        specialization: doctorData.specialization,
        licenseNumber: doctorData.licenseNumber,
        phoneNumber: doctorData.phoneNumber,
        yearsOfExperience: doctorData.yearsOfExperience,
        education: doctorData.education,
        bio: doctorData.bio,
      });
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to fetch doctor profile', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'yearsOfExperience' ? parseInt(value) : value });
  };

  const handleSave = async () => {
    try {
      if (!userId) {
        throw new Error('User ID is not available. Please ensure you are logged in.');
      }

      const updatedDoctorData = {
        id: doctor?.id,
        userId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        specialization: formData.specialization,
        licenseNumber: formData.licenseNumber,
        phoneNumber: formData.phoneNumber,
        yearsOfExperience: formData.yearsOfExperience,
        education: formData.education,
        bio: formData.bio,
      };

      const updatedDoctor = await updateDoctorProfile(updatedDoctorData as Doctor);
      setDoctor(updatedDoctor);
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

  if (!doctor) {
    return <div>No doctor data available.</div>;
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
            label="Specialization"
            type="text"
            name="specialization"
            value={formData.specialization || ''}
            onChange={handleInputChange}
            placeholder="e.g., Cardiology"
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
            placeholder="e.g., MD, Harvard Medical School"
          />
          <div className="col-span-1 md:col-span-2 space-y-2">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio || ''}
              onChange={handleInputChange}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="mt-6">
          <p><strong>Email:</strong> {doctor.user.email}</p>
          <p><strong>Created At:</strong> {new Date(doctor.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}</p>
          <p><strong>Last Updated:</strong> {new Date(doctor.updatedAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })}</p>
        </div>
        <div className="mt-6 flex space-x-4">
          <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600">
            Save Changes
          </Button>
          <Button
            onClick={() => setFormData({
              firstName: doctor.firstName,
              lastName: doctor.lastName,
              specialization: doctor.specialization,
              licenseNumber: doctor.licenseNumber,
              phoneNumber: doctor.phoneNumber,
              yearsOfExperience: doctor.yearsOfExperience,
              education: doctor.education,
              bio: doctor.bio,
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

export default DoctorProfile;