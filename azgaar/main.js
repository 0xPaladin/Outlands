// Azgaar (azgaar.fmg@yandex.com). Minsk, 2017-2023. MIT License
// https://github.com/Azgaar/Fantasy-Map-Generator

// typed arrays max values
window.UINT8_MAX = 255;
window.UINT16_MAX = 65535;
window.UINT32_MAX = 4294967295;

import "./libs/polylabel.min.js"

import {rw, gauss, rn, rand, P, minmax, round, normalize, createTypedArray, clipPoly, getPackPolygon, generateGrid, calculateVoronoi} from "./utils/index.js"

import {heightmapTemplates} from "./config/heightmap-templates.js"

import {Biomes} from "./modules/biomes.js"
import {Names} from "./modules/names-generator.js"
import {HeightmapGenerator} from "./modules/heightmap-generator.js"
import {Rivers} from "./modules/river-generator.js"
import {Lakes} from "./modules/lakes.js"
import {Cultures} from "./modules/cultures-generator.js"
import {BurgsAndStates} from "./modules/burgs-and-states.js"
import {Religions} from "./modules/religions-generator.js"

//cross reference data for one state 
//import {data as pack} from "../src/orbital/plate.js"
//export {pack}

//ui 

export {Biomes, Names, HeightmapGenerator, Rivers, Lakes, Cultures, BurgsAndStates, Religions}

// State and options, based on Earth data
// main data variables
export let mapId = ""
  , mapHistory = []
  , winds = [225, 45, 225, 315, 135, 315]
  , temperatureEquator = 27
  , temperatureNorthPole = -30
  , temperatureSouthPole = -15
  , stateLabelsMode = "auto"
  , showBurgPreview = true
  , seed = ""
  , grid = {}
  , pack = {}
  , biomesData = Biomes.getDefault()
  , nameBases = Names.getNameBases()
  , points = 10000
  , regions = 0
  , provinces = 0
  , manors = 1000
  , religions = 0
  , power = 0
  , neutralRate = 0
  , cultures = 0
  , culture = []
  , prec = 0
  , lakeElevationLimit = 20
  , resolveDepressions = 250
  , distanceScale = 3
  , distanceUnit = "km"
  , heightUnit = "m"
  , temperatureScale = "°C"
  , year = 0
  , era = 0
  , template = ""
  , size = 0
  , latitude = 50
  , heightExponent = 2
  , villageMaxPopulation = 2000
  , populationRate = 1000
  , urbanization = 1
  , urbanDensity = 10;

let color = d3.scaleSequential(d3.interpolateSpectral);
// default color scheme
const lineGen = d3.line().curve(d3.curveBasis);
// d3 line generator with default curve interpolation

// map coordinates on globe
let mapCoordinates = {};

// randomize options if randomization is allowed (not locked or queryParam options='default')
export async function generate(params={}) {
  console.group("Generated Map " + seed);
  console.time("Generated Map");
  seed = params.seed || chance.hash()

  //reset  
  grid = {}
  pack = {}

  //set random 
  Math.random = aleaPRNG(seed);

  // 'Options' settings
  points = params.points || 10000

  //regions / peoples 
  regions = params.states != null ? params.states : gauss(18, 5, 2, 30);
  cultures = params.cultures || gauss(12, 3, 5, 30);
  religions = params.religions || gauss(6, 3, 2, 10);
  provinces = gauss(20, 10, 20, 100);
  manors = 1000;
  power = gauss(4, 2, 0, 10, 2);
  neutralRate = rn(1 + Math.random(), 1);

  //random culture
  const sets = {
    world: 10,
    european: 10,
    oriental: 2,
    english: 5,
    antique: 3,
    highFantasy: 11,
    darkFantasy: 3,
    random: 1
  };
  const cultureMax = {
    world: 32,
    european: 15,
    oriental: 13,
    english: 10,
    antique: 10,
    highFantasy: 17,
    darkFantasy: 18,
    random: 100
  }
  let _culture = rw(sets);
  culture = [_culture, cultureMax[_culture]]

  // 'Configure World' settings
  temperatureEquator = params.temperatureEquator || 27;
  temperatureNorthPole = params.temperatureNorthPole || -30;
  temperatureSouthPole = params.temperatureSouthPole || -15;
  prec = params.prec || gauss(100, 40, 5, 500);
  lakeElevationLimit = params.lakeElevationLimit || 20;

  // 'Units Editor' settings
  distanceScale = gauss(3, 1, 1, 5);

  // World settings - ERA 
  year = rand(100, 2000);
  // current year
  era = Names.getBaseShort(P(0.7) ? 1 : rand(nameBases.length)) + " Era";

  if (!params.raw) {
    //grid 
    grid = params.precreatedGraph || generateGrid(seed, points, params.w || 4900, params.h || 4900);

    //heightmaps 
    const templates = {};
    for (const key in heightmapTemplates) {
      templates[key] = heightmapTemplates[key].probability || 0;
    }
    template = params.template || rw(templates);
    //run heightmap 
    grid.cells.h = await HeightmapGenerator.generate(grid, template);
    pack = {};

    markFeatures();
    markupGridOcean();
    addLakesInDeepDepressions();
    openNearSeaLakes();

    //OceanLayers();
    defineMapSize();
    size = params.size || size;
    latitude = params.latitude || latitude;

    //coordinates based upon lat 
    calculateMapCoordinates();

    //temperature 
    calculateTemperatures();

    //precipitation
    generatePrecipitation();

    //for voronoi packing
    reGraph();

    //set veriticies for coasts 
    drawCoastline();

    Rivers.generate();
    //Lakes.defineGroup();
    Biomes.define();

    //rank cells for culture 
    rankCells();
  }
  else {
    grid = params.raw.grid
    pack = params.raw.pack
  }

  //manage culture 
  Cultures.generate();
  Cultures.expand();

  //cities   
  BurgsAndStates.generate();
  Religions.generate();
  BurgsAndStates.defineStateForms();
  BurgsAndStates.generateProvinces();
  BurgsAndStates.defineBurgFeatures();

  //rivers and lakes 
  Rivers.specify();
  Lakes.generateName();

  mapId = Names.getMapName();

  console.timeEnd("Generated Map");
  console.groupEnd("Generated Map " + seed);

  return {grid,pack}
}

