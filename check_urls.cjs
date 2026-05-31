const fs = require('fs');

async function checkUrls() {
  const content = fs.readFileSync('./src/data/plantsData.js', 'utf8');
  const m = content.match(/export const plantsData = (\[[\s\S]*\]);/);
  const plants = eval(m[1]);
  
  for (let p of plants) {
    if (!p.image) {
      console.log(`[EMPTY] ${p.name}`);
      continue;
    }
    if (p.image.startsWith('/images/')) continue; // local images
    
    try {
      const res = await fetch(p.image, { method: 'HEAD' });
      if (!res.ok) {
        console.log(`[BROKEN] ${p.name} -> ${p.image} (Status: ${res.status})`);
      }
    } catch (e) {
      console.log(`[ERROR] ${p.name} -> ${p.image} (${e.message})`);
    }
  }
  console.log("Check complete.");
}

checkUrls();
