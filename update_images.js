import fs from 'fs';
import { plantsData } from './src/data/plantsData.js';

const delay = ms => new Promise(res => setTimeout(res, ms));

async function fetchWikiImage(query) {
  try {
    // Search for the page first using opensearch
    let searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=1&format=json`;
    let res = await fetch(searchUrl);
    let data = await res.json();
    
    if (data[1] && data[1].length > 0) {
      let title = data[1][0];
      
      let imageUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=600&redirects=1`;
      let imgRes = await fetch(imageUrl);
      let imgData = await imgRes.json();
      
      const pages = imgData.query.pages;
      const pageId = Object.keys(pages)[0];
      
      if (pageId !== '-1' && pages[pageId].thumbnail) {
        let src = pages[pageId].thumbnail.source;
        // Check if it's an irrelevant map or placeholder
        if (!src.includes('map') && !src.toLowerCase().includes('icon')) {
          return src;
        }
      }
    }
  } catch (e) {
    console.error(`Failed to fetch for ${query}`, e.message);
  }
  return null;
}

// Some hardcoded better images for common plants where Wiki fails or gives bad images
const overrides = {
  'Brinjal': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Solanum_melongena_24_08_2012_%281%29.JPG/600px-Solanum_melongena_24_08_2012_%281%29.JPG',
  'Coriander': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Coriander_in_Iran.JPG/600px-Coriander_in_Iran.JPG',
  'Curry Leaf': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Curry_tree.jpg/600px-Curry_tree.jpg',
  'Mint': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Peppermint.jpg/600px-Peppermint.jpg',
  'Lemon Grass': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Lemon_grass.jpg/600px-Lemon_grass.jpg',
  'Drumstick': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Moringa_oleifera_branch.jpg/600px-Moringa_oleifera_branch.jpg',
  'Guava': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Guava_ID.jpg/600px-Guava_ID.jpg',
  'Chikoo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Sapodilla_or_chikoo.jpg/600px-Sapodilla_or_chikoo.jpg',
  'Coconut': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Cocos_nucifera_tree.jpg/600px-Cocos_nucifera_tree.jpg',
  'Ridge Gourd': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Luffa_acutangula.jpg/600px-Luffa_acutangula.jpg',
  'Bitter Gourd': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Bitter_melon.jpg/600px-Bitter_melon.jpg',
  'Bottle Gourd': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Calabash.jpg/600px-Calabash.jpg',
  'French Beans': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Phaseolus_vulgaris_seed.jpg/600px-Phaseolus_vulgaris_seed.jpg',
  'Cluster Beans': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Cluster_beans.jpg/600px-Cluster_beans.jpg',
  'Amaranth': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Amaranthus_tricolor.jpg/600px-Amaranthus_tricolor.jpg',
  'Radish': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Radish_333112224.jpg/600px-Radish_333112224.jpg',
  'Carrot': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Carrots_of_many_colors.jpg/600px-Carrots_of_many_colors.jpg',
  'Onion': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Onion_on_White.JPG/600px-Onion_on_White.JPG',
  'Garlic': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Garlic.jpg/600px-Garlic.jpg',
  'Ginger': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Ginger_Root.jpg/600px-Ginger_Root.jpg',
  'Turmeric': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/06/Turmeric_rhizome.jpg/600px-Turmeric_rhizome.jpg',
  'Capsicum': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Bell_peppers.jpg/600px-Bell_peppers.jpg',
  'Cucumber': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Cucumber_Cucumis_sativus.jpg/600px-Cucumber_Cucumis_sativus.jpg',
  'Pumpkin': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/FrenchMarketPumpkinsB.jpg/600px-FrenchMarketPumpkinsB.jpg',
  'Sweet Potato': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Sweet_potato.jpg/600px-Sweet_potato.jpg',
  'Marigold': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Tagetes_erecta_10.JPG/600px-Tagetes_erecta_10.JPG',
  'Rose': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Rosa_rubiginosa_1.jpg/600px-Rosa_rubiginosa_1.jpg',
  'Hibiscus': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Hibiscus_rosa-sinensis_1.jpg/600px-Hibiscus_rosa-sinensis_1.jpg',
  'Jasmine': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Jasminum_sambac.jpg/600px-Jasminum_sambac.jpg',
  'Aloe Vera': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Aloe_vera_flower_inset.png/600px-Aloe_vera_flower_inset.png',
  'Snake Plant': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sansevieria_trifasciata.jpg/600px-Sansevieria_trifasciata.jpg',
  'Money Plant': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Epipremnum_aureum_1.jpg/600px-Epipremnum_aureum_1.jpg',
  'Neem': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Azadirachta_indica.jpg/600px-Azadirachta_indica.jpg',
  'Sunflower': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Sunflower_sky_backdrop.jpg/600px-Sunflower_sky_backdrop.jpg',
  'Papaya': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Carica_papaya_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-029.jpg/600px-Carica_papaya_-_K%C3%B6hler%E2%80%93s_Medizinal-Pflanzen-029.jpg', // this one looks like an illustration but we'll try to fetch a better one
};

async function main() {
  const filePath = './src/data/plantsData.js';

  for (let plant of plantsData) {
    console.log(`Processing image for ${plant.name}...`);
    
    // Check if it's an override or loremflickr/bad image
    const isBadImage = !plant.image || plant.image.includes('loremflickr') || plant.image.includes('K%C3%B6hler%E2%80%93s_Medizinal') || plant.image.includes('Illustration_');
    
    if (isBadImage) {
      if (overrides[plant.name]) {
         plant.image = overrides[plant.name];
         console.log(`Using override for ${plant.name}: ${plant.image}`);
      } else {
         let imgUrl = await fetchWikiImage(plant.name);
         if (!imgUrl) {
            imgUrl = await fetchWikiImage(plant.sc); 
         }
         if (imgUrl && !imgUrl.includes('K%C3%B6hler%E2%80%93s_Medizinal') && !imgUrl.includes('Illustration_')) {
            plant.image = imgUrl;
            console.log(`Found: ${imgUrl}`);
         } else {
            console.log(`No good image found for ${plant.name}`);
            plant.image = ''; // Clear it so it falls back to emoji instead of wrong image
         }
      }
      await delay(500); // 500ms delay to prevent rate limits
    }
  }

  const newContent = `// Auto-generated from user JSON\nexport const plantsData = ${JSON.stringify(plantsData, null, 2)};\n`;
  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log("Updated plantsData.js successfully!");
}

main();