// Mark features (ocean, lakes, islands) and calculate distance field
function markFeatures() {
  console.time("markFeatures");
  Math.random = aleaPRNG(seed);
  // get the same result on heightmap edit in Erase mode

  const cells = grid.cells;
  const heights = grid.cells.h;
  cells.f = new Uint16Array(cells.i.length);
  // cell feature number
  cells.t = new Int8Array(cells.i.length);
  // cell type: 1 = land coast; -1 = water near coast
  grid.features = [0];

  for (let i = 1, queue = [0]; queue[0] !== -1; i++) {
    cells.f[queue[0]] = i;
    // feature number
    const land = heights[queue[0]] >= 20;
    let border = false;
    // true if feature touches map border

    while (queue.length) {
      const q = queue.pop();
      if (cells.b[q])
        border = true;

      cells.c[q].forEach(c=>{
        const cLand = heights[c] >= 20;
        if (land === cLand && !cells.f[c]) {
          cells.f[c] = i;
          queue.push(c);
        } else if (land && !cLand) {
          cells.t[q] = 1;
          cells.t[c] = -1;
        }
      }
      );
    }
    const type = land ? "island" : border ? "ocean" : "lake";
    grid.features.push({
      i,
      land,
      border,
      type
    });

    queue[0] = cells.f.findIndex(f=>!f);
    // find unmarked cell
  }

  console.timeEnd("markFeatures");
}

function markupGridOcean() {
  console.time("markupGridOcean");
  markup(grid.cells, -2, -1, -10);
  console.timeEnd("markupGridOcean");
}

// Calculate cell-distance to coast for every cell
function markup(cells, start, increment, limit) {
  for (let t = start, count = Infinity; count > 0 && t > limit; t += increment) {
    count = 0;
    const prevT = t - increment;
    for (let i = 0; i < cells.i.length; i++) {
      if (cells.t[i] !== prevT)
        continue;

      for (const c of cells.c[i]) {
        if (cells.t[c])
          continue;
        cells.t[c] = t;
        count++;
      }
    }
  }
}

function addLakesInDeepDepressions() {
  console.time("addLakesInDeepDepressions");
  const {cells, features} = grid;
  const {c, h, b} = cells;
  const ELEVATION_LIMIT = lakeElevationLimit;
  if (ELEVATION_LIMIT === 80)
    return;

  for (const i of cells.i) {
    if (b[i] || h[i] < 20)
      continue;

    const minHeight = d3.min(c[i].map(c=>h[c]));
    if (h[i] > minHeight)
      continue;

    let deep = true;
    const threshold = h[i] + ELEVATION_LIMIT;
    const queue = [i];
    const checked = [];
    checked[i] = true;

    // check if elevated cell can potentially pour to water
    while (deep && queue.length) {
      const q = queue.pop();

      for (const n of c[q]) {
        if (checked[n])
          continue;
        if (h[n] >= threshold)
          continue;
        if (h[n] < 20) {
          deep = false;
          break;
        }

        checked[n] = true;
        queue.push(n);
      }
    }

    // if not, add a lake
    if (deep) {
      const lakeCells = [i].concat(c[i].filter(n=>h[n] === h[i]));
      addLake(lakeCells);
    }
  }

  function addLake(lakeCells) {
    const f = features.length;

    lakeCells.forEach(i=>{
      cells.h[i] = 19;
      cells.t[i] = -1;
      cells.f[i] = f;
      c[i].forEach(n=>!lakeCells.includes(n) && (cells.t[c] = 1));
    }
    );

    features.push({
      i: f,
      land: false,
      border: false,
      type: "lake"
    });
  }

  console.timeEnd("addLakesInDeepDepressions");
}

// near sea lakes usually get a lot of water inflow, most of them should break threshold and flow out to sea (see Ancylus Lake)
function openNearSeaLakes() {
  if (template === "Atoll")
    return;
  // no need for Atolls

  const cells = grid.cells;
  const features = grid.features;
  if (!features.find(f=>f.type === "lake"))
    return;
  // no lakes
  console.time("openLakes");
  const LIMIT = 22;
  // max height that can be breached by water

  for (const i of cells.i) {
    const lakeFeatureId = cells.f[i];
    if (features[lakeFeatureId].type !== "lake")
      continue;
    // not a lake

    check_neighbours: for (const c of cells.c[i]) {
      if (cells.t[c] !== 1 || cells.h[c] > LIMIT)
        continue;
      // water cannot break this

      for (const n of cells.c[c]) {
        const ocean = cells.f[n];
        if (features[ocean].type !== "ocean")
          continue;
        // not an ocean
        removeLake(c, lakeFeatureId, ocean);
        break check_neighbours;
      }
    }
  }

  function removeLake(thresholdCellId, lakeFeatureId, oceanFeatureId) {
    cells.h[thresholdCellId] = 19;
    cells.t[thresholdCellId] = -1;
    cells.f[thresholdCellId] = oceanFeatureId;
    cells.c[thresholdCellId].forEach(function(c) {
      if (cells.h[c] >= 20)
        cells.t[c] = 1;
      // mark as coastline
    });

    cells.i.forEach(i=>{
      if (cells.f[i] === lakeFeatureId)
        cells.f[i] = oceanFeatureId;
    }
    );
    features[lakeFeatureId].type = "ocean";
    // mark former lake as ocean
  }

  console.timeEnd("openLakes");
}

// define map size and position based on template and random factor
function defineMapSize() {
  const [_size,_latitude] = getSizeAndLatitude();
  size = rn(_size);
  latitude = rn(_latitude);

  function getSizeAndLatitude() {
    const part = grid.features.some(f=>f.land && f.border);
    // if land goes over map borders
    const max = part ? 80 : 100;
    // max size
    const lat = ()=>gauss(P(0.5) ? 40 : 60, 20, 25, 75);
    // latitude shift

    // heightmap template
    if (!part) {
      if (template === "Pangea")
        return [100, 50];
      if (template === "Shattered" && P(0.7))
        return [100, 50];
      if (template === "Continents" && P(0.5))
        return [100, 50];
      if (template === "Archipelago" && P(0.35))
        return [100, 50];
      if (template === "High Island" && P(0.25))
        return [100, 50];
      if (template === "Low Island" && P(0.1))
        return [100, 50];
    }

    if (template === "Pangea")
      return [gauss(70, 20, 30, max), lat()];
    if (template === "Volcano")
      return [gauss(20, 20, 10, max), lat()];
    if (template === "Mediterranean")
      return [gauss(25, 30, 15, 80), lat()];
    if (template === "Peninsula")
      return [gauss(15, 15, 5, 80), lat()];
    if (template === "Isthmus")
      return [gauss(15, 20, 3, 80), lat()];
    if (template === "Atoll")
      return [gauss(5, 10, 2, max), lat()];

    return [gauss(30, 20, 15, max), lat()];
    // Continents, Archipelago, High Island, Low Island
  }
}

