const fs = require('fs');

const dataPath = './src/data/plantsData.js';
let fileContent = fs.readFileSync(dataPath, 'utf8');

// Extract the array part
const arrayMatch = fileContent.match(/export const plantsData = (\[[\s\S]*\]);/);
if (!arrayMatch) {
  console.error("Could not parse plantsData");
  process.exit(1);
}

let plants;
try {
  plants = eval(arrayMatch[1]);
} catch (e) {
  console.error("Eval failed", e);
  process.exit(1);
}

const varietiesMap = {
  "Tomato": ["Cherry Tomato", "Roma Tomato", "Beefsteak Tomato"],
  "Hot Pepper": ["Jalapeño", "Habanero", "Cayenne"],
  "Brinjal": ["Black Beauty", "Fairy Tale", "Thai Eggplant"],
  "Okra": ["Clemson Spineless", "Burgundy", "Emerald"],
  "Spinach": ["Savoy", "Semi-savoy", "Smooth-leaf"],
  "Coriander": ["Leisure", "Santo", "Calypso"],
  "Mint": ["Peppermint", "Spearmint", "Apple Mint"],
  "Curry Leaf": ["Regular", "Dwarf", "Gamthi"],
  "Tulsi": ["Rama Tulsi", "Krishna Tulsi", "Vana Tulsi"],
  "Lemon Grass": ["West Indian", "East Indian"],
  "Basil": ["Sweet Basil", "Thai Basil", "Lemon Basil"],
  "Fenugreek": ["Kasuri Methi", "Regular Methi"],
  "Drumstick": ["PKM-1", "ODC", "Bhagya"],
  "Banana": ["Cavendish", "Robusta", "Red Banana"],
  "Papaya": ["Red Lady", "Washington", "Co-1"],
  "Lemon": ["Eureka", "Meyer", "Lisbon"],
  "Guava": ["Allahabad Safeda", "Lucknow 49", "Thai Guava"],
  "Chikoo": ["Kalipatti", "Cricket Ball", "Pala"],
  "Coconut": ["Tiptur Tall", "Chowghat Orange Dwarf", "Malayan Yellow Dwarf"],
  "Ridge Gourd": ["Pusa Nasdar", "Arka Sumeet"],
  "Bitter Gourd": ["Pusa Do Mausami", "Arka Harit"],
  "Bottle Gourd": ["Pusa Summer Prolific", "Arka Bahar"],
  "French Beans": ["Contender", "Pusa Parvati"],
  "Cluster Beans": ["Pusa Navbahar", "Pusa Sadabahar"],
  "Amaranth": ["Red Amaranth", "Green Amaranth"],
  "Radish": ["Pusa Chetki", "Japanese White"],
  "Carrot": ["Pusa Kesar", "Nantes"],
  "Onion": ["Nasik Red", "Pusa Red", "White Globe"],
  "Garlic": ["Yamuna Safed", "Agrifound White"],
  "Ginger": ["Rio de Janeiro", "Maran", "Nadia"],
  "Turmeric": ["Prathibha", "Salem", "Alleppey"],
  "Capsicum": ["California Wonder", "Yellow Wonder"],
  "Cucumber": ["Pusa Sanyog", "Japanese Long Green"],
  "Pumpkin": ["Arka Suryamukhi", "Pusa Vishwas"],
  "Sweet Potato": ["Pusa Safed", "Sree Nandini"],
  "Marigold": ["Pusa Narangi", "Pusa Basanti"],
  "Rose": ["Hybrid Tea", "Floribunda", "Climber"],
  "Hibiscus": ["Tropical", "Hardy", "Rose of Sharon"]
};

// Generic phase images we copied earlier
const phaseImages = [
  "/images/generic_phase_1_1779097059096.png",
  "/images/generic_phase_2_1779097074352.png",
  "/images/generic_phase_3_1779097091338.png",
  "/images/generic_phase_4_1779097107708.png"
];
const varietyImages = [
  "/images/generic_variety_1_1779097157616.png",
  "/images/generic_variety_2_1779097181284.png"
];

