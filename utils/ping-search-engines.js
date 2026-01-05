/**
 * Utility script to ping search engines when the sitemap is updated
 * This can be run manually or as part of a build process
 */

const https = require('https');

const SITE_URL = 'https://maskingtech.com';
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;

// List of search engines to ping
const searchEngines = [
  {
    name: 'Google',
    url: `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`
  },
  {
    name: 'Bing',
    url: `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`
  }
];

/**
 * Ping a search engine with the sitemap URL
 * @param {Object} engine - The search engine to ping
 * @returns {Promise} - A promise that resolves when the ping is complete
 */
function pingSearchEngine(engine) {
  return new Promise((resolve, reject) => {
    console.log(`Pinging ${engine.name}...`);
    
    https.get(engine.url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`${engine.name} response: ${res.statusCode}`);
        resolve({
          engine: engine.name,
          status: res.statusCode,
          success: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    }).on('error', (err) => {
      console.error(`Error pinging ${engine.name}: ${err.message}`);
      reject(err);
    });
  });
}

/**
 * Ping all search engines
 */
async function pingAllSearchEngines() {
  console.log(`Pinging search engines with sitemap: ${SITEMAP_URL}`);
  
  try {
    const results = await Promise.all(searchEngines.map(pingSearchEngine));
    
    console.log('\nPing results:');
    results.forEach(result => {
      console.log(`- ${result.engine}: ${result.success ? 'Success' : 'Failed'} (${result.status})`);
    });
    
    console.log('\nSitemap ping process completed!');
  } catch (error) {
    console.error('Error during ping process:', error);
  }
}

// Execute if run directly
if (require.main === module) {
  pingAllSearchEngines();
}

module.exports = {
  pingAllSearchEngines
};