// calculate map position on globe
function calculateMapCoordinates() {
  const latShift = latitude;

  const latT = rn((size / 100) * 180, 1);
  const latN = rn(90 - ((180 - latT) * latShift) / 100, 1);
  const latS = rn(latN - latT, 1);

  const lon = rn(Math.min(((grid.w / grid.h) * latT) / 2, 180));
  mapCoordinates = {
    latT,
    latN,
    latS,
    lonT: lon * 2,
    lonW: -lon,
    lonE: lon
  };
}

// temperature model, trying to follow real-world data
// based on http://www-das.uwyo.edu/~geerts/cwx/notes/chap16/Image64.gif
function calculateTemperatures() {
  console.time("calculateTemperatures");
  const cells = grid.cells;
  cells.temp = new Int8Array(cells.i.length);
  // temperature array

  //const {temperatureEquator, temperatureNorthPole, temperatureSouthPole} = options;
  const tropics = [16, -20];
  // tropics zone
  const tropicalGradient = 0.15;

  const tempNorthTropic = temperatureEquator - tropics[0] * tropicalGradient;
  const northernGradient = (tempNorthTropic - temperatureNorthPole) / (90 - tropics[0]);

  const tempSouthTropic = temperatureEquator + tropics[1] * tropicalGradient;
  const southernGradient = (tempSouthTropic - temperatureSouthPole) / (90 + tropics[1]);

  const exponent = heightExponent;

  for (let rowCellId = 0; rowCellId < cells.i.length; rowCellId += grid.cellsX) {
    const [,y] = grid.points[rowCellId];
    const rowLatitude = mapCoordinates.latN - (y / grid.h) * mapCoordinates.latT;
    // [90; -90]
    const tempSeaLevel = calculateSeaLevelTemp(rowLatitude);
    //console.info(`${rn(rowLatitude)}° sea temperature: ${rn(tempSeaLevel)}°C`);

    for (let cellId = rowCellId; cellId < rowCellId + grid.cellsX; cellId++) {
      const tempAltitudeDrop = getAltitudeTemperatureDrop(cells.h[cellId]);
      cells.temp[cellId] = minmax(tempSeaLevel - tempAltitudeDrop, -128, 127);
    }
  }

  function calculateSeaLevelTemp(latitude) {
    const isTropical = latitude <= 16 && latitude >= -20;
    if (isTropical)
      return temperatureEquator - Math.abs(latitude) * tropicalGradient;

    return latitude > 0 ? tempNorthTropic - (latitude - tropics[0]) * northernGradient : tempSouthTropic + (latitude - tropics[1]) * southernGradient;
  }

  // temperature drops by 6.5°C per 1km of altitude
  function getAltitudeTemperatureDrop(h) {
    if (h < 20)
      return 0;
    const height = Math.pow(h - 18, exponent);
    return rn((height / 1000) * 6.5);
  }

  console.timeEnd("calculateTemperatures");
}

// simplest precipitation model
function generatePrecipitation() {
  console.time("generatePrecipitation");
  const {cells, cellsX, cellsY} = grid;
  cells.prec = new Uint8Array(cells.i.length);
  // precipitation array

  const cellsNumberModifier = (points / 10000) ** 0.25;
  const precInputModifier = prec / 100;
  const modifier = cellsNumberModifier * precInputModifier;

  const westerly = [];
  const easterly = [];
  let southerly = 0;
  let northerly = 0;

  // precipitation modifier per latitude band
  // x4 = 0-5 latitude: wet through the year (rising zone)
  // x2 = 5-20 latitude: wet summer (rising zone), dry winter (sinking zone)
  // x1 = 20-30 latitude: dry all year (sinking zone)
  // x2 = 30-50 latitude: wet winter (rising zone), dry summer (sinking zone)
  // x3 = 50-60 latitude: wet all year (rising zone)
  // x2 = 60-70 latitude: wet summer (rising zone), dry winter (sinking zone)
  // x1 = 70-85 latitude: dry all year (sinking zone)
  // x0.5 = 85-90 latitude: dry all year (sinking zone)
  const latitudeModifier = [4, 2, 2, 2, 1, 1, 2, 2, 2, 2, 3, 3, 2, 2, 1, 1, 1, 0.5];
  const MAX_PASSABLE_ELEVATION = 85;

  // define wind directions based on cells latitude and prevailing winds there
  d3.range(0, cells.i.length, cellsX).forEach(function(c, i) {
    const lat = mapCoordinates.latN - (i / cellsY) * mapCoordinates.latT;
    const latBand = ((Math.abs(lat) - 1) / 5) | 0;
    const latMod = latitudeModifier[latBand];
    const windTier = (Math.abs(lat - 89) / 30) | 0;
    // 30d tiers from 0 to 5 from N to S
    const {isWest, isEast, isNorth, isSouth} = getWindDirections(windTier);

    if (isWest)
      westerly.push([c, latMod, windTier]);
    if (isEast)
      easterly.push([c + cellsX - 1, latMod, windTier]);
    if (isNorth)
      northerly++;
    if (isSouth)
      southerly++;
  });

  // distribute winds by direction
  if (westerly.length)
    passWind(westerly, 120 * modifier, 1, cellsX);
  if (easterly.length)
    passWind(easterly, 120 * modifier, -1, cellsX);

  const vertT = southerly + northerly;
  if (northerly) {
    const bandN = ((Math.abs(mapCoordinates.latN) - 1) / 5) | 0;
    const latModN = mapCoordinates.latT > 60 ? d3.mean(latitudeModifier) : latitudeModifier[bandN];
    const maxPrecN = (northerly / vertT) * 60 * modifier * latModN;
    passWind(d3.range(0, cellsX, 1), maxPrecN, cellsX, cellsY);
  }

  if (southerly) {
    const bandS = ((Math.abs(mapCoordinates.latS) - 1) / 5) | 0;
    const latModS = mapCoordinates.latT > 60 ? d3.mean(latitudeModifier) : latitudeModifier[bandS];
    const maxPrecS = (southerly / vertT) * 60 * modifier * latModS;
    passWind(d3.range(cells.i.length - cellsX, cells.i.length, 1), maxPrecS, -cellsX, cellsY);
  }

  function getWindDirections(tier) {
    const angle = winds[tier];

    const isWest = angle > 40 && angle < 140;
    const isEast = angle > 220 && angle < 320;
    const isNorth = angle > 100 && angle < 260;
    const isSouth = angle > 280 || angle < 80;

    return {
      isWest,
      isEast,
      isNorth,
      isSouth
    };
  }

  function passWind(source, maxPrec, next, steps) {
    const maxPrecInit = maxPrec;

    for (let first of source) {
      if (first[0]) {
        maxPrec = Math.min(maxPrecInit * first[1], 255);
        first = first[0];
      }

      let humidity = maxPrec - cells.h[first];
      // initial water amount
      if (humidity <= 0)
        continue;
      // if first cell in row is too elevated consider wind dry

      for (let s = 0, current = first; s < steps; s++,
      current += next) {
        if (cells.temp[current] < -5)
          continue;
        // no flux in permafrost

        if (cells.h[current] < 20) {
          // water cell
          if (cells.h[current + next] >= 20) {
            cells.prec[current + next] += Math.max(humidity / rand(10, 20), 1);
            // coastal precipitation
          } else {
            humidity = Math.min(humidity + 5 * modifier, maxPrec);
            // wind gets more humidity passing water cell
            cells.prec[current] += 5 * modifier;
            // water cells precipitation (need to correctly pour water through lakes)
          }
          continue;
        }

        // land cell
        const isPassable = cells.h[current + next] <= MAX_PASSABLE_ELEVATION;
        const precipitation = isPassable ? getPrecipitation(humidity, current, next) : humidity;
        cells.prec[current] += precipitation;
        const evaporation = precipitation > 1.5 ? 1 : 0;
        // some humidity evaporates back to the atmosphere
        humidity = isPassable ? minmax(humidity - precipitation + evaporation, 0, maxPrec) : 0;
      }
    }
  }

  function getPrecipitation(humidity, i, n) {
    const normalLoss = Math.max(humidity / (10 * modifier), 1);
    // precipitation in normal conditions
    const diff = Math.max(cells.h[i + n] - cells.h[i], 0);
    // difference in height
    const mod = (cells.h[i + n] / 70) ** 2;
    // 50 stands for hills, 70 for mountains
    return minmax(normalLoss + diff * mod, 1, humidity);
  }

  console.timeEnd("generatePrecipitation");
}

