import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentsAPI, uploadAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Dashboard.css';

const STATUS_BADGE = {
  confirmed: 'badge-success',
  pending: 'badge-warning',
  cancelled: 'badge-error',
  completed: 'badge-info',
};

const AppointmentCard = ({ appt, onCancel }) => {
  const date = new Date(appt.appointmentDate);
  const isPast = date < new Date();

  return (
    <div className="appt-card card">
      <div className="appt-header">
        <img src={appt.doctor?.avatar} alt={appt.doctor?.name} className="appt-avatar" />
        <div className="appt-doctor">
          <h4>{appt.doctor?.name}</h4>
          <span className="appt-specialty">{appt.doctor?.specialty}</span>
        </div>
        <span className={`badge ${STATUS_BADGE[appt.status] || 'badge-info'}`}>
          {appt.status}
        </span>
      </div>
      <div className="appt-details">
        <div className="appt-detail">
          <span>📅</span>
          <span>{date.toLocaleDateString('en-IN', { dateStyle: 'medium' })} at {appt.timeSlot}</span>
        </div>
        <div className="appt-detail">
          <span>🏥</span>
          <span>{appt.doctor?.hospital}</span>
        </div>
        <div className="appt-detail">
          <span>💬</span>
          <span>{appt.reason}</span>
        </div>
        <div className="appt-detail">
          <span>💰</span>
          <span>₹{appt.consultationFee}</span>
        </div>
      </div>
      {appt.status === 'confirmed' && !isPast && (
        <div className="appt-actions">
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onCancel(appt._id)}
          >
            Cancel Appointment
          </button>
        </div>
      )}
    </div>
  );
};

export default function Dashboard() {
  const { patient } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');
  const [filter, setFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    appointmentsAPI.getMy()
      .then(res => setAppointments(res.data.appointments || []))
      .catch(() => toast.error('Failed to load appointments'))
      .finally(() => setLoadingAppts(false));

    uploadAPI.getMyDocuments()
      .then(res => setDocuments(res.data.documents || []))
      .catch(() => {}) // S3 might not be configured
      .finally(() => setLoadingDocs(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentsAPI.cancel(id);
      setAppointments(prev =>
        prev.map(a => a._id === id ? { ...a, status: 'cancelled' } : a)
      );
      toast.success('Appointment cancelled successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);

    setUploading(true);
    try {
      const res = await uploadAPI.upload(formData);
      setDocuments(prev => [...prev, res.data.document]);
      toast.success('Document uploaded successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed. Check your S3 configuration.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleDeleteDoc = async (s3Key, index) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await uploadAPI.delete(s3Key);
      setDocuments(prev => prev.filter((_, i) => i !== index));
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete document');
    }
  };

  const filteredAppts = filter === 'all'
    ? appointments
    : appointments.filter(a => a.status === filter);

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <div className="container">
          <h1>Patient <span className="text-gradient">Dashboard</span></h1>
          <p>Welcome back, {patient?.name} 👋</p>
        </div>
      </div>

      <div className="container dashboard-content">
        {/* Stats */}
        <div className="dash-stats">
          {[
            { label: 'Total', value: stats.total, icon: '📋', color: 'var(--primary-400)' },
            { label: 'Confirmed', value: stats.confirmed, icon: '✅', color: 'var(--accent-400)' },
            { label: 'Completed', value: stats.completed, icon: '🏥', color: '#60a5fa' },
            { label: 'Cancelled', value: stats.cancelled, icon: '❌', color: '#f87171' },
          ].map(s => (
            <div key={s.label} className="dash-stat-card glass">
              <div className="dash-stat-icon" style={{ color: s.color }}>{s.icon}</div>
              <div className="dash-stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="dash-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Profile Card */}
        <div className="profile-card glass">
          <div className="profile-avatar-placeholder">
            {patient?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-info">
            <h3>{patient?.name}</h3>
            <p>{patient?.email}</p>
            <div className="profile-badges">
              {patient?.bloodGroup && <span className="badge badge-error">🩸 {patient.bloodGroup}</span>}
              {patient?.gender && <span className="badge badge-info">👤 {patient.gender}</span>}
              <span className="badge badge-success">✅ Verified Patient</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="dash-tabs">
          <button
            className={`tab-btn ${activeTab === 'appointments' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            📋 Appointments ({appointments.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'documents' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            📁 Documents ({documents.length})
          </button>
        </div>

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="tab-content">
            <div className="tab-filters">
              {['all', 'confirmed', 'completed', 'cancelled'].map(f => (
                <button
                  key={f}
                  className={`chip ${filter === f ? 'chip-active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {loadingAppts ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : filteredAppts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <h3>No appointments {filter !== 'all' ? `with status "${filter}"` : 'yet'}</h3>
                <p>Book your first appointment with a specialist doctor</p>
                <a href="/doctors" className="btn btn-primary">Find Doctors</a>
              </div>
            ) : (
              <div className="appts-grid">
                {filteredAppts.map(appt => (
                  <AppointmentCard key={appt._id} appt={appt} onCancel={handleCancel} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="tab-content">
            <div className="upload-zone">
              <input
                type="file"
                ref={fileRef}
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="doc-upload"
              />
              <label htmlFor="doc-upload" className="upload-label">
                <div className="upload-icon">📤</div>
                <h4>Upload Patient Document</h4>
                <p>Drag & drop or click to upload (JPEG, PNG, PDF – max 10MB)</p>
                <span className="btn btn-secondary btn-sm">
                  {uploading ? 'Uploading...' : 'Choose File'}
                </span>
              </label>
            </div>

            {loadingDocs ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : documents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📁</div>
                <h3>No documents uploaded yet</h3>
                <p>Upload medical reports, prescriptions, and other health documents</p>
              </div>
            ) : (
              <div className="docs-grid">
                {documents.map((doc, idx) => (
                  <div key={idx} className="doc-card glass">
                    <div className="doc-icon">
                      {doc.name?.endsWith('.pdf') ? '📄' : '🖼️'}
                    </div>
                    <div className="doc-info">
                      <h4 className="doc-name">{doc.name}</h4>
                      <p className="doc-date">
                        {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </p>
                    </div>
                    <div className="doc-actions">
                      <a href={doc.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                        View
                      </a>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteDoc(doc.s3Key, idx)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