function calculatePhases(yieldStr, cat, name) {
  let days = parseInt(yieldStr.replace('d', ''));
  if (isNaN(days)) days = 60; // default 60 days
  
  let w1 = Math.max(1, Math.floor(days * 0.15 / 7));
  let w2 = Math.max(w1 + 1, Math.floor(days * 0.4 / 7));
  let w3 = Math.max(w2 + 1, Math.floor(days * 0.75 / 7));
  let w4 = Math.max(w3 + 1, Math.floor(days / 7));

  // Category specific text
  let p1, p2, p3, p4;
  
  if (cat === "Vegetables" || cat === "Herbs") {
    p1 = { phase: "Seedling Emergence", desc: `The ${name} seeds sprout and develop their first true leaves.` };
    p2 = { phase: "Vegetative Growth", desc: `Rapid foliage development. ${name} stems thicken and branch out.` };
    p3 = { phase: "Pre-Harvest", desc: `Leaves are fully mature, and early edible parts begin to form.` };
    p4 = { phase: "Ready for Harvest", desc: `The ${name} is fully mature and ready to be picked for the best flavor.` };
  } else if (cat === "Fruits") {
    p1 = { phase: "Sapling Stage", desc: `The ${name} sapling establishes roots and starts outward growth.` };
    p2 = { phase: "Canopy Development", desc: `Branches extend and foliage density increases to support future fruit.` };
    p3 = { phase: "Flowering & Fruit Set", desc: `Blossoms appear, followed by tiny, unripe ${name} fruits.` };
    p4 = { phase: "Fruit Ripening", desc: `Fruits swell to full size and develop rich colors, ready for picking.` };
  } else {
    // Flowers or others
    p1 = { phase: "Early Growth", desc: `The ${name} seedling puts out fresh green shoots.` };
    p2 = { phase: "Bud Formation", desc: `Tight flower buds begin to appear at the ends of stems.` };
    p3 = { phase: "First Bloom", desc: `The buds open into beautiful, vibrant ${name} flowers.` };
    p4 = { phase: "Full Maturation", desc: `Peak blooming period with multiple flowers displayed prominently.` };
  }

  return [
    { week: w1, phase: p1.phase, description: p1.desc, image: phaseImages[0] },
    { week: w2, phase: p2.phase, description: p2.desc, image: phaseImages[1] },
    { week: w3, phase: p3.phase, description: p3.desc, image: phaseImages[2] },
    { week: w4, phase: p4.phase, description: p4.desc, image: phaseImages[3] }
  ];
}

plants.forEach(p => {
  // We keep Hibiscus intact if it already has custom data, but let's re-generate for consistency, 
  // or just overwrite with specific text. Since we only added it to Hibiscus, let's keep Hibiscus images 
  // if possible. Actually, let's just generate for everyone except Hibiscus, since Hibiscus has custom images!
  
  if (p.id === 38) {
    // Hibiscus already has custom images, leave it alone.
    return;
  }

  p.growthPhases = calculatePhases(p.yield, p.cat, p.name);
  
  let vList = varietiesMap[p.name] || [`Common ${p.name}`, `Hybrid ${p.name}`];
  p.varieties = vList.map((v, idx) => ({
    name: v,
    type: idx === 0 ? "Standard" : (idx === 1 ? "Hybrid" : "Premium"),
    description: `A popular and reliable variety of ${p.name} well-suited for urban gardening.`,
    image: varietyImages[idx % varietyImages.length]
  }));
});

// Write back
const newContent = `// Auto-generated from user JSON
export const plantsData = ${JSON.stringify(plants, null, 2)};
`;

fs.writeFileSync(dataPath, newContent);
console.log("Updated plantsData.js successfully!");
