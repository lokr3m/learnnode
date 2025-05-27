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

const baseUrl = 'https://www.gocomics.com/garfield/';
const comics = [];
let currentUrl = baseUrl + new Date().toISOString().split('T')[0];

for(let i = 0; i < 10; i++) {
    const cacheName = md5(currentUrl);
    
    let data = cacheGet(cacheName);
    if(!data) {
        await sleep(1500);
        console.log('!!!!! LIVE DATA - Garfield', currentUrl);
        try {
            let res = await axios.get(currentUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            data = res.data;
            cacheSet(cacheName, data);
        } catch (error) {
            console.error(`Error fetching Garfield at ${currentUrl}:`, error.message);
            break;
        }
    }
    
    try {
        const $ = cheerio.load(data);
        
        // Extract comic details
        const imgUrl = $('.item-comic-image img').attr('src');
        const title = 'Garfield';
        const date = $('.item-comic-date').text().trim();
        
        const prevLink = $('.nav-previous a').attr('href');
        if (prevLink) {
            currentUrl = 'https://www.gocomics.com' + prevLink;
        } else {
            console.log('No previous link found, stopping');
            break;
        }
        
        comics.push({
            date,
            title,
            imgUrl,
            sourceUrl: currentUrl
        });
        
        console.log(`[Garfield] ${date}`);
        console.log(`  Image: ${imgUrl}`);
    } catch (error) {
        console.error(`Error parsing Garfield at ${currentUrl}:`, error.message);
        break;
    }
}

fs.writeFileSync('garfield_comics.json', JSON.stringify(comics, null, 2));
console.log(`Saved ${comics.length} Garfield comics to garfield_comics.json`);