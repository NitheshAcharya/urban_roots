const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'src', 'data', 'plantsData.js');

if (!fs.existsSync(dataPath)) {
  console.error("Plants data file not found at " + dataPath);
  process.exit(1);
}

let content = fs.readFileSync(dataPath, 'utf8');

// Match the array content
const arrayMatch = content.match(/export const plantsData = (\[[\s\S]*\]);/);
if (!arrayMatch) {
  console.error("Could not parse plantsData array");
  process.exit(1);
}

let plants;
try {
  // Safe evaluation of the array
  plants = eval(arrayMatch[1]);
} catch (err) {
  console.error("Failed to evaluate plants array:", err);
  process.exit(1);
}

// 1. Define new plants to insert
const newPlants = [
  {
    id: 101,
    name: "Butterhead Lettuce",
    sc: "Lactuca sativa var. capitata",
    emoji: "🥬",
    cat: "Vegetables",
    diff: "Easy",
    water: "Weekly",
    sun: "6h",
    yield: "45d",
    soil: "Clay Pebbles",
    description: "The absolute champion of urban hydroponic farming. Crisp, buttery leaves that grow incredibly fast in compact vertical systems with virtually no water waste.",
    tips: [
      "Keep reservoir water cool: Lettuce roots love temperatures between 15°C and 20°C.",
      "Prevent tipburn: Maintain a small fan near the crop to ensure active transpiration.",
      "Harvest outer leaves first: Can harvest cut-and-come-again style to extend production."
    ],
    pests: "Aphids, slugs",
    season: "Year-round (Indoors)",
    image: "https://images.unsplash.com/photo-1556781366-336f835307de?q=80&w=600&auto=format&fit=crop",
    growthPhases: [
      { week: 1, phase: "Sprout Stage", description: "Rockwool cubes sprout green cotyledons.", image: "/images/generic_phase_1_1779097059096.png" },
      { week: 2, phase: "Transplant Ready", description: "Roots push through rockwool base, ready for NFT channel.", image: "/images/generic_phase_2_1779097074352.png" },
      { week: 4, phase: "Head Formation", description: "Leaves overlap to form a beautiful soft rose-like head.", image: "/images/generic_phase_3_1779097091338.png" },
      { week: 6, phase: "Full Harvest", description: "Harvest the full mature head with roots intact for longevity.", image: "/images/generic_phase_4_1779097107708.png" }
    ],
    varieties: [
      { name: "Bibb Lettuce", type: "Standard", description: "Sweet and tender leaves, ideal for hydroponic wicking beds.", image: "/images/generic_variety_1_1779097157616.png" },
      { name: "Boston Lettuce", type: "Premium", description: "Larger heads with delicate leaves well-suited for DWC rafts.", image: "/images/generic_variety_2_1779097181284.png" }
    ],
    careGuide: {
      light: "Thrives in indirect or filtered light. Perfect for indoor setups with LED grow lights.",
      soil: "Soil-less. Grows best in clay pebbles, rockwool, or foam grow cubes.",
      water: "Extremely low water usage. Uses recirculating nutrient water.",
      temp: "Prefers cool temperatures. Bolting can occur if temperature exceeds 28°C.",
      fertilizer: "Use nitrogen-heavy leafy green hydroponic nutrient solution."
    }
  },
  {
    id: 102,
    name: "Vertical Strawberry",
    sc: "Fragaria ananassa",
    emoji: "🍓",
    cat: "Fruits",
    diff: "Medium",
    water: "2 days",
    sun: "8h",
    yield: "65d",
    soil: "Coco Coir",
    description: "Highly optimized vertical tower crop. Growing strawberries vertically keeps the fruit clean of soil pests, saves 90% water, and increases yield density by 8x.",
    tips: [
      "Hand pollination: Indoors, gently brush the flowers with a small paintbrush to ensure fruit sets.",
      "Runner management: Clip runners immediately to redirect energy into sweeter, larger fruits.",
      "Root hygiene: Keep roots clean and check for rot in high-humidity vertical columns."
    ],
    pests: "Spider mites, birds",
    season: "Oct-March",
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=600&auto=format&fit=crop",
    growthPhases: [
      { week: 2, phase: "Establishment", description: "Root crowns settle into vertical pocket cups with coco-coir.", image: "/images/generic_phase_1_1779097059096.png" },
      { week: 4, phase: "Flowering", description: "White blossoms appear at the edges of the vertical tower.", image: "/images/generic_phase_2_1779097074352.png" },
      { week: 7, phase: "Green Berries", description: "Fruit sets and starts hanging down the column faces.", image: "/images/generic_phase_3_1779097091338.png" },
      { week: 9, phase: "Red Ripe Harvest", description: "Fruits turn deep glossy red. Snip for instant sweet tasting.", image: "/images/generic_phase_4_1779097107708.png" }
    ],
    varieties: [
      { name: "Albion", type: "Standard", description: "Ever-bearing variety known for large, sweet berries all winter.", image: "/images/generic_variety_1_1779097157616.png" },
      { name: "Chandler", type: "Hybrid", description: "High yielding variety, exceptionally popular for Southern climates.", image: "/images/generic_variety_2_1779097181284.png" }
    ],
    careGuide: {
      light: "Requires full direct sunlight or strong LED grow light setups (8-10 hours).",
      soil: "Grows beautifully in loose coco coir and perlite mixtures.",
      water: "Frequent but small doses. Keep soil damp but never waterlogged.",
      temp: "Thrives in pleasant warm days (20-25°C) and cooler nights.",
      fertilizer: "High potassium and phosphorus nutrients once flowers start emerging."
    }
  },
  {
    id: 103,
    name: "Lacinato Kale",
    sc: "Brassica oleracea var. palmifolia",
    emoji: "🥬",
    cat: "Vegetables",
    diff: "Easy",
    water: "Weekly",
    sun: "6h",
    yield: "50d",
    soil: "Perlite Mix",
    description: "Also known as Dinosaur Kale. Extremely hardy, drought-tolerant, and perfectly designed for high-density vertical towers and drip wicking lines.",
    tips: [
      "Harvest bottom leaves: Keep snapping leaves from the bottom up to let the central stem grow tall like a mini palm tree.",
      "Spray leaves: A misting of cold water in hot afternoons helps prevent bitterness.",
      "Check pH: Kale is sensitive to acidic environments; keep pH above 6.0."
    ],
    pests: "Cabbage moths, aphids",
    season: "Oct-Feb",
    image: "https://images.unsplash.com/photo-1628773822503-930a84511f56?q=80&w=600&auto=format&fit=crop",
    growthPhases: [
      { week: 1, phase: "Sprout", description: "Tiny cotyledons push through grow media.", image: "/images/generic_phase_1_1779097059096.png" },
      { week: 3, phase: "Foliage Stage", description: "Blue-green leaves emerge with classic blistered texture.", image: "/images/generic_phase_2_1779097074352.png" },
      { week: 5, phase: "Rapid Leafing", description: "Thick stems produce multiple robust leaves.", image: "/images/generic_phase_3_1779097091338.png" },
      { week: 7, phase: "Harvest Window", description: "Leaves reach 20-30cm, crinkled and ready for picking.", image: "/images/generic_phase_4_1779097107708.png" }
    ],
    varieties: [
      { name: "Toscano Dinosaur", type: "Standard", description: "Classic crinkly dark blue-green variety.", image: "/images/generic_variety_1_1779097157616.png" },
      { name: "Redbor", type: "Premium", description: "Vibrant purple-leafed kale with excellent cold resistance.", image: "/images/generic_variety_2_1779097181284.png" }
    ],
    careGuide: {
      light: "Requires 6h sunlight. Can tolerate half shade during warm afternoons.",
      soil: "Thrives in coco coir, clay pebbles, or lightweight soil-less mixes.",
      water: "Consistent wicking or drip system. Drought tolerant once mature.",
      temp: "Thrives in pleasant cool climates but tolerates warm days.",
      fertilizer: "Use balanced organic nutrients with moderate nitrogen."
    }
  },
  {
    id: 104,
    name: "Bok Choy",
    sc: "Brassica rapa subsp. chinensis",
    emoji: "🥬",
    cat: "Vegetables",
    diff: "Easy",
    water: "Weekly",
    sun: "5h",
    yield: "35d",
    soil: "Rockwool",
    description: "Compact Asian cabbage that is an absolute joy to grow. Reaches full size in only 35 days and adapts perfectly to Kratky jars or vertical pocket channels.",
    tips: [
      "Kratky setup: Can grow completely offline in a mason jar with zero power using the Kratky static water method.",
      "Shade tolerance: Ideal for lower shelves of vertical towers that get less direct light.",
      "Harvest early: Baby Bok Choy is tender and sweeter than fully mature plants."
    ],
    pests: "Flea beetles, slugs",
    season: "Nov-Feb",
    image: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?q=80&w=600&auto=format&fit=crop",
    growthPhases: [
      { week: 1, phase: "Emergence", description: "Sprouts appear rapidly in 3 days.", image: "/images/generic_phase_1_1779097059096.png" },
      { week: 2, phase: "Baby Leaf", description: "Spoon-shaped leaves begin clustering.", image: "/images/generic_phase_2_1779097074352.png" },
      { week: 4, phase: "Bulb Swelling", description: "Stems thicken at the base to form a tight, crunchy bulb.", image: "/images/generic_phase_3_1779097091338.png" },
      { week: 5, phase: "Harvest Ready", description: "Perfect white/green bulb. Crisp and ready for stir-fries.", image: "/images/generic_phase_4_1779097107708.png" }
    ],
    varieties: [
      { name: "Toy Choy", type: "Standard", description: "Dwarf variety growing to just 4 inches, perfect for mason jars.", image: "/images/generic_variety_1_1779097157616.png" },
      { name: "Shanghai Green", type: "Hybrid", description: "Traditional light-green stems, excellent heat tolerance.", image: "/images/generic_variety_2_1779097181284.png" }
    ],
    careGuide: {
      light: "Prefers partial shade or indirect grow lights. Needs only 4-5 hours of light.",
      soil: "Rockwool, foam, or clay pebbles work flawlessly.",
      water: "Very low water. The Kratky method requires no water replacement.",
      temp: "Sensitive to extreme heat, which triggers bolting and bitter stems.",
      fertilizer: "Mild leafy green nutrient formula (EC 1.2 - 1.6)."
    }
  }
];

