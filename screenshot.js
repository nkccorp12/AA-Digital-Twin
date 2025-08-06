import puppeteer from 'puppeteer';

async function takeScreenshot() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    await page.goto('http://localhost:5173', { 
      waitUntil: 'networkidle0',
      timeout: 15000 
    });
    
    // Wait for the graph to load
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: 'digital-twin-screenshot.png',
      fullPage: false
    });
    
    console.log('Screenshot taken: digital-twin-screenshot.png');
  } catch (error) {
    console.error('Error taking screenshot:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshot();