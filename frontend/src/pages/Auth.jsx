import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isRegister, setIsRegister] = useState(searchParams.get('mode') === 'register');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', gender: '', bloodGroup: '',
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = isRegister
        ? await authAPI.register(form)
        : await authAPI.login({ email: form.email, password: form.password });

      login(res.data.token, res.data.patient);
      toast.success(isRegister ? 'Account created successfully! 🎉' : 'Welcome back! 👋');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      <div className="auth-card glass">
        <div className="auth-header">
          <Link to="/" className="auth-logo">🏥 MediBook</Link>
          <h1>{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
          <p>{isRegister ? 'Join thousands of patients on MediBook' : 'Sign in to your patient account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                name="name"
                type="text"
                className="form-input"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              name="email"
              type="email"
              className="form-input"
              placeholder="your@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              name="password"
              type="password"
              className="form-input"
              placeholder={isRegister ? 'Min. 6 characters' : 'Enter your password'}
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          {isRegister && (
            <>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  name="phone"
                  type="tel"
                  className="form-input"
                  placeholder="+91 9876543210"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select name="gender" className="form-select" value={form.gender} onChange={handleChange}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select name="bloodGroup" className="form-select" value={form.bloodGroup} onChange={handleChange}>
                    <option value="">Select blood group</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary btn-lg auth-submit" disabled={loading}>
            {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="auth-switch">
          {isRegister ? (
            <p>Already have an account? <button onClick={() => setIsRegister(false)}>Sign In</button></p>
          ) : (
            <p>Don't have an account? <button onClick={() => setIsRegister(true)}>Create one</button></p>
          )}
        </div>
      </div>
    </div>
  );
}