// recalculate Voronoi Graph to pack cells
function reGraph() {
  console.time("reGraph");
  const {cells: gridCells, points, features} = grid;
  const newCells = {
    p: [],
    g: [],
    h: []
  };
  // store new data
  const spacing2 = grid.spacing ** 2;

  for (const i of gridCells.i) {
    const height = gridCells.h[i];
    const type = gridCells.t[i];
    if (height < 20 && type !== -1 && type !== -2)
      continue;
    // exclude all deep ocean points
    if (type === -2 && (i % 4 === 0 || features[gridCells.f[i]].type === "lake"))
      continue;
    // exclude non-coastal lake points
    const [x,y] = points[i];

    addNewPoint(i, x, y, height);

    // add additional points for cells along coast
    if (type === 1 || type === -1) {
      if (gridCells.b[i])
        continue;
      // not for near-border cells
      gridCells.c[i].forEach(function(e) {
        if (i > e)
          return;
        if (gridCells.t[e] === type) {
          const dist2 = (y - points[e][1]) ** 2 + (x - points[e][0]) ** 2;
          if (dist2 < spacing2)
            return;
          // too close to each other
          const x1 = rn((x + points[e][0]) / 2, 1);
          const y1 = rn((y + points[e][1]) / 2, 1);
          addNewPoint(i, x1, y1, height);
        }
      });
    }
  }

  function addNewPoint(i, x, y, height) {
    newCells.p.push([x, y]);
    newCells.g.push(i);
    newCells.h.push(height);
  }

  const {cells: packCells, vertices} = calculateVoronoi(newCells.p, grid.boundary);
  pack.n = points;
  pack.vertices = vertices;
  pack.cells = packCells;
  pack.cells.p = newCells.p;
  pack.cells.g = createTypedArray({
    maxValue: grid.points.length,
    from: newCells.g
  });
  pack.cells.q = d3.quadtree(newCells.p.map(([x,y],i)=>[x, y, i]));
  pack.cells.h = createTypedArray({
    maxValue: 100,
    from: newCells.h
  });
  pack.cells.area = createTypedArray({
    maxValue: UINT16_MAX,
    length: packCells.i.length
  }).map((_,cellId)=>{
    const area = Math.abs(d3.polygonArea(getPackPolygon(cellId)));
    return Math.min(area, UINT16_MAX);
  }
  );

  console.timeEnd("reGraph");
}

