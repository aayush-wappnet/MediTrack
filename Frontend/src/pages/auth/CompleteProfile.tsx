import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import AuthLayout from '../../layouts/AuthLayout';
import { useAuth } from '../../hooks/useAuth';

interface FormData {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  phoneNumber?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: string;
  chronicConditions?: string;
  specialization?: string;
  licenseNumber?: string;
  yearsOfExperience?: string;
  education?: string;
  bio?: string;
  department?: string;
}

function CompleteProfile() {
  const { user, completeProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({});
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user?.role || user.role === 'admin') {
    navigate('/login');
    return null;
  }

  const role = user.role as 'doctor' | 'nurse' | 'patient';

  const patientFields = [
    { name: 'firstName', label: 'First Name', type: 'text' },
    { name: 'lastName', label: 'Last Name', type: 'text' },
    { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
    { name: 'gender', label: 'Gender', type: 'text' },
    { name: 'bloodType', label: 'Blood Type', type: 'text' },
    { name: 'phoneNumber', label: 'Phone Number', type: 'tel' },
    { name: 'address', label: 'Address', type: 'text' },
    { name: 'emergencyContactName', label: 'Emergency Contact Name', type: 'text' },
    { name: 'emergencyContactPhone', label: 'Emergency Contact Phone', type: 'tel' },
    { name: 'allergies', label: 'Allergies', type: 'text' },
    { name: 'chronicConditions', label: 'Chronic Conditions', type: 'text' },
  ];

  const doctorFields = [
    { name: 'firstName', label: 'First Name', type: 'text' },
    { name: 'lastName', label: 'Last Name', type: 'text' },
    { name: 'specialization', label: 'Specialization', type: 'text' },
    { name: 'licenseNumber', label: 'License Number', type: 'text' },
    { name: 'phoneNumber', label: 'Phone Number', type: 'tel' },
    { name: 'yearsOfExperience', label: 'Years of Experience', type: 'number' },
    { name: 'education', label: 'Education', type: 'text' },
    { name: 'bio', label: 'Biography', type: 'textarea' },
  ];

  const nurseFields = [
    { name: 'firstName', label: 'First Name', type: 'text' },
    { name: 'lastName', label: 'Last Name', type: 'text' },
    { name: 'licenseNumber', label: 'License Number', type: 'text' },
    { name: 'phoneNumber', label: 'Phone Number', type: 'tel' },
    { name: 'department', label: 'Department', type: 'text' },
    { name: 'yearsOfExperience', label: 'Years of Experience', type: 'number' },
    { name: 'education', label: 'Education', type: 'text' },
  ];

  const fields = role === 'doctor' ? doctorFields : role === 'nurse' ? nurseFields : patientFields;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await completeProfile(role, {
        userId: user.id,
        ...formData,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : undefined,
      });
      setShowToast({ message: 'Profile completed successfully!', type: 'success' });
      setTimeout(() => navigate('/login'), 1000); // Redirect to login
    } catch (error: any) {
      setShowToast({ message: error.message || 'Failed to complete profile', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return <Loader />;
  }

  return (
    <AuthLayout>
      <Card title={`Complete Your ${role.charAt(0).toUpperCase() + role.slice(1)} Profile`} className="w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div key={field.name} className="mb-4">
              {field.type === 'textarea' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <textarea
                    value={formData[field.name as keyof typeof formData] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name as keyof typeof formData]: e.target.value })}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                    rows={4}
                  />
                </div>
              ) : (
                <Input
                  label={field.label}
                  type={field.type}
                  value={formData[field.name as keyof typeof formData] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.name as keyof typeof formData]: e.target.value })}
                />
              )}
            </div>
          ))}
          <Button type="submit" className="w-full">
            Submit Profile
          </Button>
        </form>
      </Card>
      {showToast && (
        <Toast
          message={showToast.message}
          type={showToast.type}
          onClose={() => setShowToast(null)}
        />
      )}
    </AuthLayout>
  );
}

export default CompleteProfile;