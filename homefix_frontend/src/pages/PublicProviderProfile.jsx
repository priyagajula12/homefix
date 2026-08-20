import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Clock, Award, CheckCircle, Image as ImageIcon } from 'lucide-react';
import api from '../api';

const PublicProviderProfile = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [jobsDone, setJobsDone] = useState(0); // 🔴 Added to track all completed jobs
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProviderDetails();
  }, [providerId]);

  const fetchProviderDetails = async () => {
    try {
      // 1. Fetch the provider's profile (which includes past_works and is_available)
      const profileRes = await api.get(`providers/${providerId}/`);
      setProvider(profileRes.data);

      // 2. Fetch all bookings for this provider
      const bookingsRes = await api.get('bookings/');
      
      // Filter out ONLY the completed jobs
      const completedJobs = bookingsRes.data.filter(
        b => String(b.provider) === String(providerId) && b.status === 'COMPLETED'
      );
      
      // Update Jobs Done count
      setJobsDone(completedJobs.length);

      // Extract only the jobs that actually have a review attached
      const providerReviews = completedJobs.filter(b => b.review);
      
      // Sort so newest reviews are at the top
      providerReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setReviews(providerReviews);
      
      setLoading(false);
    } catch (err) {
      console.error("Failed to load profile:", err);
      setLoading(false);
    }
  };

  // Calculate the average star rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, job) => sum + job.review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) return <div style={{ padding: '60px 5%', color: 'var(--primary-brand)', fontWeight: '600' }}>Loading Professional Profile...</div>;
  if (!provider) return <div style={{ padding: '60px 5%', color: '#dc2626' }}>Provider not found.</div>;

  return (
    <div style={{ padding: '40px 5%', minHeight: '85vh', background: '#FAFAFA' }}>
      
      {/* HEADER SECTION */}
      <div style={{ background: 'white', padding: '40px', borderRadius: '24px', display: 'flex', gap: '30px', alignItems: 'center', boxShadow: '0 10px 30px rgba(139, 90, 43, 0.05)', flexWrap: 'wrap' }}>
        
        {/* Profile Image */}
        <div style={{ width: '150px', height: '150px', borderRadius: '20px', background: 'var(--primary-brand)', overflow: 'hidden', flexShrink: 0 }}>
          {provider.profile_picture ? (
            <img src={provider.profile_picture} alt={provider.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '3rem', fontWeight: 'bold' }}>
              {provider.full_name.charAt(0)}
            </div>
          )}
        </div>

        {/* Basic Info & Rating */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                <h1 style={{ margin: 0, color: 'var(--text-dark)', fontSize: '2.5rem' }}>{provider.full_name}</h1>
                {provider.is_approved && <CheckCircle size={24} color="#10B981" title="Verified Professional" />}
              </div>
              <p style={{ color: 'var(--primary-brand)', fontSize: '1.2rem', fontWeight: '600', margin: '0 0 15px 0' }}>{provider.category_name}</p>
              
              {/* 🔴 NEW AVAILABILITY BADGE 🔴 */}
              <div style={{ marginBottom: '15px' }}>
                {provider.is_available ? (
                   <span style={{ background: '#ECFDF5', color: '#10B981', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>● Available Today</span>
                ) : (
                   <span style={{ background: '#F3F4F6', color: '#6B7280', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>● Not Available Today</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '20px', color: 'var(--text-light)', fontSize: '0.95rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={18}/> {provider.service_areas}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={18}/> {provider.available_timing} ({provider.available_days})</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Award size={18}/> {provider.experience_years} Years Exp.</span>
              </div>
            </div>

            {/* 🔴 UPGRADED STATS BOX 🔴 */}
            <div style={{ background: '#FAF3E0', padding: '20px', borderRadius: '16px', display: 'flex', gap: '30px', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-dark)' }}>
                  {avgRating > 0 ? avgRating : '-'} <Star size={24} fill="#F59E0B" color="#F59E0B" />
                </div>
                <span style={{ color: 'var(--text-light)', fontSize: '0.85rem', fontWeight: '600' }}>{reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}</span>
              </div>
              
              <div style={{ width: '1px', height: '40px', background: '#D2B48C' }}></div>
              
              <div style={{ textAlign: 'center' }}>
                 <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-dark)' }}>{jobsDone}</div>
                 <span style={{ color: 'var(--text-light)', fontSize: '0.85rem', fontWeight: '600' }}>Jobs Done</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PAST WORK GALLERY (Horizontal Scroll) */}
      {provider.past_works && provider.past_works.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-dark)' }}><ImageIcon size={24} color="var(--primary-brand)"/> Past Work Portfolio</h2>
          <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', padding: '10px 0', scrollbarWidth: 'none' }}>
            {provider.past_works.map(work => (
              <div key={work.id} style={{ minWidth: '280px', height: '200px', borderRadius: '16px', overflow: 'hidden', position: 'relative', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <img src={work.image} alt={work.description || 'Past work'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {work.description && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: 'white', padding: '20px 15px 10px', fontSize: '0.9rem', fontWeight: '500' }}>
                    {work.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CUSTOMER REVIEWS LIST */}
      <div style={{ marginTop: '50px' }}>
        <h2 style={{ color: 'var(--text-dark)', marginBottom: '20px' }}>Customer Reviews</h2>
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>This professional hasn't received any reviews yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {reviews.map(job => (
              <div key={job.id} style={{ background: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #F3F4F6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-dark)' }}>{job.customer_name}</span>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} size={16} fill={star <= job.review.rating ? "#F59E0B" : "none"} color={star <= job.review.rating ? "#F59E0B" : "#D1D5DB"} />
                    ))}
                  </div>
                </div>
                <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={14} color="#10B981" /> Job Completed: {job.sub_service_name} 
                </p>
                {job.review.comment && (
                  <p style={{ color: 'var(--text-dark)', margin: 0, fontStyle: 'italic', background: '#FAFAFA', padding: '15px', borderRadius: '8px' }}>
                    "{job.review.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FIXED BOOKING BAR AT BOTTOM */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', padding: '20px 5%', boxShadow: '0 -4px 20px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100 }}>
        <div>
          <span style={{ color: 'var(--text-light)', fontSize: '0.9rem', display: 'block' }}>Ready to hire {provider.full_name.split(' ')[0]}?</span>
          <span style={{ color: 'var(--text-dark)', fontWeight: '700', fontSize: '1.2rem' }}>Book a Service</span>
        </div>
        <button 
          onClick={() => navigate(`/book/${provider.id}`)}
          className="btn btn-primary" 
          style={{ padding: '15px 40px', fontSize: '1.1rem' }}
        >
          Book Now
        </button>
      </div>

      {/* Spacer so content isn't hidden behind the fixed bottom bar */}
      <div style={{ height: '100px' }}></div>
    </div>
  );
};

export default PublicProviderProfile;