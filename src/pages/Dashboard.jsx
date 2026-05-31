import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, Stethoscope, ShoppingBag, UserPlus, Droplets, Wind, 
  ThermometerSun, Plus, X, Check, MessageSquare, ShieldAlert,
  Flame, LineChart, Award, Zap, Compass, Calendar, Gift, RefreshCw
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { plantsData } from '../data/plantsData';
import { awardXP, unlockBadge, updateStreak } from '../utils/gamification';
import './Dashboard.css';

const BACKEND_URL = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? (import.meta.env.VITE_BACKEND_URL || '')
  : '';

const CITY_COORDINATES = {
  bangalore: { lat: 12.9716, lon: 77.5946, name: 'Bangalore' },
  bengaluru: { lat: 12.9716, lon: 77.5946, name: 'Bengaluru' },
  mangalore: { lat: 12.9141, lon: 74.8560, name: 'Mangalore' },
  mangaluru: { lat: 12.9141, lon: 74.8560, name: 'Mangaluru' },
  puttur: { lat: 12.7248, lon: 75.2071, name: 'Puttur' },
  mysore: { lat: 12.2958, lon: 76.6394, name: 'Mysore' },
  mysuru: { lat: 12.2958, lon: 76.6394, name: 'Mysuru' },
  hubli: { lat: 15.3647, lon: 75.1240, name: 'Hubli' },
  hubballi: { lat: 15.3647, lon: 75.1240, name: 'Hubballi' },
  dharwad: { lat: 15.4589, lon: 75.0078, name: 'Dharwad' },
  udupi: { lat: 13.3409, lon: 74.7421, name: 'Udupi' },
  belgaum: { lat: 15.8497, lon: 74.4977, name: 'Belgaum' },
  belagavi: { lat: 15.8497, lon: 74.4977, name: 'Belagavi' },
  shimoga: { lat: 13.9299, lon: 75.5681, name: 'Shimoga' },
  shivamogga: { lat: 13.9299, lon: 75.5681, name: 'Shivamogga' }
};

