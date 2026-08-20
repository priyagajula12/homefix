import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState({ error: '', success: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ error: '', success: '' });

    try {
      await api.post('password-reset-confirm/', { uid, token, new_password: newPassword });
      setStatus({ success: 'Password reset successful! Redirecting to login...', error: '' });
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      console.error(err);
      setStatus({ error: 'Invalid or expired reset link.', success: '' });
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '20px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(139, 90, 43, 0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '10px', color: 'var(--text-dark)' }}>Reset Password</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '30px', fontSize: '0.9rem' }}>
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {status.error && <div style={{ color: '#dc2626', background: '#fee2e2', padding: '10px', borderRadius: '8px', fontSize: '0.9rem' }}>{status.error}</div>}
          {status.success && <div style={{ color: '#16a34a', background: '#dcfce7', padding: '10px', borderRadius: '8px', fontSize: '0.9rem' }}>{status.success}</div>}

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '0.9rem' }}>New Password</label>
            <input 
              type="password" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', boxSizing: 'border-box', outline: 'none' }} 
              placeholder="Enter new password"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Update Password
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-light)' }}>
          Remember your password? <Link to="/login" style={{ color: 'var(--primary-brand)', fontWeight: '600', textDecoration: 'none' }}>Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;