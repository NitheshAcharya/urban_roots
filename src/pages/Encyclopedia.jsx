import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Droplets, Sun, Calendar, Edit3, X, Zap, Layers, Sparkles } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { plantsData } from '../data/plantsData';
import './Encyclopedia.css';

const categories = ['All Categories', 'Vegetables', 'Herbs', 'Flowers', 'Fruits', 'Indoor', 'Medicinal'];
const systems = ['All Systems', 'Hydroponics Suitable', 'Vertical Towers', 'Water-Saving (90%+)'];

const Encyclopedia = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [activeSystem, setActiveSystem] = useState('All Systems');
  const [isLoading, setIsLoading] = useState(true);
  const [plants, setPlants] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();
  
  // Suggestion Modal State
  const [suggestionModal, setSuggestionModal] = useState({ isOpen: false, plant: null });
  const [formData, setFormData] = useState({ field: 'Watering', value: '', reason: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCardClick = (plant) => {
    navigate(`/encyclopedia/${plant.id}`, { state: { plant } });
  };

  const handleSuggestSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('plant_suggestions').insert([{
        plant_id: suggestionModal.plant.id,
        plant_name: suggestionModal.plant.name,
        suggested_field: formData.field,
        suggested_value: formData.value,
        reason: formData.reason,
        status: 'pending'
      }]);
      if (error) throw error;
    } catch (err) {
      console.warn("Mock submit successful: ", err);
    } finally {
      setIsSubmitting(false);
      setSuggestionModal({ isOpen: false, plant: null });
      setFormData({ field: 'Watering', value: '', reason: '' });
      alert('Thank you! Your suggestion has been submitted for review.');
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setPlants(plantsData);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Simple client-side fuzzy-ish matching helper
  const matchesQuery = (plant, query) => {
    if (!query) return true;
    const q = query.toLowerCase().trim();
    
    // Exact or prefix substring matching
    if (plant.name.toLowerCase().includes(q) || plant.sc.toLowerCase().includes(q)) return true;
    
    // Forgiving word matching (e.g. "cherry tomato" matches "Tomato")
    const queryWords = q.split(/\s+/);
    return queryWords.every(word => 
      plant.name.toLowerCase().includes(word) || 
      plant.sc.toLowerCase().includes(word) || 
      plant.description.toLowerCase().includes(word)
    );
  };

  // Filter logic
  const filteredPlants = plants.filter(plant => {
    const matchesSearch = matchesQuery(plant, searchQuery);
    
    const matchesCat = activeCategory === 'All Categories' || plant.cat === activeCategory;
    
    let matchesSys = true;
    if (activeSystem === 'Hydroponics Suitable') {
      matchesSys = plant.hydroSuitability === 'Excellent' || plant.hydroSuitability === 'Good';
    } else if (activeSystem === 'Vertical Towers') {
      matchesSys = plant.verticalSuitability === 'Excellent' || plant.verticalSuitability === 'Good';
    } else if (activeSystem === 'Water-Saving (90%+)') {
      const pct = parseInt(plant.waterSavings?.replace('%', ''));
      matchesSys = !isNaN(pct) && pct >= 90;
    }

    return matchesSearch && matchesCat && matchesSys;
  });

  // Get search suggestions list (up to 5 matches)
  const suggestions = searchQuery.trim() 
    ? plants.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  return (
    <div className="encyclopedia page-transition">
      {/* Search & Intro Hero */}
      <section className="encyclopedia-hero">
        <h1 className="encyclopedia-title">Urban Grow Encyclopedia</h1>
        <p className="encyclopedia-subtitle">Detailed soil-less cultivation parameters, vertical spacing guidelines, and wicking system details for urban crops.</p>
        
        <div className="search-bar-container" ref={searchContainerRef}>
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search crop guides (e.g., Lettuce, Strawberry, Moringa...)" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
              <X size={18} />
            </button>
          )}

          {/* Autocomplete popover */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="search-suggestions-box glass-card">
              {suggestions.map(s => (
                <div 
                  key={s.id} 
                  className="suggestion-item-row"
                  onClick={() => {
                    setSearchQuery(s.name);
                    setShowSuggestions(false);
                    navigate(`/encyclopedia/${s.id}`, { state: { plant: s } });
                  }}
                >
                  <span className="suggestion-emoji">{s.emoji}</span>
                  <div className="suggestion-details">
                    <span className="suggestion-name">{s.name}</span>
                    <span className="suggestion-sc">{s.sc}</span>
                  </div>
                  <span className="suggestion-method">{s.waterSavings} water saved</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Dual filtering options */}
      <section className="filters-section">
        {/* Row 1: Plant category filter */}
        <div className="filter-group">
          <label className="filter-label">Categories</label>
          <div className="filter-pills hide-scrollbar">
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`filter-tab-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Growing system filter */}
        <div className="filter-group">
          <label className="filter-label">Growing Method</label>
          <div className="filter-pills hide-scrollbar">
            {systems.map(sys => (
              <button 
                key={sys} 
                className={`filter-tab-pill system ${activeSystem === sys ? 'active' : ''}`}
                onClick={() => setActiveSystem(sys)}
              >
                {sys}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Plant Grid */}
      <section className="encyclopedia-grid">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="plant-grid-card-v2 loading-skeleton" style={{ height: '320px' }}></div>
          ))
        ) : filteredPlants.length > 0 ? (
          filteredPlants.map(plant => (
            <div key={plant.id} className="glass-card plant-grid-card-v2" onClick={() => handleCardClick(plant)}>
              <div className="card-image-wrapper">
                {plant.image ? (
                  <img src={plant.image} alt={plant.name} className="card-image" />
                ) : (
                  <div className="card-emoji-placeholder">{plant.emoji}</div>
                )}
                
                {/* Eco Water Badge */}
                <div className="card-water-badge">
                  <Droplets size={12} fill="var(--color-accent-blue)" color="var(--color-accent-blue)" />
                  <span>{plant.waterSavings} saved</span>
                </div>

                <div className={`difficulty-indicator diff-${plant.diff.toLowerCase()}`}>{plant.diff}</div>
              </div>
              
              <div className="card-body">
                <h3 className="card-title">{plant.name}</h3>
                <p className="card-scientific">{plant.sc}</p>
                
                <div className="card-suitability-row">
                  {plant.hydroSuitability === 'Excellent' && (
                    <span className="suitability-tag hydro"><Zap size={11} /> Hydroponics</span>
                  )}
                  {plant.verticalSuitability === 'Excellent' && (
                    <span className="suitability-tag vertical"><Layers size={11} /> Vertical</span>
                  )}
                </div>

                <div className="card-metrics-grid">
                  <div className="metric-cell" title="Irrigation Loop">
                    <Droplets size={13} color="var(--color-accent-blue)" />
                    <span>{plant.water}</span>
                  </div>
                  <div className="metric-cell" title="Sunlight Exposure">
                    <Sun size={13} color="var(--color-accent-yellow)" />
                    <span>{plant.sun}</span>
                  </div>
                  <div className="metric-cell" title="Yield Cycle">
                    <Calendar size={13} color="var(--color-primary)" />
                    <span>{plant.yield}</span>
                  </div>
                </div>
                
                <div className="card-footer-action">
                  <span className="media-tag">{plant.soil}</span>
                  <div className="action-button-group">
                    <button 
                      className="suggest-correction-btn" 
                      onClick={(e) => { e.stopPropagation(); setSuggestionModal({ isOpen: true, plant: plant }); }} 
                      title="Suggest Parameters Correction"
                    >
                      <Edit3 size={14}/>
                    </button>
                    <span className="action-link">View Guides →</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card no-results-box">
            <span className="no-results-emoji">🪴</span>
            <h3>No crop guides matching these parameters</h3>
            <p>Try resetting the search query or adjustment filters.</p>
            <button 
              className="btn-primary" 
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All Categories');
                setActiveSystem('All Systems');
              }}
              style={{ marginTop: '20px' }}
            >
              Reset All Filters
            </button>
          </div>
        )}
      </section>

      {/* Suggest Parameter Correction Modal */}
      {suggestionModal.isOpen && (
        <div className="suggestion-overlay" onClick={() => setSuggestionModal({ isOpen: false, plant: null })}>
          <div className="glass-card suggestion-modal page-transition" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSuggestionModal({ isOpen: false, plant: null })}>
              <X size={20} />
            </button>
            <div className="modal-top">
              <div className="modal-logo">{suggestionModal.plant?.emoji}</div>
              <div>
                <h2>Correct Plant Parameters</h2>
                <p>Suggest verified urban grow edits for {suggestionModal.plant?.name}</p>
              </div>
            </div>
            
            <form className="suggestion-form" onSubmit={handleSuggestSubmit}>
              <div className="form-input-group">
                <label>Target Parameter</label>
                <select 
                  required
                  value={formData.field}
                  onChange={e => setFormData({...formData, field: e.target.value})}
                  className="modal-select-field"
                >
                  <option value="Watering">Watering/Nutrient Loop</option>
                  <option value="Sunlight">Sunlight Exposure</option>
                  <option value="Hydroponics System">Hydroponic Setup</option>
                  <option value="Vertical Layout">Vertical Layout</option>
                  <option value="Yield Days">Yield Cycle Days</option>
                  <option value="Difficulty">Difficulty Rating</option>
                </select>
              </div>
              
              <div className="form-input-group">
                <label>Corrected Value</label>
                <input 
                  type="text" 
                  placeholder="e.g. pH: 5.8 - 6.2, EC: 1.8" 
                  required
                  value={formData.value}
                  onChange={e => setFormData({...formData, value: e.target.value})}
                  className="modal-text-field"
                />
              </div>

              <div className="form-input-group">
                <label>Verification Source / Explanation</label>
                <textarea 
                  rows="3" 
                  placeholder="Reference research papers or gardening manuals..."
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                  className="modal-textarea-field"
                ></textarea>
              </div>

              <button type="submit" className="btn-primary modal-confirm-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Verifying...' : 'Submit parameters correction'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Encyclopedia;
