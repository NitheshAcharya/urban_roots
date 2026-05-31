import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Droplets, Sun, Calendar, Zap, Layers, Sparkles, AlertTriangle, ShieldCheck, Flame, Compass, Camera, X, Plus } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { useAuth } from '../context/AuthContext';
import { plantsData } from '../data/plantsData';
import { awardXP, unlockBadge } from '../utils/gamification';
import './PlantDetails.css';

const BACKEND_URL = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? (import.meta.env.VITE_BACKEND_URL || '')
  : '';

const CROP_DETAILS_DB = {
  tomato: {
    materials: "12-inch terracotta pot or 5-gallon grow bag; rich, organic loamy soil mixed with coco peat for moisture retention.",
    growGuide: [
      { step: "1. Sowing & Germination", desc: "Sow seeds 0.5cm deep in seed trays using coco-peat and vermicompost. Keep moist in shade. Sprouting happens in 5-8 days." },
      { step: "2. Transplanting (Week 3-4)", desc: "Transplant strong seedlings into 12-inch pots when they reach 4-6 inches high. Bury the stem up to the first true leaves to promote deep adventitious roots." },
      { step: "3. Training & Pruning (Week 6+)", desc: "Provide a strong stake, cage, or vertical twine trellis. Prune lower suckers (stems that grow in leaf axils) to keep air flowing and prevent disease." },
      { step: "4. Flowering & Pollination", desc: "Tomatoes are self-pollinating. Shake the plant gently during morning hours to assist wind pollination." },
      { step: "5. Harvesting (Week 10-12)", desc: "Pick tomatoes when they are firm and fully colored (red/orange/yellow depending on variety). Keep harvesting to encourage new fruit." }
    ],
    troubleshooting: {
      peakProblemTime: "Most problems occur during the flowering and fruit-set stages (around Weeks 6-8) when high moisture can lead to root rot or blight, or during hot summers.",
      diseases: [
        { name: "Blossom End Rot", symptom: "Black leathery rot on the bottom of the fruit.", cure: "Caused by calcium deficiency. Add dolomite lime or bone meal to the soil and maintain consistent watering." },
        { name: "Early Blight", symptom: "Brown spots with concentric rings on lower leaves.", cure: "Remove infected leaves. Spray organic copper fungicide or neem oil solution, and avoid splashing water on leaves." },
        { name: "Aphids / Whiteflies", symptom: "Teeny insects sucking leaf sap, sticky honeydew.", cure: "Spray leaves with diluted organic neem oil and soapy water every 3 days in the evening." }
      ]
    },
    fertilizer: {
      type: "High-nitrogen organic compost/seaweed in the vegetative phase; transition to high-phosphorus and potassium bone meal/potash during flowering and fruiting.",
      frequency: "Feed every 14 days.",
      quantity: "2 tablespoons of granular fertilizer per pot, or 500ml of diluted organic liquid seaweed fertilizer.",
      application: "Scratch granular fertilizer into the top 1 inch of soil around the edge of the pot (away from the stem) and water thoroughly."
    },
    hydroponics: {
      requirements: "Dutch bucket system or Coco wicking beds; clay pebbles & coco-coir media; air pump & nutrient solution.",
      method: "Seeds are sprouted in rockwool plugs. Once roots emerge, place plugs in net cups inside the Dutch buckets. The system circulates nutrient water through drip lines, running 15 minutes every hour.",
      howItGrows: "Roots grow into the lower chamber where they get continuous oxygen and rich nutrients, resulting in 40% faster growth than soil."
    },
    verticalFarming: {
      howToDo: "Train tomatoes to grow up a single vertical vine using wicking twine anchored to an overhead support cable. Clip the stem to the twine weekly.",
      requirements: "Overhead support system, heavy duty plant clips, pruning shears, and vertical spacing of 45-60cm between plants."
    }
  },
  "hot pepper": {
    materials: "10-inch clay pot or container; sandy-loam soil with excellent drainage; compost.",
    growGuide: [
      { step: "1. Seed Germination", desc: "Sow seeds 0.25cm deep in coco-peat. Maintain a warm temperature (25-30°C). Sprouting takes 7-14 days." },
      { step: "2. Transplanting", desc: "Transplant to 10-inch pots after 4 weeks when 4 leaves have formed. Avoid root damage." },
      { step: "3. Growth & Support", desc: "Pinch the growing tip when the plant is 6 inches tall to encourage bushy branching. Use a small bamboo stake for stability." },
      { step: "4. Fruit Set", desc: "Gently tap flowers to pollinate indoors. Peppers need warm temperatures to set fruit." },
      { step: "5. Harvesting", desc: "Harvest peppers when they reach full size and color (green, red, or yellow). Cut with shears to avoid tearing branches." }
    ],
    troubleshooting: {
      peakProblemTime: "During rainy monsoon seasons when leaf curl virus spreads rapidly via whiteflies, or when flowers drop due to excessive watering.",
      diseases: [
        { name: "Leaf Curl Virus", symptom: "Leaves curl upward and become small and puckered.", cure: "Control whiteflies using yellow sticky traps and spray neem oil. Uproot severely infected plants." },
        { name: "Damping Off", symptom: "Seedlings collapse at soil level.", cure: "Avoid overwatering seed trays. Ensure good airflow and use sterile seedling mix." }
      ]
    },
    fertilizer: {
      type: "Balanced vermicompost at transplanting; potassium-rich organic fertilizers like wood ash or banana peel tea once flowers appear.",
      frequency: "Every 15-20 days.",
      quantity: "1 handful of vermicompost or 200ml of organic liquid tea.",
      application: "Mix compost gently into top soil, or spray liquid fertilizer on the foliage (foliar spray) during early morning."
    },
    hydroponics: {
      requirements: "DWC (Deep Water Culture) or NFT channels; clay pebbles in net cups; pH: 5.8 - 6.2; EC: 1.8 - 2.2 mS/cm.",
      method: "Seeds are germinated in rockwool. Seedlings are placed in 3-inch net cups. Continuous aeration of the nutrient solution is essential.",
      howItGrows: "Aerated roots absorb nitrogen and phosphorus directly, producing crisp, pungent chilies with high capsacin levels."
    },
    verticalFarming: {
      howToDo: "Peppers can be grown in pocket vertical walls or vertical towers. Space plants staggered to prevent shading.",
      requirements: "Staggered grow pockets, 30cm spacing, and rotate towers 90 degrees weekly for uniform sun exposure."
    }
  },
  brinjal: {
    materials: "12 to 15-inch large pots; heavy loamy soil mixed with organic matter.",
    growGuide: [
      { step: "1. Seed Sowing", desc: "Sow in seedling trays. Germinates in 6-10 days." },
      { step: "2. Transplanting", desc: "Transplant after 30 days into large containers. Add a handful of neem cake powder to prevent root nematodes." },
      { step: "3. Staking", desc: "Brinjals get heavy. Support the main stem with a sturdy wooden stake." },
      { step: "4. Flowering", desc: "Tap branches gently to aid self-pollination. Prune yellowing lower leaves." },
      { step: "5. Harvesting", desc: "Harvest when skin is glossy and firm. Dull skin indicates over-ripeness and seeds will be bitter." }
    ],
    troubleshooting: {
      peakProblemTime: "Mid-vegetative and fruiting stages (Weeks 5-9) when shoot borers tunnel into stems.",
      diseases: [
        { name: "Fruit & Shoot Borer", symptom: "Terminal shoots droop and wilt; holes in fruits with excreta.", cure: "Cut and burn affected shoots. Spray Bacillus thuringiensis (Bt) or neem oil every week." },
        { name: "Phomopsis Blight", symptom: "Circular brown spots on leaves; fruit rots and shrivels.", cure: "Use disease-free seeds. Destroy crop debris and spray neem-based copper fungicides." }
      ]
    },
    fertilizer: {
      type: "Mustard cake powder, fish emulsion, or well-rotted cow manure.",
      frequency: "Every 15 days.",
      quantity: "3 tablespoons granular organic mix or 1 cup cow manure slurry.",
      application: "Side-dress around the pot, mix with topsoil, and water immediately."
    },
    hydroponics: {
      requirements: "Dutch Buckets or large DWC; pH: 6.0 - 6.5; EC: 1.6 - 2.0 mS/cm.",
      method: "Grow in Dutch buckets with clay pebbles and coco peat. Drip feed nutrient solution containing macro and micro minerals.",
      howItGrows: "Continuous nutrient access supports heavy purple brinjals without the threat of soil nematodes."
    },
    verticalFarming: {
      howToDo: "Grow compact bush varieties in vertical pocket grids or lower tiers of aeroponic towers.",
      requirements: "Lower tier pockets (due to plant weight) and 35-40cm pocket spacing."
    }
  },
  okra: {
    materials: "12-inch deep grow bags; sandy-loam well-drained soil.",
    growGuide: [
      { step: "1. Direct Sowing", desc: "Okra hates transplanting. Sow seeds directly 1cm deep in the final pot. Sprout in 5-8 days." },
      { step: "2. Thinning", desc: "Thin to 1 healthy plant per pot. Keep pots in full sunlight." },
      { step: "3. Growing", desc: "Okra grows tall. Ensure stakes are added for wind protection." },
      { step: "4. Pod Formation", desc: "Pods develop rapidly within 3-5 days after flowering." },
      { step: "5. Harvesting", desc: "Harvest pods when they are 3-4 inches long and tender. Snapping them should be easy; if they are woody, they are over-ripe." }
    ],
    troubleshooting: {
      peakProblemTime: "Flowering stage (Weeks 6-8) when leafhoppers and yellow vein mosaic virus occur.",
      diseases: [
        { name: "Yellow Vein Mosaic", symptom: "Veins turn yellow, leaves chlorotic, yellow stunted pods.", cure: "Transmitted by whiteflies. Spray neem oil. Grow resistant varieties (e.g. Arka Anamika)." },
        { name: "Powdery Mildew", symptom: "White powdery patches on leaf surfaces.", cure: "Spray baking soda solution (1 tsp in 1L water with a drop of liquid soap) or sulfur fungicide." }
      ]
    },
    fertilizer: {
      type: "Balanced vermicompost, bone meal for calcium, and compost tea.",
      frequency: "Every 14 days.",
      quantity: "2 handfuls compost and 1 tablespoon bone meal.",
      application: "Ring application (apply in a circle around the edge of the pot, keep away from the central stalk)."
    },
    hydroponics: {
      requirements: "NFT channels (wide) or Coco Coir slabs; pH: 6.0 - 6.5; EC: 1.6 - 2.0 mS/cm.",
      method: "Okra is placed in wide NFT gullies with drip emitters. Run cycles are continuous during day.",
      howItGrows: "Roots form dense wads, taking up nutrients aggressively to produce tender green pods."
    },
    verticalFarming: {
      howToDo: "Grow Okra vertically using single-stem training on trellises. Dwarf varieties are highly recommended.",
      requirements: "Dwarf varieties, vertical support strings, and 30cm spacing."
    }
  },
  spinach: {
    materials: "Wide, shallow containers (8-10 inches deep, 12+ inches wide); loamy soil high in organic compost.",
    growGuide: [
      { step: "1. Sowing", desc: "Sow seeds 0.5cm deep, spaced 2 inches apart directly in pots. Sprout in 5-10 days." },
      { step: "2. Thinning", desc: "Thin seedlings to 4 inches apart. Use thinned seedlings in salads." },
      { step: "3. Care", desc: "Keep soil consistently moist. Provide partial shade in hot afternoons." },
      { step: "4. Leaf Harvest", desc: "Harvest outer leaves continuously when they are 4 inches long. The center will keep producing." }
    ],
    troubleshooting: {
      peakProblemTime: "Mid-growth (Weeks 3-5) when warm weather causes the plant to bolt (flower and turn bitter) or leaf miners appear.",
      diseases: [
        { name: "Leaf Miners", symptom: "Winding white trails inside leaf layers.", cure: "Pinch off and destroy affected leaves immediately. Spray neem oil to prevent flies from laying eggs." },
        { name: "Downy Mildew", symptom: "Yellow spots on top of leaves, grey purple mold underneath.", cure: "Avoid overhead watering. Maintain spacing for airflow. Spray copper fungicide." }
      ]
    },
    fertilizer: {
      type: "Nitrogen-rich fertilizer like blood meal, fish emulsion, or compost tea for leafy growth.",
      frequency: "Every 10-12 days.",
      quantity: "1 cup diluted fish emulsion (1:10 water ratio) or 1 tablespoon compost tea.",
      application: "Water the soil directly with liquid fertilizer. Avoid pouring it on the leaves."
    },
    hydroponics: {
      requirements: "NFT (Nutrient Film Technique) channels or Raft (DWC) beds; pH: 5.5 - 6.0; EC: 1.2 - 1.6 mS/cm.",
      method: "Net cups are suspended in floating styrofoam rafts or placed in PVC channels. Solution flows continuously over root tips.",
      howItGrows: "Spinach thrives in water, producing large tender leaves in just 30-35 days."
    },
    verticalFarming: {
      howToDo: "Spinach is ideal for vertical wall panels or PVC pipe vertical systems.",
      requirements: "Wall planters, 15cm pocket spacing, and timed micro-irrigation."
    }
  },
  coriander: {
    materials: "Shallow tray (6 inches deep); well-draining loamy soil with coco peat.",
    growGuide: [
      { step: "1. Seed Prep & Sowing", desc: "Crush coriander seeds gently into halves. Sow 0.5cm deep in rows. Sprout in 10-14 days." },
      { step: "2. Moisture", desc: "Sprinkle water gently. Do not let soil dry out. Keep in bright morning sunlight." },
      { step: "3. Thinning", desc: "Space plants 3 inches apart. Coriander grows best in cool seasons." },
      { step: "4. Harvest", desc: "Cut stems near base when 6 inches high, or harvest outer leaves." }
    ],
    troubleshooting: {
      peakProblemTime: "Late growth (Weeks 4-6) when high heat causes coriander to immediately shoot up, flower (bolt), and lose leaf flavor.",
      diseases: [
        { name: "Powdery Mildew", symptom: "White dusty coating on leaves.", cure: "Dust with sulfur or spray diluted baking soda. Water at soil level." },
        { name: "Stem Rot", symptom: "Stems rot and collapse.", cure: "Improve drainage and reduce watering frequency." }
      ]
    },
    fertilizer: {
      type: "Mild nitrogen compost tea or vermicompost liquid slurry.",
      frequency: "Once every 14 days.",
      quantity: "150ml dilute vermicompost tea.",
      application: "Soil application during evening hours."
    },
    hydroponics: {
      requirements: "Kratky jars or NFT channels; pH: 5.8 - 6.2; EC: 1.2 - 1.6 mS/cm.",
      method: "Sprouted seeds in rockwool plugs are placed in Kratky reservoirs. No pumps needed for Kratky.",
      howItGrows: "Maintains a high concentration of essential oils in leaves, providing an intense aroma and flavor."
    },
    verticalFarming: {
      howToDo: "Grow densely in horizontal vertical stacked shelves with LED grow lights.",
      requirements: "Shelving units, grow lights, and wicking trays."
    }
  },
  mint: {
    materials: "10-inch wide pot; loamy moisture-holding soil.",
    growGuide: [
      { step: "1. Propagation", desc: "Propagate via stem cuttings in water. Roots develop in 4-6 days." },
      { step: "2. Planting", desc: "Plant rooted cuttings 2 inches deep in pots. Place in semi-shade." },
      { step: "3. Growth Control", desc: "Pinch the tips regularly to promote bushy side-shoots." },
      { step: "4. Harvesting", desc: "Harvest sprigs daily. Mint is highly resilient and grows back rapidly." }
    ],
    troubleshooting: {
      peakProblemTime: "Hot dry summers when spider mites attack leaves.",
      diseases: [
        { name: "Spider Mites", symptom: "Fine webbing on leaves; yellow speckles on foliage.", cure: "Spray plants with a strong stream of water to dislodge mites, then spray neem oil." },
        { name: "Mint Rust", symptom: "Orange-brown pustules on leaf undersides.", cure: "Remove and burn affected leaves. Water base of plants to keep foliage dry." }
      ]
    },
    fertilizer: {
      type: "Vermicompost or liquid seaweed extract.",
      frequency: "Every 20 days.",
      quantity: "1 handful vermicompost.",
      application: "Mix compost into top soil and water."
    },
    hydroponics: {
      requirements: "DWC or Kratky jars; pH: 5.5 - 6.2; EC: 1.0 - 1.4 mS/cm.",
      method: "Suspending root cuttings in Kratky jars is the simplest home hydroponic setup.",
      howItGrows: "Mint roots form lush white networks in water, generating endless leafy sprigs."
    },
    verticalFarming: {
      howToDo: "Mint cascades beautifully out of vertical tower slots.",
      requirements: "Grow tower pockets, 20cm spacing, and regular pruning."
    }
  },
  "curry leaf": {
    materials: "18-inch large container; well-draining sandy-loam soil with organic compost.",
    growGuide: [
      { step: "1. Pot Selection & Sowing", desc: "Sow fresh seeds or transplant a nursery sapling. Use a deep pot with a drain hole." },
      { step: "2. Early Care", desc: "Water moderately. Keep in full sun. Growth is slow in the first year." },
      { step: "3. Pruning", desc: "Prune the terminal tip in spring to encourage multiple branches." },
      { step: "4. Maintenance", desc: "Apply sour buttermilk (yogurt diluted in water) once a month to boost growth." },
      { step: "5. Harvesting", desc: "Strip leaves from bottom branches. Do not pluck the top growing shoots." }
    ],
    troubleshooting: {
      peakProblemTime: "Winter seasons when growth goes dormant, and scale insects occur on stems.",
      diseases: [
        { name: "Scale Insects / Mealybugs", symptom: "White cottony or brown bumps on stems and leaf undersides.", cure: "Scrub off manually with a toothbrush dipped in soapy neem water." },
        { name: "Sooty Mold", symptom: "Black coating on leaves due to insect honeydew.", cure: "Control sucking pests first, then wash leaves with warm water." }
      ]
    },
    fertilizer: {
      type: "Cow manure, bone meal, and fermented curd/buttermilk.",
      frequency: "Every 30 days.",
      quantity: "2 cups cow manure and 1 cup diluted sour curd.",
      application: "Pour sour buttermilk around the roots to acidify the soil and add beneficial bacteria."
    },
    hydroponics: {
      requirements: "Not recommended for small hydroponic systems as it is a woody perennial shrub.",
      method: "N/A",
      howItGrows: "N/A"
    },
    verticalFarming: {
      howToDo: "Perennial shrubs are not suitable for vertical farming towers or wall panels.",
      requirements: "N/A"
    }
  },
  tulsi: {
    materials: "10-inch clay/terracotta pot; loamy soil with rich compost.",
    growGuide: [
      { step: "1. Sowing", desc: "Sow seeds on the soil surface, press gently. Do not cover (needs light to germinate). Sprout in 7-14 days." },
      { step: "2. Growth", desc: "Keep soil moist but not soggy. Place in bright sun (6-8 hours)." },
      { step: "3. Pinching", desc: "Pinch off flower buds (manjari) as soon as they appear to extend leaf production." },
      { step: "4. Harvesting", desc: "Pinch top leaf pairs. This keeps the plant bushy and healthy." }
    ],
    troubleshooting: {
      peakProblemTime: "Monsoons when root rot occurs due to waterlogging, or winter when leaves drop.",
      diseases: [
        { name: "Root Rot", symptom: "Leaves turn yellow and wilt; stems turn mushy.", cure: "Improve pot drainage. Stop watering until top 2 inches of soil is dry." },
        { name: "Powdery Mildew", symptom: "White spots on leaves.", cure: "Spray organic garlic extract solution (crush garlic, mix with water, strain, and spray)." }
      ]
    },
    fertilizer: {
      type: "Vermicompost, neem cake powder, and Epsom salt.",
      frequency: "Every 25 days.",
      quantity: "1 handful vermicompost and 1 tsp Epsom salt dissolved in water.",
      application: "Apply to soil in the evening."
    },
    hydroponics: {
      requirements: "DWC or Kratky setups; pH: 5.8 - 6.5; EC: 1.4 - 1.8 mS/cm.",
      method: "Tulsi propagates easily from cuttings in Kratky jars.",
      howItGrows: "Produces clean, dirt-free medicinal leaves for tea in a home CEA environment."
    },
    verticalFarming: {
      howToDo: "Ideal for grow tower pocket cultivation with bright sunlight.",
      requirements: "Staggered grow tower pockets and 25cm spacing."
    }
  }
};

