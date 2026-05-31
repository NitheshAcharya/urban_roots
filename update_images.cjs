const fs = require('fs');

async function fetchWikiImage(title) {
  try {
    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=400`);
    const data = await res.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId !== '-1' && pages[pageId].thumbnail) {
      return pages[pageId].thumbnail.source;
    }
  } catch (e) {
    console.error(`Failed to fetch for ${title}`, e);
  }
  return null;
}

async function main() {
  const filePath = './src/data/plantsData.js';
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Quick extract using regex or just evaluate the file (since it's an export, we can modify the string or parse it)
  // To keep it simple, let's extract the array, modify it, and put it back.
  
  // Since we only need to add 'image' property. We can do it by finding each object.
  // Actually, let's just parse it. It's a JS file.
  // We can write a quick parser or just use regex to insert the image URL.
  // Alternatively, load it using require after removing 'export const'.
  
  const jsonStr = content.replace('export const plantsData = ', '').replace(/;\s*$/, '');
  let plants = [];
  try {
    // If it's valid JSON, we can parse it. Wait, the file might be pure JS with single quotes or unquoted keys.
    // Let's use eval or new Function
    plants = new Function('return ' + jsonStr)();
  } catch (e) {
    console.error("Failed to parse", e);
    return;
  }

  for (let plant of plants) {
    if (!plant.image) {
      console.log(`Fetching image for ${plant.name} (${plant.sc})...`);
      let imgUrl = await fetchWikiImage(plant.sc); // try scientific name first
      if (!imgUrl) {
         imgUrl = await fetchWikiImage(plant.name); // fallback to common name
      }
      if (imgUrl) {
         plant.image = imgUrl;
         console.log(`Found: ${imgUrl}`);
      } else {
         console.log(`No image found for ${plant.name}`);
         // placeholder fallback
         plant.image = `https://loremflickr.com/400/300/${encodeURIComponent(plant.name.toLowerCase().split(' ')[0])}`;
      }
    }
  }

  const newContent = `// Auto-generated from user JSON\nexport const plantsData = ${JSON.stringify(plants, null, 2)};\n`;
  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log("Updated plantsData.js successfully!");
}

main();
