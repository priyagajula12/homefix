import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  
  // States for Forgot Password flow
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('login/', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user_id', response.data.user_id);
      localStorage.setItem('is_customer', response.data.is_customer);
      localStorage.setItem('is_provider', response.data.is_provider);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Invalid email or password. Please try again.');
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotMessage('');
    try {
      const res = await api.post('password-reset/', { email: forgotEmail });
      setForgotMessage(res.data.message);
    } catch (err) {
      console.error(err);
      setForgotMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      
      <div style={{ background: 'white', padding: '40px', borderRadius: '20px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(139, 90, 43, 0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '10px', color: 'var(--text-dark)' }}>Welcome Back</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '30px', fontSize: '0.9rem' }}>
          Log in to your HomeFix account.
        </p>

        {!showForgotModal ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {error && <div style={{ color: '#dc2626', background: '#fee2e2', padding: '10px', borderRadius: '8px', fontSize: '0.9rem' }}>{error}</div>}

            <div>
              <label style={labelStyle}>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} placeholder="Enter your email" />
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required style={inputStyle} placeholder="Enter your password" />
              
              {/* Forgot Password Link */}
              <div style={{ textAlign: 'right', marginTop: '8px' }}>
                <span onClick={() => setShowForgotModal(true)} style={{ color: 'var(--primary-brand)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' }}>
                  Forgot password?
                </span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              Log In
            </button>
          </form>
        ) : (
          // Forgot Password Form View
          <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', margin: 0 }}>
              Enter your account email and we will generate a reset link for you.
            </p>

            {forgotMessage && <div style={{ color: 'var(--primary-brand)', background: '#F5E6D3', padding: '10px', borderRadius: '8px', fontSize: '0.85rem' }}>{forgotMessage}</div>}

            <div>
              <label style={labelStyle}>Your Email</label>
              <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required style={inputStyle} placeholder="name@example.com" />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Send Reset Link
            </button>

            <button type="button" onClick={() => setShowForgotModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' }}>
              Back to Login
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-light)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary-brand)', fontWeight: '600', textDecoration: 'none' }}>Sign Up</Link>
        </p>
      </div>

    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '0.9rem' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' };

export default LoginPage;