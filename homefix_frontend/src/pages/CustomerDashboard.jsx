import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// 👇 IMPORTED ALL THE NEW ICONS 👇
import { Wrench, Zap, Paintbrush, Droplets, Hammer } from 'lucide-react';
import api from '../api';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('categories/');
        setCategories(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // 👇 ADDED THIS FUNCTION TO MATCH NAMES TO ICONS 👇
  const getCategoryIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('plumb')) return <Droplets size={32} />;
    if (lower.includes('electr')) return <Zap size={32} />;
    if (lower.includes('paint')) return <Paintbrush size={32} />;
    if (lower.includes('carpent')) return <Hammer size={32} />;
    return <Wrench size={32} />; // Default fallback
  };

  return (
    <div style={{ padding: '60px 5%', minHeight: '80vh', background: '#FAFAFA' }}>
      
      <div style={{ marginBottom: '50px' }}>
        <h4 style={{ color: 'var(--text-light)', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem', marginBottom: '10px' }}>
          OUR SERVICES
        </h4>
        <h1 style={{ color: 'var(--text-dark)', margin: '0', fontSize: '3rem', maxWidth: '600px', lineHeight: '1.2' }}>
          Perfect repairs without effort!
        </h1>
      </div>

      {loading ? (
        <div style={{ color: 'var(--primary-brand)', fontWeight: '600' }}>Loading services...</div>
      ) : (
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
          
          {categories.map((category) => (
            <div key={category.id} style={{ 
              background: 'white', padding: '40px 30px', borderRadius: '20px', 
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)', width: '260px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
              transition: 'transform 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ 
                width: '80px', height: '80px', background: 'var(--primary-brand)', 
                borderRadius: '50%', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', color: 'white', marginBottom: '25px'
              }}>
                {/* 👇 REPLACED HARDCODED WRENCH WITH DYNAMIC ICON 👇 */}
                {getCategoryIcon(category.name)}
              </div>
              
              <h3 style={{ margin: '0 0 15px 0', color: 'var(--text-dark)', fontSize: '1.4rem' }}>
                {category.name}
              </h3>
              
              <p style={{ fontSize: '0.95rem', color: 'var(--text-light)', margin: '0 0 30px 0', lineHeight: '1.5' }}>
                Expert {category.name.toLowerCase()} services for your home.
              </p>

              <button 
                onClick={() => navigate(`/category/${category.id}/providers`)} 
                className="btn btn-outline" 
                style={{ marginTop: 'auto', width: '100%' }}
              >
                Know More
              </button>
            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;