import { useState, useEffect } from 'react';
import { X, ArrowRight, Check } from 'lucide-react';
import './OnboardingModal.css';

const OnboardingModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [city, setCity] = useState('');
  const [space, setSpace] = useState('');
  const [plants, setPlants] = useState([]);

  useEffect(() => {
    const hasOnboarded = localStorage.getItem('urbanroots_onboarded');
    if (!hasOnboarded) {
      setTimeout(() => setIsOpen(true), 500);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('urbanroots_onboarded', 'true');
    setIsOpen(false);
  };

  const togglePlant = (plant) => {
    if (plants.includes(plant)) {
      setPlants(plants.filter(p => p !== plant));
    } else if (plants.length < 3) {
      setPlants([...plants, plant]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal page-transition">
        <button className="onboarding-close" onClick={completeOnboarding}>
          <X size={24} />
        </button>
        
        <div className="onboarding-progress">
          <div className="progress-bar" style={{ width: `${(step / 4) * 100}%` }}></div>
        </div>

        <div className="onboarding-content">
          {step === 1 && (
            <div className="step-content page-transition">
              <span className="step-emoji">📍</span>
              <h2>Where are you growing?</h2>
              <p>Enter your city in Karnataka for accurate weather insights.</p>
              <input 
                type="text" 
                placeholder="e.g., Bangalore, Mysore..." 
                value={city}
                onChange={e => setCity(e.target.value)}
                className="onboarding-input"
              />
              <button 
                className="btn-primary" 
                onClick={() => setStep(2)}
                disabled={!city.trim()}
              >
                Next <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="step-content page-transition">
              <span className="step-emoji">🏡</span>
              <h2>Select your space type</h2>
              <p>Where will your plants live?</p>
              <div className="options-grid">
                {['Balcony', 'Terrace', 'Window', 'Indoor', 'Garden'].map(type => (
                  <button 
                    key={type}
                    className={`option-btn ${space === type ? 'selected' : ''}`}
                    onClick={() => setSpace(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <button 
                className="btn-primary" 
                onClick={() => setStep(3)}
                disabled={!space}
              >
                Next <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="step-content page-transition">
              <span className="step-emoji">🌿</span>
              <h2>Pick 3 plants you want to grow</h2>
              <p>We'll set up your initial dashboard with these.</p>
              <div className="plants-grid">
                {['Tomato', 'Tulsi', 'Aloe Vera', 'Mint', 'Money Plant', 'Rose'].map(p => (
                  <div 
                    key={p}
                    className={`plant-option ${plants.includes(p) ? 'selected' : ''}`}
                    onClick={() => togglePlant(p)}
                  >
                    {plants.includes(p) && <div className="check-badge"><Check size={12}/></div>}
                    {p}
                  </div>
                ))}
              </div>
              <p className="selection-count">{plants.length}/3 selected</p>
              <button 
                className="btn-primary" 
                onClick={() => setStep(4)}
                disabled={plants.length < 1}
              >
                Next <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="step-content page-transition">
              <span className="step-emoji" style={{ fontSize: '48px' }}>🎉</span>
              <h2>You're all set!</h2>
              <p>Welcome to UrbanRoots. We've customized your experience for growing in {city}.</p>
              <button className="btn-primary final-btn" onClick={completeOnboarding}>
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
