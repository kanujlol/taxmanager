import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    try {
      await axios.post('forgot-password/', { email });
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error sending OTP');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-xl font-semibold text-center mb-4">Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded mb-4"
        />

        <button
          onClick={handleSendOtp}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded"
        >
          Send OTP
        </button>

        {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}
      </div>
      
    </div>
  );
}
