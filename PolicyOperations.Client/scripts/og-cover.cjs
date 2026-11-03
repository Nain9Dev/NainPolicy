/*
 * Renders the social preview card (Open Graph, 1200 x 630) to public/og-cover.png from the same
 * tokens, fonts and copy as the client. Usage: `npm run build:og`. Needs Playwright with Chromium
 * available to Node (not a dependency of this package). Re-run it whenever the hero copy changes.
 */
const { chromium } = require('playwright');
const path = require('path');
const { pathToFileURL } = require('url');

const fonts = pathToFileURL(path.resolve(__dirname, '../public/fonts/')).href;
const output = path.resolve(__dirname, '../public/og-cover.png');

const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8">
<style>
  @font-face { font-family: 'Urbanist'; font-weight: 500 900; src: url('${fonts}urbanist-latin.woff2') format('woff2'); }
  @font-face { font-family: 'IBM Plex Mono'; font-weight: 500; src: url('${fonts}plex-mono-500-latin.woff2') format('woff2'); }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body {
    background-color: #060d1a; color: #f7f9fc; font-family: 'Urbanist', system-ui, sans-serif;
    background-image:
      linear-gradient(to right, #1b3b6f 1px, transparent 1px), linear-gradient(to bottom, #1b3b6f 1px, transparent 1px),
      linear-gradient(to right, #0f2243 1px, transparent 1px), linear-gradient(to bottom, #0f2243 1px, transparent 1px);
    background-size: 200px 200px, 200px 200px, 40px 40px, 40px 40px; background-position: -1px -1px;
    padding: 56px 64px; display: flex; flex-direction: column; justify-content: space-between;
  }
  .brand { display: flex; align-items: center; gap: 18px; }
  .brand svg { width: 56px; height: 56px; }
  .brand .name { font-weight: 800; font-size: 34px; letter-spacing: -0.01em; }
  .brand .eyebrow { font-family: 'IBM Plex Mono', monospace; font-size: 15px; letter-spacing: 0.14em; text-transform: uppercase; color: #80ff00; margin-top: 4px; }
  h1 { font-weight: 900; font-size: 74px; line-height: 1.04; letter-spacing: -0.015em; max-width: 1000px; }
  .lede { font-size: 27px; line-height: 1.35; color: #94a3b8; max-width: 980px; margin-top: 22px; }
  .lede b { color: #f7f9fc; font-weight: 700; }
  .foot { display: flex; align-items: flex-end; justify-content: space-between; }
  .chips { display: flex; gap: 12px; }
  .chip { font-family: 'IBM Plex Mono', monospace; font-size: 15px; white-space: nowrap; padding: 12px 16px; border: 1px solid #1b3b6f; background: #0a1628; border-radius: 4px; display: flex; align-items: center; gap: 10px; }
  .chip i { width: 10px; height: 10px; background: #80ff00; display: inline-block; }
  .url { font-family: 'IBM Plex Mono', monospace; font-size: 20px; color: #38bdf8; padding: 12px 18px; border: 1px solid #38bdf8; border-radius: 4px; box-shadow: 6px 6px 0 #ff001f; background: #0a1628; }
  .flow { position: absolute; right: 64px; top: 56px; display: flex; align-items: center; gap: 0; }
  .node { font-family: 'IBM Plex Mono', monospace; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: #94a3b8; border: 1px solid #1b3b6f; background: #0a1628; padding: 10px 12px; border-radius: 4px; }
  .node.lit { color: #f7f9fc; border-color: #80ff00; box-shadow: 0 0 18px rgba(128,255,0,.18); }
  .wire { width: 34px; height: 2px; background: #80ff00; position: relative; }
  .wire::after { content: ''; position: absolute; right: -1px; top: -4px; width: 10px; height: 10px; background: #80ff00; border-radius: 50%; }
</style></head>
<body>
  <div class="brand">
    <svg viewBox="0 0 440 440" aria-hidden="true">
      <defs><mask id="cut"><rect width="440" height="440" fill="white"/><polygon points="60,60 160,60 340,340 240,340" fill="none" stroke="black" stroke-width="24"/></mask></defs>
      <g mask="url(#cut)"><rect x="60" y="60" width="100" height="280" fill="#38BDF8" rx="8"/><rect x="240" y="60" width="100" height="280" fill="#38BDF8" rx="8"/></g>
      <polygon points="60,60 160,60 340,340 240,340" fill="#80FF00"/>
    </svg>
    <div><div class="name">NainPolicy</div><div class="eyebrow">Operaciones de pólizas · .NET 10 · SQL Server</div></div>
  </div>
  <div class="flow">
    <div class="node lit">API</div><div class="wire"></div><div class="node lit">Aplicación</div><div class="wire"></div><div class="node lit">Dominio</div><div class="wire"></div><div class="node lit">SQL Server</div>
  </div>
  <div>
    <h1>Cada cambio de póliza, protegido y registrado</h1>
    <p class="lede">Sin sobrescrituras perdidas. Cada cambio anotado: <b>quién, cuándo, por qué</b>. Los datos de cada correduría, aislados. Pruébalo en un minuto, <b>sin registro</b>.</p>
  </div>
  <div class="foot">
    <div class="chips">
      <span class="chip"><i></i>En vivo sobre Azure SQL</span>
      <span class="chip"><i></i>Tests contra SQL Server real</span>
      <span class="chip"><i></i>Código abierto MIT</span>
    </div>
    <span class="url">policy.naindev.com</span>
  </div>
</body></html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: output, type: 'png' });
  await browser.close();
  console.log(`written ${output}`);
})();
