const fs = require('fs');
const content = fs.readFileSync('./src/data/plantsData.js', 'utf8');
const m = content.match(/export const plantsData = (\[[\s\S]*\]);/);
let plants = eval(m[1]);
for (let p of plants) {
  if (p.name === 'Mint') p.image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Peppermint.jpg/500px-Peppermint.jpg';
  if (p.name === 'Curry Basil') p.image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Thai_green_chicken_curry_and_roti.jpg/500px-Thai_green_chicken_curry_and_roti.jpg';
  if (p.name === 'Sunflower') p.image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Sunflower_sky_backdrop.jpg/500px-Sunflower_sky_backdrop.jpg';
}
const newContent = `// Auto-generated from user JSON\nexport const plantsData = ${JSON.stringify(plants, null, 2)};\n`;
fs.writeFileSync('./src/data/plantsData.js', newContent, 'utf-8');
console.log('Fixed final 3 images!');
