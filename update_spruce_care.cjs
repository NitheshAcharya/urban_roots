const fs = require('fs');

const dataPath = './src/data/plantsData.js';
let fileContent = fs.readFileSync(dataPath, 'utf8');

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

function getSpruceCareGuide(name, cat, sun, soil, water) {
  let light = `Prefers ${sun} of direct sunlight daily. If growing indoors, place near a south-facing window.`;
  if (cat === "Herbs" || name.includes("Spinach")) {
    light = `Requires ${sun} of sunlight. Can tolerate partial shade, especially during the hottest part of the afternoon.`;
  }
  
  let soilDesc = `Thrives in well-draining ${soil} soil. Ensure a pH between 6.0 and 7.0 for optimal nutrient absorption.`;
  if (cat === "Vegetables") {
    soilDesc = `Needs highly fertile, well-draining ${soil} soil amended with plenty of organic compost before planting.`;
  }

  let waterDesc = `Water ${water.toLowerCase()}. The top inch of the soil should dry out between waterings, but never let the root ball completely dry.`;
  if (cat === "Fruits") {
    waterDesc = `Water deeply and consistently (${water.toLowerCase()}). Deep watering encourages deep root systems which are essential for fruiting trees.`;
  }

  let temp = `Ideal temperatures range from 65°F to 85°F (18°C - 29°C). Protect from frost and freezing temperatures.`;
  if (cat === "Flowers") {
    temp = `Prefers moderate temperatures (60°F - 75°F) and average household humidity. Avoid placing near drafty windows.`;
  }

  let fert = `Feed with a balanced slow-release fertilizer at planting, and side-dress with compost mid-season.`;
  if (cat === "Vegetables" || cat === "Fruits") {
    fert = `Heavy feeder. Use a high-phosphorus, potassium-rich fertilizer once blooms appear to support heavy fruiting.`;
  }

  // Custom overrides for specific popular plants to make them extremely authentic
  if (name === "Tomato") {
    light = "Full sun is absolutely essential. Aim for 8+ hours of direct sunlight daily for the best fruit production and disease resistance.";
    soilDesc = "Requires rich, loamy soil with a slightly acidic pH (6.2 to 6.8). Deeply bury the stem to encourage adventitious root growth.";
    waterDesc = "Provide 1 to 2 inches of water per week. Consistent watering is critical to prevent blossom-end rot and fruit cracking.";
    temp = "Thrives in warm weather (70°F to 85°F). Fruit set may pause if temperatures exceed 90°F or drop below 55°F at night.";
    fert = "Mix a tomato-specific granular fertilizer into the hole at planting. Once fruit sets, feed every two weeks with a water-soluble fertilizer.";
  } else if (name === "Hibiscus") {
    waterDesc = "Tropical hibiscus are thirsty plants. In hot weather, they may need watering daily. Never let the soil become bone dry.";
    fert = "Use a fertilizer with a high potassium content (like 17-5-24) to keep the foliage lush and promote constant blooming.";
  }

  return { light, soil: soilDesc, water: waterDesc, temp, fertilizer: fert };
}

plants.forEach(p => {
  p.careGuide = getSpruceCareGuide(p.name, p.cat, p.sun, p.soil, p.water);
});

// Write back
const newContent = `// Auto-generated from user JSON\nexport const plantsData = ${JSON.stringify(plants, null, 2)};\n`;

fs.writeFileSync(dataPath, newContent);
console.log("Updated plantsData.js care guides successfully!");