// Detect and draw the coastline
function drawCoastline() {
  console.time("drawCoastline");
  reMarkFeatures();

  const cells = pack.cells
    , vertices = pack.vertices
    , n = cells.i.length
    , features = pack.features;
  const used = new Uint8Array(features.length);
  // store connected features
  const largestLand = d3.scan(features.map(f=>(f.land ? f.cells : 0)), (a,b)=>b - a);
  //const landMask = defs.select("#land");
  //const waterMask = defs.select("#water");
  lineGen.curve(d3.curveBasisClosed);

  for (const i of cells.i) {
    const startFromEdge = !i && cells.h[i] >= 20;
    if (!startFromEdge && cells.t[i] !== -1 && cells.t[i] !== 1)
      continue;
    // non-edge cell
    const f = cells.f[i];
    if (used[f])
      continue;
    // already connected
    if (features[f].type === "ocean")
      continue;
    // ocean cell

    const type = features[f].type === "lake" ? 1 : -1;
    // type value to search for
    const start = findStart(i, type);
    if (start === -1)
      continue;
    // cannot start here
    let vchain = connectVertices(start, type);
    if (features[f].type === "lake")
      relax(vchain, 1.2);
    used[f] = 1;
    let points = clipPoly(vchain.map(v=>vertices.p[v]), grid.w, grid.h, 1);
    const area = d3.polygonArea(points);
    // area with lakes/islands
    if (area > 0 && features[f].type === "lake") {
      points = points.reverse();
      vchain = vchain.reverse();
    }

    features[f].area = Math.abs(area);
    features[f].vertices = vchain;

    const path = round(lineGen(points));

    /*
    if (features[f].type === "lake") {
      landMask.append("path").attr("d", path).attr("fill", "black").attr("id", "land_" + f);
      // waterMask.append("path").attr("d", path).attr("fill", "white").attr("id", "water_"+id); // uncomment to show over lakes
      lakes.select("#freshwater").append("path").attr("d", path).attr("id", "lake_" + f).attr("data-f", f);
      // draw the lake
    } else {
      landMask.append("path").attr("d", path).attr("fill", "white").attr("id", "land_" + f);
      waterMask.append("path").attr("d", path).attr("fill", "black").attr("id", "water_" + f);
      const g = features[f].group === "lake_island" ? "lake_island" : "sea_island";
      coastline.select("#" + g).append("path").attr("d", path).attr("id", "island_" + f).attr("data-f", f);
      // draw the coastline
    }

    // draw ruler to cover the biggest land piece
    if (f === largestLand) {
      const from = points[d3.scan(points, (a,b)=>a[0] - b[0])];
      const to = points[d3.scan(points, (a,b)=>b[0] - a[0])];
      rulers.create(Ruler, [from, to]);
    }
    */
  }

  // find cell vertex to start path detection
  function findStart(i, t) {
    if (t === -1 && cells.b[i])
      return cells.v[i].find(v=>vertices.c[v].some(c=>c >= n));
    // map border cell
    const filtered = cells.c[i].filter(c=>cells.t[c] === t);
    const index = cells.c[i].indexOf(d3.min(filtered));
    return index === -1 ? index : cells.v[i][index];
  }

  // connect vertices to chain
  function connectVertices(start, t) {
    const chain = [];
    // vertices chain to form a path
    for (let i = 0, current = start; i === 0 || (current !== start && i < 50000); i++) {
      const prev = chain[chain.length - 1];
      // previous vertex in chain
      chain.push(current);
      // add current vertex to sequence
      const c = vertices.c[current];
      // cells adjacent to vertex
      const v = vertices.v[current];
      // neighboring vertices
      const c0 = c[0] >= n || cells.t[c[0]] === t;
      const c1 = c[1] >= n || cells.t[c[1]] === t;
      const c2 = c[2] >= n || cells.t[c[2]] === t;
      if (v[0] !== prev && c0 !== c1)
        current = v[0];
      else if (v[1] !== prev && c1 !== c2)
        current = v[1];
      else if (v[2] !== prev && c0 !== c2)
        current = v[2];
      if (current === chain[chain.length - 1]) {
        ERROR && console.error("Next vertex is not found");
        break;
      }
    }
    return chain;
  }

  // move vertices that are too close to already added ones
  function relax(vchain, r) {
    const p = vertices.p
      , tree = d3.quadtree();

    for (let i = 0; i < vchain.length; i++) {
      const v = vchain[i];
      let[x,y] = [p[v][0], p[v][1]];
      if (i && vchain[i + 1] && tree.find(x, y, r) !== undefined) {
        const v1 = vchain[i - 1]
          , v2 = vchain[i + 1];
        const [x1,y1] = [p[v1][0], p[v1][1]];
        const [x2,y2] = [p[v2][0], p[v2][1]];
        [x,y] = [(x1 + x2) / 2, (y1 + y2) / 2];
        p[v] = [x, y];
      }
      tree.add([x, y]);
    }
  }

  console.timeEnd("drawCoastline");
}

// Re-mark features (ocean, lakes, islands)
function reMarkFeatures() {
  console.time("reMarkFeatures");
  const cells = pack.cells;
  const features = (pack.features = [0]);

  cells.f = new Uint16Array(cells.i.length);
  // cell feature number
  cells.t = new Int8Array(cells.i.length);
  // cell type: 1 = land along coast; -1 = water along coast;
  cells.haven = cells.i.length < 65535 ? new Uint16Array(cells.i.length) : new Uint32Array(cells.i.length);
  // cell haven (opposite water cell);
  cells.harbor = new Uint8Array(cells.i.length);
  // cell harbor (number of adjacent water cells);

  if (!cells.i.length)
    return;
  // no cells -> there is nothing to do
  for (let i = 1, queue = [0]; queue[0] !== -1; i++) {
    const start = queue[0];
    // first cell
    cells.f[start] = i;
    // assign feature number
    const land = cells.h[start] >= 20;
    let border = false;
    // true if feature touches map border
    let cellNumber = 1;
    // to count cells number in a feature

    while (queue.length) {
      const q = queue.pop();
      if (cells.b[q])
        border = true;
      cells.c[q].forEach(function(e) {
        const eLand = cells.h[e] >= 20;
        if (land && !eLand) {
          cells.t[q] = 1;
          cells.t[e] = -1;
          if (!cells.haven[q])
            defineHaven(q);
        } else if (land && eLand) {
          if (!cells.t[e] && cells.t[q] === 1)
            cells.t[e] = 2;
          else if (!cells.t[q] && cells.t[e] === 1)
            cells.t[q] = 2;
        }
        if (!cells.f[e] && land === eLand) {
          queue.push(e);
          cells.f[e] = i;
          cellNumber++;
        }
      });
    }

    const type = land ? "island" : border ? "ocean" : "lake";
    let group;
    if (type === "ocean")
      group = defineOceanGroup(cellNumber);
    else if (type === "island")
      group = defineIslandGroup(start, cellNumber);
    features.push({
      i,
      land,
      border,
      type,
      cells: cellNumber,
      firstCell: start,
      group
    });
    queue[0] = cells.f.findIndex(f=>!f);
    // find unmarked cell
  }

  // markupPackLand
  markup(pack.cells, 3, 1, 0);

  function defineHaven(i) {
    const water = cells.c[i].filter(c=>cells.h[c] < 20);
    const dist2 = water.map(c=>(cells.p[i][0] - cells.p[c][0]) ** 2 + (cells.p[i][1] - cells.p[c][1]) ** 2);
    const closest = water[dist2.indexOf(Math.min.apply(Math, dist2))];

    cells.haven[i] = closest;
    cells.harbor[i] = water.length;
  }

  function defineOceanGroup(number) {
    if (number > grid.cells.i.length / 25)
      return "ocean";
    if (number > grid.cells.i.length / 100)
      return "sea";
    return "gulf";
  }

  function defineIslandGroup(cell, number) {
    if (cell && features[cells.f[cell - 1]].type === "lake")
      return "lake_island";
    if (number > grid.cells.i.length / 10)
      return "continent";
    if (number > grid.cells.i.length / 1000)
      return "island";
    return "isle";
  }

  console.timeEnd("reMarkFeatures");
}

