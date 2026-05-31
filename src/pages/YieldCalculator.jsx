import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Info, Droplets, Leaf, ShieldCheck, Share2, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { unlockBadge } from '../utils/gamification';
import { plantsData } from '../data/plantsData';
import './YieldCalculator.css';
const COMPARATIVE_DATA = {
  tomato: {
    soil: {
      materials: "12\" terracotta pot, potting soil mix (soil + coco peat + vermicompost), stakes/trellis, granular NPK.",
      water: "High (5-7 Liters/week per plant). Evaporation & drainage runoff lose 80% of water.",
      cycle: "70-85 days from seed to first harvest.",
      space: "Low density (4 plants / m²)."
    },
    hydro: {
      materials: "Dutch Buckets or Coco-Peat slabs, wicking twine, liquid hydroponic A+B nutrients, reservoir, pump & drip emitters.",
      water: "Minimal (0.5 Liters/week per plant). Closed recirculating loop saves 90% water.",
      cycle: "50-60 days (30% faster due to direct oxygenated nutrient absorption).",
      space: "Medium density (10-12 plants / m²)."
    },
    vertical: {
      materials: "Vertical grow tower columns, support twine, water pump, cycle timer, vertical LED grow bars (if indoors).",
      water: "Ultra-low (0.3 Liters/week per plant). Aeroponic misting saves 95% water.",
      cycle: "55-65 days.",
      space: "Highest density (32 plants / m² using vertical tiers)."
    }
  },
  pepper: {
    soil: {
      materials: "10-12\" pot, rich well-drained loam soil mixed with compost, support stakes.",
      water: "Moderate (3-5 Liters/week per plant). Needs soil drying intervals to avoid root rot.",
      cycle: "80-90 days from seed to harvest.",
      space: "Low density (6 plants / m²)."
    },
    hydro: {
      materials: "Dutch buckets or DWC reservoir, clay pebbles, liquid vegetative/bloom nutrients, air pump.",
      water: "Minimal (0.4 Liters/week per plant). Saves 90% water.",
      cycle: "60-70 days (increased nutrient absorption accelerates flowering).",
      space: "Medium density (12 plants / m²)."
    },
    vertical: {
      materials: "Vertical tower grow pockets, wicking cords, pump, timer, LED grow bars.",
      water: "Ultra-low (0.25 Liters/week). Saves 95% water.",
      cycle: "65-75 days.",
      space: "High density (28 plants / m²)."
    }
  },
  brinjal: {
    soil: {
      materials: "14-16\" heavy pot, highly organic loamy soil, sturdy stakes.",
      water: "High (5-6 Liters/week per plant). Evaporation losses in summer are high.",
      cycle: "75-85 days.",
      space: "Low density (3 plants / m² due to bushy growth)."
    },
    hydro: {
      materials: "Dutch buckets, coco-coir/perlite mix, liquid calcium-rich nutrients, pump & drip emitters.",
      water: "Minimal (0.5 Liters/week per plant). Saves 90% water.",
      cycle: "55-65 days (continuous nutrient intake supports heavy fruiting).",
      space: "Medium density (8 plants / m²)."
    },
    vertical: {
      materials: "Lower tiers of vertical towers or wide tiered shelves, wicking support twine.",
      water: "Ultra-low (0.35 Liters/week per plant). Saves 94% water.",
      cycle: "60-70 days.",
      space: "Medium-high density (16 plants / m² using lower tiers)."
    }
  },
  okra: {
    soil: {
      materials: "12\" deep grow bag, sandy-loam soil, compost, strong support stakes.",
      water: "Moderate-high (4-5 Liters/week per plant).",
      cycle: "55-65 days.",
      space: "Low density (5 plants / m²)."
    },
    hydro: {
      materials: "Dutch buckets or deep DWC troughs, leafy/fruiting mineral nutrients, air pump.",
      water: "Minimal (0.45 Liters/week per plant). Saves 90% water.",
      cycle: "40-48 days (grows extremely fast in oxygenated systems).",
      space: "Medium density (10 plants / m²)."
    },
    vertical: {
      materials: "Vertical tower column (dwarf varieties only) or vertical trellis net, pump.",
      water: "Ultra-low (0.3 Liters/week per plant). Saves 95% water.",
      cycle: "45-52 days.",
      space: "High density (24 plants / m² using single-stem training)."
    }
  },
  spinach: {
    soil: {
      materials: "Wide shallow pots (8\" deep), standard potting soil, organic compost.",
      water: "Moderate (3-4 Liters/week per plant).",
      cycle: "35-45 days.",
      space: "Low density (9 plants / m²)."
    },
    hydro: {
      materials: "Floating Raft (DWC) or NFT channels, net cups, clay pebbles, liquid leafy green nutrients, air pump.",
      water: "Very low (0.3 Liters/week). 90% water savings.",
      cycle: "28-35 days.",
      space: "High density (24 plants / m²)."
    },
    vertical: {
      materials: "Vertical pocket green-walls or tiered towers, water pump, timer.",
      water: "Ultra-low (0.2 Liters/week). 95% water savings.",
      cycle: "30-38 days.",
      space: "Maximum density (64 plants / m² using wall panels)."
    }
  },
  coriander: {
    soil: {
      materials: "Shallow seedling trays, light sandy-loam soil, vermicompost.",
      water: "Moderate (2-3 Liters/week).",
      cycle: "40-50 days.",
      space: "Low density (16 plants / m²)."
    },
    hydro: {
      materials: "Static Kratky cups or NFT lines, net cups, coco plugs, leafy minerals.",
      water: "Minimal (0.2 Liters/week). 92% water savings.",
      cycle: "30-35 days.",
      space: "High density (36 plants / m²)."
    },
    vertical: {
      materials: "Stacked horizontal grow shelves, wicking mats, overhead LED bars.",
      water: "Ultra-low (0.15 Liters/week). 95% water savings.",
      cycle: "32-38 days.",
      space: "Maximum density (80 plants / m² on shelving)."
    }
  },
  mint: {
    soil: {
      materials: "10\" wide pot, moisture-holding soil, organic nitrogen compost.",
      water: "High (4-5 Liters/week). Mint thrives in continuous moisture.",
      cycle: "30-40 days from cutting.",
      space: "Low density (9 plants / m²)."
    },
    hydro: {
      materials: "Kratky glass jars or DWC tub, clay pebbles, liquid seaweed nutrients.",
      water: "Very low (0.3 Liters/week). 90% water savings.",
      cycle: "20-25 days (propagates extremely fast in water).",
      space: "High density (24 plants / m²)."
    },
    vertical: {
      materials: "Aeroponic tower column pockets, water pump, timer.",
      water: "Ultra-low (0.2 Liters/week). 95% water savings.",
      cycle: "22-28 days.",
      space: "Maximum density (48 plants / m² cascading down towers)."
    }
  },
  curry: {
    soil: {
      materials: "16\" large clay pot, sandy-loam well-drained soil, cow manure, organic compost.",
      water: "Low-moderate (2-3 Liters/week). Drought-tolerant once established.",
      cycle: "365 days (perennial shrub, slow initial growth).",
      space: "Very low density (2 plants / m²)."
    },
    hydro: {
      materials: "DWC deep reservoir or wicking beds, leafy green mineral formula, air stone.",
      water: "Minimal (0.3 Liters/week). Closed recirculating loop saves 92% water.",
      cycle: "180-200 days to first light harvest.",
      space: "Low density (4 plants / m²)."
    },
    vertical: {
      materials: "Not recommended. Curry Leaf is a woody perennial shrub; it must be grown on lower shelves with ample clearance.",
      water: "N/A",
      cycle: "N/A",
      space: "N/A"
    }
  },
  tulsi: {
    soil: {
      materials: "10\" terracotta pot, loamy soil, vermicompost, cow manure.",
      water: "Moderate (3 Liters/week). Tulsi prefers moist but not waterlogged soil.",
      cycle: "50-60 days.",
      space: "Low density (8 plants / m²)."
    },
    hydro: {
      materials: "NFT channels or Kratky cups, clay pebbles, leafy green nutrients, pump.",
      water: "Minimal (0.2 Liters/week). Saves 92% water.",
      cycle: "35-40 days.",
      space: "High density (20 plants / m²)."
    },
    vertical: {
      materials: "Vertical tower pockets, wicking tower system, submersible pump, timers.",
      water: "Ultra-low (0.15 Liters/week). Saves 95% water.",
      cycle: "38-45 days.",
      space: "Maximum density (48 plants / m² using tower layers)."
    }
  },
  lettuce: {
    soil: {
      materials: "Shallow pots (6-8\" deep), standard potting soil, nitrogen-rich organic compost.",
      water: "Moderate (2.5-3 Liters/week). Shallow roots dry out quickly.",
      cycle: "45-55 days.",
      space: "Low density (12 plants / m²)."
    },
    hydro: {
      materials: "NFT channels or DWC rafts, net cups, coco plugs, leafy minerals, air stone.",
      water: "Minimal (0.15 Liters/week). Saves 95% water.",
      cycle: "30-35 days (champion of commercial hydroponics).",
      space: "High density (30 plants / m²)."
    },
    vertical: {
      materials: "Vertical grow tower pockets or stacked horizontal NFT gutters with grow lights.",
      water: "Ultra-low (0.1 Liters/week). Saves 97% water.",
      cycle: "32-38 days.",
      space: "Maximum density (72 plants / m² using vertical towers)."
    }
  },
  strawberry: {
    soil: {
      materials: "8\" deep hanging baskets, sandy-loam soil, pine needle mulch.",
      water: "Moderate-high (3-4 Liters/week per plant). Fruits rot easily on wet soil.",
      cycle: "90-110 days.",
      space: "Low density (8 plants / m²)."
    },
    hydro: {
      materials: "NFT channels or coco peat slab grow bags on gutters, drip emitters, bloom formulation.",
      water: "Minimal (0.25 Liters/week). Saves 90% water.",
      cycle: "70-80 days.",
      space: "Medium density (16 plants / m²)."
    },
    vertical: {
      materials: "Aeroponic vertical grow tower pockets, wicking columns, water pump, cycle timer.",
      water: "Ultra-low (0.15 Liters/week). Aeroponics prevents fruit-rot diseases completely.",
      cycle: "75-85 days.",
      space: "Highest density (60 plants / m² using vertical tiers)."
    }
  },
  default: {
    soil: {
      materials: "Potting container, standard soil, organic fertilizer.",
      water: "High volume (runoff and soil retention absorption loss).",
      cycle: "Standard grow cycle.",
      space: "1.0x baseline spacing density."
    },
    hydro: {
      materials: "NFT channels / DWC tub, net cups, clay pebbles, hydroponic liquid nutrients.",
      water: "90% water saved (recirculating nutrient water closed loop).",
      cycle: "30% faster harvest cycle (direct mineral intake).",
      space: "2.5x density multiplier."
    },
    vertical: {
      materials: "Aeroponic vertical grow column, submersible pump, programmable timer.",
      water: "95% water saved (gravity run-off recycling loop).",
      cycle: "25% faster harvest cycle.",
      space: "8.0x density multiplier (stacked tiers)."
    }
  }
};

