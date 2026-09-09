import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { doctorsAPI } from '../services/api';
import './Doctors.css';

const SPECIALTIES = [
  'All', 'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
  'General Practice', 'Gynecology', 'Neurology', 'Oncology', 'Ophthalmology',
  'Orthopedics', 'Pediatrics', 'Psychiatry', 'Pulmonology', 'Radiology', 'Urology',
];

const StarRating = ({ rating }) => (
  <span className="star-rating">
    {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
    <span className="rating-value"> {rating}</span>
  </span>
);

const DoctorCard = ({ doctor }) => (
  <div className="doctor-card card animate-fadeInUp">
    <div className="doctor-card-header">
      <img src={doctor.avatar} alt={doctor.name} className="doctor-avatar" />
      <div className="doctor-availability">
        <span className="availability-dot" />
        Available
      </div>
    </div>
    <div className="doctor-card-body">
      <h3 className="doctor-name">{doctor.name}</h3>
      <span className="doctor-specialty">{doctor.specialty}</span>
      <p className="doctor-qualification">{doctor.qualification}</p>

      <div className="doctor-stats">
        <div className="stat">
          <StarRating rating={doctor.rating} />
          <span className="stat-sub">({doctor.reviewCount} reviews)</span>
        </div>
        <div className="stat">
          <span className="stat-main">⭐ {doctor.experience} yrs</span>
          <span className="stat-sub">Experience</span>
        </div>
      </div>

      <div className="doctor-hospital">
        <span>🏥</span> <strong>{doctor.hospital}</strong>
        {doctor.hospitalLocation && <span style={{ opacity: 0.8 }}> ({doctor.hospitalLocation})</span>}
      </div>

      <div className="doctor-card-footer">
        <div className="consultation-fee">
          <span className="fee-label">Fee</span>
          <span className="fee-amount">₹{doctor.consultationFee}</span>
        </div>
        <Link to={`/book/${doctor._id}`} className="btn btn-primary btn-sm">
          Book Appointment
        </Link>
      </div>
    </div>
  </div>
);

export default function Doctors() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const specialty = searchParams.get('specialty') || '';
  const search = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(search);
  const [selectedSpecialty, setSelectedSpecialty] = useState(specialty || 'All');
  const [sortBy, setSortBy] = useState('rating');

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        sortBy,
        ...(selectedSpecialty !== 'All' && { specialty: selectedSpecialty }),
        ...(searchInput && { search: searchInput }),
      };
      const res = await doctorsAPI.getAll(params);
      setDoctors(res.data.doctors || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, selectedSpecialty, searchInput]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleSpecialty = (spec) => {
    setSelectedSpecialty(spec);
    setPage(1);
    setSearchParams(spec !== 'All' ? { specialty: spec } : {});
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDoctors();
  };

  return (
    <div className="doctors-page">
      <div className="page-header">
        <div className="container">
          <h1>Find Your <span className="text-gradient">Doctor</span></h1>
          <p>Browse from {total}+ specialist doctors across all departments & premier hospitals</p>
        </div>
      </div>

      <div className="container">
        {/* Search & Filters */}
        <div className="doctors-filters">
          <form className="doctors-search" onSubmit={handleSearch}>
            <input
              type="text"
              className="form-input"
              placeholder="🔍  Search by doctor, hospital, or city..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          <select
            className="form-select sort-select"
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
          >
            <option value="rating">Sort: Top Rated</option>
            <option value="experience">Sort: Most Experienced</option>
            <option value="fee_low">Sort: Fee Low to High</option>
            <option value="fee_high">Sort: Fee High to Low</option>
          </select>
        </div>

        {/* Specialty Chips */}
        <div className="specialty-chips">
          {SPECIALTIES.map((spec) => (
            <button
              key={spec}
              className={`chip ${selectedSpecialty === spec ? 'chip-active' : ''}`}
              onClick={() => handleSpecialty(spec)}
            >
              {spec}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : doctors.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No doctors found</h3>
            <p>Try adjusting your filters or search terms</p>
            <button className="btn btn-secondary" onClick={() => { setSelectedSpecialty('All'); setSearchInput(''); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <p className="results-count">{total} doctors found</p>
            <div className="grid-3">
              {doctors.map((doc) => <DoctorCard key={doc._id} doctor={doc} />)}
            </div>
            {/* Pagination */}
            <div className="pagination">
              <button
                className="btn btn-ghost btn-sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Previous
              </button>
              <span className="page-info">Page {page} of {Math.ceil(total / 12) || 1}</span>
              <button
                className="btn btn-ghost btn-sm"
                disabled={page >= Math.ceil(total / 12)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
