const fs = require('fs');

async function fetchWikiImageBySearch(query) {
  try {
    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=pageimages&format=json&pithumbsize=500`);
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

  for (let plant of plants) {
    if (plant.varieties && plant.varieties.length > 0) {
      for (let variety of plant.varieties) {
        console.log(`Fetching image for ${variety.name}...`);
        
        // Help the search engine by appending the plant name if it's missing
        let searchQ = variety.name;
        if (!searchQ.toLowerCase().includes(plant.name.toLowerCase())) {
           searchQ = `${variety.name} ${plant.name}`;
        }
        
        let imgUrl = await fetchWikiImageBySearch(searchQ);
        
        // If no image is found for the variety, fall back to the plant's main image
        if (!imgUrl) {
           console.log(`No specific image found for ${variety.name}, falling back to main plant image.`);
           imgUrl = plant.image; 
        }
        
        if (imgUrl) {
           variety.image = imgUrl;
           console.log(`Found: ${imgUrl}`);
        }
        
        // Sleep to avoid hammering the Wikipedia API
        await new Promise(r => setTimeout(r, 200));
      }
    }
  }

  const newContent = `// Auto-generated from user JSON\nexport const plantsData = ${JSON.stringify(plants, null, 2)};\n`;
  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log("Updated variety images successfully!");
}

main();
