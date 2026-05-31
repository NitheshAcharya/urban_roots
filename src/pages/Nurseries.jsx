import { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, Clock, Star, ExternalLink, Globe, Compass, Search, X } from 'lucide-react';
import './Nurseries.css';

const mockNurseries = [
  { 
    id: 1, 
    name: 'Green Haven Nursery & Landscaping', 
    rating: 4.8, 
    reviewsCount: 142,
    distance: '2.4 km', 
    isOpen: true, 
    type: 'Balcony Setups & Houseplants', 
    img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=400&auto=format&fit=crop',
    description: 'A premium, eco-friendly garden center offering a vast selection of exotic foliage, wicking clay pebble reservoirs, premium ceramic pots, and expert vertical tower consulting.',
    address: '123 Flora Avenue, Indiranagar, Bengaluru',
    phone: '+91 98765 43210',
    hours: 'Open · Closes 8:00 PM',
    website: 'https://example.com/greenhaven',
    gallery: [
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=400&auto=format&fit=crop'
    ]
  },
  { 
    id: 2, 
    name: 'Urban Roots Garden Center', 
    rating: 4.6, 
    reviewsCount: 89,
    distance: '3.1 km', 
    isOpen: true, 
    type: 'Hydroponics & Organic Supplies', 
    img: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=400&auto=format&fit=crop',
    description: 'Your one-stop destination for smart urban gardening. We specialize in vertical tower wicking beds, liquid NPK mineral nutrients, and rare aroids.',
    address: '45 Metro Square, Koramangala, Bengaluru',
    phone: '+91 98765 11223',
    hours: 'Open · Closes 7:30 PM',
    website: 'https://example.com/urbanroots',
    gallery: [
      'https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=400&auto=format&fit=crop'
    ]
  },
  { 
    id: 3, 
    name: 'Sunshine Botanicals', 
    rating: 4.9, 
    reviewsCount: 204,
    distance: '5.0 km', 
    isOpen: false, 
    type: 'Succulents & Vertical Columns', 
    img: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=400&auto=format&fit=crop',
    description: 'Beautifully curated outdoor botanical gardens and nursery. Known for our extensive collection of cacti, custom terrariums, and green wall vertical installations.',
    address: '78 Sun Valley Road, Yelahanka, Bengaluru',
    phone: '+91 91234 56789',
    hours: 'Closed · Opens 9:00 AM Fri',
    website: 'https://example.com/sunshine',
    gallery: [
      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=400&auto=format&fit=crop'
    ]
  }
];

