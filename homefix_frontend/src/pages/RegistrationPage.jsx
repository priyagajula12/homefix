import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../api';

const RegistrationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [role, setRole] = useState('customer');
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState({ error: '', success: '', loading: false });

  const [formData, setFormData] = useState({
    email: '', password: '', full_name: '', phone_number: '',
    address: '', 
    category: '', experience_years: '', service_areas: '',
    available_days: 'Mon-Fri', available_timing: '9:00 AM - 5:00 PM'
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlRole = queryParams.get('role');
    if (urlRole === 'provider' || urlRole === 'customer') setRole(urlRole);
  }, [location]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('categories/');
        setCategories(response.data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ error: '', success: '', loading: true });

    try {
      // 1. Create the User Account
      const userRes = await api.post('register/', {
        email: formData.email,
        password: formData.password,
        is_customer: role === 'customer',
        is_provider: role === 'provider'
      });
      const newUserId = userRes.data.id;

      // 2. Create the Specific Profile
      if (role === 'provider') {
        await api.post('providers/', {
          user_id: newUserId,
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          category: formData.category,
          experience_years: formData.experience_years,
          service_areas: formData.service_areas,
          available_days: formData.available_days,
          available_timing: formData.available_timing,
          is_approved: false
        });
      } else {
        await api.post('customers/', {
          user_id: newUserId,
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          address: formData.address
        });
      }

      // 3. Show Success & Redirect to Login Page
      setStatus({ success: 'Account created! Redirecting to Login...', error: '', loading: false });
      
      setTimeout(() => navigate('/login'), 2000);
      
    } catch (error) {
      console.error(error);
      const errorData = error.response?.data;
      let errorMessage = 'Registration failed. Please check your inputs.';
      if (errorData) errorMessage = Object.values(errorData).flat().join(' ');
      
      setStatus({ error: errorMessage, success: '', loading: false });
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '40px 5%' }}>
      
      <div style={{ background: 'white', padding: '40px', borderRadius: '20px', width: '100%', maxWidth: '600px', boxShadow: '0 10px 30px rgba(139, 90, 43, 0.1)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '10px', color: 'var(--text-dark)' }}>Create an Account</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '30px', fontSize: '0.9rem' }}>
          Join HomeFix and get started today.
        </p>

        <div style={{ display: 'flex', background: '#F5E6D3', borderRadius: '50px', padding: '5px', marginBottom: '30px' }}>
          <button 
            type="button" onClick={() => setRole('customer')}
            style={{ 
              flex: 1, padding: '10px', borderRadius: '50px', border: 'none', 
              background: role === 'customer' ? 'var(--primary-brand)' : 'transparent', 
              color: role === 'customer' ? 'white' : 'var(--text-dark)', 
              fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease' 
            }}>
            Customer
          </button>
          <button 
            type="button" onClick={() => setRole('provider')}
            style={{ 
              flex: 1, padding: '10px', borderRadius: '50px', border: 'none', 
              background: role === 'provider' ? 'var(--primary-brand)' : 'transparent', 
              color: role === 'provider' ? 'white' : 'var(--text-dark)', 
              fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease' 
            }}>
            Service Provider
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {status.error && <div style={{ color: '#dc2626', background: '#fee2e2', padding: '10px', borderRadius: '8px' }}>{status.error}</div>}
          {status.success && <div style={{ color: '#16a34a', background: '#dcfce7', padding: '10px', borderRadius: '8px' }}>{status.success}</div>}

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required style={inputStyle} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Full Name</label>
              <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Phone Number</label>
              <input type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} required style={inputStyle} />
            </div>
          </div>

          {role === 'customer' && (
            <div>
              <label style={labelStyle}>Complete Home Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} required style={{...inputStyle, height: '80px', resize: 'vertical'}} placeholder="Street, Apt, Landmark" />
            </div>
          )}

          {role === 'provider' && (
            <>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Primary Trade</label>
                  <select name="category" value={formData.category} onChange={handleChange} required style={inputStyle}>
                    <option value="">Select a category...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Years of Experience</label>
                  <input type="number" name="experience_years" value={formData.experience_years} onChange={handleChange} required style={inputStyle} min="0" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Service Areas</label>
                <input type="text" name="service_areas" value={formData.service_areas} onChange={handleChange} required style={inputStyle} placeholder="E.g. Mumbai, Thane" />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" disabled={status.loading} style={{ width: '100%', marginTop: '10px' }}>
            {status.loading ? 'Creating Account...' : `Register as ${role === 'customer' ? 'Customer' : 'Provider'}`}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: 'var(--text-light)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary-brand)', fontWeight: '600', textDecoration: 'none' }}>Log In</Link>
        </p>

      </div>
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '0.9rem' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' };

export default RegistrationPage;