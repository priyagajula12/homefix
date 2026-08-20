import { useState, useEffect } from 'react';
import { Calendar, MapPin, Wrench, Clock, CheckCircle, XCircle, Phone, Star, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const CustomerBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State for Reviews
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [activeJob, setActiveJob] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      const userId = localStorage.getItem('user_id');

      const customerRes = await api.get('customers/');
      let currentCustomer = customerRes.data.find(c => {
        const backendId = c.user?.id || c.user?.pk || c.user || c.user_id;
        return String(backendId) === String(userId);
      });

      if (!currentCustomer && customerRes.data.length > 0) currentCustomer = customerRes.data[0];

      if (!currentCustomer) {
        setError("Customer profile not found. Please complete your profile to view bookings.");
        setLoading(false);
        return;
      }

      const bookingsRes = await api.get('bookings/');
      const myHistory = bookingsRes.data.filter(b => b.customer === currentCustomer.id);
      
      myHistory.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setBookings(myHistory);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Failed to load your booking history.");
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'COMPLETED':
        return { bg: '#DBEAFE', text: '#1D4ED8', icon: <CheckCircle size={14} /> };
      case 'ACCEPTED':
        return { bg: '#D1FAE5', text: '#059669', icon: <CheckCircle size={14} /> };
      case 'REJECTED':
      case 'CANCELLED':
        return { bg: '#FEE2E2', text: '#DC2626', icon: <XCircle size={14} /> };
      default: // PENDING
        return { bg: '#FEF3C7', text: '#D97706', icon: <Clock size={14} /> };
    }
  };

  const openReviewModal = (job) => {
    setActiveJob(job);
    setRating(5);
    setComment('');
    setReviewModalOpen(true);
  };

  const handleCompleteJob = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 1. Mark the booking as COMPLETED
      await api.patch(`bookings/${activeJob.id}/`, { status: 'COMPLETED' });

      // 2. Submit the Review
      await api.post('reviews/', {
        booking: activeJob.id,
        rating: rating,
        comment: comment
      });

      // 3. Update the UI instantly without reloading the page
      setBookings(prevBookings => 
        prevBookings.map(b => b.id === activeJob.id ? { 
          ...b, 
          status: 'COMPLETED',
          review: { rating, comment } 
        } : b)
      );

      setReviewModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to complete the job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '60px 5%', color: 'var(--primary-brand)', fontWeight: '600' }}>Loading your bookings...</div>;

  return (
    <div style={{ padding: '50px 5%', minHeight: '85vh', background: 'var(--bg-beige)', position: 'relative' }}>
      
      <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ color: 'var(--text-dark)', margin: '0', fontSize: '2.5rem' }}>My Bookings</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1rem', marginTop: '10px' }}>Track and manage your requested services.</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ padding: '10px 20px' }}>
          Book a New Service
        </button>
      </div>

      {error ? (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '20px', borderRadius: '12px' }}>{error}</div>
      ) : bookings.length === 0 ? (
        <div style={{ background: 'white', padding: '50px', borderRadius: '20px', textAlign: 'center', border: '1px solid #F5E6D3' }}>
          <Wrench size={48} color="var(--primary-brand)" style={{ marginBottom: '20px', opacity: 0.5 }} />
          <h3 style={{ color: 'var(--text-dark)', marginBottom: '10px' }}>No bookings found</h3>
          <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>You haven't requested any services yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
          
          {bookings.map((job) => {
            const badge = getStatusBadge(job.status);
            
            return (
              <div key={job.id} style={{ 
                background: 'white', padding: '25px', borderRadius: '20px', 
                boxShadow: '0 10px 30px rgba(139, 90, 43, 0.05)', border: '1px solid #F5E6D3',
                display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative', overflow: 'hidden'
              }}>
                
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: badge.text }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingLeft: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', background: badge.bg, color: badge.text }}>
                    {badge.icon} {job.status}
                  </div>
                  <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>Job #{job.id}</span>
                </div>

                <div style={{ paddingLeft: '10px' }}>
                  {/* 🔴 THE CLICKABLE PROVIDER NAME 🔴 */}
                    <h3 
                    onClick={() => navigate(`/provider/${job.provider}`)}
                    title="View Provider Profile"
                    style={{ 
                        margin: '0 0 15px 0', 
                        fontSize: '1.2rem', 
                        color: 'var(--text-dark)', 
                        cursor: 'pointer',
                        display: 'inline-block',
                        transition: 'color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary-brand)'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-dark)'}
                    >
                    {job.provider_name || 'Service Provider'}
                    </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                      <Calendar size={16} color="var(--primary-brand)" /> 
                      <span style={{ fontWeight: '500' }}>Scheduled:</span> {job.scheduled_date}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                      <MapPin size={16} color="var(--primary-brand)" style={{ marginTop: '2px', flexShrink: 0 }} /> 
                      <span>{job.service_address}</span>
                    </div>
                  </div>

                  {/* ACTION BUTTONS & REVIEWS */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
                    
                    {/* Call Provider Button - Only if accepted or pending, and phone exists */}
                    {(job.status === 'ACCEPTED' || job.status === 'PENDING') && job.provider_phone && (
                      <a href={`tel:${job.provider_phone}`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px', background: '#F3F4F6', color: 'var(--text-dark)', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', transition: 'background 0.2s' }}>
                        <Phone size={16} color="var(--primary-brand)"/> Call Provider: {job.provider_phone}
                      </a>
                    )}

                    {/* Mark Completed Button */}
                    {job.status === 'ACCEPTED' && (
                      <button 
                        onClick={() => openReviewModal(job)}
                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px', background: 'var(--primary-brand)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}
                      >
                        <CheckCircle size={16} /> Mark as Completed
                      </button>
                    )}

                    {/* Show Review if completed */}
                    {job.status === 'COMPLETED' && job.review && (
                      <div style={{ background: '#FAF3E0', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} size={14} fill={star <= job.review.rating ? "#F59E0B" : "none"} color={star <= job.review.rating ? "#F59E0B" : "#D1D5DB"} />
                          ))}
                        </div>
                        {job.review.comment && <span style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontStyle: 'italic' }}>"{job.review.comment}"</span>}
                      </div>
                    )}

                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* 🔴 REVIEW MODAL OVERLAY 🔴 */}
      {reviewModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative' }}>
            
            <button onClick={() => setReviewModalOpen(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}>
              <X size={24} />
            </button>

            <h2 style={{ margin: '0 0 20px 0', color: 'var(--text-dark)', fontSize: '1.5rem' }}>Rate Service</h2>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '20px' }}>
              How was your experience with <strong>{activeJob?.provider_name}</strong>?
            </p>

            <form onSubmit={handleCompleteJob} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Interactive Stars */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star} 
                    size={32} 
                    fill={star <= rating ? "#F59E0B" : "none"} 
                    color={star <= rating ? "#F59E0B" : "#D1D5DB"}
                    onClick={() => setRating(star)}
                    style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                ))}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-dark)' }}>Leave a comment (Optional)</label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="3"
                  placeholder="They did a great job fixing the pipe..."
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <button type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: '12px', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {submitting ? 'Saving...' : 'Submit & Complete'}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerBookingsPage;