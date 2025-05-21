import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSignInAlt } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import FormError from '../../components/common/FormError';
import Toast from '../../components/common/Toast';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const { login, error } = useAuth();
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
    if (!validatePassword(password)) {
      setShowToast({ message: 'Please fix form errors', type: 'error' });
      return;
    }

    const success = await login({ email, password });
    if (success) {
      setShowToast({ message: 'Login successful!', type: 'success' });
      setIsNavigating(true);
      setTimeout(() => navigate('/'), 1000); // Redirect to dashboard
    } else {
      setShowToast({ message: error || 'Login failed', type: 'error' });
    }
  };

  if (isNavigating) {
    return <Loader />;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
      {/* Left Side: Login Card */}
      <div className="flex items-center justify-center w-full lg:w-1/2 p-6">
        
        <Card title="" className="w-full max-w-md animate-fade-in">
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-600"><FaSignInAlt className="inline text-2xl" /> Login</h2>
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
                  // validatePassword(e.target.value);
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
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 rounded-md shadow-md transition-all duration-300"
            >
              Login
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <a
              href="/register"
              className="text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium"
            >
              Register
            </a>
          </p>
        </Card>
      </div>

      {/* Right Side: Image */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-6">
        <img
          src="../../../public/HMS.jpg"
          alt="Medical Illustration"
          className="w-full h-full object-cover rounded-lg shadow-lg"
        />
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

export default Login;