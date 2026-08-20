import { useState, useEffect } from 'react';
import { Calendar, MapPin, User, FileText, CheckCircle, XCircle, Wallet, TrendingUp, Star, ToggleLeft, ToggleRight, Clock } from 'lucide-react';
import api from '../api';

const ProviderDashboard = () => {
  const [provider, setProvider] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWorkspace();
  }, []);

  const fetchWorkspace = async () => {
    try {
      const userId = localStorage.getItem('user_id');

      // 1. Fetch Provider Profile
      const providerRes = await api.get('providers/');
      const currentProvider = providerRes.data.find(p => {
        const backendId = p.user?.id || p.user?.pk || p.user || p.user_id;
        return String(backendId) === String(userId);
      });

      if (!currentProvider) {
        setError("Provider profile not found.");
        setLoading(false);
        return;
      }
      setProvider(currentProvider);

      // 2. Fetch Bookings
      const bookingsRes = await api.get('bookings/');
      const myJobs = bookingsRes.data.filter(b => b.provider === currentProvider.id);
      
      // Sort newest first
      myJobs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setBookings(myJobs);
      setLoading(false);

    } catch (err) {
      console.error(err);
      setError("Failed to load your workspace.");
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await api.patch(`bookings/${bookingId}/`, { status: newStatus });
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    } catch (err) {
      alert("Could not update the booking status. Try again.");
    }
  };

  const toggleAvailability = async () => {
    try {
      const newStatus = !provider.is_available;
      await api.patch(`providers/${provider.id}/`, { is_available: newStatus });
      setProvider({ ...provider, is_available: newStatus });
    } catch (err) {
      alert("Failed to update availability.");
    }
  };

  if (loading) return <div style={{ padding: '60px 5%', color: 'var(--primary-brand)', fontWeight: '600' }}>Loading your workspace...</div>;

  // --- STATS CALCULATION ---
  const completedJobs = bookings.filter(b => b.status === 'COMPLETED');
  const totalEarnings = completedJobs.reduce((sum, job) => sum + parseFloat(job.sub_service_price || 0), 0);
  const reviews = completedJobs.filter(b => b.review);
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, job) => sum + job.review.rating, 0) / reviews.length).toFixed(1) : 0;

  // --- 4 SECTIONS ORGANIZATION ---
  const pending = bookings.filter(b => b.status === 'PENDING');
  const accepted = bookings.filter(b => b.status === 'ACCEPTED');
  const completed = completedJobs;
  const rejected = bookings.filter(b => b.status === 'REJECTED' || b.status === 'CANCELLED');

  const SectionHeader = ({ title, count, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '40px 0 20px 0', borderBottom: `2px solid ${color}`, paddingBottom: '10px' }}>
      <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-dark)' }}>{title}</h2>
      <span style={{ background: color, color: 'white', padding: '2px 10px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 'bold' }}>{count}</span>
    </div>
  );

  return (
    <div style={{ padding: '50px 5%', minHeight: '85vh', background: '#FAFAFA' }}>
      
      {/* HEADER & TOGGLE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: 'var(--text-dark)', margin: '0', fontSize: '2.5rem' }}>Workspace</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1rem', marginTop: '10px' }}>Manage jobs and track your earnings.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'white', padding: '15px 20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <div>
            <span style={{ display: 'block', fontWeight: 'bold', color: 'var(--text-dark)' }}>Visibility Status</span>
            <span style={{ fontSize: '0.85rem', color: provider?.is_available ? '#10B981' : '#9CA3AF' }}>
              {provider?.is_available ? 'Available for new jobs today' : 'Currently hidden from search'}
            </span>
          </div>
          <div onClick={toggleAvailability} style={{ cursor: 'pointer', color: provider?.is_available ? '#10B981' : '#D1D5DB' }}>
            {provider?.is_available ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
          </div>
        </div>
      </div>

      {/* STATS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        
        <div style={{ background: 'white', padding: '25px', borderRadius: '20px', border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '60px', height: '60px', background: '#ECFDF5', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}><Wallet size={28} /></div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.9rem' }}>Total Earnings</p>
            <h2 style={{ margin: '5px 0 0 0', color: 'var(--text-dark)', fontSize: '1.8rem' }}>₹{totalEarnings.toLocaleString()}</h2>
          </div>
        </div>

        <div style={{ background: 'white', padding: '25px', borderRadius: '20px', border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '60px', height: '60px', background: '#EFF6FF', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6' }}><TrendingUp size={28} /></div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.9rem' }}>Jobs Completed</p>
            <h2 style={{ margin: '5px 0 0 0', color: 'var(--text-dark)', fontSize: '1.8rem' }}>{completedJobs.length}</h2>
          </div>
        </div>

        <div style={{ background: 'white', padding: '25px', borderRadius: '20px', border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '60px', height: '60px', background: '#FFFBEB', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B' }}><Star size={28} /></div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.9rem' }}>Customer Rating</p>
            <h2 style={{ margin: '5px 0 0 0', color: 'var(--text-dark)', fontSize: '1.8rem' }}>{avgRating > 0 ? avgRating : '-'} / 5.0</h2>
          </div>
        </div>
      </div>

      {/* JOB LISTS */}
      {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '20px', borderRadius: '12px' }}>{error}</div>}

      <SectionHeader title="Pending Requests" count={pending.length} color="#F59E0B" />
      <JobGrid jobs={pending} handleStatusUpdate={handleStatusUpdate} />

      <SectionHeader title="Accepted & Scheduled" count={accepted.length} color="#3B82F6" />
      <JobGrid jobs={accepted} handleStatusUpdate={handleStatusUpdate} />

      <SectionHeader title="Completed Jobs" count={completed.length} color="#10B981" />
      <JobGrid jobs={completed} handleStatusUpdate={handleStatusUpdate} />

      <SectionHeader title="Rejected / Cancelled" count={rejected.length} color="#EF4444" />
      <JobGrid jobs={rejected} handleStatusUpdate={handleStatusUpdate} />

    </div>
  );
};