const Nurseries = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNursery, setSelectedNursery] = useState(mockNurseries[0]);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLoading(false);
      },
      (err) => {
        setError('Location access unavailable. Displaying general Bengaluru view.');
        setLoading(false);
      }
    );
  }, []);

  const filteredNurseries = mockNurseries.filter(n => 
    n.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    n.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStars = (rating) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          size={13} 
          fill={i <= floor ? "#f1c40f" : "none"} 
          color={i <= floor ? "#f1c40f" : "#bdc3c7"} 
        />
      );
    }
    return stars;
  };

  return (
    <div className="nurseries-google-search page-transition">
      {/* Map Listings Split Trough */}
      <div className="google-local-layout">
        
        {/* Left Side: Local listings list */}
        <aside className="local-listings-sidebar glass-card">
          <div className="search-local-header">
            <h3>Local Nurseries</h3>
            
            <div className="local-search-input-box">
              <Search size={16} className="search-icon-local" />
              <input 
                type="text" 
                placeholder="Search nurseries nearby..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-local-btn" onClick={() => setSearchQuery('')}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="listings-list hide-scrollbar">
            {filteredNurseries.map(nursery => (
              <div 
                key={nursery.id} 
                className={`nursery-listing-card ${selectedNursery?.id === nursery.id ? 'selected' : ''}`}
                onClick={() => setSelectedNursery(nursery)}
              >
                <div className="listing-card-body">
                  <h4 className="listing-title">{nursery.name}</h4>
                  
                  <div className="listing-rating-row">
                    <span className="rating-num">{nursery.rating}</span>
                    <div className="stars-wrapper">{renderStars(nursery.rating)}</div>
                    <span className="reviews-count">({nursery.reviewsCount})</span>
                  </div>

                  <p className="listing-type">{nursery.type} · {nursery.distance}</p>
                  <p className="listing-address">{nursery.address}</p>
                  
                  <div className="listing-hours-row">
                    <Clock size={12} className="hours-icon" />
                    <span className={nursery.isOpen ? 'text-green' : 'text-red'}>{nursery.hours}</span>
                  </div>

                  {/* Quick Action buttons */}
                  <div className="listing-action-shortcuts" onClick={e => e.stopPropagation()}>
                    <a href={nursery.website} target="_blank" rel="noopener noreferrer" className="shortcut-btn">
                      <Globe size={14} /> <span>Website</span>
                    </a>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nursery.name + ' ' + nursery.address)}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="shortcut-btn"
                    >
                      <Compass size={14} /> <span>Directions</span>
                    </a>
                    <a href={`tel:${nursery.phone}`} className="shortcut-btn">
                      <Phone size={14} /> <span>Call</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}

            {filteredNurseries.length === 0 && (
              <p className="no-listings-text">No nurseries found. Try searching for "Koramangala" or "Indiranagar".</p>
            )}
          </div>
        </aside>

        {/* Right Side: Map frame + Selected Detail overlay */}
        <main className="local-map-area">
          <div className="map-view-wrapper glass-card">
            {loading ? (
              <div className="map-loading-hud">
                <div className="map-spinner"></div>
                <p>Retrieving coordinates...</p>
              </div>
            ) : (
              <iframe
                title="Google Maps Nearby Nurseries"
                src={location 
                  ? `https://maps.google.com/maps?q=plant+nursery+near+${location.latitude},${location.longitude}&z=14&output=embed`
                  : `https://maps.google.com/maps?q=plant+nursery+bengaluru&z=13&output=embed`
                }
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            )}

            {/* Selected business detail box overlay */}
            {selectedNursery && (
              <div className="selected-detail-overlay-box glass-card page-transition">
                <button className="close-detail-overlay-btn" onClick={() => setSelectedNursery(null)}>
                  <X size={16} />
                </button>
                
                <div className="overlay-detail-header">
                  {selectedNursery.img ? (
                    <>
                      <img 
                        src={selectedNursery.img} 
                        alt={selectedNursery.name} 
                        className="overlay-detail-img" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallbackEmoji = e.target.parentNode.querySelector('.nursery-img-fallback');
                          if (fallbackEmoji) fallbackEmoji.style.display = 'flex';
                        }}
                      />
                      <div className="overlay-detail-img nursery-img-fallback" style={{ display: 'none', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--color-border)', fontSize: '2rem' }}>🏪</div>
                    </>
                  ) : (
                    <div className="overlay-detail-img nursery-img-fallback" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--color-border)', fontSize: '2rem' }}>🏪</div>
                  )}
                  <div className="overlay-header-info">
                    <h4>{selectedNursery.name}</h4>
                    <span className="overlay-type">{selectedNursery.type}</span>
                    <div className="overlay-stars">{renderStars(selectedNursery.rating)} <small>({selectedNursery.reviewsCount})</small></div>
                  </div>
                </div>

                <div className="overlay-detail-body">
                  <p className="overlay-desc">{selectedNursery.description}</p>
                  
                  <div className="overlay-contact-info">
                    <div className="contact-item-row"><MapPin size={14} className="text-green" /> <span>{selectedNursery.address}</span></div>
                    <div className="contact-item-row"><Clock size={14} className="text-green" /> <span>{selectedNursery.hours}</span></div>
                    <div className="contact-item-row"><Phone size={14} className="text-green" /> <span>{selectedNursery.phone}</span></div>
                  </div>

                  <div className="overlay-gallery-row">
                    {selectedNursery.gallery.map((imgUrl, i) => (
                      <div key={i} className="gallery-thumbnail-box" style={{ width: 'calc(33.33% - 4px)', height: '50px', borderRadius: '4px', overflow: 'hidden', display: 'inline-block', position: 'relative', backgroundColor: 'var(--color-border)' }}>
                        <img 
                          src={imgUrl} 
                          alt="gallery thumbnail" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const fallbackEmoji = e.target.parentNode.querySelector('.gallery-emoji-fallback');
                            if (fallbackEmoji) fallbackEmoji.style.display = 'flex';
                          }}
                        />
                        <div className="gallery-emoji-fallback" style={{ display: 'none', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem' }}>🌱</div>
                      </div>
                    ))}
                  </div>

                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedNursery.name + ' ' + selectedNursery.address)}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn-primary overlay-directions-btn"
                  >
                    Start Navigation <Compass size={16} />
                  </a>
                </div>
              </div>
            )}
          </div>
          
          <div className="location-disclaimer-bar">
            <Navigation size={14} className="text-green animate-pulse" />
            <span>Showing verified listings near your location in Bengaluru. Geolocation is enabled.</span>
          </div>
        </main>

      </div>
    </div>
  );
};

export default Nurseries;
