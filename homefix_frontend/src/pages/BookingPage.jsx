import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Calendar, Clock, MapPin, Phone, ShieldCheck, Wrench } from 'lucide-react';

const BookingPage = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [subServices, setSubServices] = useState([]); // 🔴 Holds the filtered dropdown options
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [bookingData, setBookingData] = useState({
    scheduled_date: '',
    service_address: '', 
    customer_phone: '',
    sub_service: '', // 🔴 Added to state
    job_notes: ''        
  });

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // 1. Fetch the provider
        const response = await api.get('providers/');
        const foundProvider = response.data.find(p => p.id === parseInt(providerId));
        setProvider(foundProvider);

        // 2. Fetch categories to grab this provider's specific sub-services!
        if (foundProvider && foundProvider.category) {
          const catRes = await api.get('categories/');
          const providerCategory = catRes.data.find(c => c.id === foundProvider.category);
          if (providerCategory && providerCategory.sub_services) {
            setSubServices(providerCategory.sub_services);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching booking details", err);
        setLoading(false);
      }
    };
    fetchDetails();
  }, [providerId]);

  const handleChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const userId = localStorage.getItem('user_id');
      const customerRes = await api.get('customers/');
      
      let currentCustomer = customerRes.data.find(c => {
        const backendId = c.user?.id || c.user?.pk || c.user || c.user_id;
        return String(backendId) === String(userId);
      });

      if (!currentCustomer && customerRes.data.length > 0) {
        currentCustomer = customerRes.data[0];
      }

      if (!currentCustomer) {
        setError('Customer profile not found. Please complete your profile first.');
        setSubmitting(false);
        return;
      }

      // Format the sub_service ID safely (Django expects an integer or null)
      const finalSubServiceId = bookingData.sub_service ? parseInt(bookingData.sub_service) : null;

      await api.post('bookings/', {
        customer: currentCustomer.id, 
        provider: provider.id,
        sub_service: finalSubServiceId, // 🔴 Passing the selected ID to Django
        service_address: bookingData.service_address,
        scheduled_date: bookingData.scheduled_date,
        job_notes: bookingData.job_notes,
        status: 'PENDING'
      });

      navigate('/bookings');

    } catch (err) {
      console.error("Booking Error:", err.response?.data);
      setError("Failed to book service. Please ensure all fields are correct.");
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '60px 5%', color: 'var(--primary-brand)', fontWeight: '600' }}>Loading booking details...</div>;
  if (!provider) return <div style={{ padding: '60px 5%', color: '#dc2626' }}>Provider not found.</div>;

  return (
    <div style={{ padding: '50px 5%', minHeight: '85vh', background: 'var(--bg-beige)', display: 'flex', justifyContent: 'center' }}>
      
      <div style={{ width: '100%', maxWidth: '700px' }}>
        
        <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', color: 'var(--primary-brand)', fontWeight: '600', cursor: 'pointer', marginBottom: '20px', fontSize: '1rem' }}>
          ← Back
        </button>

        <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(139, 90, 43, 0.08)', border: '1px solid #F5E6D3' }}>
          
          <h2 style={{ color: 'var(--text-dark)', marginBottom: '10px', fontSize: '2rem' }}>Confirm Your Booking</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '30px' }}>
            You are booking a service with a verified professional. Select your exact requirement below.
          </p>

          <div style={{ background: '#FAF3E0', padding: '20px', borderRadius: '16px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-dark)', fontSize: '1.2rem' }}>{provider.full_name}</h3>
              <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.9rem' }}>{provider.category_name} • {provider.experience_years} Years Exp</p>
            </div>
            <div style={{ background: '#E8F5E9', color: '#2E8B57', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} /> Verified
            </div>
          </div>

          <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {error && <div style={{ color: '#dc2626', background: '#fee2e2', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }}>{error}</div>}

            {/* 🔴 THE NEW SUB-SERVICE DROPDOWN 🔴 */}
            <div>
              <label style={labelStyle}><Wrench size={16} /> What do you need help with?</label>
              <select 
                name="sub_service" 
                value={bookingData.sub_service} 
                onChange={handleChange} 
                style={inputStyle}
                required
              >
                <option value="" disabled>Select a specific task...</option>
                {subServices.length > 0 ? (
                  subServices.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} {sub.base_price ? `(Est. ₹${sub.base_price})` : ''}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>No specific tasks listed for this category</option>
                )}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={labelStyle}><Calendar size={16} /> Scheduled Date</label>
                <input 
                  type="date" 
                  name="scheduled_date" 
                  value={bookingData.scheduled_date} 
                  onChange={handleChange} 
                  required 
                  style={inputStyle} 
                />
              </div>

              <div style={{ flex: '1 1 200px' }}>
                <label style={labelStyle}><Phone size={16} /> Contact Phone</label>
                <input 
                  type="text" 
                  name="customer_phone" 
                  value={bookingData.customer_phone} 
                  onChange={handleChange} 
                  required 
                  placeholder="10-digit mobile number" 
                  style={inputStyle} 
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}><MapPin size={16} /> Service Address</label>
              <input 
                type="text" 
                name="service_address" 
                value={bookingData.service_address} 
                onChange={handleChange} 
                required 
                placeholder="Enter complete street address & apartment" 
                style={inputStyle} 
              />
            </div>

            <div>
              <label style={labelStyle}>Job Notes / Instructions</label>
              <textarea 
                name="job_notes" 
                value={bookingData.job_notes} 
                onChange={handleChange} 
                placeholder="Describe the issue in detail, or specify gate entry instructions..." 
                style={{ ...inputStyle, height: '80px', resize: 'vertical' }} 
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', marginTop: '10px', padding: '14px' }}>
              {submitting ? 'Confirming Booking...' : 'Confirm & Book Service'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

const labelStyle = { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-dark)' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit', background: '#fff' };

export default BookingPage;