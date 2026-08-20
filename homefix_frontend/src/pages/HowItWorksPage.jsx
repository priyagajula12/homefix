import { Link } from 'react-router-dom';
import { Search, CalendarCheck, PhoneCall, Star, ArrowRight } from 'lucide-react';

const HowItWorksPage = () => {
  return (
    <div style={{ padding: '60px 5%', minHeight: '85vh', background: 'var(--bg-beige)', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h4 style={{ color: 'var(--primary-brand)', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem', marginBottom: '10px', fontWeight: '700' }}>
          Platform Guide
        </h4>
        <h1 style={{ color: 'var(--text-dark)', fontSize: '3rem', margin: '0 0 15px 0' }}>
          How HomeFix Works
        </h1>
        <p style={{ color: 'var(--text-light)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          Whether you're looking to fix up your home or grow your trade business, HomeFix makes the entire process seamless.
        </p>
      </div>

      {/* Steps Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '60px' }}>
        
        <StepCard 
          step="01" 
          icon={<Search size={28} color="var(--primary-brand)" />}
          title="Browse & Discover" 
          desc="Explore verified home service categories like plumbing, electrical work, carpentry, and more. Filter by service areas and view professional portfolios."
        />

        <StepCard 
          step="02" 
          icon={<CalendarCheck size={28} color="var(--primary-brand)" />}
          title="Book a Service" 
          desc="Select your preferred sub-service, pick a scheduled date, input your precise location details, and submit your request instantly."
        />

        <StepCard 
          step="03" 
          icon={<PhoneCall size={28} color="var(--primary-brand)" />}
          title="Connect & Coordinate" 
          desc="Once accepted, use direct provider phone numbers to coordinate logistics. When the job is done, mark it as completed right from your dashboard."
        />

        <StepCard 
          step="04" 
          icon={<Star size={28} color="#F59E0B" />}
          title="Review & Build Trust" 
          desc="Rate your experience with a 1-5 star review and leave feedback. Your ratings help maintain a high-quality community of trusted experts."
        />

      </div>

      {/* Action Banner */}
      <div style={{ background: 'white', padding: '40px', borderRadius: '24px', border: '1px solid #F5E6D3', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ color: 'var(--text-dark)', margin: '0 0 10px 0', fontSize: '1.8rem' }}>Ready to get started?</h2>
          <p style={{ color: 'var(--text-light)', margin: 0 }}>Join our growing network of homeowners and verified service providers today.</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <Link to="/register?role=customer">
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              Get Started <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </div>

    </div>
  );
};

const StepCard = ({ step, icon, title, desc }) => (
  <div style={{ background: 'white', padding: '35px 30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(139, 90, 43, 0.05)', border: '1px solid #F5E6D3', display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative', overflow: 'hidden' }}>
    <span style={{ position: 'absolute', top: '20px', right: '25px', fontSize: '2.5rem', fontWeight: '900', color: '#F3EFE6', zIndex: 0 }}>{step}</span>
    <div style={{ width: '60px', height: '60px', background: '#FAF3E0', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
      {icon}
    </div>
    <h3 style={{ margin: '10px 0 0 0', color: 'var(--text-dark)', fontSize: '1.3rem', zIndex: 1 }}>{title}</h3>
    <p style={{ color: 'var(--text-light)', fontSize: '0.95netrem', lineHeight: '1.6', margin: 0, zIndex: 1 }}>{desc}</p>
  </div>
);

export default HowItWorksPage;