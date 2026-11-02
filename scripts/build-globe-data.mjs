// Generates the static map data used by the dotted globe on the landing page.
// Run once (needs dev deps installed): node scripts/build-globe-data.mjs
// Map data: Natural Earth via world-atlas (public domain).
import { geoContains } from 'd3-geo';
import { readFileSync, writeFileSync } from 'node:fs';
import { feature } from 'topojson-client';

const load = (file) => {
    const topo = JSON.parse(readFileSync(`node_modules/world-atlas/${file}`, 'utf8'));
    return feature(topo, topo.objects.land);
};
const round = (v) => Math.round(v * 100) / 100;

// Coastline outline: the light 1:110m set, coordinates rounded to keep the file small.
const outline = load('land-110m.json');
const roundCoords = (c) => (typeof c[0] === 'number' ? [round(c[0]), round(c[1])] : c.map(roundCoords));
outline.features.forEach((f) => (f.geometry.coordinates = roundCoords(f.geometry.coordinates)));
writeFileSync('public/data/land.json', JSON.stringify(outline));

// Land dots: an evenly spaced grid tested against the more detailed 1:50m set (keeps small islands like Indonesia's).
const land = load('land-50m.json');
const dots = [];
const STEP = 1.1;
for (let lat = -84; lat <= 84; lat += STEP) {
    const lonStep = STEP / Math.cos((lat * Math.PI) / 180);
    for (let lon = -180; lon < 180; lon += lonStep) {
        if (geoContains(land, [lon, lat])) dots.push(round(lon), round(lat));
    }
}
writeFileSync('public/data/land-dots.json', JSON.stringify(dots));
console.log(`${dots.length / 2} dots`);
