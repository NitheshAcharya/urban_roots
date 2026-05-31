import { useState, useEffect } from 'react';
import { MapPin, Star, Calendar as CalendarIcon, Clock, Video, Home, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Experts.css';

const expertsData = [
  { id: 1, name: 'Dr. Ananya Reddy', role: 'Plant Pathologist', emoji: '👩🏽‍🔬', location: 'Bengaluru', rating: 4.9, reviews: 124, tags: ['Disease Diagnosis', 'Indoor'], baseRate: 399, type: 'Disease Diagnosis' },
  { id: 2, name: 'Rohan Sharma', role: 'Urban Farming Specialist', emoji: '🧑🏽‍🌾', location: 'Mysuru', rating: 4.8, reviews: 89, tags: ['Setup & Design', 'Vegetables'], baseRate: 599, type: 'Setup & Design' },
  { id: 3, name: 'Lakshmi Narayan', role: 'Soil Scientist', emoji: '👩🏽‍🌾', location: 'Mangaluru', rating: 4.7, reviews: 56, tags: ['Soil Testing', 'Fertilizers'], baseRate: 299, type: 'Soil Testing' },
  { id: 4, name: 'Vikram Joshi', role: 'Horticulturist', emoji: '👨🏽‍🔬', location: 'Hubballi', rating: 4.9, reviews: 210, tags: ['Online Only', 'Fruits'], baseRate: 199, type: 'Online Only' },
];

const categories = ['All Experts', 'Disease Diagnosis', 'Setup & Design', 'Soil Testing', 'Online Only'];

const Experts = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('All Experts');
  const [bookingModal, setBookingModal] = useState({ isOpen: false, expert: null });
  const [bookingData, setBookingData] = useState({ date: '', time: '', type: 'online', issue: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userCity, setUserCity] = useState('Bengaluru');

  useEffect(() => {
    if (profile?.city) {
      setUserCity(profile.city);
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`);
              if (res.ok) {
                const data = await res.json();
                const city = data.city || data.locality || data.principalSubdivision;
                if (city) {
                  setUserCity(city);
                }
              }
            } catch (err) {
              console.warn('Geolocation lookup failed in Experts:', err);
            }
          }
        );
      }
    }
  }, [profile]);

  const getFinalRate = (expert) => {
    if (!expert) return { rate: 0, isLocal: false };
    const isLocal = userCity.toLowerCase().trim().includes(expert.location.toLowerCase().trim()) || 
                    expert.location.toLowerCase().trim().includes(userCity.toLowerCase().trim());
    return {
      rate: isLocal ? expert.baseRate - 100 : expert.baseRate,
      isLocal
    };
  };

  const filteredExperts = expertsData.filter(
    exp => activeTab === 'All Experts' || exp.tags.includes(activeTab) || exp.type === activeTab
  );

  const openModal = (expert) => {
    setIsSubmitted(false);
    setBookingData({ date: '', time: '', type: 'online', issue: '' });
    setBookingModal({ isOpen: true, expert });
  };

  const handleBook = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setBookingModal({ isOpen: false, expert: null });
    }, 2000);
  };

  return (
    <div className="experts-page page-transition">
      <section className="experts-hero">
        <h1 className="experts-title">Hire a Plant Expert</h1>
        <p className="experts-subtitle">Connect with certified horticulturists and plant pathologists across Karnataka for personalized guidance.</p>
      </section>

      <section className="experts-filters hide-scrollbar">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`filter-tab ${activeTab === cat ? 'active' : ''}`}
            onClick={() => setActiveTab(cat)}
          >
            {cat}
          </button>
        ))}
      </section>

      <section className="experts-grid">
        {filteredExperts.map(expert => (
          <div key={expert.id} className="expert-card">
            <div className="expert-header">
              <div className="expert-avatar">{expert.emoji}</div>
              <div className="expert-rating">
                <Star size={14} className="star-icon" fill="currentColor" />
                <span>{expert.rating}</span>
                <span className="reviews">({expert.reviews})</span>
              </div>
            </div>
            
            <div className="expert-info">
              <h3 className="expert-name">{expert.name}</h3>
              <p className="expert-role">{expert.role}</p>
              
              <div className="expert-location">
                <MapPin size={14} /> <span>{expert.location}, KA</span>
              </div>
              
              <div className="expert-tags">
                {expert.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
            
            <div className="expert-footer">
              <div className="expert-rate" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                {getFinalRate(expert).isLocal ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <span className="rate-amount" style={{ color: 'var(--color-primary)' }}>₹{getFinalRate(expert).rate}</span>
                       <span className="rate-amount-old" style={{ textDecoration: 'line-through', fontSize: '11px', opacity: 0.6 }}>₹{expert.baseRate}</span>
                    </div>
                    <span style={{ fontSize: '9px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '1px 6px', borderRadius: '10px', marginTop: '2px', fontWeight: 800 }}>📍 Local Discount (-₹100)</span>
                  </>
                ) : (
                  <span className="rate-amount">₹{expert.baseRate}</span>
                )}
                <span className="rate-session" style={{ fontSize: '10px', opacity: 0.8 }}>/ session</span>
              </div>
              <button className="book-btn" onClick={() => openModal(expert)}>Book Now</button>
            </div>
          </div>
        ))}
      </section>

      {/* Booking Modal */}
      {bookingModal.isOpen && (
        <div className="booking-overlay">
          <div className="booking-modal page-transition">
            <button className="close-modal" onClick={() => setBookingModal({ isOpen: false, expert: null })}>
              <X size={24} />
            </button>
            
            {isSubmitted ? (
              <div className="booking-success page-transition">
                <span className="success-emoji">✅</span>
                <h2>Booking Confirmed!</h2>
                <p>An email has been sent with meeting details.</p>
              </div>
            ) : (
              <>
                <div className="modal-header">
                  <div className="modal-avatar">{bookingModal.expert?.emoji}</div>
                  <div>
                    <h2>Book Consultation</h2>
                    <p>with {bookingModal.expert?.name}</p>
                  </div>
                </div>
                
                <form className="booking-form" onSubmit={handleBook}>
                  <div className="form-group row">
                    <div className="input-field">
                      <label><CalendarIcon size={16}/> Date</label>
                      <input 
                        type="date" 
                        required 
                        value={bookingData.date}
                        onChange={e => setBookingData({...bookingData, date: e.target.value})}
                      />
                    </div>
                    <div className="input-field">
                      <label><Clock size={16}/> Time</label>
                      <input 
                        type="time" 
                        required 
                        value={bookingData.time}
                        onChange={e => setBookingData({...bookingData, time: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Consultation Type</label>
                    <div className="type-options">
                      <button 
                        type="button" 
                        className={`type-btn ${bookingData.type === 'online' ? 'active' : ''}`}
                        onClick={() => setBookingData({...bookingData, type: 'online'})}
                      >
                        <Video size={18} /> Online (Video Call)
                      </button>
                      <button 
                        type="button" 
                        className={`type-btn ${bookingData.type === 'home' ? 'active' : ''}`}
                        onClick={() => setBookingData({...bookingData, type: 'home'})}
                      >
                        <Home size={18} /> Home Visit
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Describe your plant problem</label>
                    <textarea 
                      rows="3" 
                      placeholder="e.g. My tomato leaves are turning yellow with brown spots..."
                      required
                      value={bookingData.issue}
                      onChange={e => setBookingData({...bookingData, issue: e.target.value})}
                    ></textarea>
                  </div>

                  <div className="booking-total">
                    <span>Total Amount</span>
                    <span className="total-price">₹{getFinalRate(bookingModal.expert).rate}</span>
                  </div>

                  <button type="submit" className="confirm-book-btn">Confirm Booking</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Experts;
