import { Link } from 'react-router-dom';
import { Instagram, Youtube, MessageCircle } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="brand-logo footer-logo">
            <span className="logo-emoji">🌱</span>
            <span className="logo-text">UrbanRoots</span>
          </div>
          <p className="tagline">Grow Green in the City</p>
        </div>
        
        <div className="footer-links">
          <Link to="#">About</Link>
          <Link to="#">Contact</Link>
          <Link to="#">Privacy Policy</Link>
          <Link to="#">Terms</Link>
        </div>
        
        <div className="footer-socials">
          <a href="#" aria-label="Instagram"><Instagram size={24} /></a>
          <a href="#" aria-label="YouTube"><Youtube size={24} /></a>
          <a href="#" aria-label="WhatsApp"><MessageCircle size={24} /></a>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>Made with 🌿 in Karnataka</p>
      </div>
    </footer>
  );
};

export default Footer;
