import assert from 'node:assert/strict';
import { readFile, stat, readdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const html = await readFile('dist/index.html', 'utf8');
const content = JSON.parse(await readFile('src/content.json', 'utf8'));
assert.equal(content.projects.length, 5, 'Keep the five agreed projects');
assert.equal(content.jobs.length, 5, 'Keep the five agreed jobs');
assert.equal((html.match(/class="project"/g) || []).length, 5);
assert.equal((html.match(/class="job"/g) || []).length, 5);
assert.ok(!html.includes('Caspeco platform scale'), 'Caspeco uses normal prose');
assert.ok(!html.includes('<video'), 'Do not publish an unfinished video');
assert.ok(!/href="(?:#|)"/.test(html), 'Links must have destinations');
const images = [...new Set([...html.matchAll(/data-image="([^"]+)"/g)].map(m => m[1]))];
assert.equal(images.length, 7, 'Each deliverable keeps its own preview');
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
console.log(`Passed: 5 projects, 5 jobs, 7 optimized previews. HTML ${gzipSync(html).length}B gzip; JS ${jsBytes}B gzip.`);
