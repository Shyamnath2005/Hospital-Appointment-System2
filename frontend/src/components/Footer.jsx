import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">🏥 Medi<span>Book</span></div>
            <p>Connecting patients with trusted healthcare professionals. Book appointments with ease, anywhere, anytime.</p>
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/doctors">Find Doctors</Link></li>
              <li><Link to="/auth">Patient Login</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Specialties</h4>
            <ul>
              <li>Cardiology</li>
              <li>Pediatrics</li>
              <li>Neurology</li>
              <li>Dermatology</li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Contact</h4>
            <ul>
              <li>📍 123 Medical Center Drive</li>
              <li>📞 +1 (800) MEDIBOOK</li>
              <li>✉️ support@medibook.com</li>
              <li>🕐 24/7 Support</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 MediBook. All rights reserved. Built with ❤️ for better healthcare.</p>
        </div>
      </div>
    </footer>
  );
}