// Combine existing plants and new plants
let allPlants = [...plants];
newPlants.forEach(np => {
  if (!allPlants.some(p => p.id === np.id)) {
    allPlants.push(np);
  }
});

// Helper generators for growing methods
function generateHydroGuide(plant) {
  const cat = plant.cat;
  if (cat === "Vegetables") {
    if (plant.name.includes("Tomato") || plant.name.includes("Pepper")) {
      return {
        system: "Dutch Bucket / Coco Wicking",
        ph: "5.8 - 6.2",
        ec: "1.8 - 2.5 mS/cm",
        nutrient: "High Potassium and Calcium during fruiting. Use low-nitrogen after flowers appear to prevent blossom-end rot.",
        setup: "Set up a Dutch bucket containing expanded clay pebbles and coco-coir. Feed nutrient solution using micro-drip emitters on a cyclical timer."
      };
    }
    if (plant.name.includes("Lettuce") || plant.name.includes("Bok Choy")) {
      return {
        system: "NFT (Nutrient Film Technique) / Kratky",
        ph: "5.5 - 6.0",
        ec: "1.2 - 1.6 mS/cm",
        nutrient: "Leafy Green formulation rich in Nitrogen, Magnesium, and Chelated Iron.",
        setup: "Insert root-established rockwool plugs directly into NFT channels or static Kratky wicking cups. Keep root bases touching flowing water."
      };
    }
    return {
      system: "DWC (Deep Water Culture) / Wicking beds",
      ph: "6.0 - 6.5",
      ec: "1.6 - 2.0 mS/cm",
      nutrient: "Balanced hydroponic nutrient solution containing complete macro and micro trace minerals.",
      setup: "Suspend net cups in a reservoir of water aerated continuously with a local aquarium air pump."
    };
  }
  if (cat === "Herbs") {
    if (plant.name.includes("Mint")) {
      return {
        system: "Kratky Water Jar / DWC",
        ph: "5.5 - 6.2",
        ec: "1.0 - 1.4 mS/cm",
        nutrient: "Very mild vegetative liquid nutrients. Mint propagates quickly from stem cuttings directly in water.",
        setup: "Put cutting in a jar with plain water. Once roots grow 3cm, add mild nutrient formulation. Maintain water level at 2/3 of root height."
      };
    }
    return {
      system: "Kratky / Vertical Tower Pockets",
      ph: "5.8 - 6.2",
      ec: "1.2 - 1.6 mS/cm",
      nutrient: "Leafy green minerals. Avoid overfeeding to keep essential oil concentrations high (for flavor).",
      setup: "Grow in net pots filled with clay pebbles. Place in vertical pocket slots or a simple static reservoir."
    };
  }
  if (cat === "Fruits") {
    return {
      system: "Drip Irrigation / Coco Coir bags",
      ph: "5.8 - 6.3",
      ec: "1.8 - 2.4 mS/cm",
      nutrient: "Fruiting NPK formula with enhanced Boron and Calcium for fruit set.",
      setup: "Use Dutch buckets or coco grow bags. Irrigate via drip tubes, recovering drainage water to a main sump."
    };
  }
  // Fallback / Flowers
  return {
    system: "Ebb and Flow (Flood & Drain)",
    ph: "6.0 - 6.5",
    ec: "1.2 - 1.8 mS/cm",
    nutrient: "High phosphorus fertilizer formulation to promote active blossom sets and sturdy stems.",
    setup: "Place pots in a tray. Periodically flood the tray with nutrient water and let it drain back into the reservoir."
  };
}

