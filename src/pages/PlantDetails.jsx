import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Droplets, Sun, Calendar, Zap, Layers, Sparkles, AlertTriangle, ShieldCheck, Flame, Compass, Camera } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { plantsData } from '../data/plantsData';
import { awardXP, unlockBadge } from '../utils/gamification';
import './PlantDetails.css';

const PlantDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Try location.state first, then fall back to local data lookup
  let plant = location.state?.plant;
  
  if (!plant && id) {
    const found = plantsData.find(p => p.id === parseInt(id));
    if (found) {
      plant = found;
    }
  }

  if (!plant) {
    return (
      <div className="plant-details-page page-transition" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2>Plant Guide Not Found</h2>
        <p>Sorry, we couldn't load the details for this plant.</p>
        <button className="btn-primary" onClick={() => navigate('/encyclopedia')} style={{ marginTop: '20px' }}>
          Back to Encyclopedia
        </button>
      </div>
    );
  }

  const { user, isAuthenticated } = useAuth();
  const [userPlant, setUserPlant] = useState(null);
  const [logs, setLogs] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [logImageFile, setLogImageFile] = useState(null);
  const [logImagePreview, setLogImagePreview] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user || !plant) return;
    
    const checkUserPlant = async () => {
      try {
        const { data } = await supabase
          .from('user_plants')
          .select('*')
          .eq('user_id', user.id)
          .ilike('plant_name', `%${plant.name}%`)
          .limit(1);
        if (data && data.length > 0) {
          setUserPlant(data[0]);
        }
      } catch (err) {
        console.warn('Could not check user plant:', err);
      }
    };
    checkUserPlant();
  }, [user, plant, isAuthenticated]);

  const fetchLogs = async () => {
    if (!userPlant) return;
    try {
      const { data, error } = await supabase
        .from('plant_growth_logs')
        .select('*')
        .eq('plant_id', userPlant.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data) setLogs(data);
    } catch (err) {
      console.warn('Could not fetch growth logs:', err.message);
    }
  };

  useEffect(() => {
    if (userPlant) {
      fetchLogs();
    }
  }, [userPlant]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogImageFile(file);
      setLogImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (!logImageFile || !userPlant) return;
    setIsLogging(true);
    try {
      const fileExt = logImageFile.name.split('.').pop();
      const filePath = `${userPlant.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('grow_logs')
        .upload(filePath, logImageFile, { upsert: true });
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('grow_logs')
        .getPublicUrl(filePath);
        
      const publicUrl = data.publicUrl;
      
      const { error: insertError } = await supabase
        .from('plant_growth_logs')
        .insert([{
          plant_id: userPlant.id,
          user_id: user.id,
          image_url: publicUrl,
          note: newNote
        }]);
        
      if (insertError) throw insertError;
      
      setNewNote('');
      setLogImageFile(null);
      setLogImagePreview('');
      fetchLogs();

      // Award XP for updating the Grow Photo Journal
      await awardXP(50, 'Updated Grow Photo Journal', user.id);

      // Check if they unlocked the Photo Journalist badge (need 3 logs total)
      if (logs.length + 1 >= 3) {
        await unlockBadge('photo_journalist', user.id);
      }
    } catch (err) {
      console.error(err.message);
      alert('Failed to log growth photo. Note: Please verify that a public Supabase storage bucket named "grow_logs" has been created.');
    } finally {
      setIsLogging(false);
    }
  };

  // Dynamic growth phases fallback generator
  const growthPhases = (plant.growthPhases && plant.growthPhases.length > 0) 
    ? plant.growthPhases 
    : [
        {
          week: 1,
          phase: "Sprouting & Seedling Stage",
          description: `The ${plant.name} seeds sprout in 5-10 days. Maintain continuous substrate moisture and humidity. Protect delicate cotyledons from direct noon heat.`,
          image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=400&q=80"
        },
        {
          week: 3,
          phase: "Early Vegetative Expansion",
          description: `Rapid root development and foliage growth. In hydroponics, increase nutrient concentration (EC) to standard grow limits.`,
          image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=400&q=80"
        },
        {
          week: 6,
          phase: "Flowering & Fruit/Leaf Set",
          description: `Crop enters reproductive/mature phase. Transition nutrient solutions to low nitrogen, high potassium formulas to support heavy yields.`,
          image: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=400&q=80"
        },
        {
          week: 10,
          phase: "Peak Harvest Stage",
          description: `${plant.name} is ready. Harvest outer leaves or ripe fruits continuously. Flush system with clean water a few days before harvesting.`,
          image: "https://images.unsplash.com/photo-1566393028639-d108a42c46a7?auto=format&fit=crop&w=400&q=80"
        }
      ];

  // Dynamic varieties fallback generator
  const varieties = (plant.varieties && plant.varieties.length > 0)
    ? plant.varieties
    : [
        {
          name: `Classic Organic ${plant.name}`,
          type: "Heirloom Heritage",
          description: `The authentic variety prized for its rich heirloom flavor profile and high natural resilience in traditional container gardens.`,
          image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=400&q=80"
        },
        {
          name: `Hydro Elite F1`,
          type: "CEA Specialized",
          description: `A fast-growing, heavy-yielding selection developed specifically for vertical aeroponic towers and recirculating NFT hydroponics.`,
          image: "https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=400&q=80"
        },
        {
          name: `Patio Micro Dwarf`,
          type: "Space Optimizer",
          description: `Compact foliage structure that fits beautifully in high-density vertical grow pockets, windowsill wicking setups, and indoor LED grids.`,
          image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80"
        }
      ];

  return (
    <div className="plant-details-page page-transition">
      <button className="back-nav-btn" onClick={() => navigate(-1)}>
        <ChevronLeft size={18} /> Back to Encyclopedia
      </button>

      <div className="glass-card pd-card-v2">
        {/* Hero visual banner with overlay */}
        <div className="pd-hero-v2">
          {plant.image ? (
            <img src={plant.image} alt={plant.name} className="pd-hero-image" />
          ) : (
            <div className="pd-emoji-placeholder">{plant.emoji}</div>
          )}
          <div className="pd-hero-overlay"></div>
          
          <div className="pd-header-overlay-info">
            <span className="pd-category-badge">{plant.cat}</span>
            <h2 className="pd-title-v2">{plant.name}</h2>
            <p className="pd-scientific-v2">{plant.sc}</p>
          </div>
          
          <div className={`difficulty-badge-v2 diff-${plant.diff?.toLowerCase()}`}>
            {plant.diff} Difficulty
          </div>
        </div>

        {/* Tab navigation headers */}
        <div className="pd-tabs-nav-bar hide-scrollbar">
          {[
            { id: 'overview', label: '🪴 General Care', icon: Compass },
            { id: 'hydroponics', label: '⚡ Hydroponics', icon: Zap },
            { id: 'vertical', label: '📐 Vertical Setup', icon: Layers },
            { id: 'water', label: '💧 Water Saving', icon: Droplets },
            { id: 'timeline', label: '📈 Progress & Varieties', icon: Sparkles },
            ...(userPlant ? [{ id: 'journal', label: '📖 Photo Journal', icon: Camera }] : [])
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content bodies */}
        <div className="pd-content-v2">
          
          {/* Tab 1: General Overview */}
          {activeTab === 'overview' && (
            <div className="tab-pane page-transition">
              <div className="overview-grid">
                <div className="overview-main">
                  <h3>Crop Bio</h3>
                  <p className="pd-description-v2">{plant.description}</p>
                  
                  <h3>Quick Guidelines</h3>
                  <div className="pd-stats-grid-v2">
                    <div className="pd-stat-box" title="Water requirements">
                      <Droplets size={22} className="text-blue" />
                      <small>Irrigation Loop</small>
                      <p>{plant.water}</p>
                    </div>
                    <div className="pd-stat-box" title="Sunlight required">
                      <Sun size={22} className="text-yellow" />
                      <small>Sunlight</small>
                      <p>{plant.sun}</p>
                    </div>
                    <div className="pd-stat-box" title="Days to harvest">
                      <Calendar size={22} className="text-green" />
                      <small>Yield Cycle</small>
                      <p>{plant.yield}</p>
                    </div>
                  </div>

                  <h3>Expert Tips</h3>
                  <ul className="care-tips-list-v2">
                    {plant.tips?.map((tip, i) => (
                      <li key={i} className="tip-item-v2">
                        <span className="tip-bullet">✦</span>
                        <p>{tip}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="overview-sidebar">
                  <div className="parameter-card-v2">
                    <h4>📅 Planting Season</h4>
                    <p>{plant.season || 'Year-round'}</p>
                  </div>
                  
                  <div className="parameter-card-v2">
                    <h4>🐛 Common Pests</h4>
                    <p>{plant.pests || 'Minimal pest sensitivity'}</p>
                  </div>

                  <div className="parameter-card-v2">
                    <h4>🌱 Substrate Soil</h4>
                    <p>{plant.soil} type preferred</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Hydroponics Guide */}
          {activeTab === 'hydroponics' && (
            <div className="tab-pane page-transition">
              <div className="growing-method-banner hydro">
                <Zap className="banner-icon text-green" size={28} />
                <div>
                  <h4>Soil-less cultivation guide</h4>
                  <p>How to grow {plant.name} without soil using nutrient-enriched water solutions.</p>
                </div>
              </div>

              <div className="technical-parameters-grid">
                <div className="tech-box">
                  <small>Recommended system</small>
                  <h4>{plant.hydroGuide?.system || 'Deep Water Culture (DWC)'}</h4>
                </div>
                <div className="tech-box">
                  <small>Optimal pH Range</small>
                  <h4 className="text-green">{plant.hydroGuide?.ph || '5.8 - 6.5'}</h4>
                </div>
                <div className="tech-box">
                  <small>Nutrient strength (EC)</small>
                  <h4 className="text-blue">{plant.hydroGuide?.ec || '1.4 - 2.0 mS/cm'}</h4>
                </div>
              </div>

              <div className="detailed-setup-block">
                <h3>System Setup Instructions</h3>
                <p className="grow-setup-instructions">{plant.hydroGuide?.setup || 'Insert seedling root plugs in net cups filled with expanded clay pebbles. Ensure roots extend down to touch the circulating nutrient water.'}</p>
                
                <h3>Nutrient and Fertilizer Requirements</h3>
                <p className="grow-setup-instructions">{plant.hydroGuide?.nutrient || 'Use a balanced hydroponic grow formula. Once flower buds appear, transition to fruit-specific nutrient formulas.'}</p>
              </div>
            </div>
          )}

          {/* Tab 3: Vertical Farming Guide */}
          {activeTab === 'vertical' && (
            <div className="tab-pane page-transition">
              <div className="growing-method-banner vertical">
                <Layers className="banner-icon text-blue" size={28} />
                <div>
                  <h4>High-density space optimization</h4>
                  <p>Methods to stack {plant.name} vertically on balconies, walls, or hydroponic towers.</p>
                </div>
              </div>

              <div className="technical-parameters-grid">
                <div className="tech-box">
                  <small>Vertical System</small>
                  <h4>{plant.verticalGuide?.system || 'Aeroponic Grow Tower'}</h4>
                </div>
                <div className="tech-box">
                  <small>Pocket spacing</small>
                  <h4>{plant.verticalGuide?.spacing || '25 cm'}</h4>
                </div>
                <div className="tech-box">
                  <small>Density layout</small>
                  <h4>{plant.verticalGuide?.layout || 'Staggered pockets'}</h4>
                </div>
              </div>

              <div className="detailed-setup-block">
                <h3>Vertical Spacing and Tower Setup</h3>
                <p className="grow-setup-instructions">{plant.verticalGuide?.setup || 'Position the plants in staggered grow slots. For tall crops, utilize trellis supports running down the side of the column.'}</p>
                
                <div className="glass-card vertical-layout-alert">
                  <AlertTriangle size={18} className="alert-icon text-yellow" />
                  <div>
                    <h5>Vertical Lighting Tip</h5>
                    <p>Rotate the tower column by 90 degrees every week to ensure even lighting on all sides, or use vertical LED bar arrays.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Water Savings & Wicking */}
          {activeTab === 'water' && (
            <div className="tab-pane page-transition">
              <div className="growing-method-banner water">
                <Droplets className="banner-icon text-blue" size={28} />
                <div>
                  <h4>Water conservation parameters</h4>
                  <p>Methods to cultivate {plant.name} using sub-surface wicking or timed micro-drips.</p>
                </div>
              </div>

              <div className="glass-card water-savings-showcase">
                <div className="savings-highlight">
                  <span className="savings-pct">{plant.waterSavings || '90%'}</span>
                  <span>Water saved vs traditional ground rows</span>
                </div>
                <p>This is achieved by eliminating soil absorption loss, runoff drainage, and surface evaporation.</p>
              </div>

              <div className="detailed-setup-block">
                <h3>Water Optimization Strategies</h3>
                <ul className="water-saving-tips-list">
                  {plant.waterSavingGuide?.tips?.map((tip, i) => (
                    <li key={i} className="water-tip-item">
                      <ShieldCheck size={18} className="text-green" />
                      <p>{tip}</p>
                    </li>
                  )) || (
                    <li className="water-tip-item">
                      <ShieldCheck size={18} className="text-green" />
                      <p>Use wicking reservoirs or self-watering pots to feed water directly to root bases.</p>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Tab 5: Growth Phases & Genetics */}
          {activeTab === 'timeline' && (
            <div className="tab-pane page-transition">
              <h3>📈 Weekly Growth Phases</h3>
              <div className="pd-phases-container-v2">
                {growthPhases.map((phase, i) => (
                  <div key={i} className="glass-card pd-phase-card-v2">
                    <div className="phase-img-box">
                      <img src={phase.image} alt={`Week ${phase.week}`} />
                    </div>
                    <div className="pd-phase-info-v2">
                      <span className="pd-phase-week-v2">Week {phase.week}</span>
                      <h4>{phase.phase}</h4>
                      <p>{phase.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <h3 style={{ marginTop: '40px' }}>🧬 Plant Varieties / Genetics</h3>
              <div className="pd-varieties-container-v2">
                {varieties.map((variety, i) => (
                  <div key={i} className="glass-card pd-variety-card-v2">
                    <div className="variety-img-box">
                      <img src={variety.image} alt={variety.name} />
                    </div>
                    <div className="pd-variety-info-v2">
                      <h4>{variety.name}</h4>
                      <span className="pd-variety-type-v2">{variety.type} variety</span>
                      <p>{variety.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 6: Grow Photo Journal & Timeline */}
          {activeTab === 'journal' && userPlant && (
            <div className="tab-pane page-transition">
              <div className="growing-method-banner water">
                <Camera className="banner-icon text-green" size={28} />
                <div>
                  <h4>Photo Growth Journal</h4>
                  <p>Log progress photos of your active {plant.name} and track growth stats over time.</p>
                </div>
              </div>

              {/* Log Composer Form */}
              <div className="glass-card journal-log-composer">
                <h3>Add Growth Entry</h3>
                <form onSubmit={handleAddLog} className="log-composer-form">
                  <div className="file-select-group">
                    <label htmlFor="log-image-upload" className="file-input-btn">
                      <Camera size={16} /> Choose Progress Photo
                    </label>
                    <input
                      type="file"
                      id="log-image-upload"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                      required
                    />
                    {logImagePreview && (
                      <img src={logImagePreview} alt="Preview" className="image-preview-thumbnail" />
                    )}
                  </div>

                  <textarea
                    placeholder="Describe how the plant is doing (e.g., cotyledon leaves spreading, roots look clean)..."
                    className="note-input-textarea"
                    rows="3"
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                  />

                  <button type="submit" className="submit-log-btn" disabled={isLogging || !logImageFile}>
                    {isLogging ? 'Uploading...' : 'Log Growth Entry'}
                  </button>
                </form>
              </div>

              {/* Timeline Output List */}
              <h3>Timeline Log</h3>
              {logs.length > 0 ? (
                <div className="journal-timeline">
                  {logs.map((log) => (
                    <div key={log.id} className="timeline-entry">
                      <div className="timeline-marker"></div>
                      <div className="glass-card timeline-card">
                        <img src={log.image_url} alt="Grow progress" className="timeline-card-image" />
                        <div className="timeline-card-details">
                          <span className="timeline-date">{new Date(log.created_at).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          <p className="timeline-note">{log.note || 'No notes added.'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="journal-empty-state">
                  <h4>No logs entered yet</h4>
                  <p>Upload your first progress photo of {plant.name} to start your botanical photo journal timeline!</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PlantDetails;
