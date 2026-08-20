import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ClipboardList, LogOut, ChevronDown } from 'lucide-react';
import api from '../api';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  const isProvider = localStorage.getItem('is_provider') === 'true';
  const userId = localStorage.getItem('user_id');

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [profileData, setProfileData] = useState({ 
    name: isProvider ? 'Provider' : 'Customer', 
    picture: null 
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🔴 UPDATED FETCH LOGIC 🔴
  useEffect(() => {
    if (token && userId) {
      const fetchProfileForNav = async () => {
        try {
          const endpoint = isProvider ? 'providers/' : 'customers/';
          const res = await api.get(endpoint);
          
          let myProfile = res.data.find(p => {
            const backendId = p.user?.id || p.user?.pk || p.user || p.user_id;
            return String(backendId) === String(userId);
          });

          // FIX 1: Dev Fallback! If it can't match your ID perfectly, grab the first profile
          if (!myProfile && res.data.length > 0) {
            myProfile = res.data[0];
          }

          if (myProfile) {
            const firstName = myProfile.full_name ? myProfile.full_name.split(' ')[0] : (isProvider ? 'Provider' : 'Customer');
            
            // FIX 2: Force the image URL to point to Django's port 8000
            let pictureUrl = myProfile.profile_picture;
            if (pictureUrl && !pictureUrl.startsWith('http')) {
              pictureUrl = `http://127.0.0.1:8000${pictureUrl}`;
            }

            setProfileData({
              name: firstName,
              picture: pictureUrl
            });
          }
        } catch (err) {
          console.error("Navbar failed to fetch profile:", err);
        }
      };
      fetchProfileForNav();
    }
  }, [token, userId, isProvider]);

  const handleLogout = () => {
    localStorage.clear();
    setDropdownOpen(false);
    navigate('/', { replace: true });
    window.location.reload(); 
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 5%', background: 'white', borderBottom: '1px solid #F5E6D3', position: 'relative' }}>
      
      <Link to={token ? "/dashboard" : "/"} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem', fontWeight: '800', textDecoration: 'none', color: 'var(--text-dark)' }}>
        <div style={{ background: 'var(--primary-brand)', color: 'white', padding: '5px 12px', borderRadius: '8px' }}>
          H
        </div>
        HomeFix
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
        
        {token ? (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <div 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                background: '#FAF3E0', padding: '6px 12px', borderRadius: '50px', border: '1px solid #D2B48C',
                transition: 'all 0.2s ease'
              }}
            >
              {profileData.picture ? (
                <img 
                  src={profileData.picture} 
                  alt="Profile" 
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--primary-brand)' }} 
                />
              ) : (
                <div style={{ 
                  width: '32px', height: '32px', background: 'var(--primary-brand)', 
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: '700', fontSize: '0.9rem'
                }}>
                  <User size={16} />
                </div>
              )}
              
              <span style={{ fontWeight: '600', color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                {profileData.name}
              </span>
              <ChevronDown size={14} color="var(--text-light)" />
            </div>

            {dropdownOpen && (
              <div style={{ 
                position: 'absolute', right: 0, top: '50px', background: 'white', 
                borderRadius: '12px', boxShadow: '0 10px 30px rgba(139, 90, 43, 0.15)', 
                border: '1px solid #F5E6D3', width: '200px', zIndex: 100, overflow: 'hidden',
                display: 'flex', flexDirection: 'column'
              }}>
                <Link 
                  to="/profile" 
                  onClick={() => setDropdownOpen(false)}
                  style={dropdownLinkStyle}
                  onMouseOver={(e) => e.currentTarget.style.background = '#FAF3E0'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                >
                  <User size={16} color="var(--primary-brand)" /> Profile & Edit
                </Link>

                {!isProvider && (
                  <Link 
                    to="/bookings" 
                    onClick={() => setDropdownOpen(false)}
                    style={dropdownLinkStyle}
                    onMouseOver={(e) => e.currentTarget.style.background = '#FAF3E0'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <ClipboardList size={16} color="var(--primary-brand)" /> My Bookings
                  </Link>
                )}

                <button 
                  onClick={handleLogout}
                  style={{ ...dropdownLinkStyle, color: '#dc2626' }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#fee2e2'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '30px', fontWeight: '600', color: 'var(--text-dark)' }}>
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link>
              {/* 👇 THE FIX IS RIGHT HERE 👇 */}
              <Link to="/how-it-works" style={{ textDecoration: 'none', color: 'inherit' }}>How It Works</Link>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <Link to="/register">
                <button className="btn btn-outline">Sign up</button>
              </Link>
              <Link to="/login">
                <button className="btn btn-primary">Log In</button>
              </Link>
            </div>
          </>
        )}

      </div>
    </nav>
  );
};

const dropdownLinkStyle = {
  padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px',
  textDecoration: 'none', color: 'var(--text-dark)', fontSize: '0.9rem', fontWeight: '600',
  borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s',
  background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', width: '100%'
};

export default Navbar;