function generateVerticalGuide(plant) {
  const cat = plant.cat;
  if (plant.name.includes("Tomato") || plant.name.includes("Pepper") || plant.name.includes("Gourd") || plant.name.includes("Cucumber")) {
    return {
      system: "Vertical Trellis / Support Netting",
      spacing: "45cm",
      layout: "Single vine vertical training on wicking twine.",
      setup: "Anchor plant in a bottom bucket. Prune to a single central vine. Train twine upward to a ceiling wire. Clip the plant to twine as it grows."
    };
  }
  if (cat === "Vegetables" || cat === "Herbs") {
    return {
      system: "Aeroponic Tower / Pocket Wall Planter",
      spacing: "20cm",
      layout: "Staggered layout in vertical column pockets.",
      setup: "Insert starter plugs into slots of vertical towers. Ensure tower pump runs 15m on, 15m off to spray roots inside the central column."
    };
  }
  return {
    system: "Wall planter shelves / Hanging vertical columns",
    spacing: "30cm",
    layout: "Horizontal stacked troughs or staggered pockets.",
    setup: "Mount planter shelves along sunny balcony walls. Arrange lighter plants on upper tiers, heavier ones on bottom shelves."
  };
}

function generateWaterSavingGuide(plant) {
  const waterVal = plant.water.toLowerCase();
  let savings = "85% water saved vs traditional farming";
  let tips = [];
  
  if (waterVal.includes("daily") || waterVal.includes("2 days")) {
    savings = "90% water saved using wicking or hydroponics";
    tips = [
      "Use closed recirculating hydroponic loops (DWC/NFT) which only lose water through plant transpiration.",
      "Implement drip irrigation with a sub-surface moisture sensor to water only when soil drops below 35% moisture.",
      "Add a thick 2-inch organic straw or coco peat mulch layer to reduce surface evaporation by up to 50%."
    ];
  } else {
    savings = "95% water saved using Kratky or sub-irrigation";
    tips = [
      "Utilize sub-irrigation planter boxes (SIPs) or wicking beds where plants draw water upward via capillary action.",
      "Cover the reservoir completely with light-blocking lids to eliminate evaporation and prevent algae formation.",
      "Capture and reuse air conditioner condensation or rainwater to fill the wicking reservoir."
    ];
  }

  return {
    savingPct: savings,
    tips: tips
  };
}

// Inject details for all plants
allPlants.forEach(p => {
  p.hydroSuitability = p.hydroSuitability || (p.cat === "Vegetables" || p.cat === "Herbs" ? "Excellent" : "Good");
  p.verticalSuitability = p.verticalSuitability || (p.name.includes("Gourd") || p.name.includes("Cucumber") || p.cat === "Herbs" || p.name.includes("Tomato") ? "Excellent" : "Good");
  p.waterSavings = p.waterSavings || (p.cat === "Vegetables" ? "90%" : p.cat === "Herbs" ? "95%" : "85%");
  
  p.hydroGuide = p.hydroGuide || generateHydroGuide(p);
  p.verticalGuide = p.verticalGuide || generateVerticalGuide(p);
  p.waterSavingGuide = p.waterSavingGuide || generateWaterSavingGuide(p);
});

// Re-generate content
const newContent = `// Auto-generated from user JSON
export const plantsData = ${JSON.stringify(allPlants, null, 2)};
`;

fs.writeFileSync(dataPath, newContent);
console.log("SUCCESS: Patched plantsData.js with hydroponic, vertical farming, and water-saving methods for all " + allPlants.length + " plants.");
