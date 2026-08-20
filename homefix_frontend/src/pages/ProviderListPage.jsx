import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Star, ShieldCheck, MapPin, Calendar } from 'lucide-react';

const ProviderListPage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        // Fetch all providers from Django backend
        const response = await api.get('providers/');
        // Filter providers belonging to this specific category ID
        const filtered = response.data.filter(p => p.category === parseInt(categoryId));
        setProviders(filtered);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching providers", err);
        setLoading(false);
      }
    };
    fetchProviders();
  }, [categoryId]);

  return (
    <div style={{ padding: '40px 5%', minHeight: '80vh', background: 'var(--bg-beige)' }}>
      
      <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: 'var(--primary-brand)', fontWeight: '600', cursor: 'pointer', marginBottom: '20px', fontSize: '1rem' }}>
        ← Back to Categories
      </button>

      <h1 style={{ color: 'var(--text-dark)', marginBottom: '30px', fontSize: '2.5rem' }}>Available Professionals</h1>

      {loading ? (
        <div style={{ color: 'var(--primary-brand)', fontWeight: '600' }}>Loading trusted experts...</div>
      ) : providers.length === 0 ? (
        <div style={{ background: 'white', padding: '30px', borderRadius: '16px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-light)' }}>No service providers are currently registered under this category.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' }}>
          {providers.map((provider) => (
            <div key={provider.id} style={{ 
              background: 'white', padding: '30px', borderRadius: '20px', 
              boxShadow: '0 10px 25px rgba(139, 90, 43, 0.05)', border: '1px solid #F5E6D3',
              display: 'flex', flexDirection: 'column', gap: '15px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.3rem', color: 'var(--text-dark)' }}>{provider.full_name}</h3>
                  <span style={{ color: 'var(--text-light)', fontSize: '0.85rem', fontWeight: '600' }}>{provider.experience_years} Years Experience</span>
                </div>
                <div style={{ background: '#E8F5E9', color: '#2E8B57', padding: '5px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} /> Verified
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                <MapPin size={16} color="var(--primary-brand)" /> Serves: {provider.service_areas}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                <Calendar size={16} color="var(--primary-brand)" /> {provider.available_days} ({provider.available_timing})
              </div>

              <button 
                onClick={() => navigate(`/provider/${provider.id}`)} 
                className="btn btn-primary"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ProviderListPage;