function isWetLand(moisture, temperature, height) {
  if (moisture > 40 && temperature > -2 && height < 25)
    return true;
  //near coast
  if (moisture > 24 && temperature > -2 && height > 24 && height < 60)
    return true;
  //off coast
  return false;
}

// assess cells suitability to calculate population and rand cells for culture center and burgs placement
function rankCells() {
  console.time("rankCells");
  const {cells, features} = pack;
  cells.s = new Int16Array(cells.i.length);
  // cell suitability array
  cells.pop = new Float32Array(cells.i.length);
  // cell population array

  const flMean = d3.median(cells.fl.filter(f=>f)) || 0
    , flMax = d3.max(cells.fl) + d3.max(cells.conf);
  // to normalize flux
  const areaMean = d3.mean(cells.area);
  // to adjust population by cell area

  for (const i of cells.i) {
    if (cells.h[i] < 20)
      continue;
    // no population in water
    let s = +biomesData.habitability[cells.biome[i]];
    // base suitability derived from biome habitability
    if (!s)
      continue;
    // uninhabitable biomes has 0 suitability
    if (flMean)
      s += normalize(cells.fl[i] + cells.conf[i], flMean, flMax) * 250;
    // big rivers and confluences are valued
    s -= (cells.h[i] - 50) / 5;
    // low elevation is valued, high is not;

    if (cells.t[i] === 1) {
      if (cells.r[i])
        s += 15;
      // estuary is valued
      const feature = features[cells.f[cells.haven[i]]];
      if (feature.type === "lake") {
        if (feature.group === "freshwater")
          s += 30;
        else if (feature.group == "salt")
          s += 10;
        else if (feature.group == "frozen")
          s += 1;
        else if (feature.group == "dry")
          s -= 5;
        else if (feature.group == "sinkhole")
          s -= 5;
        else if (feature.group == "lava")
          s -= 30;
      } else {
        s += 5;
        // ocean coast is valued
        if (cells.harbor[i] === 1)
          s += 20;
        // safe sea harbor is valued
      }
    }

    cells.s[i] = s / 5;
    // general population rate
    // cell rural population is suitability adjusted by cell area
    cells.pop[i] = cells.s[i] > 0 ? (cells.s[i] * cells.area[i]) / areaMean : 0;
  }

  console.timeEnd("rankCells");
}

/*
  Display





*/

export function drawRivers(pack) {
  let draw = SVG("#map")
  let g = draw.group().addClass('rivers')
  //have to keep river paths for flipping between multiple maps
  pack._rivers = pack._rivers || []

  const {addMeandering, getRiverPath} = Rivers;
  lineGen.curve(d3.curveCatmullRom.alpha(0.1));

  const riverPaths = pack.rivers.map(({cells, points, i, widthFactor, sourceWidth})=>{
    if (!cells || cells.length < 2)
      return;

    if (points && points.length !== cells.length) {
      console.error(`River ${i} has ${cells.length} cells, but only ${points.length} points defined. Resetting points data`);
      points = undefined;
    }

    const meanderedPoints = addMeandering(cells, points);
    //pull save path if it exists 
    const path = pack._rivers[i] = pack._rivers[i] || getRiverPath(meanderedPoints, widthFactor, sourceWidth);
    g.path(path)
  }
  );
}

// draw state and province borders
export function drawBorders(pack) {
  console.time("drawBorders");

  let draw = SVG("#map")
  let g = draw.group().attr({
    id: 'borders'
  })

  const {cells, vertices} = pack;
  const n = cells.i.length;

  const sPath = [];
  const pPath = [];

  const sUsed = new Array(pack.states.length).fill("").map(_=>[]);
  const pUsed = new Array(pack.provinces.length).fill("").map(_=>[]);

  for (let i = 0; i < cells.i.length; i++) {
    if (!cells.state[i])
      continue;
    const p = cells.province[i];
    const s = cells.state[i];

    // if cell is on province border
    const provToCell = cells.c[i].find(n=>cells.state[n] === s && p > cells.province[n] && pUsed[p][n] !== cells.province[n]);

    if (provToCell) {
      const provTo = cells.province[provToCell];
      pUsed[p][provToCell] = provTo;
      const vertex = cells.v[i].find(v=>vertices.c[v].some(i=>cells.province[i] === provTo));
      const chain = connectVertices(vertex, p, cells.province, provTo, pUsed);

      if (chain.length > 1) {
        pPath.push("M" + chain.map(c=>vertices.p[c]).join(" "));
        i--;
        continue;
      }
    }

    // if cell is on state border
    const stateToCell = cells.c[i].find(n=>cells.h[n] >= 20 && s > cells.state[n] && sUsed[s][n] !== cells.state[n]);
    if (stateToCell !== undefined) {
      const stateTo = cells.state[stateToCell];
      sUsed[s][stateToCell] = stateTo;
      const vertex = cells.v[i].find(v=>vertices.c[v].some(i=>cells.h[i] >= 20 && cells.state[i] === stateTo));
      const chain = connectVertices(vertex, s, cells.state, stateTo, sUsed);

      if (chain.length > 1) {
        sPath.push("M" + chain.map(c=>vertices.p[c]).join(" "));
        i--;
        continue;
      }
    }
  }

  //state borders 
  g.path(sPath.join(" ")).addClass("border border-state")
  //province borders 
  g.path(pPath.join(" ")).addClass("border border-province")

  // connect vertices to chain
  function connectVertices(current, f, array, t, used) {
    let chain = [];
    const checkCell = c=>c >= n || array[c] !== f;
    const checkVertex = v=>vertices.c[v].some(c=>array[c] === f) && vertices.c[v].some(c=>array[c] === t && cells.h[c] >= 20);

    // find starting vertex
    for (let i = 0; i < 1000; i++) {
      if (i === 999)
        ERROR && console.error("Find starting vertex: limit is reached", current, f, t);
      const p = chain[chain.length - 2] || -1;
      // previous vertex
      const v = vertices.v[current]
        , c = vertices.c[current];

      const v0 = checkCell(c[0]) !== checkCell(c[1]) && checkVertex(v[0]);
      const v1 = checkCell(c[1]) !== checkCell(c[2]) && checkVertex(v[1]);
      const v2 = checkCell(c[0]) !== checkCell(c[2]) && checkVertex(v[2]);
      if (v0 + v1 + v2 === 1)
        break;
      current = v0 && p !== v[0] ? v[0] : v1 && p !== v[1] ? v[1] : v[2];

      if (current === chain[0])
        break;
      if (current === p)
        return [];
      chain.push(current);
    }

    chain = [current];
    // vertices chain to form a path
    // find path
    for (let i = 0; i < 1000; i++) {
      if (i === 999)
        ERROR && console.error("Find path: limit is reached", current, f, t);
      const p = chain[chain.length - 2] || -1;
      // previous vertex
      const v = vertices.v[current]
        , c = vertices.c[current];
      c.filter(c=>array[c] === t).forEach(c=>(used[f][c] = t));

      const v0 = checkCell(c[0]) !== checkCell(c[1]) && checkVertex(v[0]);
      const v1 = checkCell(c[1]) !== checkCell(c[2]) && checkVertex(v[1]);
      const v2 = checkCell(c[0]) !== checkCell(c[2]) && checkVertex(v[2]);
      current = v0 && p !== v[0] ? v[0] : v1 && p !== v[1] ? v[1] : v[2];

      if (current === p)
        break;
      if (current === chain[chain.length - 1])
        break;
      if (chain.length > 1 && v0 + v1 + v2 < 2)
        break;
      chain.push(current);
      if (current === chain[0])
        break;
    }

    return chain;
  }

  console.timeEnd("drawBorders");
}

