import { useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

export default function LoginRegister() {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === 'register') {
      if (formData.password !== formData.confirmPassword) {
        setMessage("Passwords do not match");
        return;
      }
      try {
        await axios.post('send-otp/', { email: formData.email });
        navigate('/verify-otp', { state: { ...formData, type: 'register' } });
      } catch {
        setMessage('Error sending OTP');
      }

    } else {
      try {
        const res = await axios.post('login/', {
          username: formData.username,
          password: formData.password
        });
        localStorage.setItem("accessToken", res.data.access);
        navigate("/tracking");
      } catch {
        setMessage("Login failed");
      }
    }
  };

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'login' ? 'register' : 'login'));
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white shadow-md rounded-lg p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-200 mb-1">Tax Manager</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
            required
          />

          {mode === 'register' && (
            <>
              <input
                type="text"
                name="full_name"
                placeholder="Full Name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
                required
              />
            </>
          )}

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
            required
          />

          {mode === 'register' && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-400"
              required
            />
          )}

          {mode === 'login' && (
            <div className="text-right">
              <span
                className="text-sm text-teal-600 hover:underline cursor-pointer"
                onClick={() => navigate('/forgot-password')}
              >
                Forgot password?
              </span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-teal-500 text-white py-2 rounded hover:bg-teal-600 transition font-medium"
          >
            {mode === 'login' ? 'Login' : 'Send OTP'}
          </button>
        </form>

        <div className="text-center mt-4 text-sm text-gray-600">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <span onClick={toggleMode} className="text-teal-600 font-semibold cursor-pointer hover:underline">
                Sign up
              </span>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <span onClick={toggleMode} className="text-teal-600 font-semibold cursor-pointer hover:underline">
                Log in
              </span>
            </>
          )}
        </div>

        {message && <p className="mt-4 text-center text-red-500 text-sm">{message}</p>}
      </div>
    </div>
  );

}