const getComparativeDetails = (plantName) => {
  const lower = plantName.toLowerCase();
  if (lower.includes('tomato')) return COMPARATIVE_DATA.tomato;
  if (lower.includes('pepper') || lower.includes('chili')) return COMPARATIVE_DATA.pepper;
  if (lower.includes('brinjal') || lower.includes('eggplant')) return COMPARATIVE_DATA.brinjal;
  if (lower.includes('okra')) return COMPARATIVE_DATA.okra;
  if (lower.includes('spinach')) return COMPARATIVE_DATA.spinach;
  if (lower.includes('coriander')) return COMPARATIVE_DATA.coriander;
  if (lower.includes('mint')) return COMPARATIVE_DATA.mint;
  if (lower.includes('curry')) return COMPARATIVE_DATA.curry;
  if (lower.includes('tulsi')) return COMPARATIVE_DATA.tulsi;
  if (lower.includes('lettuce')) return COMPARATIVE_DATA.lettuce;
  if (lower.includes('strawberry')) return COMPARATIVE_DATA.strawberry;
  if (lower.includes('kale')) return COMPARATIVE_DATA.kale || COMPARATIVE_DATA.default;
  if (lower.includes('bok')) return COMPARATIVE_DATA.bok || COMPARATIVE_DATA.default;
  return COMPARATIVE_DATA.default;
};