async function renderGroupCOAs(g) {
  const [group,type] = g.id === "burgEmblems" ? [pack.burgs, "burg"] : g.id === "provinceEmblems" ? [pack.provinces, "province"] : [pack.states, "state"];
  for (let use of g.children) {
    const i = +use.dataset.i;
    const id = type + "COA" + i;
    COArenderer.trigger(id, group[i].coa);
    use.setAttribute("href", "#" + id);
  }
}

export function drawStates(pack) {
  console.time("drawStates");

  var draw = SVG("#map")
  let g = draw.group().attr({
    id: 'states'
  })

  const {cells, vertices, features} = pack;
  const states = pack.states;
  const n = cells.i.length;

  const used = new Uint8Array(cells.i.length);
  const vArray = new Array(states.length);
  // store vertices array
  const body = new Array(states.length).fill("");
  // path around each state
  const gap = new Array(states.length).fill("");
  // path along water for each state to fill the gaps
  const halo = new Array(states.length).fill("");
  // path around states, but not lakes

  const getStringPoint = v=>vertices.p[v[0]].join(",");

  // define inner-state lakes to omit on border render
  const innerLakes = features.map(feature=>{
    if (feature.type !== "lake")
      return false;
    if (!feature.shoreline)
      Lakes.getShoreline(feature);

    const states = feature.shoreline.map(i=>cells.state[i]);
    return new Set(states).size > 1 ? false : true;
  }
  );

  for (const i of cells.i) {
    if (!cells.state[i] || used[i])
      continue;
    const state = cells.state[i];

    const onborder = cells.c[i].some(n=>cells.state[n] !== state);
    if (!onborder)
      continue;

    const borderWith = cells.c[i].map(c=>cells.state[c]).find(n=>n !== state);
    const vertex = cells.v[i].find(v=>vertices.c[v].some(i=>cells.state[i] === borderWith));
    const chain = connectVertices(vertex, state);

    const noInnerLakes = chain.filter(v=>v[1] !== "innerLake");
    if (noInnerLakes.length < 3)
      continue;

    // get path around the state
    if (!vArray[state])
      vArray[state] = [];
    const points = noInnerLakes.map(v=>vertices.p[v[0]]);
    vArray[state].push(points);
    body[state] += "M" + points.join("L");

    // connect path for halo
    let discontinued = true;
    halo[state] += noInnerLakes.map(v=>{
      if (v[1] === "border") {
        discontinued = true;
        return "";
      }

      const operation = discontinued ? "M" : "L";
      discontinued = false;
      return `${operation}${getStringPoint(v)}`;
    }
    ).join("");

    // connect gaps between state and water into a single path
    discontinued = true;
    gap[state] += chain.map(v=>{
      if (v[1] === "land") {
        discontinued = true;
        return "";
      }

      const operation = discontinued ? "M" : "L";
      discontinued = false;
      return `${operation}${getStringPoint(v)}`;
    }
    ).join("");
  }

  // find state visual center
  vArray.forEach((ar,i)=>{
    const sorted = ar.sort((a,b)=>b.length - a.length);
    // sort by points number
    states[i].pole = polylabel(sorted, 1.0);
    // pole of inaccessibility
  }
  );

  const bodyData = body.map((p,s)=>[p.length > 10 ? p : null, s, states[s].color]).filter(d=>d[0]);
  const gapData = gap.map((p,s)=>[p.length > 10 ? p : null, s, states[s].color]).filter(d=>d[0]);
  const haloData = halo.map((p,s)=>[p.length > 10 ? p : null, s, states[s].color]).filter(d=>d[0]);

  bodyData.map((d,i)=>{
    //basic body 
    g.path(d[0]).addClass('state').attr({
      id: `nations_${d[1]}`,
      fill: d[2],
      stroke: d[2]
    })
  }
  );
  /*
  gapData.map((d,i)=>{
    g.path(d[0]).addClass('state state-gap').attr({
      id : `state-gap${d[1]}`,
      fill:"none",
      stroke : d[2]
    })
  });
  */

  const clipString = bodyData.map(d=>`<clipPath id="state-clip${d[1]}"><use href="#state${d[1]}"/></clipPath>`).join("");
  const haloString = haloData.map(d=>`<path id="state-border${d[1]}" d="${d[0]}" clip-path="url(#state-clip${d[1]})" stroke="${d3.color(d[2]) ? d3.color(d[2]).darker().hex() : "#666666"}"/>`).join("");

  //defs.select("#statePaths").html(clipString);
  //statesHalo.html(haloString);

  // connect vertices to chain
  function connectVertices(start, state) {
    const chain = [];
    // vertices chain to form a path
    const getType = c=>{
      const borderCell = c.find(i=>cells.b[i]);
      if (borderCell)
        return "border";

      const waterCell = c.find(i=>cells.h[i] < 20);
      if (!waterCell)
        return "land";
      if (innerLakes[cells.f[waterCell]])
        return "innerLake";
      return features[cells.f[waterCell]].type;
    }
    ;

    for (let i = 0, current = start; i === 0 || (current !== start && i < 20000); i++) {
      const prev = chain.length ? chain[chain.length - 1][0] : -1;
      // previous vertex in chain

      const c = vertices.c[current];
      // cells adjacent to vertex
      chain.push([current, getType(c)]);
      // add current vertex to sequence

      c.filter(c=>cells.state[c] === state).forEach(c=>(used[c] = 1));
      const c0 = c[0] >= n || cells.state[c[0]] !== state;
      const c1 = c[1] >= n || cells.state[c[1]] !== state;
      const c2 = c[2] >= n || cells.state[c[2]] !== state;

      const v = vertices.v[current];
      // neighboring vertices

      if (v[0] !== prev && c0 !== c1)
        current = v[0];
      else if (v[1] !== prev && c1 !== c2)
        current = v[1];
      else if (v[2] !== prev && c0 !== c2)
        current = v[2];

      if (current === prev) {
        ERROR && console.error("Next vertex is not found");
        break;
      }
    }

    if (chain.length)
      chain.push(chain[0]);
    return chain;
  }

  console.timeEnd("drawStates");
}

