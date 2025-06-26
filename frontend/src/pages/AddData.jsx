import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from '../api/axiosInstance';

export default function AddDataPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    salary: "",
    property: "",
    stocks: "",
    municipal: "",
    expenses: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const endpoint = 'add-data/';
      const payload = {
        ...formData,
        salary: parseFloat(formData.salary) || 0,
        property: parseFloat(formData.property) || 0,
        stocks: parseFloat(formData.stocks) || 0,
        municipal: parseFloat(formData.municipal) || 0,
        expenses: parseFloat(formData.expenses) || 0,
      };
      const accessToken = localStorage.getItem('accessToken');

      await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setMessage("Data added successfully!");
      setError("");
      setTimeout(() => {
        navigate("/tracking");
      }, 1800);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
      setMessage("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setMessage("🔓 You have been logged out.");
    setTimeout(() => {
      navigate('/');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-sky-50 to-teal-100 flex flex-col items-center p-6">
      {/* Logout button top right */}
      <div className="w-full max-w-4xl flex justify-end mb-8">
        <button
          onClick={handleLogout}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition"
        >
          Log Out
        </button>
      </div>
      {/* Messages */}
        {message && (
          <p className="mt-6 text-center text-green-600 font-medium">{message}</p>
        )}
        {error && (
          <p className="mt-6 text-center text-red-600 font-medium">{error}</p>
        )}

      {/* Form container */}
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-10">
        <h2 className="text-3xl font-bold text-teal-700 mb-8 text-center tracking-tight">
          Add Income & Expenses
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {["salary", "property", "stocks", "municipal", "expenses"].map((field) => (
            <div key={field} className="flex flex-col">
              <label
                htmlFor={field}
                className="mb-2 font-semibold text-gray-700 capitalize"
              >
                {field}
              </label>
              <input
                type="number"
                id={field}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                placeholder={`Enter ${field} amount`}
                className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
                min="0"
                step="1"
              />
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl shadow-lg transition"
          >
            Submit
          </button>
        </form>

        
      </div>
      
    </div>
  );
}
