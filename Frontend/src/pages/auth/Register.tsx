import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaUserTag, FaEye, FaEyeSlash } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import FormError from '../../components/common/FormError';
import Toast from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import AuthLayout from '../../layouts/AuthLayout';
import { useAuth } from '../../hooks/useAuth';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'' | 'doctor' | 'nurse' | 'patient'>('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const roleOptions = [
    { value: 'doctor', label: 'Doctor' },
    { value: 'nurse', label: 'Nurse' },
    { value: 'patient', label: 'Patient' },
  ];

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!role || !validatePassword(password)) {
      setShowToast({ message: 'Please fix form errors', type: 'error' });
      return;
    }

    try {
      await register({ email, password, role });
      setShowToast({ message: 'Registration successful! Please login.', type: 'success' });
      setIsNavigating(true);
      setTimeout(() => navigate('/login'), 1000); // Redirect to login
    } catch {
      setShowToast({ message: error || 'Registration failed', type: 'error' });
    }
  };

  if (isNavigating) {
    return <Loader />;
  }

  return (
    <AuthLayout>
      <Card title="Register" className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <FormError error={error} />
          <div className="relative mb-4">
            <FaUser className="absolute left-3 top-9 text-gray-400" />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
          <div className="relative mb-4">
            <FaLock className="absolute left-3 top-9 text-gray-400" />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              error={passwordError}
              className="pl-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <div className="relative mb-4">
            <FaUserTag className="absolute left-3 top-9 text-gray-400" />
            <Select
              label="Role"
              options={roleOptions}
              value={role}
              onChange={(e) => setRole(e.target.value as 'doctor' | 'nurse' | 'patient')}
              className="pl-10"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Register
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>
        </p>
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

export default Register;