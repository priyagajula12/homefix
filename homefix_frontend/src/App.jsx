import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ResetPasswordPage from './pages/ResestPasswordPage';
import ProviderListPage from './pages/ProviderListPage';
import BookingPage from './pages/BookingPage';
import CustomerBookingsPage from './pages/CustomerBookingPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import PublicProviderProfile from './pages/PublicProviderProfile';
import HowItWorksPage from './pages/HowItWorksPage';
function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/category/:categoryId/providers" element={<ProtectedRoute><ProviderListPage /></ProtectedRoute>} />
        <Route path="/book/:providerId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><CustomerBookingsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/provider/:providerId" element={<ProtectedRoute><PublicProviderProfile /></ProtectedRoute>}/>
        <Route path="/how-it-works" element={<HowItWorksPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;