const YieldCalculator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [space, setSpace] = useState(10); // in m2
  const [method, setMethod] = useState('Vertical Tower'); // Soil, DWC, NFT, Vertical Tower
  const [cycles, setCycles] = useState(4); // crop cycles per year
  const [selectedPlants, setSelectedPlants] = useState([1, 5]); // Tomato, Spinach

  const [results, setResults] = useState({
    yieldKg: 0,
    waterSaved: 0,
    spaceMultiplier: '1x',
    carbonOffset: 0,
    costSavings: 0,
    ecoScore: 'B'
  });

  const availablePlants = plantsData.filter(p => [1, 2, 3, 4, 5, 6, 7, 8, 9, 101, 102, 103, 104].includes(p.id));

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

      {/* Comparative Materials & Growing Methods Section */}
      <section className="glass-card comparative-methods-section" style={{ marginTop: '24px', padding: '28px' }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📊 Setup & Materials Comparison</span>
        </h3>
        <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          Compare materials required, water footprint, grow speed, and space density across cultivation styles for your selected crops.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {selectedPlants.map(plantId => {
            const plantObj = plantsData.find(p => p.id === plantId);
            if (!plantObj) return null;
            const comp = getComparativeDetails(plantObj.name);
            
            return (
              <div key={plantId} className="crop-comparison-block" style={{
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden'
              }}>
                <div style={{
                  backgroundColor: 'var(--color-input-bg)',
                  padding: '12px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderBottom: '1px solid var(--color-border)'
                }}>
                  <span style={{ fontSize: '20px' }}>{plantObj.emoji}</span>
                  <h4 style={{ margin: 0, fontWeight: '800', color: 'var(--color-text-primary)' }}>{plantObj.name} Comparison Guide</h4>
                </div>

                <div className="comparison-columns-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1px',
                  backgroundColor: 'var(--color-border)'
                }}>
                  {/* Traditional Soil */}
                  <div style={{ backgroundColor: 'var(--color-card-bg)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h5 style={{ margin: 0, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800' }}>
                      🟤 Traditional Soil Potting
                    </h5>
                    <div style={{ fontSize: '12px', lineHeight: '1.5' }}>
                      <p style={{ margin: '4px 0' }}><strong>Required Materials:</strong> {comp.soil.materials}</p>
                      <p style={{ margin: '4px 0' }}><strong>Water footprint:</strong> {comp.soil.water}</p>
                      <p style={{ margin: '4px 0' }}><strong>Cultivation Cycle:</strong> {comp.soil.cycle}</p>
                      <p style={{ margin: '4px 0' }}><strong>Space Density:</strong> {comp.soil.space}</p>
                    </div>
                  </div>

                  {/* Hydroponics */}
                  <div style={{ backgroundColor: 'var(--color-card-bg)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '1px solid var(--color-border)' }}>
                    <h5 style={{ margin: 0, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800' }}>
                      ⚡ Hydroponics (DWC/NFT)
                    </h5>
                    <div style={{ fontSize: '12px', lineHeight: '1.5' }}>
                      <p style={{ margin: '4px 0' }}><strong>Required Materials:</strong> {comp.hydro.materials}</p>
                      <p style={{ margin: '4px 0' }}><strong>Water footprint:</strong> <span style={{ color: 'var(--color-accent-blue)', fontWeight: 700 }}>{comp.hydro.water}</span></p>
                      <p style={{ margin: '4px 0' }}><strong>Cultivation Cycle:</strong> <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{comp.hydro.cycle}</span></p>
                      <p style={{ margin: '4px 0' }}><strong>Space Density:</strong> {comp.hydro.space}</p>
                    </div>
                  </div>

                  {/* Vertical Farming */}
                  <div style={{ backgroundColor: 'var(--color-card-bg)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '1px solid var(--color-border)' }}>
                    <h5 style={{ margin: 0, color: 'var(--color-accent-blue)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800' }}>
                      📐 Vertical Tower Grow
                    </h5>
                    <div style={{ fontSize: '12px', lineHeight: '1.5' }}>
                      <p style={{ margin: '4px 0' }}><strong>Required Materials:</strong> {comp.vertical.materials}</p>
                      <p style={{ margin: '4px 0' }}><strong>Water footprint:</strong> <span style={{ color: 'var(--color-accent-blue)', fontWeight: 700 }}>{comp.vertical.water}</span></p>
                      <p style={{ margin: '4px 0' }}><strong>Cultivation Cycle:</strong> {comp.vertical.cycle}</p>
                      <p style={{ margin: '4px 0' }}><strong>Space Density:</strong> <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>{comp.vertical.space}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default YieldCalculator;
