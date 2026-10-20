import assert from 'node:assert/strict';
import { readFile, stat, readdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const html = await readFile('dist/index.html', 'utf8');
const content = JSON.parse(await readFile('src/content.json', 'utf8'));
const companyPreviews = JSON.parse(await readFile('src/company-previews.json', 'utf8'));
assert.equal(content.projects.length, 5, 'Keep the five agreed projects');
assert.equal(content.jobs.length, 5, 'Keep the five agreed jobs');
assert.equal((html.match(/class="project"/g) || []).length, 5);
assert.equal((html.match(/class="job"/g) || []).length, 5);
assert.ok(!html.includes('Caspeco platform scale'), 'Caspeco uses normal prose');
assert.equal((html.match(/<video\b/g) || []).length, 1, 'Include the finished introduction film');
const videoTag = html.match(/<video\b[^>]*>/)?.[0] || '';
assert.ok(videoTag.includes('preload="none"') && !videoTag.includes('autoplay'), 'Load the film only when visitors choose to play');
assert.ok(videoTag.includes('width="1920"') && videoTag.includes('height="1080"'), 'Use the HD film dimensions');
assert.ok(html.includes('/video/portfolio-intro-v33-1080p.mp4'), 'Serve the crisp 1080p film');
for (const file of ['portfolio-intro-v33-1080p.mp4', 'portfolio-intro-v33-poster.webp', 'portfolio-intro-v32-en.vtt']) {
  assert.ok((await stat(`dist/video/${file}`)).size > 0, `Missing film asset: ${file}`);
}
assert.ok(!/href="(?:#|)"/.test(html), 'Links must have destinations');
const images = [...new Set([...html.matchAll(/data-image="([^"]+)"/g)].map(m => m[1]))];
assert.equal(companyPreviews.length, 5, 'Keep metadata for each company');
assert.ok(companyPreviews.every(company => company.title && company.sourceImage?.startsWith('https://') && company.file), 'Company previews must use sourced SEO titles and Open Graph images');
assert.equal(images.length, 12, 'Keep seven project and five company images');
assert.equal((html.match(/data-preview="experience-/g) || []).length, 5, 'Each job needs a company website preview');
for (const image of images) {
  const info = await stat(`dist${image}`);
  assert.ok(info.size < 200_000, `${image} is too large for a thumbnail`);
}
assert.ok(gzipSync(html).length < 12_000, 'Initial HTML exceeds 12KB gzip');
let jsBytes = [...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)]
  .reduce((bytes, match) => bytes + gzipSync(match[1]).length, 0);
for (const file of await readdir('dist/_astro')) {
  if (file.endsWith('.js')) jsBytes += gzipSync(await readFile(`dist/_astro/${file}`)).length;
}
assert.ok(jsBytes < 6000, `Client JavaScript exceeds 6KB gzip: ${jsBytes}`);
console.log(`Passed: 5 projects, 5 jobs, ${images.length} optimized images. HTML ${gzipSync(html).length}B gzip; JS ${jsBytes}B gzip.`);