const getCropDetails = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes('tomato')) return CROP_DETAILS_DB.tomato;
  if (lower.includes('pepper') || lower.includes('chili') || lower.includes('chilli')) return CROP_DETAILS_DB['hot pepper'];
  if (lower.includes('brinjal') || lower.includes('eggplant')) return CROP_DETAILS_DB.brinjal;
  if (lower.includes('okra') || lower.includes('ladyfinger') || lower.includes('lady\'s finger')) return CROP_DETAILS_DB.okra;
  if (lower.includes('spinach') || lower.includes('palak')) return CROP_DETAILS_DB.spinach;
  if (lower.includes('coriander') || lower.includes('cilantro') || lower.includes('kothmiri')) return CROP_DETAILS_DB.coriander;
  if (lower.includes('mint') || lower.includes('pudina')) return CROP_DETAILS_DB.mint;
  if (lower.includes('curry')) return CROP_DETAILS_DB['curry leaf'];
  if (lower.includes('tulsi') || lower.includes('basil')) return CROP_DETAILS_DB.tulsi;
  
  return {
    materials: "10-inch container; well-draining loamy soil mixed with organic compost.",
    growGuide: [
      { step: "1. Sowing", desc: `Sow ${name} seeds according to package depth (usually 0.5cm) in seedling trays.` },
      { step: "2. Transplanting", desc: "Transplant to the final container once 3-4 true leaves develop." },
      { step: "3. Maintenance", desc: "Keep soil moist, pull weeds, and place in bright sunlight." },
      { step: "4. Harvesting", desc: "Harvest ripe parts carefully using clean garden shears." }
    ],
    troubleshooting: {
      peakProblemTime: "Transition from vegetative to flowering/fruiting stage.",
      diseases: [
        { name: "Root Rot", symptom: "Yellowing leaves, wilting, soggy soil.", cure: "Reduce watering, improve container drainage hole." },
        { name: "Pests (Aphids)", symptom: "Clusters of tiny green/black insects on tender shoots.", cure: "Spray neem oil solution weekly." }
      ]
    },
    fertilizer: {
      type: "Balanced nitrogen-phosphorus-potassium organic fertilizer.",
      frequency: "Every 20 days.",
      quantity: "1-2 tablespoons per plant.",
      application: "Mix into the top soil and water immediately."
    },
    hydroponics: {
      requirements: "DWC or Kratky system; pH: 5.8 - 6.5; EC: 1.2 - 2.0 mS/cm.",
      method: "Grow in net cups filled with expanded clay pebbles suspended over nutrient water.",
      howItGrows: "Roots absorb minerals directly from the oxygenated water loop."
    },
    verticalFarming: {
      howToDo: "Grow in vertical towers or pocket planters spaced staggered.",
      requirements: "Vertical grow slots, spacing of 25cm, and automated pump cycles."
    }
  };
};

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

  const [showGrowModal, setShowGrowModal] = useState(false);
  const [growMethod, setGrowMethod] = useState('Hydroponics');
  const [growFreq, setGrowFreq] = useState(3);
  const [isAddingPlant, setIsAddingPlant] = useState(false);
  const details = getCropDetails(plant.name);

  const handleConfirmGrow = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please log in to add this plant to your active grow systems!');
      navigate('/auth');
      return;
    }

    setIsAddingPlant(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/plants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          plantName: plant.name,
          species: plant.sc,
          wateringFrequencyDays: growFreq,
          growMethod: growMethod
        })
      });

      if (!response.ok) throw new Error('Failed to add plant');
      const data = await response.json();
      alert(`🌱 Successfully added ${plant.name} to your active systems!`);
      setShowGrowModal(false);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Error deploying plant. Please check your network and try again.');
    } finally {
      setIsAddingPlant(false);
    }
  };

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

  useEffect(() => {
    if (plant) {
      let defaultDays = 3;
      if (plant.water) {
        const parsed = parseInt(plant.water.replace(/[^0-9]/g, ''));
        if (!isNaN(parsed) && parsed > 0) {
          defaultDays = parsed;
        } else if (plant.water.toLowerCase().includes('daily')) {
          defaultDays = 1;
        } else if (plant.water.toLowerCase().includes('weekly')) {
          defaultDays = 7;
        }
      }
      setGrowFreq(defaultDays);
    }
  }, [plant]);

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
        <div className="pd-hero-v2" style={{ position: 'relative' }}>
          {plant.image ? (
            <img src={plant.image} alt={plant.name} className="pd-hero-image" />
          ) : (
            <div className="pd-emoji-placeholder">{plant.emoji}</div>
          )}
          <div className="pd-hero-overlay"></div>
          
          <div className="pd-header-overlay-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', paddingRight: '20px' }}>
            <div>
              <span className="pd-category-badge">{plant.cat}</span>
              <h2 className="pd-title-v2">{plant.name}</h2>
              <p className="pd-scientific-v2">{plant.sc}</p>
            </div>
            
            <button 
              className="btn-primary grow-crop-btn"
              onClick={() => setShowGrowModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-white)',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '10px',
                boxShadow: 'var(--glow-green)'
              }}
            >
              <Plus size={16} /> Grow This Plant
            </button>
          </div>
          
          <div className={`difficulty-badge-v2 diff-${plant.diff?.toLowerCase()}`} style={{ top: '20px', right: '20px' }}>
            {plant.diff} Difficulty
          </div>
        </div>

        {/* Tab navigation headers */}
        <div className="pd-tabs-nav-bar hide-scrollbar">
          {[
            { id: 'overview', label: '🪴 Beginner Grow Guide', icon: Compass },
            { id: 'problems', label: '🩺 Problems & Diseases', icon: AlertTriangle },
            { id: 'fertilizers', label: '🧪 Materials & Fertilizers', icon: ShieldCheck },
            { id: 'cea', label: '⚡ Hydro & Vertical', icon: Zap },
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
          
          {/* Tab 1: Beginner Grow Guide */}
          {activeTab === 'overview' && (
            <div className="tab-pane page-transition">
              <div className="overview-grid">
                <div className="overview-main">
                  <h3>Crop Bio</h3>
                  <p className="pd-description-v2">{plant.description}</p>
                  
                  <h3>Seedling to Yield Step-by-Step Guide</h3>
                  <div className="grow-step-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '20px 0' }}>
                    {details.growGuide.map((step, idx) => (
                      <div key={idx} className="grow-step-card" style={{
                        padding: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start'
                      }}>
                        <div className="step-num-badge" style={{
                          backgroundColor: 'var(--color-primary-light)',
                          color: 'var(--color-primary)',
                          fontWeight: '800',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          whiteSpace: 'nowrap'
                        }}>{idx + 1}</div>
                        <div>
                          <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{step.step}</h4>
                          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

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
                    <h4>🐛 Key Pests</h4>
                    <p>{plant.pests || 'Minimal pest sensitivity'}</p>
                  </div>

                  <div className="parameter-card-v2">
                    <h4>🌱 Substrate Soil</h4>
                    <p>{plant.soil} type preferred</p>
                  </div>

                  <div className="parameter-card-v2" style={{ borderLeft: '4px solid var(--color-primary)' }}>
                    <h4>🛠️ Materials Required</h4>
                    <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--color-text-secondary)' }}>{details.materials}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Problems & Diseases */}
          {activeTab === 'problems' && (
            <div className="tab-pane page-transition">
              <div className="growing-method-banner water" style={{ borderLeftColor: 'var(--color-accent-red)' }}>
                <AlertTriangle className="banner-icon text-red" size={28} style={{ color: 'var(--color-accent-red)' }} />
                <div>
                  <h4>Crop Troubleshooting Guide</h4>
                  <p>Common issues, diseases, and organic eradication steps for {plant.name}.</p>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '20px', margin: '20px 0', borderLeft: '4px solid var(--color-accent-yellow)' }}>
                <h4 style={{ margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>⚠️ Peak Problem Window</h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>{details.troubleshooting.peakProblemTime}</p>
              </div>

              <h3>Common Diseases & Eradication Steps</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                {details.troubleshooting.diseases.map((d, i) => (
                  <div key={i} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h4 style={{ margin: 0, color: 'var(--color-accent-red)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Flame size={16} /> {d.name}
                    </h4>
                    <p style={{ margin: '4px 0', fontSize: '13px' }}>
                      <strong>Symptoms:</strong> <span style={{ color: 'var(--color-text-secondary)' }}>{d.symptom}</span>
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '13px', lineHeight: '1.5' }}>
                      <strong>How to Eradicate:</strong> <span style={{ color: 'var(--color-primary)' }}>{d.cure}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Materials & Fertilizers */}
          {activeTab === 'fertilizers' && (
            <div className="tab-pane page-transition">
              <div className="growing-method-banner water">
                <ShieldCheck className="banner-icon text-green" size={28} />
                <div>
                  <h4>Soil, Materials & Fertilizers</h4>
                  <p>Optimal container substrates, fertilizer selection, and application schedules.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '20px 0' }} className="responsive-split">
                <div className="glass-card" style={{ padding: '20px' }}>
                  <h4 style={{ color: 'var(--color-primary)', margin: '0 0 12px 0' }}>🪴 Growing Media & Container</h4>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
                    <strong>Suitable Substrate:</strong> {details.materials}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginTop: '8px' }}>
                    <strong>Traditional Container:</strong> Earthen clay pot, terracotta, or UV-stabilized plastic grow bags with multiple bottom drainage holes.
                  </p>
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                  <h4 style={{ color: 'var(--color-primary)', margin: '0 0 12px 0' }}>🧪 Nutrition & Fertilizer Schedule</h4>
                  <ul style={{ paddingLeft: '16px', fontSize: '13px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px', margin: 0 }}>
                    <li><strong>Fertilizer Type:</strong> {details.fertilizer.type}</li>
                    <li><strong>Frequency:</strong> {details.fertilizer.frequency}</li>
                    <li><strong>Quantity:</strong> {details.fertilizer.quantity}</li>
                    <li><strong>Application:</strong> {details.fertilizer.application}</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Advanced CEA (Hydroponics & Vertical Setup) */}
          {activeTab === 'cea' && (
            <div className="tab-pane page-transition">
              <div className="growing-method-banner hydro">
                <Zap className="banner-icon text-green" size={28} />
                <div>
                  <h4>Soil-less & Space-Optimized Cultivation</h4>
                  <p>How to grow {plant.name} using recirculating nutrient channels or vertical space structures.</p>
                </div>
              </div>

              <div className="technical-parameters-grid">
                <div className="tech-box">
                  <small>Hydro System</small>
                  <h4>{plant.hydroGuide?.system || 'DWC / Wicking'}</h4>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '20px 0' }} className="responsive-split">
                <div className="glass-card" style={{ padding: '20px' }}>
                  <h4 style={{ color: 'var(--color-primary)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}><Zap size={16} /> Hydroponics Method</h4>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    <strong>System Requirements:</strong> {details.hydroponics.requirements}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginTop: '8px', marginBottom: 0 }}>
                    <strong>What to Do & Setup:</strong> {details.hydroponics.method}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginTop: '8px', marginBottom: 0 }}>
                    <strong>How It Grows:</strong> {details.hydroponics.howItGrows}
                  </p>
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                  <h4 style={{ color: 'var(--color-accent-blue)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}><Layers size={16} /> Vertical Farming Layout</h4>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    <strong>How It Can Be Done:</strong> {details.verticalFarming.howToDo}
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6', marginTop: '8px', marginBottom: 0 }}>
                    <strong>Spacing & Spindle Setup:</strong> {plant.verticalGuide?.setup || details.verticalFarming.requirements}
                  </p>
                  <div className="glass-card vertical-layout-alert" style={{ marginTop: '12px', padding: '10px', background: 'rgba(240, 147, 43, 0.05)' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                      <AlertTriangle size={14} className="text-yellow" style={{ color: 'var(--color-accent-yellow)', marginTop: '2px', flexShrink: 0 }} />
                      <p style={{ fontSize: '11px', margin: 0, color: 'var(--color-text-secondary)' }}>
                        <strong>Vertical Light Tip:</strong> Rotate vertical columns weekly by 90° for uniform sunlight or mount high-intensity full-spectrum LED bars.
                      </p>
                    </div>
                  </div>
                </div>
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

      {/* Grow modal dialog popup */}
      {showGrowModal && (
        <div className="suggestion-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }} onClick={() => setShowGrowModal(false)}>
          <div className="glass-card suggestion-modal page-transition" style={{
            width: '100%',
            maxWidth: '450px',
            padding: '24px',
            position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setShowGrowModal(false)} style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer'
            }}>
              <X size={20} />
            </button>
            <div className="modal-top" style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
              <div className="modal-logo" style={{ fontSize: '32px', backgroundColor: 'var(--color-primary-light)', padding: '10px', borderRadius: '12px' }}>{plant.emoji}</div>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Grow {plant.name}</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Deploy this crop to your Active Grow Systems</p>
              </div>
            </div>
            
            <form className="suggestion-form" onSubmit={handleConfirmGrow} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Cultivation Grow Method</label>
                <select 
                  required
                  value={growMethod}
                  onChange={e => setGrowMethod(e.target.value)}
                  className="modal-select-field"
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: 'var(--color-input-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text-primary)'
                  }}
                >
                  <option value="Hydroponics">Hydroponics (NFT/DWC)</option>
                  <option value="Vertical Tower">Vertical Grow Tower</option>
                  <option value="Soil">Soil Container / Pot</option>
                </select>
              </div>
              
              <div className="form-input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-secondary)' }}>Water / Nutrient Loop Frequency (days)</label>
                <input 
                  type="number" 
                  min="1"
                  max="30"
                  required
                  value={growFreq}
                  onChange={e => setGrowFreq(parseInt(e.target.value) || 1)}
                  className="modal-text-field"
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: 'var(--color-input-bg)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text-primary)'
                  }}
                />
              </div>

              <div style={{ padding: '12px', backgroundColor: 'rgba(46, 213, 115, 0.05)', borderRadius: '8px', border: '1px solid rgba(46, 213, 115, 0.15)', fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                🚀 This crop will appear in your control panel under Active Systems with automated notifications based on your chosen frequency.
              </div>

              <button type="submit" className="btn-primary modal-confirm-btn" disabled={isAddingPlant} style={{
                padding: '12px',
                width: '100%',
                fontWeight: '700',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px'
              }}>
                {isAddingPlant ? 'Deploying...' : <>🌱 Deploy to Active Systems</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantDetails;
