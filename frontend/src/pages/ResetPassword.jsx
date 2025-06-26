import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';

export default function ResetPassword() {
  const location = useLocation();
  const email = location.state?.email;
  const navigate = useNavigate();

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      await axios.post('reset-password/', {
        email,
        otp,
        new_password: newPassword
      });
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-100 to-white px-4 py-8">
    <div className="bg-white shadow-2xl rounded-xl px-8 py-10 w-full max-w-md">
      <h2 className="text-2xl font-bold text-center text-teal-600 mb-6">Reset Password</h2>

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 mb-4"
      />

      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 mb-4"
      />

      <input
        type="password"
        placeholder="Re-enter Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 mb-6"
      />

      <button
        onClick={handleReset}
        className="w-full bg-teal-500 hover:bg-teal-600 text-white text-lg font-semibold py-3 rounded-lg transition duration-300"
      >
        Reset Password
      </button>

      {message && (
        <p className={`mt-4 text-center text-sm ${message.toLowerCase().includes('successful') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  </div>

  );
}
