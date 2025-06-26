import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';

export default function SendOtp() {
  const [otp, setOtp] = useState( '');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state;

  const handleVerify = async () => {
    try {
      const { email, type } = formData;

      await axios.post('verify-otp/', { email, otp });

      if (type === 'register') {
        const response = await axios.post('register/', formData);
        localStorage.setItem("accessToken", response.data.access);
        setMessage('Registration successful!');
        navigate('/tracking');
      } else if (type === 'forgot') {
        navigate('/reset-password', { state: { email } });
      } else {
        setMessage('Unknown operation type.');
      }

    } catch (err) {
      console.error('Error verifying OTP:', err);
      setMessage(err.response?.data?.error || 'OTP verification failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
    <div className="bg-white shadow-xl rounded-lg px-8 py-10 w-full max-w-sm">
      <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">Verify OTP</h2>

      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter OTP"
        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 mb-6"
      />

      <button
        onClick={handleVerify}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold py-3 rounded-lg transition"
      >
        Verify OTP
      </button>

      {message && <p className="text-red-600 text-sm text-center mt-4">{message}</p>}
    </div>
  </div>

  );
}
