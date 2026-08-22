import { useState, useEffect } from 'react';
import { Camera, User, Save, Trash2, Image as ImageIcon, Plus } from 'lucide-react';
import api from '../api';

const ProfilePage = () => {
  const isProvider = localStorage.getItem('is_provider') === 'true';
  const userId = localStorage.getItem('user_id');
  const endpoint = isProvider ? 'providers/' : 'customers/';

  const [profileId, setProfileId] = useState(null);
  const [isNewProfile, setIsNewProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [categories, setCategories] = useState([]); // Stores categories for the dropdown

  // 🔴 ALL FIELDS ADDED 🔴
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    address: '', 
    service_areas: '', 
    category: '', 
    experience_years: '',
    available_days: '',
    available_timing: ''
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [removePicture, setRemovePicture] = useState(false);

  // Portfolio State (For Providers Only)
  const [pastWorks, setPastWorks] = useState([]);
  const [workFile, setWorkFile] = useState(null);
  const [workPreview, setWorkPreview] = useState(null);
  const [workDesc, setWorkDesc] = useState('');
  const [uploadingWork, setUploadingWork] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch Categories for the Dropdown (if they are a provider)
      if (isProvider) {
        const catRes = await api.get('categories/');
        setCategories(catRes.data);
      }

      // 2. Fetch the User's Profile
      const res = await api.get(endpoint);
      let myProfile = res.data.find(p => {
        const backendId = p.user?.id || p.user?.pk || p.user || p.user_id;
        return String(backendId) === String(userId);
      });

      if (!myProfile && res.data.length > 0) myProfile = res.data[0]; 

      if (myProfile) {
        setProfileId(myProfile.id);
        setIsNewProfile(false);
        setFormData({
          full_name: myProfile.full_name || '',
          phone_number: myProfile.phone_number || '',
          address: myProfile.address || '',
          service_areas: myProfile.service_areas || '',
          category: myProfile.category || '', // Pre-fill dropdown
          experience_years: myProfile.experience_years || '',
          available_days: myProfile.available_days || '',
          available_timing: myProfile.available_timing || ''
        });
        
        if (myProfile.profile_picture) setImagePreview(myProfile.profile_picture);
        if (isProvider && myProfile.past_works) setPastWorks(myProfile.past_works);

      } else {
        setIsNewProfile(true);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to load profile', type: 'error' });
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 400; 
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');
        const scale = Math.max(size / img.width, size / img.height);
        const width = img.width * scale; const height = img.height * scale;
        const dx = (size - width) / 2; const dy = (size - height) / 2;
        ctx.drawImage(img, dx, dy, width, height);
        canvas.toBlob((blob) => {
          setSelectedFile(blob);
          setImagePreview(URL.createObjectURL(blob));
          setRemovePicture(false); 
        }, 'image/jpeg', 0.8);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    const submitData = new FormData();
    submitData.append('user', userId);
    submitData.append('full_name', formData.full_name);
    submitData.append('phone_number', formData.phone_number);
    
    // Dynamically append fields based on user role
    if (isProvider) {
      submitData.append('service_areas', formData.service_areas);
      submitData.append('category', formData.category);
      submitData.append('experience_years', formData.experience_years);
      submitData.append('available_days', formData.available_days);
      submitData.append('available_timing', formData.available_timing);
    } else {
      submitData.append('address', formData.address);
    }

    if (selectedFile) {
      submitData.append('profile_picture', selectedFile, 'profile.jpg');
    } else if (removePicture) {
      submitData.append('profile_picture', '');
    }

    try {
      if (isNewProfile) {
        const res = await api.post(endpoint, submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setProfileId(res.data.id);
        setIsNewProfile(false);
        setMessage({ text: 'Profile created successfully!', type: 'success' });
      } else {
        await api.patch(`${endpoint}${profileId}/`, submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
      }

      // 👇 ADDED: Tell the rest of the app to refresh its data
      window.dispatchEvent(new Event('profileUpdated'));

    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to save profile. Please ensure all fields are filled.', type: 'error' });
    } finally {
      setSaving(false); setRemovePicture(false); 
    }
  };

  // Portfolio Logic (Same as before)
  const handleUploadPastWork = async (e) => {
    e.preventDefault();
    if (!workFile || !profileId) return;
    setUploadingWork(true);
    const data = new FormData();
    data.append('provider', profileId); 
    data.append('image', workFile);
    if (workDesc) data.append('description', workDesc);

    try {
      const res = await api.post('provider-works/', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPastWorks([res.data, ...pastWorks]); 
      setWorkFile(null); setWorkPreview(null); setWorkDesc('');
    } catch (err) {
      alert("Failed to upload image. Please try again.");
    } finally { setUploadingWork(false); }
  };

  if (loading) return <div style={{ padding: '50px 5%' }}>Loading profile...</div>;

  return (
    <div style={{ padding: '50px 5%', minHeight: '85vh', background: 'var(--bg-beige)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
      
      {/* 1. MAIN PROFILE CARD */}
      <div style={{ background: 'white', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '600px', boxShadow: '0 10px 30px rgba(139, 90, 43, 0.08)' }}>
        
        <h2 style={{ color: 'var(--text-dark)', marginBottom: '30px', fontSize: '2rem' }}>
          {isProvider ? 'Professional Settings' : 'My Settings'}
        </h2>

        {message.text && (
          <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '20px', background: message.type === 'success' ? '#D1FAE5' : '#FEE2E2', color: message.type === 'success' ? '#059669' : '#DC2626' }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '20px', background: '#FAFAFA', borderRadius: '16px' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--primary-brand)', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', color: 'white', border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              {imagePreview ? <img src={imagePreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={50} />}
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-brand)', fontWeight: '600', fontSize: '0.9rem', padding: '8px 16px', background: '#FAF3E0', borderRadius: '20px' }}>
                <Camera size={16} /> {imagePreview ? 'Change' : 'Upload'}
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </label>

              {imagePreview && (
                <button type="button" onClick={() => { setImagePreview(null); setSelectedFile(null); setRemovePicture(true); }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#EF4444', fontWeight: '600', fontSize: '0.9rem', padding: '8px 16px', background: '#FEE2E2', border: 'none', borderRadius: '20px' }}>
                  <Trash2 size={16} /> Remove
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Full Name</label>
              <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} style={inputStyle} required />
            </div>

            <div>
              <label style={labelStyle}>Phone Number</label>
              <input type="text" name="phone_number" value={formData.phone_number} onChange={handleInputChange} style={inputStyle} required />
            </div>

            {!isProvider ? (
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Home Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} style={inputStyle} required />
              </div>
            ) : (
              <>
                <div>
                  <label style={labelStyle}>Service Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} style={inputStyle} required>
                    <option value="" disabled>Select your trade...</option>
                    <option value="1">Electrician</option>
                    <option value="2">Plumber</option>
                    <option value="3">Carpenter</option>
                    <option value="4">Painter</option>
                    <option value="5">AC Repair</option>
                    <option value="6">Pest Control</option>
                    <option value="7">Cleaning Services</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Years of Experience</label>
                  <input type="number" name="experience_years" min="0" value={formData.experience_years} onChange={handleInputChange} style={inputStyle} required />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Service Areas</label>
                  <input type="text" name="service_areas" placeholder="e.g., Downtown, North Side, Suburbs" value={formData.service_areas} onChange={handleInputChange} style={inputStyle} required />
                </div>

                <div>
                  <label style={labelStyle}>Working Days</label>
                  <input type="text" name="available_days" placeholder="e.g., Mon - Sat" value={formData.available_days} onChange={handleInputChange} style={inputStyle} required />
                </div>

                <div>
                  <label style={labelStyle}>Working Hours</label>
                  <input type="text" name="available_timing" placeholder="e.g., 09:00 AM - 06:00 PM" value={formData.available_timing} onChange={handleInputChange} style={inputStyle} required />
                </div>
              </>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '14px', marginTop: '10px' }}>
            <Save size={18} /> {saving ? 'Saving...' : 'Save Profile Details'}
          </button>
        </form>
      </div>

      {/* 2. PORTFOLIO MANAGER (UNCHANGED) */}
      {isProvider && profileId && (
        <div style={{ background: 'white', padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '600px', boxShadow: '0 10px 30px rgba(139, 90, 43, 0.08)' }}>
          <h2 style={{ color: 'var(--text-dark)', marginBottom: '10px', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ImageIcon color="var(--primary-brand)" /> Past Work Gallery
          </h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '30px', fontSize: '0.95rem' }}>
            Upload photos of your completed jobs to display on your public portfolio.
          </p>

          <form onSubmit={handleUploadPastWork} style={{ background: '#FAFAFA', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px', border: '1px dashed #D1D5DB' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '12px', background: '#E5E7EB', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {workPreview ? <img src={workPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={32} color="#9CA3AF" />}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--primary-brand)', fontWeight: '600', fontSize: '0.9rem' }}>
                  <Camera size={16} /> Choose Photo
                  <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files[0]; if(f) { setWorkFile(f); setWorkPreview(URL.createObjectURL(f)); } }} style={{ display: 'none' }} required />
                </label>
                <input type="text" placeholder="Short description (e.g., 'Fixed kitchen sink')" value={workDesc} onChange={(e) => setWorkDesc(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb', outline: 'none' }} />
              </div>
            </div>
            <button type="submit" disabled={!workFile || uploadingWork} className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '10px', opacity: (!workFile || uploadingWork) ? 0.5 : 1 }}>
              <Plus size={18} /> {uploadingWork ? 'Uploading...' : 'Add to Portfolio'}
            </button>
          </form>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
            {pastWorks.length === 0 ? (
              <p style={{ color: 'var(--text-light)', fontStyle: 'italic', gridColumn: '1 / -1' }}>No images uploaded yet.</p>
            ) : (
              pastWorks.map(work => (
                <div key={work.id} style={{ position: 'relative', height: '150px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                  <img src={work.image} alt={work.description} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={async () => { if(window.confirm("Delete this image?")) { await api.delete(`provider-works/${work.id}/`); setPastWorks(pastWorks.filter(w => w.id !== work.id)); } }} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(220,38,38,0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}><Trash2 size={14} /></button>
                  {work.description && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '0.75rem', padding: '5px 8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{work.description}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-dark)' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', boxSizing: 'border-box', outline: 'none', background: '#fff' };

export default ProfilePage;