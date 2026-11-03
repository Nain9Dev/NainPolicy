/*
 * Accessibility audit of the built client with axe-core (WCAG 2.x A/AA and best practices).
 * Usage: npm run build && npx vite preview --port 5375 & then `npm run audit:a11y`.
 * Needs Playwright with Chromium available to Node (not a dependency of this package).
 */
const { chromium } = require('playwright');
const fs = require('fs');
const axeSource = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const base = process.env.AUDIT_URL || 'http://localhost:5375';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: process.env.AUDIT_LOCALE || 'es-ES' });
  const page = await context.newPage();
  await page.route('**/*.naindev.com/**', (route) => route.abort());
  let total = 0;
  for (const tab of ['blueprint', 'lifecycle', 'concurrency', 'audit', 'resilience']) {
    await page.goto(`${base}/#${tab}`, { waitUntil: 'networkidle' }).catch(() => {});
    await page.waitForTimeout(700);
    if (tab === 'blueprint') {
      await page.locator('.hero-run').click();
      await page.waitForTimeout(6000);
    }
    await page.addScriptTag({ content: axeSource });
    const result = await page.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } }));
    const violations = result.violations;
    total += violations.length;
    console.log(`${tab}: ${violations.length} violation(s), ${result.passes.length} rule(s) passed`);
    for (const v of violations) {
      console.log(`  ${v.impact} ${v.id} (${v.nodes.length}): ${v.help}`);
      for (const n of v.nodes.slice(0, 3)) console.log(`    ${n.target.join(' ')}`);
    }
  }
  await browser.close();
  process.exit(total === 0 ? 0 : 1);
})();
