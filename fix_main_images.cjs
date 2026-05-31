const fs = require('fs');

async function fetchWikiImageBySearch(query) {
  try {
    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=pageimages&format=json&pithumbsize=600`);
    const data = await res.json();
    if (data && data.query && data.query.pages) {
      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];
      if (pages[pageId].thumbnail) {
        return pages[pageId].thumbnail.source;
      }
    }
  } catch (e) {
    console.error(`Failed to fetch for ${query}`, e);
  }
  return null;
}

async function main() {
  const filePath = './src/data/plantsData.js';
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const arrayMatch = content.match(/export const plantsData = (\[[\s\S]*\]);/);
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

  for (let p of plants) {
    let broken = false;
    
    if (!p.image) {
      broken = true;
    } else if (p.image.startsWith('/images/')) {
      broken = false;
    } else {
      try {
        const res = await fetch(p.image, { method: 'HEAD' });
        if (!res.ok) broken = true;
      } catch (e) {
        broken = true;
      }
    }

    if (broken) {
      console.log(`Fixing image for ${p.name}...`);
      let newImg = await fetchWikiImageBySearch(p.name + " plant");
      if (!newImg) {
         newImg = await fetchWikiImageBySearch(p.name);
      }
      
      if (newImg) {
         p.image = newImg;
         console.log(`Fixed ${p.name}: ${newImg}`);
      } else {
         console.log(`Could not find replacement for ${p.name}`);
      }
      await new Promise(r => setTimeout(r, 200));
    }
  }

  const newContent = `// Auto-generated from user JSON\nexport const plantsData = ${JSON.stringify(plants, null, 2)};\n`;
  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log("Updated main plant images successfully!");
}

main();
