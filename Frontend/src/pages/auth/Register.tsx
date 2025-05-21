import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaUserPlus } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import FormError from '../../components/common/FormError';
import Toast from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
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
      setShowToast({ message: 'Registration successful! Please complete your profile.', type: 'success' });
      setIsNavigating(true);
      setTimeout(() => navigate('/complete-profile'), 1000); // Redirect to complete profile
    } catch {
      setShowToast({ message: error || 'Registration failed', type: 'error' });
    }
  };

  const handleRoleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRole(e.target.value as 'doctor' | 'nurse' | 'patient');
  };

  if (isNavigating) {
    return <Loader />;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
      {/* Left Side: Image */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-6">
        <img
          src="../../../public/HMS.jpg"
          alt="Medical Illustration"
          className="w-full h-full object-cover rounded-lg shadow-lg"
        />
      </div>

      {/* Right Side: Register Card */}
      <div className="flex items-center justify-center w-full lg:w-1/2 p-6">
        <Card title="" className="w-full max-w-md animate-fade-in">
          
          <h2 className="text-2xl font-bold mb-6 text-center text-blue-600"><FaUserPlus className="inline text-2xl" /> Register</h2>
          <form onSubmit={handleSubmit}>
            <FormError error={error} />
            <div className="relative mb-6">
              <FaUser className="absolute left-3 top-9 text-gray-400 transition-colors duration-200 group-hover:text-blue-500" />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-md shadow-sm"
                required
              />
            </div>
            <div className="relative mb-6">
              <FaLock className="absolute left-3 top-9 text-gray-400 transition-colors duration-200 group-hover:text-blue-500" />
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
                error={passwordError}
                className="pl-10 pr-10 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-md shadow-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-blue-600 transition-colors duration-200 focus:outline-none"
              >
                {showPassword ? <FaEyeSlash className="w-5 h-5" /> : <FaEye className="w-5 h-5" />}
              </button>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="doctor"
                    checked={role === 'doctor'}
                    onChange={handleRoleChange}
                    className="hidden"
                    required
                  />
                  <span className={`w-5 h-5 mr-2 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${role === 'doctor' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                    {role === 'doctor' && <span className="w-3 h-3 bg-white rounded-full"></span>}
                  </span>
                  <span className="text-gray-700 font-medium">Doctor</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="nurse"
                    checked={role === 'nurse'}
                    onChange={handleRoleChange}
                    className="hidden"
                    required
                  />
                  <span className={`w-5 h-5 mr-2 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${role === 'nurse' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                    {role === 'nurse' && <span className="w-3 h-3 bg-white rounded-full"></span>}
                  </span>
                  <span className="text-gray-700 font-medium">Nurse</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="patient"
                    checked={role === 'patient'}
                    onChange={handleRoleChange}
                    className="hidden"
                    required
                  />
                  <span className={`w-5 h-5 mr-2 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${role === 'patient' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                    {role === 'patient' && <span className="w-3 h-3 bg-white rounded-full"></span>}
                  </span>
                  <span className="text-gray-700 font-medium">Patient</span>
                </label>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 rounded-md shadow-md transition-all duration-300"
            >
              Register
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium"
            >
              Login
            </a>
          </p>
        </Card>
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

export default Register;