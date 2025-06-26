import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginRegister from './pages/LoginRegister';
import TrackingPage from './pages/Tracking';
import AddDataPage from './pages/AddData';
import SendOtp from './pages/SendOtp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginRegister />} />
        <Route path="/tracking" element={<TrackingPage />} />
        <Route path="/add-data" element={<AddDataPage />} />
        <Route path="/verify-otp" element={<SendOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
