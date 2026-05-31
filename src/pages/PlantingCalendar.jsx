import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  ChevronLeft, 
  Search, 
  Printer, 
  Info, 
  CloudRain, 
  Sun, 
  Wind, 
  Thermometer, 
  Droplets, 
  Leaf, 
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { plantsData } from '../data/plantsData';
import './PlantingCalendar.css';

const MONTHS = [
  { name: 'January', short: 'Jan', icon: '❄️' },
  { name: 'February', short: 'Feb', icon: '🍃' },
  { name: 'March', short: 'Mar', icon: '☀️' },
  { name: 'April', short: 'Apr', icon: '🔥' },
  { name: 'May', short: 'May', icon: '🥵' },
  { name: 'June', short: 'Jun', icon: '🌧️' },
  { name: 'July', short: 'Jul', icon: '🌦️' },
  { name: 'August', short: 'Aug', icon: '⛈️' },
  { name: 'September', short: 'Sep', icon: '🌾' },
  { name: 'October', short: 'Oct', icon: '🍁' },
  { name: 'November', short: 'Nov', icon: '🌸' },
  { name: 'December', short: 'Dec', icon: '🌬️' }
];

const REGIONS = {
  bengaluru: {
    name: 'Bengaluru Urban (Elevation ~900m)',
    description: 'Moderate year-round climate. Mild summers and cool winters. Suitable for growing most temperate leafy greens and herbs throughout the year.',
    tips: [
      'Summer (Mar-May): Use light 30% shade nets to prevent leafy greens from bolting due to high UV.',
      'Monsoon (Jun-Sep): Shield hydroponic reservoirs from rain dilution. Check EC daily after showers.',
      'Winter (Dec-Feb): Golden period for exotic crops like Strawberries, Broccoli, and Bell Peppers.'
    ]
  },
  coastal: {
    name: 'Coastal Karnataka (Mangaluru/Udupi)',
    description: 'Hot and highly humid. Heavy monsoon rainfall (Jun-Aug). Requires rain-proof structures and salt-tolerant rootstocks.',
    tips: [
      'Monsoon (Jun-Aug): Direct soil planting is high-risk. Elevate container beds and use rain shelters. NFT hydroponics must be covered.',
      'Summer (Mar-May): Extremely high relative humidity. Ensure spacing is doubled to prevent powdery mildew and fungal diseases.',
      'Post-Monsoon (Oct-Jan): Best season for traditional crops like Okra, Brinjal, and Chillies.'
    ]
  },
  plains: {
    name: 'Dry Plains / Bayaluseeme (Hubballi/Kalaburagi)',
    description: 'Arid to semi-arid. High temperatures and low rainfall. Water conservation is critical; wicking beds and shade nets are essential.',
    tips: [
      'Summer (Mar-May): Temperatures can exceed 40°C. Hydroponics requires reservoir cooling or deep bury. Switch to wicking pots.',
      'Water Optimization: Mulch soil containers with 3 inches of coco peat or straw. Maximize greywater recycling.',
      'Best Crops: Tough heat-tolerant crops like Moringa, Chillies, Okra, and Gourds thrive here.'
    ]
  },
  malnad: {
    name: 'Malnad / Hilly Hilly (Chikkamagaluru/Madikeri)',
    description: 'Wet, cooler highlands. High rainfall, rich soil, cool nights. Excellent for herbs, spices, and exotic fruits.',
    tips: [
      'Monsoon (Jun-Sep): Extreme humidity and heavy downpours. Fungal protection using organic neem sprays is mandatory.',
      'Winter (Nov-Jan): Temperatures drop below 15°C. Slow growth rate; reduce nutrient concentration (EC) slightly.',
      'Best Crops: Rosemary, Thyme, Mint, Strawberries, and Ginger grow exceptionally well here.'
    ]
  }
};

