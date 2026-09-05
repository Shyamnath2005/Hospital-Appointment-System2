import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorsAPI, appointmentsAPI } from '../services/api';
import toast from 'react-hot-toast';
import './BookAppointment.css';

const TIME_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'];

const getMinDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const getMaxDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
};

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [booked, setBooked] = useState(false);
  const [appointmentId, setAppointmentId] = useState(null);

  useEffect(() => {
    doctorsAPI.getById(doctorId)
      .then(res => setDoctor(res.data.doctor))
      .catch(() => toast.error('Doctor not found'))
      .finally(() => setLoading(false));
  }, [doctorId]);

  useEffect(() => {
    if (selectedDate && doctorId) {
      setSlotsLoading(true);
      setSelectedSlot('');
      doctorsAPI.getSlots(doctorId, selectedDate)
        .then(res => setAvailableSlots(res.data.slots || []))
        .catch(() => setAvailableSlots(TIME_SLOTS))
        .finally(() => setSlotsLoading(false));
    }
  }, [selectedDate, doctorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot || !reason.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await appointmentsAPI.book({
        doctorId,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        reason,
        notes,
      });
      setAppointmentId(res.data.appointment._id);
      setBooked(true);
      toast.success('Appointment booked successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!doctor) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Doctor not found.</div>;

  if (booked) {
    return (
      <div className="booking-success">
        <div className="success-card glass">
          <div className="success-icon">✅</div>
          <h2>Appointment Confirmed!</h2>
          <p>Your appointment has been successfully booked.</p>
          <div className="success-details">
            <div className="detail-row"><span>Doctor</span><strong>Dr. {doctor.name}</strong></div>
            <div className="detail-row"><span>Specialty</span><strong>{doctor.specialty}</strong></div>
            <div className="detail-row"><span>Date</span><strong>{new Date(selectedDate).toLocaleDateString('en-IN', { dateStyle: 'long' })}</strong></div>
            <div className="detail-row"><span>Time</span><strong>{selectedSlot}</strong></div>
            <div className="detail-row"><span>Fee</span><strong>₹{doctor.consultationFee}</strong></div>
          </div>
          <div className="success-actions">
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>View My Appointments</button>
            <button className="btn btn-ghost" onClick={() => navigate('/doctors')}>Find Another Doctor</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="book-page">
      <div className="page-header">
        <div className="container">
          <h1>Book <span className="text-gradient">Appointment</span></h1>
          <p>Schedule your visit with {doctor.name}</p>
        </div>
      </div>

      <div className="container">
        <div className="book-layout">
          {/* Doctor Info Panel */}
          <aside className="doctor-panel glass">
            <img src={doctor.avatar} alt={doctor.name} className="panel-avatar" />
            <h2 className="panel-name">{doctor.name}</h2>
            <span className="panel-specialty">{doctor.specialty}</span>
            <p className="panel-qual">{doctor.qualification}</p>
            <div className="panel-divider" />
            <div className="panel-info">
              <div className="info-row">
                <span>⭐ Rating</span>
                <strong>{doctor.rating} ({doctor.reviewCount} reviews)</strong>
              </div>
              <div className="info-row">
                <span>🏥 Hospital</span>
                <strong>{doctor.hospital}</strong>
              </div>
              <div className="info-row">
                <span>📅 Available</span>
                <strong>{doctor.availableDays?.join(', ')}</strong>
              </div>
              <div className="info-row">
                <span>💰 Fee</span>
                <strong className="fee-highlight">₹{doctor.consultationFee}</strong>
              </div>
            </div>
            <p className="panel-bio">{doctor.bio}</p>
          </aside>

          {/* Booking Form */}
          <div className="booking-form-wrapper">
            <form className="booking-form card" onSubmit={handleSubmit}>
              <h3>Select Date & Time</h3>

              {/* Date Picker */}
              <div className="form-group">
                <label className="form-label">Appointment Date *</label>
                <input
                  type="date"
                  className="form-input"
                  min={getMinDate()}
                  max={getMaxDate()}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  required
                />
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="form-group">
                  <label className="form-label">Available Time Slots *</label>
                  {slotsLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
                      <div className="spinner" style={{ width: 24, height: 24 }} />
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="no-slots">No slots available on this date. Please select another date.</p>
                  ) : (
                    <div className="slots-grid">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          className={`slot-btn ${selectedSlot === slot ? 'slot-selected' : ''}`}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Reason for Visit *</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Describe your symptoms or reason for consultation..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Additional Notes <span style={{ color: 'var(--neutral-500)' }}>(Optional)</span></label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Any allergies, current medications, or other information..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {selectedDate && selectedSlot && (
                <div className="booking-summary">
                  <h4>Booking Summary</h4>
                  <div className="summary-row"><span>Date</span><strong>{new Date(selectedDate).toLocaleDateString('en-IN', { dateStyle: 'full' })}</strong></div>
                  <div className="summary-row"><span>Time</span><strong>{selectedSlot}</strong></div>
                  <div className="summary-row"><span>Consultation Fee</span><strong className="fee-highlight">₹{doctor.consultationFee}</strong></div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                disabled={submitting || !selectedDate || !selectedSlot || !reason}
              >
                {submitting ? 'Booking...' : '🗓 Confirm Appointment'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
