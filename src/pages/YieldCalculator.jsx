import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Info, Droplets, Leaf, ShieldCheck, Share2, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { unlockBadge } from '../utils/gamification';
import { plantsData } from '../data/plantsData';
import './YieldCalculator.css';

const YieldCalculator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [space, setSpace] = useState(10); // in m2
  const [method, setMethod] = useState('Vertical Tower'); // Soil, DWC, NFT, Vertical Tower
  const [cycles, setCycles] = useState(4); // crop cycles per year
  const [selectedPlants, setSelectedPlants] = useState([101, 102]); // Butterhead lettuce, Strawberries

  const [results, setResults] = useState({
    yieldKg: 0,
    waterSaved: 0,
    spaceMultiplier: '1x',
    carbonOffset: 0,
    costSavings: 0,
    ecoScore: 'B'
  });

  const availablePlants = plantsData.filter(p => [1, 5, 6, 7, 11, 101, 102, 103, 104].includes(p.id));

  const togglePlantSelect = (id) => {
    if (selectedPlants.includes(id)) {
      if (selectedPlants.length > 1) {
        setSelectedPlants(selectedPlants.filter(pId => pId !== id));
      }
    } else if (selectedPlants.length < 3) {
      setSelectedPlants([...selectedPlants, id]);
    }
  };

  useEffect(() => {
    // Parameters variables
    let density = 4; // plants per m2
    let yieldFactor = 1.2; // kg per plant per cycle
    let waterSavingPct = 0;
    let spaceMultiplier = '1.0x';
    let ecoScore = 'C';

    if (method === 'Soil') {
      density = 4;
      yieldFactor = 1.2;
      waterSavingPct = 0;
      spaceMultiplier = '1.0x';
      ecoScore = 'C';
    } else if (method === 'DWC') {
      density = 10;
      yieldFactor = 1.5;
      waterSavingPct = 0.90;
      spaceMultiplier = '2.5x';
      ecoScore = 'A';
    } else if (method === 'NFT') {
      density = 12;
      yieldFactor = 1.6;
      waterSavingPct = 0.92;
      spaceMultiplier = '3.0x';
      ecoScore = 'A';
    } else if (method === 'Vertical Tower') {
      density = 32;
      yieldFactor = 1.4;
      waterSavingPct = 0.95;
      spaceMultiplier = '8.0x';
      ecoScore = 'A+';
    }

    // Average price per kg of organic crops in INR
    const avgPricePerKg = 150;

    // Calculate outputs
    const totalPlantsCount = space * density;
    const yieldPerCycle = totalPlantsCount * yieldFactor;
    const yieldKgYear = Math.round(yieldPerCycle * cycles);
    
    // Traditional watering = 2.0 Liters per plant per day
    const traditionalWaterPerYear = totalPlantsCount * 2.0 * 365;
    const waterSavedLitersYear = Math.round(traditionalWaterPerYear * waterSavingPct);
    
    const carbonOffsetKgYear = Math.round(yieldKgYear * 0.52 * 10) / 10;
    const costSavingsInrYear = yieldKgYear * avgPricePerKg;

    setResults({
      yieldKg: yieldKgYear,
      waterSaved: waterSavedLitersYear,
      spaceMultiplier,
      carbonOffset: carbonOffsetKgYear,
      costSavings: costSavingsInrYear,
      ecoScore
    });

    if (ecoScore === 'A+') {
      unlockBadge('ecoscore_elite', user?.id);
    }

  }, [space, method, cycles, selectedPlants, user]);

  const getEcoScoreStroke = () => {
    switch (results.ecoScore) {
      case 'A+': return 100;
      case 'A': return 85;
      case 'B': return 65;
      default: return 40;
    }
  };

  const handleShare = () => {
    const text = `I calculated my Urban Farm impact using UrbanRoots! 🌱\nMethods: ${method}\nSpace: ${space}m²\nAnnual Yield: ${results.yieldKg} kg of fresh food\nWater Saved: ${results.waterSaved} Liters! 💧\nEco-Score: ${results.ecoScore} 🏆\nCalculate yours at UrbanRoots!`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="yield-calculator-page page-transition">
      <button className="back-nav-btn" onClick={() => navigate('/')}>
        <ChevronLeft size={18} /> Back to Control Panel
      </button>

      <section className="calc-header">
        <h1>Urban Yield & Water Savings Simulator</h1>
        <p>Interactive tool to measure the food security and conservation impact of your home systems.</p>
      </section>

      <div className="calc-split-layout">
        
        {/* Step 1: Simulator Inputs */}
        <div className="glass-card calc-inputs-panel">
          <h3>1. Setup Parameters</h3>
          
          <div className="input-field-group">
            <div className="field-label-row">
              <label>Growing System</label>
              <span className="field-badge">{method}</span>
            </div>
            <select 
              value={method} 
              onChange={e => setMethod(e.target.value)}
              className="calc-select"
            >
              <option value="Soil">Traditional Soil Containers</option>
              <option value="DWC">Deep Water Culture (DWC) Hydroponics</option>
              <option value="NFT">Nutrient Film Technique (NFT) Channels</option>
              <option value="Vertical Tower">Aeroponic Vertical Grow Tower</option>
            </select>
          </div>

          <div className="input-field-group">
            <div className="field-label-row">
              <label>Available Space (m²)</label>
              <span className="field-badge value">{space} m²</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="50" 
              value={space}
              onChange={e => setSpace(parseInt(e.target.value))}
              className="calc-slider"
            />
            <div className="slider-limits"><span>1 m²</span><span>50 m²</span></div>
          </div>

          <div className="input-field-group">
            <div className="field-label-row">
              <label>Harvest Cycles Per Year</label>
              <span className="field-badge value">{cycles} cycles</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="8" 
              value={cycles}
              onChange={e => setCycles(parseInt(e.target.value))}
              className="calc-slider"
            />
            <div className="slider-limits"><span>1 cycle</span><span>8 cycles</span></div>
          </div>

          <div className="input-field-group">
            <label className="section-sub-label">Select Crops (Max 3)</label>
            <div className="plants-selector-grid">
              {availablePlants.map(plant => {
                const isSelected = selectedPlants.includes(plant.id);
                return (
                  <div 
                    key={plant.id} 
                    className={`calc-plant-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => togglePlantSelect(plant.id)}
                  >
                    <span className="chip-emoji">{plant.emoji}</span>
                    <span>{plant.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 2: Live Impacts */}
        <div className="glass-card calc-outputs-panel">
          <div className="outputs-header">
            <h3>2. Simulated Eco Impact</h3>
            
            {/* SVG Radial Eco Score */}
            <div className="eco-score-circle-wrapper">
              <svg width="80" height="80" viewBox="0 0 36 36" className="eco-radial-svg">
                <path
                  className="ring-bg"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--color-border)"
                  strokeWidth="3"
                />
                <path
                  className="ring-fill"
                  strokeDasharray={`${getEcoScoreStroke()}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <text x="18" y="22" className="score-text">{results.ecoScore}</text>
              </svg>
              <small>Eco-Impact Score</small>
            </div>
          </div>

          <div className="impact-results-grid">
            <div className="impact-result-card">
              <Leaf className="text-green" size={24} />
              <div>
                <small>Food Harvested</small>
                <h4>{results.yieldKg} kg / year</h4>
              </div>
            </div>

            <div className="impact-result-card">
              <Droplets className="text-blue" size={24} />
              <div>
                <small>Water Conserved</small>
                <h4>{results.waterSaved.toLocaleString()} Liters</h4>
              </div>
            </div>

            <div className="impact-result-card">
              <Award className="text-yellow" size={24} />
              <div>
                <small>Space Efficiency</small>
                <h4>{results.spaceMultiplier} density</h4>
              </div>
            </div>

            <div className="impact-result-card">
              <ShieldCheck className="text-purple" size={24} />
              <div>
                <small>CO₂ Emissions Offset</small>
                <h4>{results.carbonOffset} kg / year</h4>
              </div>
            </div>
          </div>

          <div className="financial-yield-summary">
            <div className="financial-label">Estimated Annual Grocery Savings</div>
            <div className="financial-value">₹ {results.costSavings.toLocaleString()} / year</div>
            <p className="financial-subtext">Based on local organic vegetable pricing index in South India (₹150/kg avg).</p>
          </div>

          <div className="calc-alert-banner">
            <Info size={16} />
            <p>Vertical systems cut water usage by up to 95% by collecting and recycling nutrient run-off back to the root nozzles continuously.</p>
          </div>

          <button className="btn-primary share-calc-btn" onClick={handleShare}>
            <Share2 size={16} /> Share Your Farm Impact
          </button>
        </div>

      </div>
    </div>
  );
};

export default YieldCalculator;
