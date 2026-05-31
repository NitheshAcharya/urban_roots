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

function getSpruceStyleTips(name, cat) {
  if (name === "Tomato") {
    return [
      "Plant deeply: Bury the stem up to the first true leaves to encourage a strong, deep root system.",
      "Water at the base: Avoid getting leaves wet to prevent blight and fungal diseases.",
      "Pruning: Remove lower leaves and pinch off suckers (for indeterminate varieties) to improve airflow."
    ];
  } else if (name === "Rose") {
    return [
      "Sunlight: Ensure at least 6-8 hours of direct morning sunlight to dry dew and prevent black spot.",
      "Pruning: Prune in early spring, cutting at a 45-degree angle about 1/4 inch above an outward-facing bud.",
      "Feeding: Use a specialized rose fertilizer monthly during the active growing season."
    ];
  } else if (name === "Hibiscus") {
    return [
      "Watering: Keep soil consistently moist but never waterlogged; tropical hibiscus drops leaves if too dry.",
      "Overwintering: Bring indoors before first frost if you live outside zones 9-11.",
      "Fertilizing: Feed with a high-potassium fertilizer to encourage prolific blooming."
    ];
  } else if (name === "Mint") {
    return [
      "Containment: Always grow mint in containers as it spreads aggressively via underground runners.",
      "Harvesting: Pinch off sprigs regularly to encourage bushy growth and prevent it from flowering (bolting).",
      "Moisture: Prefers consistently moist, rich soil and partial shade in hotter climates."
    ];
  } else if (name === "Basil") {
    return [
      "Pinching: Pinch off the top sets of leaves regularly to encourage the plant to branch out.",
      "Bolting: Remove flower buds as soon as you see them; flowering turns the leaves bitter.",
      "Watering: Water freely during hot periods, but ensure the pot has excellent drainage."
    ];
  } else if (cat === "Vegetables") {
    return [
      `Soil Prep: Amend soil with rich organic compost before planting ${name} to ensure adequate nutrients.`,
      `Watering: Provide 1-2 inches of water per week, adjusting for rainfall and extreme heat.`,
      `Pest Control: Inspect leaves weekly for common pests like aphids or caterpillars; treat with neem oil if needed.`
    ];
  } else if (cat === "Herbs") {
    return [
      `Harvesting: Regularly trim the outer leaves of your ${name} to promote vigorous new growth.`,
      `Drainage: Ensure your container has excellent drainage; most herbs despise "wet feet".`,
      `Sun: Place in a bright location receiving at least 6 hours of sunlight for the best essential oil production.`
    ];
  } else if (cat === "Fruits") {
    return [
      `Fertilizer: Feed your ${name} with a balanced fruit-tree fertilizer in early spring before buds swell.`,
      `Pruning: Annually remove dead, diseased, or crossing branches to maintain an open canopy for sunlight.`,
      `Mulching: Apply a 2-3 inch layer of organic mulch around the drip line, keeping it away from the trunk.`
    ];
  } else {
    return [
      `Soil: Plant ${name} in well-draining soil mixed with organic matter.`,
      `Watering: Water deeply when the top inch of soil feels dry to the touch.`,
      `Maintenance: Remove spent blooms or dead foliage to keep the plant looking tidy and healthy.`
    ];
  }
}

plants.forEach(p => {
  p.tips = getSpruceStyleTips(p.name, p.cat);
});

// Write back
const newContent = `// Auto-generated from user JSON
export const plantsData = ${JSON.stringify(plants, null, 2)};
`;

fs.writeFileSync(dataPath, newContent);
console.log("Updated plantsData.js tips successfully!");
