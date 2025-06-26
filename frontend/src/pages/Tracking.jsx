import { useEffect, useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

export default function TrackingPage() {
  const [directTax, setDirectTax] = useState({});
  const [indirectTax, setIndirectTax] = useState({});
  const accessToken = localStorage.getItem('accessToken');
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('tracking/', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setDirectTax(response.data.direct_tax);
        setIndirectTax(response.data.indirect_tax);
      } catch (error) {
        console.error('Error fetching tax data:', error);
      }
    };

    fetchData();
  }, []);

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all your tax data?')) {
      try {
        await axios.post('clear-data/', {}, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setMessage('Tax data cleared successfully!');

        const response = await axios.get('tracking/', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setDirectTax(response.data.direct_tax);
        setIndirectTax(response.data.indirect_tax);

      } catch (err) {
        alert('Error clearing tax data: ' + (err.response?.data?.error || 'Unknown error'));
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setMessage("🔓 You have been logged out successfully.");
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-sky-50 to-teal-100 px-4 py-10 font-sans">
      <div className="max-w-6xl mx-auto shadow-2xl rounded-2xl bg-white p-10">
        {/* Header and logout */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-bold text-teal-700 tracking-tight">📊 Tax Tracker</h1>
          <button
            onClick={handleLogout}
            className="bg-teal-500 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition"
          >
            Log Out
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="text-center text-green-700 font-medium mb-6">
            {message}
          </div>
        )}

        {/* Tax Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Direct Tax */}
          <div className="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-teal-600 mb-4">Direct Tax</h2>
            <div className="space-y-3 text-gray-800 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Salary</span>
                <span>₹ {directTax.salary }</span>
                <span className="font-medium">Salary Tax</span>
                <span>₹ {directTax.salary_tax }</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Property</span>
                <span>₹ {directTax.property }</span>
                <span className="font-medium">Property Tax</span>
                <span>₹ {directTax.property_tax}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Stocks</span>
                <span>₹ {directTax.stocks }</span>
                <span className="font-medium">Stocks Tax</span>
                <span>₹ {directTax.stocks_tax }</span>
              </div>
            </div>
          </div>

          {/* Indirect Tax */}
          <div className="bg-gray-50 p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-teal-600 mb-4">Indirect Tax</h2>
            <div className="space-y-3 text-gray-800 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Municipal</span>
                <span>₹ {indirectTax.municipal}</span>
                <span className="font-medium">Municipal Tax</span>
                <span>₹ {indirectTax.municipal_taxes }</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Expenses</span>
                <span>₹ {indirectTax.expenses }</span>
                <span className="font-medium">GST</span>
                <span>₹ {indirectTax.gst }</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6 mt-12">
          <button
            onClick={() => navigate('/add-data')}
            className="bg-teal-500 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition"
          >
            Add Data
          </button>
          <button
            onClick={handleClearData}
            className="bg-teal-500 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg shadow transition"
          >
            Clear Data
          </button>
        </div>
      </div>
    </div>
  );
}