export function drawProvinces(pack) {
  console.time("drawProvinces");

  let draw = SVG("#map")
  let g = draw.group().attr({
    id: 'provinces'
  })

  const provinces = pack.provinces;
  const {body, gap} = getProvincesVertices(pack);

  const bodyData = body.map((p,i)=>[p.length > 10 ? p : null, i, provinces[i].color]).filter(d=>d[0]);
  bodyData.forEach(d=>{
    g.path(d[0]).attr({
      id: "provinces_" + d[1],
    }).addClass("province")
  }
  )

  const gapData = gap.map((p,i)=>[p.length > 10 ? p : null, i, provinces[i].color]).filter(d=>d[0]);
  gapData.forEach(d=>{
    g.path(d[0]).attr({
      id: "province-gap." + d[1],
      fill: "none",
      stroke: d[2]
    }).addClass("province province-gap")
  }
  )

  /*  
  const labels = provs.append("g").attr("id", "provinceLabels");
  labels.style("display", `${labelsOn ? "block" : "none"}`);
  const labelData = provinces.filter(p => p.i && !p.removed && p.pole);
  labels
    .selectAll(".path")
    .data(labelData)
    .enter()
    .append("text")
    .attr("x", d => d.pole[0])
    .attr("y", d => d.pole[1])
    .attr("id", d => "provinceLabel" + d.i)
    .text(d => d.name);
    */

  console.timeEnd("drawProvinces");
}

function getProvincesVertices(pack) {
  const cells = pack.cells
    , vertices = pack.vertices
    , provinces = pack.provinces
    , n = cells.i.length;
  const used = new Uint8Array(cells.i.length);
  const vArray = new Array(provinces.length);
  // store vertices array
  const body = new Array(provinces.length).fill("");
  // store path around each province
  const gap = new Array(provinces.length).fill("");
  // store path along water for each province to fill the gaps

  for (const i of cells.i) {
    if (!cells.province[i] || used[i])
      continue;
    const p = cells.province[i];
    const onborder = cells.c[i].some(n=>cells.province[n] !== p);
    if (!onborder)
      continue;

    const borderWith = cells.c[i].map(c=>cells.province[c]).find(n=>n !== p);
    const vertex = cells.v[i].find(v=>vertices.c[v].some(i=>cells.province[i] === borderWith));
    const chain = connectVertices(vertex, p, borderWith);
    if (chain.length < 3)
      continue;
    const points = chain.map(v=>vertices.p[v[0]]);
    if (!vArray[p])
      vArray[p] = [];
    vArray[p].push(points);
    body[p] += "M" + points.join("L");
    gap[p] += "M" + vertices.p[chain[0][0]] + chain.reduce((r,v,i,d)=>!i ? r : !v[2] ? r + "L" + vertices.p[v[0]] : d[i + 1] && !d[i + 1][2] ? r + "M" + vertices.p[v[0]] : r, "");
  }

  // find province visual center
  vArray.forEach((ar,i)=>{
    const sorted = ar.sort((a,b)=>b.length - a.length);
    // sort by points number
    provinces[i].pole = polylabel(sorted, 1.0);
    // pole of inaccessibility
  }
  );

  return {
    body,
    gap
  };

  // connect vertices to chain
  function connectVertices(start, t, province) {
    const chain = [];
    // vertices chain to form a path
    let land = vertices.c[start].some(c=>cells.h[c] >= 20 && cells.province[c] !== t);
    function check(i) {
      province = cells.province[i];
      land = cells.h[i] >= 20;
    }

    for (let i = 0, current = start; i === 0 || (current !== start && i < 20000); i++) {
      const prev = chain[chain.length - 1] ? chain[chain.length - 1][0] : -1;
      // previous vertex in chain
      chain.push([current, province, land]);
      // add current vertex to sequence
      const c = vertices.c[current];
      // cells adjacent to vertex
      c.filter(c=>cells.province[c] === t).forEach(c=>(used[c] = 1));
      const c0 = c[0] >= n || cells.province[c[0]] !== t;
      const c1 = c[1] >= n || cells.province[c[1]] !== t;
      const c2 = c[2] >= n || cells.province[c[2]] !== t;
      const v = vertices.v[current];
      // neighboring vertices
      if (v[0] !== prev && c0 !== c1) {
        current = v[0];
        check(c0 ? c[0] : c[1]);
      } else if (v[1] !== prev && c1 !== c2) {
        current = v[1];
        check(c1 ? c[1] : c[2]);
      } else if (v[2] !== prev && c0 !== c2) {
        current = v[2];
        check(c2 ? c[2] : c[0]);
      }
      if (current === chain[chain.length - 1][0]) {
        ERROR && console.error("Next vertex is not found");
        break;
      }
    }
    chain.push([start, province, land]);
    // add starting vertex to sequence to close the path
    return chain;
  }
}