// Reusable Job Card Component
const JobGrid = ({ jobs, handleStatusUpdate }) => {
  if (jobs.length === 0) return <p style={{ color: '#9CA3AF', fontStyle: 'italic' }}>No jobs in this category.</p>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
      {jobs.map((job) => (
        <div key={job.id} style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #F3F4F6', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--primary-brand)', fontWeight: '700', fontSize: '1.1rem' }}>
              {job.sub_service_name || 'General Service'}
            </span>
            {job.sub_service_price && <span style={{ fontWeight: 'bold', color: '#10B981' }}>₹{job.sub_service_price}</span>}
          </div>

          <div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} color="var(--text-light)" /> {job.customer_name || 'Customer'}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                <MapPin size={16} style={{ marginTop: '2px', flexShrink: 0 }} /> <span>{job.service_address}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                <Calendar size={16} /> <span>{job.scheduled_date}</span>
              </div>
              {job.job_notes && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-light)', fontSize: '0.9rem', background: '#F9FAFB', padding: '10px', borderRadius: '8px', marginTop: '5px' }}>
                  <FileText size={16} style={{ flexShrink: 0 }} /> <span style={{ fontStyle: 'italic' }}>"{job.job_notes}"</span>
                </div>
              )}
            </div>
          </div>

          {job.status === 'PENDING' && (
            <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '15px' }}>
              <button onClick={() => handleStatusUpdate(job.id, 'ACCEPTED')} style={{ flex: 1, padding: '10px', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '6px' }}><CheckCircle size={16} /> Accept</button>
              <button onClick={() => handleStatusUpdate(job.id, 'REJECTED')} style={{ flex: 1, padding: '10px', background: 'transparent', color: '#EF4444', border: '1px solid #EF4444', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '6px' }}><XCircle size={16} /> Reject</button>
            </div>
          )}
          
          {job.status === 'COMPLETED' && job.review && (
            <div style={{ marginTop: 'auto', background: '#FFFBEB', padding: '12px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>
                {[1, 2, 3, 4, 5].map(star => <Star key={star} size={14} fill={star <= job.review.rating ? "#F59E0B" : "none"} color={star <= job.review.rating ? "#F59E0B" : "#D1D5DB"} />)}
              </div>
              {job.review.comment && <span style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontStyle: 'italic' }}>"{job.review.comment}"</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProviderDashboard;