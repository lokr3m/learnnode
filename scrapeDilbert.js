import axios from "axios";
import * as cheerio from 'cheerio';
import fs from 'fs';
import md5 from "md5";

const sleep = function(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

if(!fs.existsSync('cache')){
    fs.mkdirSync('cache');
}

const cacheGet = (name) => {
    if(fs.existsSync('cache/' + name + '.html')){
        return fs.readFileSync('cache/' + name + '.html');
    } 
    return false;
}

const cacheSet = (name, value) => {
   fs.writeFileSync('cache/' + name + '.html', value);
}

const today = new Date();
const comics = [];

for(let i = 0; i < 10; i++) {
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const url = `https://dilbert.com/strip/${dateStr}`;
    const cacheName = md5(url);
    
    let data = cacheGet(cacheName);
    if(!data) {
        await sleep(2000);
        console.log('!!!!! LIVE DATA - Dilbert', dateStr);
        try {
            let res = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            data = res.data;
            cacheSet(cacheName, data);
        } catch (error) {
            console.error(`Error fetching Dilbert for ${dateStr}:`, error.message);
            today.setDate(today.getDate() - 1);
            continue;
        }
    }
    
    try {
        const $ = cheerio.load(data);
        const imgUrl = $('.img-responsive.img-comic').attr('src');
        const title = $('.comic-title-name').text().trim();
        const date = $('.comic-title-date').text().trim();
        
        comics.push({
            date,
            title,
            imgUrl,
            sourceUrl: url
        });
        
        console.log(`[Dilbert] ${date} - ${title}`);
        console.log(`  Image: ${imgUrl}`);
    } catch (error) {
        console.error(`Error parsing Dilbert for ${dateStr}:`, error.message);
    }
    today.setDate(today.getDate() - 1);
}

fs.writeFileSync('dilbert_comics.json', JSON.stringify(comics, null, 2));
console.log(`Saved ${comics.length} Dilbert comics to dilbert_comics.json`);