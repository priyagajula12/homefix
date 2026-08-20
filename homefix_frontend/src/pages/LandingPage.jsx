import { Link } from 'react-router-dom';
import { Wrench, Zap, Paintbrush, Droplets, Hammer, Fan, Settings, ShieldCheck } from 'lucide-react';

const LandingPage = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '50px 5%', minHeight: '80vh' }}>
      
      {/* LEFT COLUMN: Text and Buttons */}
      <div style={{ flex: '1', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '4rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '20px' }}>
          Small Fixes That <br />
          Change Your <span style={{ color: 'var(--primary-brand)' }}>Home</span>
        </h1>
        
        <p style={{ fontSize: '1.2rem', color: 'var(--text-light)', marginBottom: '40px', lineHeight: '1.6' }}>
          Connect homeowners with trusted service providers and make every repair matter. 
          Book secure, verified professionals for all your maintenance needs on our platform.
        </p>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '50px' }}>
          <Link to="/register?role=provider">
            <button className="btn btn-primary">Start Providing Service</button>
          </Link>
          <Link to="/register?role=customer">
            <button className="btn btn-outline">Fix Your Home</button>
          </Link>
        </div>

        {/* Stats Section */}
        <div style={{ display: 'flex', gap: '40px' }}>
          <div>
            <h3 style={{ color: 'var(--primary-brand)', fontSize: '1.8rem', margin: '0 0 5px 0' }}>500+</h3>
            <span style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontWeight: '600' }}>Jobs Completed</span>
          </div>
          <div>
            <h3 style={{ color: 'var(--primary-brand)', fontSize: '1.8rem', margin: '0 0 5px 0' }}>50+</h3>
            <span style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontWeight: '600' }}>Verified Providers</span>
          </div>
          <div>
            <h3 style={{ color: 'var(--primary-brand)', fontSize: '1.8rem', margin: '0 0 5px 0' }}>25+</h3>
            <span style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontWeight: '600' }}>Service Areas</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: The Orbit Graphic */}
      <div style={{ flex: '1', display: 'flex', justifyContent: 'center', position: 'relative' }}>
        
        {/* Dashed Orbit Ring - Changed to Tan */}
        <div style={{ position: 'absolute', width: '550px', height: '550px', border: '2px dashed #D2B48C', borderRadius: '50%', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}></div>
        
        {/* Floating Badges on the Ring */}
        <div style={{ position: 'absolute', top: '10%', right: '15%', background: 'var(--primary-brand)', padding: '10px', borderRadius: '50%', color: 'white', zIndex: 2 }}>
          <ShieldCheck size={24} />
        </div>

        {/* Center White Circle Container */}
        <div style={{ 
          position: 'relative', width: '380px', height: '380px', background: 'white', 
          borderRadius: '50%', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', 
          alignContent: 'center', gap: '20px', boxShadow: '0 20px 50px rgba(139, 90, 43, 0.08)', zIndex: 1
        }}>
          
          {/* Service Icons Grid - Updated with Earthy Tones */}
          <IconBubble icon={<Wrench color="#8B5A2B" />} bg="#F5E6D3" />
          <IconBubble icon={<Zap color="#B8860B" />} bg="#FFF8DC" />
          <IconBubble icon={<Paintbrush color="#4682B4" />} bg="#E6F2FF" />
          
          <IconBubble icon={<Droplets color="#2E8B57" />} bg="#E8F5E9" />
          
          {/* Center Main Icon */}
          <div style={{ 
            width: '80px', height: '80px', background: 'var(--primary-brand)', 
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', boxShadow: '0 10px 20px rgba(139, 90, 43, 0.3)'
          }}>
            <Settings size={36} />
          </div>
          
          <IconBubble icon={<Hammer color="#696969" />} bg="#F0F0F0" />
          <IconBubble icon={<Fan color="#CD5C5C" />} bg="#FFE4E1" />
          <IconBubble icon={<ShieldCheck color="#483D8B" />} bg="#E6E6FA" />
          <IconBubble icon={<Wrench color="#556B2F" />} bg="#F5F5DC" />

        </div>
      </div>

    </div>
  );
};

// Helper component for the little colored circles
const IconBubble = ({ icon, bg }) => (
  <div style={{ width: '60px', height: '60px', background: bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    {icon}
  </div>
);

export default LandingPage;