const Dashboard = () => {
  const { user, profile, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [weather, setWeather] = useState({ temp: '--', humidity: '--', wind: '--', isLoading: true });
  const [resolvedCity, setResolvedCity] = useState('Bangalore');
  const [locationSource, setLocationSource] = useState('Default');
  const [showEcoExplanation, setShowEcoExplanation] = useState(false);
  const [myPlants, setMyPlants] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [isLoadingPlants, setIsLoadingPlants] = useState(true);
  const [showAddPlant, setShowAddPlant] = useState(false);
  const [newPlant, setNewPlant] = useState({ name: '', species: '', waterDays: 2, method: 'Hydroponics' });
  const [toast, setToast] = useState(null);

  // Recipe Generator States
  const [selectedHarvests, setSelectedHarvests] = useState(['Tomato', 'Mint']);
  const [harvestQty, setHarvestQty] = useState('1kg');
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);
  const [recipeError, setRecipeError] = useState('');

  // Extract names of active plants to show as options, alongside standard defaults
  const activePlantNames = Array.from(new Set(myPlants.map(p => p.name)));
  const defaultIngredients = ['Tomato', 'Mint', 'Coriander', 'Basil', 'Chili', 'Curry Leaf', 'Spinach'];
  const harvestIngredients = Array.from(new Set([...activePlantNames, ...defaultIngredients])).slice(0, 10);

  const getIngredientEmoji = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('tomato')) return '🍅';
    if (lower.includes('mint')) return '🌿';
    if (lower.includes('coriander')) return '🌿';
    if (lower.includes('basil')) return '🍃';
    if (lower.includes('chili') || lower.includes('pepper')) return '🌶️';
    if (lower.includes('curry')) return '🍃';
    if (lower.includes('spinach')) return '🥬';
    if (lower.includes('strawberry')) return '🍓';
    if (lower.includes('lettuce')) return '🥬';
    return '🌱';
  };

  const handleToggleHarvest = (item) => {
    if (selectedHarvests.includes(item)) {
      setSelectedHarvests(selectedHarvests.filter(h => h !== item));
    } else {
      setSelectedHarvests([...selectedHarvests, item]);
    }
  };

  const handleGenerateRecipes = async () => {
    if (selectedHarvests.length === 0) return;
    setIsGeneratingRecipes(true);
    setRecipeError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/generate-recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: selectedHarvests,
          harvestQty: harvestQty,
          recipeCount: 3
        })
      });

      if (!res.ok) throw new Error('API server returned error');
      const data = await res.json();
      setGeneratedRecipes(data.recipes || []);
      
      // Award XP for utilizing harvest recipes
      await awardXP(25, 'Generated Harvest Recipes', user?.id);
    } catch (err) {
      setRecipeError('Recipe service is currently busy. Please try again.');
    } finally {
      setIsGeneratingRecipes(false);
    }
  };

  // Live IoT Sensor Simulator State
  const [sensorData, setSensorData] = useState({
    temp: 23.4,
    ph: 5.95,
    ec: 1.82,
    humidity: 64,
    light: 4800,
    status: 'OPTIMAL'
  });
  
  // Last 20 simulated ticks of pH and EC for the SVG sparkline
  const [history, setHistory] = useState({
    ph: [5.8, 5.9, 5.85, 5.95, 6.0, 5.9, 5.85, 5.9, 6.05, 5.95, 6.0, 5.9, 5.8, 5.85, 5.95, 6.0, 5.95, 5.9, 5.85, 5.95],
    ec: [1.7, 1.75, 1.8, 1.78, 1.82, 1.85, 1.8, 1.83, 1.81, 1.86, 1.88, 1.85, 1.8, 1.78, 1.82, 1.84, 1.81, 1.83, 1.85, 1.82]
  });

  // Fetch mock base data
  const mockReminders = [
    { id: 1, name: 'Tomato', emoji: '🍅', msg: 'Watering overdue', status: 'urgent', color: 'red', waterDays: 2 },
    { id: 2, name: 'Tulsi', emoji: '🌿', msg: 'Due today', status: 'due', color: 'orange', waterDays: 1 },
    { id: 3, name: 'Butterhead Lettuce', emoji: '🥬', msg: 'Done', status: 'done', color: 'green', waterDays: 4 },
  ];

  const mockMyPlants = [
    { id: 1, name: 'Butterhead Lettuce', emoji: '🥬', health: 'green', progress: 95, nextWater: 'In 3 days', waterDays: 4, method: 'Hydroponics', image: plantsData.find(p=>p.name==='Butterhead Lettuce')?.image },
    { id: 2, name: 'Vertical Strawberry', emoji: '🍓', health: 'green', progress: 90, nextWater: 'Tomorrow', waterDays: 2, method: 'Vertical Tower', image: plantsData.find(p=>p.name==='Vertical Strawberry')?.image },
    { id: 3, name: 'San Marzano Tomato', emoji: '🍅', health: 'orange', progress: 70, nextWater: 'Today', waterDays: 2, method: 'Hydroponics', image: plantsData.find(p=>p.name==='Tomato')?.image },
    { id: 4, name: 'Sacred Tulsi', emoji: '🌿', health: 'green', progress: 95, nextWater: 'Tomorrow', waterDays: 1, method: 'Soil', image: plantsData.find(p=>p.name==='Tulsi')?.image },
  ];

  const getPlantEmoji = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('lettuce')) return '🥬';
    if (lower.includes('strawberry')) return '🍓';
    if (lower.includes('kale')) return '🥬';
    if (lower.includes('bok choy')) return '🥬';
    if (lower.includes('tomato')) return '🍅';
    if (lower.includes('tulsi') || lower.includes('basil')) return '🌿';
    if (lower.includes('aloe')) return '🪴';
    if (lower.includes('curry')) return '🍃';
    if (lower.includes('rose')) return '🌹';
    if (lower.includes('mint')) return '🌿';
    if (lower.includes('marigold')) return '🌼';
    return '🌱';
  };

  const calculateNextWater = (lastWatered, frequencyDays) => {
    if (!lastWatered) return 'Unknown';
    const next = new Date(lastWatered);
    next.setDate(next.getDate() + frequencyDays);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    next.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((next - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Overdue!';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `In ${diffDays} days`;
  };

  const getHealthFromWater = (lastWatered, frequencyDays) => {
    if (!lastWatered) return 'orange';
    const next = new Date(lastWatered);
    next.setDate(next.getDate() + frequencyDays);
    const today = new Date();
    const diffDays = Math.ceil((next - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'red';
    if (diffDays === 0) return 'orange';
    return 'green';
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handlePlantClick = (plantName) => {
    if (!plantName) return;
    const lowerName = plantName.toLowerCase();
    const encyPlant = plantsData.find(p => lowerName.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(lowerName));
    
    if (encyPlant) {
      navigate(`/encyclopedia/${encyPlant.id}`, { state: { plant: encyPlant } });
    } else {
      showToast(`No encyclopedia guide found for ${plantName}.`);
    }
  };

  // Weather fetch helper
  const fetchWeather = async () => {
    setWeather(w => ({ ...w, isLoading: true }));
    let lat = 12.9716; // default Bangalore
    let lon = 77.5946;
    let cityName = 'Bangalore';
    let source = 'Default';

    // 1. Try Geolocation (GPS) first
    const getGPSCoords = () => {
      return new Promise((resolve) => {
        if (!navigator.geolocation) return resolve(null);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lon: position.coords.longitude
            });
          },
          () => {
            resolve(null); // denied or error
          },
          { timeout: 5000 }
        );
      });
    };

    const gps = await getGPSCoords();
    if (gps) {
      lat = gps.lat;
      lon = gps.lon;
      source = 'GPS';
      
      // Attempt reverse geocoding to get human readable city name
      try {
        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          cityName = geoData.city || geoData.locality || geoData.principalSubdivision || 'Current Location';
        } else {
          cityName = `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
        }
      } catch (err) {
        cityName = `Lat: ${lat.toFixed(2)}, Lon: ${lon.toFixed(2)}`;
      }
    } else {
      // 2. Try User Profile City fallback
      const profileCity = profile?.city || 'Bangalore';
      const cleanCityName = profileCity.trim().toLowerCase();
      
      if (CITY_COORDINATES[cleanCityName]) {
        lat = CITY_COORDINATES[cleanCityName].lat;
        lon = CITY_COORDINATES[cleanCityName].lon;
        cityName = CITY_COORDINATES[cleanCityName].name;
        source = 'Profile';
      } else {
        cityName = profileCity;
        source = 'Profile';
      }
    }

    setResolvedCity(cityName);
    setLocationSource(source);

    // Fetch from Open-Meteo
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`);
      if (!res.ok) throw new Error('Weather API error');
      const data = await res.json();
      if (data.current) {
        setWeather({
          temp: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          wind: data.current.wind_speed_10m,
          isLoading: false
        });
      }
    } catch (error) {
      console.warn('Weather fetch failed, using fallback:', error);
      setWeather({ temp: '28.4', humidity: '64', wind: '4.2', isLoading: false });
    }
  };

  // Weather fetch
  useEffect(() => {
    
    // Fetch plants
    const fetchPlantsData = async () => {
      setIsLoadingPlants(true);
      try {
        const query = isAuthenticated
          ? supabase.from('user_plants').select('*').eq('user_id', user.id)
          : supabase.from('user_plants').select('*');

        const { data, error } = await query;
        if (error) throw error;

        if (data && data.length > 0) {
          const dbPlants = data.map(p => {
            const encyPlant = plantsData.find(ep => ep.name.toLowerCase() === p.plant_name.toLowerCase() || p.plant_name.toLowerCase().includes(ep.name.toLowerCase()));
            return {
              id: p.id,
              name: p.plant_name,
              emoji: getPlantEmoji(p.plant_name),
              image: encyPlant?.image,
              health: getHealthFromWater(p.last_watered, p.watering_frequency_days),
              progress: getHealthFromWater(p.last_watered, p.watering_frequency_days) === 'green' ? 95 : getHealthFromWater(p.last_watered, p.watering_frequency_days) === 'orange' ? 60 : 30,
              nextWater: calculateNextWater(p.last_watered, p.watering_frequency_days),
              waterDays: p.watering_frequency_days,
              lastWatered: p.last_watered,
              method: p.grow_method || 'Hydroponics',
              dbId: p.id
            };
          });
          setMyPlants(dbPlants);
          
          // Count hydroponics and vertical tower systems to check for Hydroponic Hero badge
          const hydroAndVerticalCount = dbPlants.filter(p => p.method === 'Hydroponics' || p.method === 'Vertical Tower').length;
          if (hydroAndVerticalCount >= 2) {
            await unlockBadge('hydro_hero', user?.id);
          }

          // Generate reminders
          const dynamicReminders = dbPlants
            .filter(p => p.health !== 'green')
            .slice(0, 3)
            .map(p => ({
              ...p,
              msg: p.nextWater === 'Overdue!' ? 'Watering overdue' : p.nextWater === 'Today' ? 'Due today' : `Water ${p.nextWater}`,
              status: p.health === 'red' ? 'urgent' : 'due',
              color: p.health === 'red' ? 'red' : 'orange'
            }));
          
          const doneReminders = dbPlants
            .filter(p => p.health === 'green')
            .slice(0, 1)
            .map(p => ({
              ...p, msg: 'Well watered', status: 'done', color: 'green'
            }));

          setReminders([...dynamicReminders, ...doneReminders]);
        } else if (isAuthenticated) {
          setMyPlants([]);
          setReminders([]);
        } else {
          setMyPlants(mockMyPlants);
          setReminders(mockReminders);
        }
      } catch(err) {
        if (isAuthenticated) {
          setMyPlants([]);
          setReminders([]);
        } else {
          setMyPlants(mockMyPlants);
          setReminders(mockReminders);
        }
      } finally {
        setIsLoadingPlants(false);
      }
    };

    fetchWeather();
    fetchPlantsData();
  }, [user, isAuthenticated, profile]);

  // IoT Sensor fluctuation simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => {
        const nextTemp = Math.round((22.4 + Math.sin(Date.now() / 80000) * 1.5 + (Math.random() - 0.5) * 0.4) * 10) / 10;
        const nextPh = Math.round((6.1 + Math.sin(Date.now() / 40000) * 0.2 + (Math.random() - 0.5) * 0.1) * 100) / 100;
        const nextEc = Math.round((1.82 + Math.cos(Date.now() / 60000) * 0.15 + (Math.random() - 0.5) * 0.06) * 100) / 100;
        const nextHum = Math.round(62 + Math.sin(Date.now() / 100000) * 5 + (Math.random() - 0.5) * 1.5);
        const nextLight = Math.round(4800 + Math.sin(Date.now() / 30000) * 800 + (Math.random() - 0.5) * 150);

        let status = 'OPTIMAL';
        if (nextPh < 5.6 || nextPh > 6.6 || nextTemp > 27 || nextTemp < 17) {
          status = 'WARNING';
        }
        if (nextPh < 5.2 || nextPh > 7.0) {
          status = 'ALERT';
        }

        setHistory(hist => {
          return {
            ph: [...hist.ph.slice(1), nextPh],
            ec: [...hist.ec.slice(1), nextEc]
          };
        });

        return { temp: nextTemp, ph: nextPh, ec: nextEc, humidity: nextHum, light: nextLight, status };
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAddPlant = async (e) => {
    e.preventDefault();
    if (!newPlant.name.trim()) return;

    try {
      if (isAuthenticated) {
        const { data, error } = await supabase.from('user_plants').insert([{
          user_id: user.id,
          plant_name: newPlant.name,
          species: newPlant.species || null,
          watering_frequency_days: parseInt(newPlant.waterDays) || 2,
          last_watered: new Date().toISOString(),
          grow_method: newPlant.method,
          health_status: 'Good'
        }]).select();
        if (error) throw error;

        const p = data[0];
        setMyPlants(prev => [...prev, {
          id: p.id, name: p.plant_name, emoji: getPlantEmoji(p.plant_name),
          health: 'green', progress: 100,
          nextWater: calculateNextWater(p.last_watered, p.watering_frequency_days),
          waterDays: p.watering_frequency_days, lastWatered: p.last_watered, method: p.grow_method, dbId: p.id
        }]);
      } else {
        setMyPlants(prev => [...prev, {
          id: Date.now(), name: newPlant.name, emoji: getPlantEmoji(newPlant.name),
          health: 'green', progress: 100, nextWater: `In ${newPlant.waterDays} days`,
          waterDays: newPlant.waterDays, lastWatered: new Date().toISOString(), method: newPlant.method
        }]);
      }

      showToast(`🌱 ${newPlant.name} added to your ${newPlant.method} system!`);
      setNewPlant({ name: '', species: '', waterDays: 2, method: 'Hydroponics' });
      setShowAddPlant(false);
    } catch (err) {
      showToast('Failed to add plant. Try again.');
    }
  };

  const handleWaterPlant = async (plant) => {
    const isDueOrOverdue = plant.health !== 'green';
    try {
      if (isAuthenticated && plant.dbId) {
        const { error } = await supabase
          .from('user_plants')
          .update({ last_watered: new Date().toISOString() })
          .eq('id', plant.dbId);
        if (error) throw error;
      }

      setMyPlants(prev => prev.map(p => {
        if (p.id === plant.id) {
          return {
            ...p, health: 'green', progress: 100,
            nextWater: calculateNextWater(new Date().toISOString(), p.waterDays),
            lastWatered: new Date().toISOString()
          };
        }
        return p;
      }));

      setReminders(prev => prev.map(r => {
        if (r.id === plant.id) {
          return { ...r, status: 'done', msg: 'Well watered', color: 'green' };
        }
        return r;
      }));

      showToast(`💧 ${plant.name} has been watered/replenished!`);

      if (isDueOrOverdue) {
        await awardXP(20, `Watered ${plant.name} on time`, user?.id);
        await updateStreak(user?.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Dynamic calculations for Eco-Savings HUD
  const hydroAndVerticalCount = myPlants.filter(p => p.method === 'Hydroponics' || p.method === 'Vertical Tower').length;
  // Let's assume a hydroponics system saves ~8.5 Liters of water per plant per day compared to soil
  const waterSavedLiters = Math.round(hydroAndVerticalCount * 8.5 * 14.5); // 14.5 days avg running
  // Vertical towers can pack 8x plants per sq meter compared to horizontal soil rows
  const spaceMultiplier = hydroAndVerticalCount > 0 ? '8.0x' : '1.0x';
  const ecoScore = hydroAndVerticalCount > 2 ? 'A+' : hydroAndVerticalCount > 0 ? 'A' : 'B';

  const renderSparkline = (data, min, max) => {
    const w = 110;
    const h = 26;
    const pts = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * w;
      const y = h - 2 - ((val - min) / (max - min)) * (h - 4);
      return `${x},${y}`;
    }).join(' ');
    
    return (
      <svg width={w} height={h} className="sparkline-svg">
        <polyline fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={pts} />
      </svg>
    );
  };

  const quickActions = [
    { title: 'Encyclopedia', desc: 'Browse grow guides', icon: BookOpen, path: '/encyclopedia', emoji: '📖' },
    { title: 'Yield Calculator', desc: 'Calculate food/water saved', icon: Award, path: '/yield-calculator', emoji: '📊' },
    { title: 'Plant Calendar', desc: 'Sow windows for KA', icon: Calendar, path: '/planting-calendar', emoji: '📅' },
    { title: 'AI Plant Doctor', desc: 'Gemini visual diagnosis', icon: Stethoscope, path: '/ai-tools', emoji: '🤖' },
    { title: 'Buy Supplies', desc: 'Amazon-style shopping', icon: ShoppingBag, path: '/market', emoji: '🛒' },
    { title: 'Hire Expert', desc: 'Gardening consultations', icon: UserPlus, path: '/experts', emoji: '👨‍🌾' },
    { title: 'Community Feed', desc: 'YouTube-style discussion', icon: MessageSquare, path: '/community', emoji: '💬' }
  ];

  return (
    <div className="dashboard page-transition">
      {/* Top Banner section */}
      <section className="dashboard-header-container">
        <div className="header-greeting-block">
          <h1 className="hero-greeting">Smart Grow Dashboard</h1>
          <p className="hero-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        
        {/* Weather widget */}
        <div className="glass-card weather-card">
          <div className="weather-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {resolvedCity}
              <button 
                className="location-refresh-btn" 
                onClick={fetchWeather} 
                title={`Weather resolved via ${locationSource}. Click to fetch live GPS location.`}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '2px',
                  borderRadius: '4px',
                  transition: 'opacity 0.2s'
                }}
              >
                <RefreshCw size={14} className={weather.isLoading ? 'spin-animation' : ''} />
              </button>
            </h3>
            <span style={{ fontSize: '10px', opacity: 0.8, textTransform: 'uppercase', fontWeight: 700 }}>
              {locationSource === 'GPS' ? '📍 GPS Location' : '🏠 Profile Location'}
            </span>
          </div>
          <div className="weather-stats">
            <div className="stat">
              <ThermometerSun size={18} color="var(--color-accent-yellow)" />
              <span>{weather.temp}°C</span>
            </div>
            <div className="stat">
              <Droplets size={18} color="var(--color-accent-blue)" />
              <span>{weather.humidity}%</span>
            </div>
            <div className="stat">
              <Wind size={18} color="var(--color-text-secondary)" />
              <span>{weather.wind} km/h</span>
            </div>
          </div>
        </div>
      </section>

      {/* IoT Sensors Live Dashboard HUD */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Live IoT Telemetry</h2>
          <span className={`telemetry-status status-${sensorData.status.toLowerCase()}`}>
            {sensorData.status === 'OPTIMAL' ? '● System Optimal' : sensorData.status === 'WARNING' ? '▲ Range Warning' : '✖ System Critical'}
          </span>
        </div>
        
        <div className="telemetry-grid">
          <div className="glass-card telemetry-card">
            <div className="telemetry-label">Water Reservoir pH</div>
            <div className="telemetry-value-row">
              <span className={`telemetry-value ${sensorData.ph < 5.6 || sensorData.ph > 6.6 ? 'text-red' : 'text-green'}`}>{sensorData.ph}</span>
              <span className="telemetry-unit">pH</span>
            </div>
            <div className="telemetry-spark">
              {renderSparkline(history.ph, 5.5, 6.5)}
            </div>
          </div>
          
          <div className="glass-card telemetry-card">
            <div className="telemetry-label">Conductivity (EC)</div>
            <div className="telemetry-value-row">
              <span className="telemetry-value text-blue">{sensorData.ec}</span>
              <span className="telemetry-unit">mS/cm</span>
            </div>
            <div className="telemetry-spark">
              {renderSparkline(history.ec, 1.5, 2.2)}
            </div>
          </div>

          <div className="glass-card telemetry-card">
            <div className="telemetry-label">Reservoir Temp</div>
            <div className="telemetry-value-row">
              <span className="telemetry-value">{sensorData.temp}</span>
              <span className="telemetry-unit">°C</span>
            </div>
            <div className="telemetry-info-box">Optimal: 18 - 24°C</div>
          </div>

          <div className="glass-card telemetry-card">
            <div className="telemetry-label">Ambient Humidity</div>
            <div className="telemetry-value-row">
              <span className="telemetry-value">{sensorData.humidity}</span>
              <span className="telemetry-unit">%</span>
            </div>
            <div className="telemetry-info-box">Target: 50 - 70%</div>
          </div>

          <div className="glass-card telemetry-card">
            <div className="telemetry-label">Light Intensity</div>
            <div className="telemetry-value-row">
              <span className="telemetry-value">{sensorData.light}</span>
              <span className="telemetry-unit">lux</span>
            </div>
            <div className="telemetry-info-box">Photo Period Active</div>
          </div>
        </div>
      </section>

      {/* Smart Eco-Savings Panel */}
      <section className="glass-card eco-savings-hud" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="eco-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Award size={24} className="eco-icon" />
            <div>
              <h3>Your Urban Eco-Impact</h3>
              <p>Calculated in real time based on your active hydroponic & vertical tower systems</p>
            </div>
          </div>
          <button 
            className="eco-info-toggle-btn"
            onClick={() => setShowEcoExplanation(!showEcoExplanation)}
            style={{
              padding: '6px 12px',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              border: 'none',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s',
              outline: 'none'
            }}
          >
            {showEcoExplanation ? 'Hide Info' : 'How it works?'}
          </button>
        </div>
        
        {showEcoExplanation && (
          <div className="eco-explanation-panel page-transition" style={{
            padding: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            fontSize: '13px',
            lineHeight: '1.6'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-primary)', fontWeight: '800' }}>🔬 Science Behind the Eco-Impact Metrics</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <strong style={{ color: 'var(--color-accent-blue)' }}>💧 Freshwater Saved</strong>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Recirculating hydroponic loops and vertical towers reuse water continuously, reducing water consumption by 85-95% compared to traditional soil rows (saving approx. 8.5 liters per plant per day).</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <strong style={{ color: 'var(--color-primary)' }}>📐 Space Optimization</strong>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Vertical systems stack plants in vertical growth slots, achieving 8x higher cultivation density per square meter compared to traditional flat ground spaces.</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <strong style={{ color: 'var(--color-accent-yellow)' }}>🏆 Eco-Impact Rating</strong>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Calculated based on your number of active soil-less systems: A+ (3+ systems), A (1-2 systems), B (no active systems).</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <strong style={{ color: 'var(--color-accent-purple)' }}>💜 Carbon Offset (CO₂)</strong>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>By growing your food hyper-locally on your balcony or terrace, you eliminate carbon footprint from transport logistics, cold chains, and plastic packaging (estimated at 0.05 kg CO₂ offset per liter of water optimized).</span>
              </div>
            </div>
          </div>
        )}

        <div className="eco-stats-row">
          <div className="eco-stat-item">
            <span className="eco-num text-blue">{waterSavedLiters} L</span>
            <span className="eco-label">Freshwater Saved</span>
          </div>
          <div className="eco-stat-item">
            <span className="eco-num text-green">{spaceMultiplier}</span>
            <span className="eco-label">Space Optimization</span>
          </div>
          <div className="eco-stat-item">
            <span className="eco-num text-yellow">{ecoScore}</span>
            <span className="eco-label">Eco-Impact Rating</span>
          </div>
          <div className="eco-stat-item">
            <span className="eco-num text-purple">-{Math.round(waterSavedLiters * 0.05)} kg</span>
            <span className="eco-label">Carbon Offset (CO₂)</span>
          </div>
        </div>
      </section>

      {/* Reminders section */}
      <section className="dashboard-section">
        <h2 className="section-title">Maintenance Reminders</h2>
        <div className="reminders-scroll hide-scrollbar">
          {reminders.length > 0 ? reminders.map(rem => (
            <div 
              key={rem.id} 
              className={`glass-card reminder-card-v2 ${rem.status === 'done' ? 'done' : ''}`} 
              style={{ borderLeft: `4px solid var(--color-${rem.color})` }}
              onClick={() => handlePlantClick(rem.name)}
            >
              <div className="reminder-icon">{rem.emoji}</div>
              <div className="reminder-info">
                <h4>{rem.name}</h4>
                <p>{rem.msg} ({rem.method})</p>
              </div>
              <div className="reminder-action-block">
                <span className={`reminder-badge-v2 ${rem.status}`}>{rem.status === 'due' ? 'Due Today' : rem.status === 'done' ? 'Done' : 'Urgent'}</span>
                {rem.status !== 'done' && (
                  <button 
                    className="water-action-btn" 
                    onClick={(e) => { e.stopPropagation(); handleWaterPlant(rem); }}
                    title="Replenish nutrients/water"
                  >
                    <Droplets size={14} />
                  </button>
                )}
                {rem.status === 'done' && (
                  <div className="water-action-btn watered-done">
                    <Check size={14} />
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="glass-card reminder-card-v2" style={{ borderLeft: '4px solid var(--color-primary)' }}>
              <div className="reminder-icon">✅</div>
              <div className="reminder-info">
                <h4>System Synchronized</h4>
                <p>No immediate parameters require replenishment.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* My Plants Grid */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">Active Systems</h2>
          <button className="add-plant-btn" onClick={() => setShowAddPlant(!showAddPlant)}>
            {showAddPlant ? <X size={16} /> : <Plus size={16} />}
            {showAddPlant ? 'Cancel' : 'Deploy Plant'}
          </button>
        </div>

        {/* Add Plant Form */}
        {showAddPlant && (
          <form className="glass-card add-plant-form page-transition" onSubmit={handleAddPlant}>
            <div className="form-grid">
              <input
                type="text"
                placeholder="Crop name (e.g. Butterhead Lettuce)"
                value={newPlant.name}
                onChange={e => setNewPlant({...newPlant, name: e.target.value})}
                required
                className="add-plant-input"
              />
              <input
                type="text"
                placeholder="Genetics (optional)"
                value={newPlant.species}
                onChange={e => setNewPlant({...newPlant, species: e.target.value})}
                className="add-plant-input"
              />
              
              <div className="form-select-group">
                <label>System Method</label>
                <select 
                  value={newPlant.method} 
                  onChange={e => setNewPlant({...newPlant, method: e.target.value})}
                  className="add-plant-input"
                >
                  <option value="Hydroponics">Hydroponics (NFT/DWC)</option>
                  <option value="Vertical Tower">Vertical Grow Tower</option>
                  <option value="Soil">Soil Container</option>
                </select>
              </div>

              <div className="water-freq-row">
                <label>Replenish loop every</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={newPlant.waterDays}
                  onChange={e => setNewPlant({...newPlant, waterDays: e.target.value})}
                  className="water-freq-input"
                />
                <span>days</span>
              </div>
            </div>
            
            <button type="submit" className="btn-primary add-plant-submit">
              <Plus size={16} /> Add to System
            </button>
          </form>
        )}

        <div className="plants-grid">
          {myPlants.map(plant => (
            <div 
              key={plant.id} 
              className="glass-card plant-card" 
              onClick={() => handlePlantClick(plant.name)}
            >
              <div className="plant-emoji-bg">
                {plant.image ? (
                  <>
                    <img 
                      src={plant.image} 
                      alt={plant.name} 
                      className="plant-image" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const emojiSpan = e.target.parentNode.querySelector('.plant-emoji-fallback');
                        if (emojiSpan) emojiSpan.style.display = 'inline';
                      }}
                    />
                    <span className="plant-emoji plant-emoji-fallback" style={{ display: 'none' }}>{plant.emoji}</span>
                  </>
                ) : (
                  <span className="plant-emoji">{plant.emoji}</span>
                )}
                <span className={`health-dot ${plant.health}`} title={`Health status`}></span>
              </div>
              
              <div className="plant-details">
                <h4 className="plant-name">{plant.name}</h4>
                <div className="plant-meta-tag">{plant.method}</div>
                <div className="health-bar-container">
                  <div className="health-bar" style={{ width: `${plant.progress}%`, backgroundColor: plant.health === 'green' ? 'var(--color-primary)' : plant.health === 'orange' ? 'var(--color-accent-yellow)' : 'var(--color-accent-red)' }}></div>
                </div>
                <p className="next-water"><Droplets size={11} /> Next: {plant.nextWater}</p>
              </div>

              <button
                className={`water-btn ${plant.health === 'green' ? 'watered' : ''}`}
                onClick={(e) => { e.stopPropagation(); handleWaterPlant(plant); }}
                title="Water crop"
              >
                {plant.health === 'green' ? <Check size={16} /> : <Droplets size={16} />}
              </button>
            </div>
          ))}
          
          <div 
            className="glass-card plant-card add-plant-card-dashed" 
            onClick={() => {
              setShowAddPlant(true);
              setTimeout(() => {
                document.querySelector('.add-plant-form')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            style={{ 
              border: '2px dashed var(--color-border)', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center', 
              padding: '24px', 
              cursor: 'pointer',
              minHeight: '170px',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.01)',
              transition: 'all 0.3s'
            }}
          >
            <div className="plant-emoji-bg" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              <Plus size={24} />
            </div>
            <div className="plant-details" style={{ marginTop: '12px' }}>
              <h4 className="plant-name" style={{ color: 'var(--color-primary)', fontWeight: '800' }}>Add New Plant</h4>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>Deploy a crop to your hydroponics or vertical system</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Taste & Recipe Generator Section */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2 className="section-title">AI Harvest Taste & Recipe Generator</h2>
        </div>
        <div className="glass-card recipe-generator-hud">
          <div className="recipe-header">
            <span className="recipe-header-emoji">🍳</span>
            <div>
              <h3>AI Culinary Engine</h3>
              <p>Turn your freshly harvested crops into authentic South Indian or contemporary meals.</p>
            </div>
          </div>

          <div className="recipe-generator-body">
            <div className="ingredients-select-block">
              <h4>1. Select your harvested ingredients</h4>
              <div className="harvest-checkboxes-grid">
                {harvestIngredients.map(item => (
                  <label key={item} className={`harvest-checkbox-label ${selectedHarvests.includes(item) ? 'selected' : ''}`}>
                    <input 
                      type="checkbox"
                      checked={selectedHarvests.includes(item)}
                      onChange={() => handleToggleHarvest(item)}
                    />
                    <span>{getIngredientEmoji(item)} {item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="quantity-select-block">
              <h4>2. Harvest Quantity & Submit</h4>
              <div className="qty-input-row">
                <input 
                  type="text"
                  placeholder="e.g. 1kg, 200g, a handful"
                  value={harvestQty}
                  onChange={(e) => setHarvestQty(e.target.value)}
                  className="recipe-qty-input"
                />
                <button 
                  type="button"
                  className="btn-primary generate-recipes-btn" 
                  onClick={handleGenerateRecipes}
                  disabled={selectedHarvests.length === 0 || isGeneratingRecipes}
                >
                  {isGeneratingRecipes ? 'Consulting Chef...' : 'Generate 3 Recipes'}
                </button>
              </div>
            </div>
          </div>

          {recipeError && <div className="recipe-error-banner">⚠️ {recipeError}</div>}

          {/* Generated Recipes List */}
          {generatedRecipes.length > 0 && (
            <div className="generated-recipes-container page-transition">
              <h3>🍽️ Recommended Recipes for Your Garden Harvest</h3>
              <div className="recipes-deck">
                {generatedRecipes.map((recipe, index) => (
                  <div key={index} className="glass-card recipe-card-v2">
                    <div className="recipe-card-header">
                      <h4>{recipe.name}</h4>
                      <div className="recipe-badges-row">
                        <span className="recipe-badge time">{recipe.prepTime}</span>
                        <span className="recipe-badge diff">{recipe.difficulty}</span>
                      </div>
                    </div>
                    
                    <p className="recipe-description">{recipe.description}</p>
                    
                    <div className="recipe-section-list">
                      <h5>Ingredients Needed:</h5>
                      <ul>
                        {Array.isArray(recipe.ingredients) ? (
                          recipe.ingredients.map((ing, i) => (
                            <li key={i}>{ing}</li>
                          ))
                        ) : typeof recipe.ingredients === 'string' ? (
                          recipe.ingredients.split(',').map((ing, i) => (
                            <li key={i}>{ing.trim()}</li>
                          ))
                        ) : (
                          <li>No ingredients listed.</li>
                        )}
                      </ul>
                    </div>

                    <div className="recipe-section-list">
                      <h5>Instructions:</h5>
                      <ol>
                        {Array.isArray(recipe.instructions) ? (
                          recipe.instructions.map((inst, i) => (
                            <li key={i}>{inst}</li>
                          ))
                        ) : typeof recipe.instructions === 'string' ? (
                          recipe.instructions.split('\n').filter(line => line.trim()).map((inst, i) => (
                            <li key={i}>{inst.replace(/^\d+\.\s*/, '')}</li>
                          ))
                        ) : (
                          <li>No instructions provided.</li>
                        )}
                      </ol>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section className="dashboard-section">
        <h2 className="section-title">Control Hub Quick Actions</h2>
        <div className="actions-grid">
          {quickActions.map((action, idx) => {
            return (
              <Link to={action.path} key={idx} className="glass-card action-card">
                <div className="action-icon-wrapper">
                  <span className="action-emoji">{action.emoji}</span>
                </div>
                <div className="action-text">
                  <h4>{action.title}</h4>
                  <p>{action.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Toast notifications */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
};

export default Dashboard;
