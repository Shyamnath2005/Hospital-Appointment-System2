import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doctorsAPI } from '../services/api';
import './Home.css';

const SPECIALTIES = [
  { icon: '❤️', name: 'Cardiology', color: '#ef4444' },
  { icon: '🧠', name: 'Neurology', color: '#8b5cf6' },
  { icon: '🦴', name: 'Orthopedics', color: '#f59e0b' },
  { icon: '👶', name: 'Pediatrics', color: '#10b981' },
  { icon: '🔬', name: 'Dermatology', color: '#ec4899' },
  { icon: '👁️', name: 'Ophthalmology', color: '#3b82f6' },
  { icon: '🦷', name: 'General Practice', color: '#06b6d4' },
  { icon: '🫁', name: 'Pulmonology', color: '#14b8a6' },
];

const STATS = [
  { value: '500+', label: 'Specialist Doctors' },
  { value: '50K+', label: 'Patients Served' },
  { value: '15+', label: 'Medical Specialties' },
  { value: '4.9★', label: 'Average Rating' },
];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredDoctors, setFeaturedDoctors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    doctorsAPI.getAll({ limit: 4, sortBy: 'rating' })
      .then(res => setFeaturedDoctors(res.data.doctors || []))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/doctors?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="home">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
        </div>
        <div className="container hero-content">
          <div className="hero-badge animate-fadeInUp">
            <span className="pulse-dot" /> Trusted by 50,000+ patients
          </div>
          <h1 className="hero-title animate-fadeInUp">
            Your Health, Our <span className="text-gradient">Priority</span>
          </h1>
          <p className="hero-subtitle animate-fadeInUp">
            Book appointments with top-rated specialists instantly. 
            Expert care, just a few clicks away.
          </p>

          <form className="search-bar animate-fadeInUp" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search doctors, specialties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg">Find Doctors</button>
          </form>

          <div className="hero-stats animate-fadeIn">
            {STATS.map((s) => (
              <div key={s.label} className="stat-item">
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Specialties ── */}
      <section className="section specialties-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Browse by Category</span>
            <h2>Find by <span className="text-gradient">Specialty</span></h2>
            <p>Choose from our wide range of medical specialties</p>
          </div>
          <div className="specialties-grid">
            {SPECIALTIES.map((spec) => (
              <Link
                key={spec.name}
                to={`/doctors?specialty=${encodeURIComponent(spec.name)}`}
                className="specialty-card"
                style={{ '--accent-color': spec.color }}
              >
                <div className="specialty-icon">{spec.icon}</div>
                <span>{spec.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Doctors ── */}
      {featuredDoctors.length > 0 && (
        <section className="section featured-section">
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Top Rated</span>
              <h2>Featured <span className="text-gradient">Doctors</span></h2>
              <p>Meet our highly rated medical professionals</p>
            </div>
            <div className="featured-grid">
              {featuredDoctors.map((doc) => (
                <div key={doc._id} className="featured-card card">
                  <img src={doc.avatar} alt={doc.name} className="featured-avatar" />
                  <div className="featured-info">
                    <h3>{doc.name}</h3>
                    <span className="specialty-badge">{doc.specialty}</span>
                    <div className="featured-meta">
                      <span>⭐ {doc.rating} ({doc.reviewCount})</span>
                      <span>🏥 {doc.hospital}</span>
                    </div>
                    <div className="featured-footer">
                      <span className="fee">₹{doc.consultationFee}</span>
                      <Link to={`/book/${doc._id}`} className="btn btn-primary btn-sm">Book Now</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="section-cta">
              <Link to="/doctors" className="btn btn-secondary btn-lg">View All Doctors →</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── How It Works ── */}
      <section className="section how-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Simple Process</span>
            <h2>How It <span className="text-gradient">Works</span></h2>
          </div>
          <div className="steps-grid">
            {[
              { step: '01', icon: '🔍', title: 'Find a Doctor', desc: 'Search by specialty, name, or location to find the right doctor.' },
              { step: '02', icon: '📅', title: 'Choose a Slot', desc: 'Pick a convenient date and time that works best for you.' },
              { step: '03', icon: '✅', title: 'Book & Confirm', desc: 'Fill in your details and confirm your appointment instantly.' },
              { step: '04', icon: '🏥', title: 'Visit Doctor', desc: 'Show up at the clinic and receive expert medical care.' },
            ].map((s) => (
              <div key={s.step} className="step-card glass">
                <div className="step-number">{s.step}</div>
                <div className="step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-card glass">
            <div className="cta-orb" />
            <h2>Ready to <span className="text-gradient">Get Started?</span></h2>
            <p>Join thousands of patients who trust MediBook for their healthcare needs.</p>
            <div className="cta-actions">
              <Link to="/auth?mode=register" className="btn btn-primary btn-lg">Create Free Account</Link>
              <Link to="/doctors" className="btn btn-ghost btn-lg">Browse Doctors</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