const PlantingCalendar = () => {
  const navigate = useNavigate();
  const [region, setRegion] = useState('bengaluru');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [growingMethod, setGrowingMethod] = useState('Soil'); // Soil, Hydroponics, Vertical

  // Reset filters
  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setGrowingMethod('Soil');
    setRegion('bengaluru');
  };

  // Helper to parse the plant season string and return 12-month status array
  // status: 'sow' | 'grow' | 'harvest' | null
  const getPlantMonthlyStatus = (plant, activeRegion, activeMethod) => {
    const name = plant.name.toLowerCase();
    const cat = plant.cat;
    const seasonStr = (plant.season || 'Year-round').toLowerCase();
    
    // Initialize 12 months array
    let schedule = Array(12).fill(null);

    // 1. Base scheduling based on crop season in database
    if (seasonStr.includes('year-round') || seasonStr.includes('all year')) {
      // Year round crops (leafy greens, herbs)
      // Sow: Jan-Feb, Jun-Jul, Oct-Nov
      // Grow & Harvest in remaining
      for (let i = 0; i < 12; i++) {
        if ([0, 1, 5, 6, 9, 10].includes(i)) {
          schedule[i] = 'sow';
        } else if ([2, 3, 7, 8, 11].includes(i)) {
          schedule[i] = 'grow';
        } else {
          schedule[i] = 'harvest';
        }
      }
    } else if (seasonStr.includes('june-september') || seasonStr.includes('jun-sep')) {
      // Monsoon / Kharif crops (Tomato, Chilli, Okra)
      schedule[5] = 'sow'; // June
      schedule[6] = 'sow'; // July
      schedule[7] = 'grow'; // August
      schedule[8] = 'grow'; // September
      schedule[9] = 'harvest'; // October
      schedule[10] = 'harvest'; // November
    } else if (seasonStr.includes('july-october') || seasonStr.includes('jul-oct')) {
      schedule[6] = 'sow'; // July
      schedule[7] = 'sow'; // August
      schedule[8] = 'grow'; // September
      schedule[9] = 'grow'; // October
      schedule[10] = 'harvest'; // November
      schedule[11] = 'harvest'; // December
    } else if (seasonStr.includes('nov-feb') || seasonStr.includes('november-february') || seasonStr.includes('winter')) {
      // Winter / Rabi crops
      schedule[9] = 'sow'; // October
      schedule[10] = 'sow'; // November
      schedule[11] = 'grow'; // December
      schedule[0] = 'grow'; // January
      schedule[1] = 'harvest'; // February
      schedule[2] = 'harvest'; // March
    } else if (seasonStr.includes('feb-may') || seasonStr.includes('february-may') || seasonStr.includes('summer')) {
      // Summer crops
      schedule[1] = 'sow'; // Feb
      schedule[2] = 'sow'; // March
      schedule[3] = 'grow'; // April
      schedule[4] = 'grow'; // May
      schedule[5] = 'harvest'; // June
      schedule[6] = 'harvest'; // July
    } else {
      // Default fallback based on category
      if (cat === 'Herbs' || cat === 'Leafy Greens') {
        for (let i = 0; i < 12; i++) {
          if ([0, 3, 6, 9].includes(i)) schedule[i] = 'sow';
          else if ([1, 4, 7, 10].includes(i)) schedule[i] = 'grow';
          else schedule[i] = 'harvest';
        }
      } else {
        // General crop cycle (Sow: Jun-Jul, Grow: Aug-Sep, Harvest: Oct)
        schedule[5] = 'sow'; schedule[6] = 'sow';
        schedule[7] = 'grow'; schedule[8] = 'grow';
        schedule[9] = 'harvest'; schedule[10] = 'harvest';
      }
    }

    // 2. Adjustments based on REGION
    if (activeRegion === 'coastal') {
      // Heavy monsoon in June-August makes sowing soil seeds almost impossible due to washing away.
      // Shift June/July soil sowing to September, or mark as 'grow' only if protected.
      if (activeMethod === 'Soil') {
        for (let i = 5; i <= 7; i++) {
          if (schedule[i] === 'sow') {
            schedule[i] = null; // Clear out sow during peak rains
            schedule[(i + 3) % 12] = 'sow'; // Shift to post monsoon
          }
        }
      }
    } else if (activeRegion === 'plains') {
      // Extreme summer heat in March-May bolts leafy greens.
      if (cat === 'Leafy Greens' || name.includes('lettuce') || name.includes('spinach') || name.includes('coriander') || name.includes('kale')) {
        // Soil plants burn in Peak Summer
        if (activeMethod === 'Soil') {
          schedule[2] = null; // March - dead
          schedule[3] = null; // April - dead
          schedule[4] = null; // May - dead
        }
      }
    }

    // 3. Adjustments based on GROWING METHOD (Hydroponics / Vertical towers)
    // Hydroponics extends growing seasons, allowing earlier sowing and longer harvesting
    if (activeMethod === 'Hydroponics' || activeMethod === 'Vertical') {
      for (let i = 0; i < 12; i++) {
        // Expand the grow & harvest window by 1 month because of faster grow rates
        if (schedule[i] === 'grow' && schedule[(i + 1) % 12] === null) {
          schedule[(i + 1) % 12] = 'grow';
        }
        if (schedule[i] === 'harvest' && schedule[(i + 1) % 12] === null) {
          schedule[(i + 1) % 12] = 'harvest';
        }
        // Hydro allows continuous seed starting indoors
        if (schedule[i] === 'sow' && schedule[(i - 1 + 12) % 12] === null) {
          schedule[(i - 1 + 12) % 12] = 'sow';
        }
      }
    }

    return schedule;
  };

  // Process data
  const filteredPlants = plantsData.filter(plant => {
    // 1. Category filter
    if (selectedCategory !== 'All' && plant.cat !== selectedCategory) {
      return false;
    }
    // 2. Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const nameMatch = plant.name.toLowerCase().includes(q);
      const scMatch = (plant.sc || '').toLowerCase().includes(q);
      const catMatch = plant.cat.toLowerCase().includes(q);
      if (!nameMatch && !scMatch && !catMatch) return false;
    }
    return true;
  });

  // Calculate statistics for the selected month
  const getMonthStats = () => {
    let sowingCount = 0;
    let growingCount = 0;
    let harvestingCount = 0;

    filteredPlants.forEach(plant => {
      const schedule = getPlantMonthlyStatus(plant, region, growingMethod);
      const status = schedule[selectedMonth];
      if (status === 'sow') sowingCount++;
      else if (status === 'grow') growingCount++;
      else if (status === 'harvest') harvestingCount++;
    });

    return { sowingCount, growingCount, harvestingCount };
  };

  const { sowingCount, growingCount, harvestingCount } = getMonthStats();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="planting-calendar-page page-transition">
      
      {/* Back button */}
      <button className="back-nav-btn no-print" onClick={() => navigate('/')}>
        <ChevronLeft size={18} /> Back to Dashboard
      </button>

      {/* Header */}
      <header className="calendar-header">
        <div className="header-text-block">
          <div className="title-icon-row">
            <Calendar className="text-green header-icon" size={36} />
            <h1>South India Planting Calendar</h1>
          </div>
          <p>Optimize your urban sow-grow-harvest schedules based on regional microclimates and modern setups.</p>
        </div>
        <button className="btn-secondary print-btn no-print" onClick={handlePrint}>
          <Printer size={16} /> Print/PDF Guide
        </button>
      </header>

      {/* Filter and settings bar */}
      <section className="glass-card controls-card no-print">
        <div className="controls-row top-controls">
          <div className="control-group region-selector">
            <label htmlFor="region-select">Select Climate Zone</label>
            <select 
              id="region-select"
              value={region} 
              onChange={e => setRegion(e.target.value)}
              className="calendar-select"
            >
              <option value="bengaluru">Bengaluru Urban (Moderate, high elevation)</option>
              <option value="coastal">Coastal Karnataka (Hot, humid, high monsoon rain)</option>
              <option value="plains">Dry Plains / Bayaluseeme (Arid, hot, dry winter)</option>
              <option value="malnad">Malnad / Western Ghats (Hilly, wet, cool nights)</option>
            </select>
          </div>

          <div className="control-group method-selector">
            <label>Growing Method</label>
            <div className="toggle-button-group">
              {['Soil', 'Hydroponics', 'Vertical'].map(method => (
                <button
                  key={method}
                  className={`toggle-btn ${growingMethod === method ? 'active' : ''}`}
                  onClick={() => setGrowingMethod(method)}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="controls-row bottom-controls">
          <div className="control-group search-group">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={16} />
              <input
                type="text"
                placeholder="Search crops, scientific names..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="calendar-search-input"
              />
            </div>
          </div>

          <div className="control-group category-group">
            <div className="category-pills">
              {['All', 'Vegetables', 'Herbs', 'Fruits', 'Flowers'].map(cat => (
                <button
                  key={cat}
                  className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <button className="reset-filters-btn" onClick={handleReset} title="Reset All Filters">
            <RotateCcw size={16} />
          </button>
        </div>
      </section>

      {/* Split layout: Month Detail Panel (Left) & Schedule Grid (Right) */}
      <div className="calendar-layout-grid">
        
        {/* Month Selector & Details (Left Panel) */}
        <div className="month-details-column">
          
          {/* Horizontal Months Selector (No Print) */}
          <div className="glass-card months-navigation no-print">
            <h3>Select Month</h3>
            <div className="months-scroll-grid hide-scrollbar">
              {MONTHS.map((m, idx) => (
                <button
                  key={m.name}
                  className={`month-tab-btn ${selectedMonth === idx ? 'active' : ''}`}
                  onClick={() => setSelectedMonth(idx)}
                >
                  <span className="month-btn-emoji">{m.icon}</span>
                  <span className="month-btn-name">{m.short}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Month Stats & Climate Advisory */}
          <div className="glass-card month-advisory-card">
            <div className="advisory-header">
              <div className="advisory-title-block">
                <span className="advisory-emoji">{MONTHS[selectedMonth].icon}</span>
                <div>
                  <h2>{MONTHS[selectedMonth].name}</h2>
                  <small>Regional Climate Advisory</small>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="advisory-stats-row">
              <div className="adv-stat-chip sow">
                <div className="stat-dot"></div>
                <div className="stat-vals">
                  <span className="stat-label">Sowing Now</span>
                  <span className="stat-number">{sowingCount} Crops</span>
                </div>
              </div>
              <div className="adv-stat-chip grow">
                <div className="stat-dot"></div>
                <div className="stat-vals">
                  <span className="stat-label">Growing Phase</span>
                  <span className="stat-number">{growingCount} Crops</span>
                </div>
              </div>
              <div className="adv-stat-chip harvest">
                <div className="stat-dot"></div>
                <div className="stat-vals">
                  <span className="stat-label">Harvesting Now</span>
                  <span className="stat-number">{harvestingCount} Crops</span>
                </div>
              </div>
            </div>

            {/* Advisory Tips List */}
            <div className="advisory-tips-block">
              <div className="advisory-sub-title">
                <Thermometer size={16} />
                <span>Zone: {REGIONS[region].name}</span>
              </div>
              <p className="zone-desc-text">{REGIONS[region].description}</p>
              
              <ul className="advisory-tips-list">
                {REGIONS[region].tips.map((tip, idx) => (
                  <li key={idx}>
                    <Info size={14} className="bullet-info-icon" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech Advisory (Hydro/Vertical specific) */}
            <div className="tech-advisory-block">
              <div className="advisory-sub-title">
                <Droplets size={16} />
                <span>System Guidelines ({growingMethod})</span>
              </div>
              <p className="tech-adv-text">
                {growingMethod === 'Hydroponics' && (
                  "💡 Keep nutrient solution temperature below 26°C. During warm months, bury reservoirs or add insulated sleeves to prevent root rot. Monitor EC frequently."
                )}
                {growingMethod === 'Vertical' && (
                  "💡 Check vertical nozzle emitters weekly. In high wind seasons (June-August), ensure structural supports are tied down. Rotate towers 180 degrees weekly for uniform sun."
                )}
                {growingMethod === 'Soil' && (
                  "💡 Maintain 2-inch organic mulch layer. Soil microbes are highly active; feed root systems with seaweed liquid extract once every 2 weeks."
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Calendar Grid (Right Column / Main Body) */}
        <div className="glass-card calendar-grid-panel">
          <div className="grid-header-row">
            <h3>Crop Schedule Summary</h3>
            <div className="legend-row">
              <div className="legend-item"><span className="legend-box sow"></span> Sow</div>
              <div className="legend-item"><span className="legend-box grow"></span> Grow</div>
              <div className="legend-item"><span className="legend-box harvest"></span> Harvest</div>
            </div>
          </div>

          <div className="grid-responsive-container hide-scrollbar">
            <table className="calendar-table">
              <thead>
                <tr>
                  <th className="sticky-column-header">Crop Name</th>
                  {MONTHS.map((m, idx) => (
                    <th 
                      key={m.short} 
                      className={`month-column-header ${selectedMonth === idx ? 'highlighted-col' : ''}`}
                      onClick={() => setSelectedMonth(idx)}
                    >
                      <div>{m.short}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPlants.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="empty-results-cell">
                      <div className="empty-state-card">
                        <Info size={24} />
                        <p>No crops match your search or category filter.</p>
                        <button className="btn-secondary" onClick={handleReset}>Reset Filters</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPlants.map(plant => {
                    const schedule = getPlantMonthlyStatus(plant, region, growingMethod);
                    return (
                      <tr key={plant.id} className="crop-schedule-row">
                        <td className="sticky-column-cell">
                          <div 
                            className="crop-info-cell"
                            onClick={() => navigate(`/encyclopedia/${plant.id}`)}
                          >
                            <span className="crop-emoji">{plant.emoji}</span>
                            <div className="crop-details">
                              <span className="crop-name">{plant.name}</span>
                              <span className="crop-sub">{plant.cat}</span>
                            </div>
                            <ExternalLink size={12} className="link-icon" />
                          </div>
                        </td>
                        {schedule.map((status, idx) => {
                          let statusClass = '';
                          let titleText = `${plant.name}: Off-Season`;
                          if (status === 'sow') {
                            statusClass = 'cell-sow';
                            titleText = `${plant.name}: Best Sowing Month`;
                          } else if (status === 'grow') {
                            statusClass = 'cell-grow';
                            titleText = `${plant.name}: Vegetative Growth / Fruiting`;
                          } else if (status === 'harvest') {
                            statusClass = 'cell-harvest';
                            titleText = `${plant.name}: Ready for Harvest`;
                          }

                          return (
                            <td 
                              key={idx} 
                              className={`calendar-cell ${statusClass} ${selectedMonth === idx ? 'highlighted-col' : ''}`}
                              title={titleText}
                              onClick={() => setSelectedMonth(idx)}
                            >
                              <div className="cell-indicator-bar"></div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          <div className="calendar-disclaimer">
            <Info size={12} />
            <span>Sowing and harvesting times are projections. Indoor hydroponics with LED grow lights can grow crops year-round regardless of outdoor climate changes.</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default PlantingCalendar;
