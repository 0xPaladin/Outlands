import*as Details from "../data.js"

import {biomesData} from '../../azgaar/main.js';
let biomeGroup = (biome)=>biome.includes('desert') ? 'Desert' : biome.includes('forest') ? "Forest" : ['Taiga', 'Tundra', 'Glacier'].includes(biome) ? 'Cold' : ['Savanna', 'Grassland'].includes(biome) ? "Plains" : biome

/*
  Safety and Alignment 
*/
const Aligment = {
  "good": [["evil", "chaotic", "neutral", "lawful", "good"], [1, 2, 2, 2, 5]],
  "lawful": [["evil", "chaotic", "neutral", "lawful", "good"], [2, 1, 2, 5, 2]],
  "neutral": [["evil", "chaotic", "neutral", "lawful", "good"], [1, 2, 6, 2, 1]],
  "chaotic": [["evil", "chaotic", "neutral", "lawful", "good"], [2, 7, 0, 1, 2]],
  "evil": [["evil", "chaotic", "neutral", "lawful", "good"], [5, 2, 2, 2, 1]]
}
const AligmentMod = {
  "good": -3,
  "lawful": -5,
  "neutral": 0,
  "chaotic": 5,
  "evil": 3
}
const SAFETY = ["perilous", "dangerous", "unsafe", "safe"]

/*
  Climate and Precip for Plate Generation 
*/
//determine globe placement  - size,lattitude
const ClimateLocations = {
  "sub-arctic": [10, 25],
  "temperate": [10, 30],
  "sub-tropical": [10, 38],
  "tropical": [25, 50],
  "tropic-arctic": [50, 0],
  "arctic-tropic": [50, 100],
  "sub-tropic-temperate": [25, 30],
  "temperate-sub-tropic": [25, 70],
  "temperate-sub-arctic": [25, 20],
  "sub-arctic-temperate": [25, 80],
}
const Precipitation = {
  wet: [275, 325],
  rainy: [175, 225],
  standard: [75, 125],
  arid: [40, 60],
  desert: [15, 30]
}

/*
  Sub Classes for Plane regions 
*/

import {Nation,Province,Cell} from "./regions.js"

/*
  Features for generation at the cell level 
*/

import {Features} from "./features.js"

/*
  Plane Class 
  
*/

export class Plane {
  constructor(app, state) {
    this.app = app
    this.what = "Plane"

    //establish i and seed 
    this.i = state.i
    this.id = this.seed = state.seed

    this._show = null
    this.zoom = false

    this.name = state.name
    this.nations = []
    this._portals = []

    //state - object only 
    app.game.state[this.id] = state
    //active - class 
    this.app.activeState[this.id] = this
  }
  get state() {
    return this.app.game.state[this.id]
  }

  /*
    Factions 
  */
  get originPlate() {
    return this.state.home
  }
  get factions() {
    return this.originPlate ? this.state.factions : this.state.settlements
  }
  get factionGroup() {
    if (this.nations.length == 0) {
      return {};
    }

    let map = {}
    this.factions.forEach((f,i)=>{
      let nCheck = this.state.factions.length > 0 ? this.nations[i + 1] : this.portals[i].cell.province
      map[f.id] ? map[f.id].push(nCheck) : map[f.id] = [nCheck]
    }
    )
    return map
  }

  /*
    Portals 
  */
  get portals() {
    return this._portals.map((id,i)=>{
      let b = this.burgs.find(b=>b.i == id)
      b.settlement = this.originPlate ? null : this.state.settlements[i]
      return b
    }
    )
  }

  /*
    Cities
    Burgs and Ruins from history 
  */
  get burgs() {
    let plane = this
    let size = ["hamlet", "village", "burg", "town", "city"]

    return this.data.burgs.map((b,i)=>{
      let population = Math.round(b.population * 40) * 100
      let _size = Math.floor(b.population / 8)
      return {
        i,
        what: "settlements",
        d: b,
        plane,
        name: b.name,
        population,
        short: b.name + ` (${size[_size] || "city"})`,
        x: b.x,
        y: b.y,
        get cell() {
          return this.plane.cells[this.d.cell]
        },
      }
    }
    )
  }
  get ruins() {
    let plane = this
    let size = ["hamlet", "village", "burg", "town", "city", "metropolis"]

    return this.history.burgs.map((b,i)=>{
      let population = Math.round(b.population * 40) * 100
      let _size = Math.floor(b.population / 8)
      return {
        i,
        what: "ruins",
        d: b,
        plane,
        name: b.name,
        population,
        short: b.name + ` (${size[_size] || "metropolis"})`,
        x: b.x,
        y: b.y,
        get cell() {
          return this.plane.cells[this.d.cell]
        },
      }
    }
    )
  }
  /*
  Features
  */
  get features() {
    return this.data.features
  }

  /*
    Encounter generation 
  */
  encounter(RNG=chance, opts) {
    const BASEENCOUNTER = 'Alien Hives,Elves,Saurians,Humans,Independents,Celestial,Proxies,Misc/10,20,20,20,15,5,5,5'
  }

  /*
    Initialization on loading page 
  */
  async init() {
    if (this.history && this.data) {
      this.display()
      console.log(this)
      return
    }
    await Generate(this)
    return
  }

  /*
   Display 
   UI and SVG
  */
  display(zoom=false) {
    if (SVG("#map")) {
      SVG("#map").clear()
    }

    this.zoom = zoom

    let draw = SVG("#map").size(800, 800)
    let back = draw.group().attr("id", "background")
    let g = draw.group()

    let P = this
    let biomeColor = biomesData.color
    let {cells, vertices, features, burgs} = this.data
    cells.v.forEach((v,i)=>{
      // create a polygon from a hex's corner points
      let points = `${v.map(vi=>vertices.p[vi].join(",")).join(" ")}`
      const polygon = g.polygon(points).addClass('cell').attr({
        id: "cells_" + i,
        fill: biomeColor[cells.biome[i]]
      }).addClass("cell").click(function() {
        SVG.find(".selected").forEach(s=>s.removeClass("selected"))
        let d = P.cells[i]
        let pi = d.d.province
        console.log(d)
        //set show and unhide 
        if(P.state.factions.length>0){
          d.nation.select(pi)
        }
        else if (P.portals.map(pd=>pd.cell.d.province).includes(pi)){
          d.nation.select(pi)
        }
        else {
          d.nation.select(-1)
        }
        //show cell 
        this.addClass("selected")
      })
    }
    )

    //rivers 
    this.app.gen.Azgaar.drawRivers(this.data)

    //states
    this.app.gen.Azgaar.drawStates(this.data)

    //provinces
    this.app.gen.Azgaar.drawProvinces(this.data)

    //borders
    this.app.gen.Azgaar.drawBorders(this.data)

    this.nations.slice(1).forEach(s=>this._show && this._show.i == s.i ? s.svg.show() : s.svg.hide())

    //settlements 
    let bg = draw.group().attr("id", "settlements")
    burgs.slice(1).forEach((b,i)=>{
      const burg = g.circle(16).addClass(b.capital > 0 ? 'burg capital' : 'burg').data({
        i
      }).attr({
        cx: b.x,
        cy: b.y,
      }).click(function() {
        SVG.find(".selected").forEach(s=>s.removeClass("selected"))
        let d = P.cells[b.cell]
        console.log(d)
        //set show and unhide 
        if(this.state.factions.length > 0){
          d.nation.select(d.province.i)
        }
        //show cell
        SVG(`#cells_${b.cell}`).addClass("selected")
      })
    }
    )

    let box = g.bbox()
    back.rect().attr({
      width: box.width * 2,
      height: box.height * 2,
      x: -500,
      y: -500,
      fill: "#466eab"
    })

    //get what is selected and color 
    let _obj = this._show ? this._show.svg : null

    box = zoom ? _obj.bbox() : box
    let m = zoom ? 5 : 50
    SVG("#map").attr('viewBox', [box.x - m, box.y - m, box.width + m, box.height + m].join(" "))
  }
}

/*
  Generate plane data from Azgaar on first load
*/
const Generate = async(P)=>{
  let {seed, heightmap, precip, climate, factions=[], settlements} = P.state
  let RNG = new Chance(seed)

  //precipitation 
  let prec = typeof precip === "number" ? precip : RNG.randBetween(...Precipitation[precip])
  //size and latitude 
  let[size,latitude] = ClimateLocations[climate]

  let azgaar = {
    seed,
    w: 4900,
    h: 4900,
    prec,
    template: heightmap,
    size,
    latitude
  }

  //current - build terrain and people 
  let {pack, grid} = await P.app.gen.Azgaar.generate(Object.assign({
    states: factions.length > 0 ? factions.length : settlements.length
  }, azgaar))
  let data = P.data = pack

  //history
  let history = P.history = await MakeHistory(P.app.gen, pack, grid, seed, azgaar)

  let safe = P.data.cells.safety = []
  //determine safety / alignment 
  let {cells, burgs, provinces, states} = data
  let {state, burg, province, biome} = cells
  states.forEach(s=>{
    s.biomes = biomesData.name.map(_=>0)
    //culture based on faction 
    let cf = s._faction = s.i == 0 ? null : (factions[s.i - 1] || settlements[s.i - 1])
    s.e = new P.app.gen.Encounter({what:s._faction?s._faction.id:null})
    //handle gov't change
    if (cf && s.form != cf.govt[0]) {
      s.form = cf.govt[0]
      s.formName = cf.govt[1]
      s.fullName = `${s.formName} of ${s.name}`
    }
    //establish attributes 
    let r = s.diplomacy.includes("Suzerain") ? 0 : s.diplomacy.includes("Vassal") ? 2 : 1
    s.attr = RNG.shuffle([[3, 2, 1], [5, 4, 2], [7, 6, 3]][r].map(v=>RNG.bool() ? v + 1 : v))
  }
  )

  //ids of all burgs 
  let allBurgs = new Set(history.burgs.map(b=>b.cell).concat(data.burgs.map(b=>b.cell)))

  //set cells and features
  P.cells = []
  P.data.features = [0]
  cells.feature = []
  //provinces and cells 
  for (const i of cells.i) {
    let _state = states[state[i]]
    //assign biome 
    _state.biomes[biome[i]]++
    //safety 
    let baseSafe = RNG.pickone([0, 1])
    let _safe = state[i] == 0 ? baseSafe : _state._faction ? _state._faction._safety : baseSafe
    let _burg = burgs[burg[i]]
    safe[i] = _burg.i == _state.capital ? _safe + 1 : _burg.capital == 1 ? _safe : _safe - 1
    safe[i] = _.clamp(safe[i], 0, 3)
    //raw data 
    let d = Object.fromEntries(Object.keys(cells).map(key=>[key, key != "q" ? cells[key][i] : null]))
    let h = Object.fromEntries(Object.keys(history.cells).map(key=>[key, key != "q" ? history.cells[key][i] : null]))
    //features 
    cells.feature[i] = 0
    // 50/50 generate if not a burg 
    let f = !allBurgs.has(i) && RNG.likely(35) ? Features.generate(P, {
      id: [seed, i].join("."),
      safety: safe[i],
      biome: biomesData.name[biome[i]],
      plate : P,
      cell : d
    }) : 0
    if (f != 0) {
      //give it id and push to arrays 
      f.i = data.features.length
      f.cell = i
      f.province = province[i]
      f.state = state[i]
      cells.feature[i] = f.i
      data.features.push(f)
    }
   
    //define class 
    P.cells.push(new Cell(P,d,h))
  }

  //provinces and states 
  P.provinces = [0, ...provinces.slice(1).map(p=>new Province(P,p))]
  P.nations = [0, ...states.slice(1).map(s=>new Nation(P,s))]

  //portals if not evil 
  let historicPortal = history.provinces.slice(1).filter(b=>b.burg != 0).map(p=>p.burg)
  let portalNations = P.nations.slice(1).filter(n=>!['evil', 'chaotic'].includes(n.faction.alignment)).map(n=>n.provinces.filter(p=>p.d.burg != 0))
  P._portals = portalNations.length > 0 ? portalNations.map(np=>RNG.shuffle(np).slice(0, portalNations.length == 1 ? 6 : 3).map(p=>p.d.burg)).flat() : RNG.shuffle(historicPortal).slice(0, P.state.settlements.length)

  P.display()
  console.log(P)
}

//create history - don't generate terrain 
const MakeHistory = async(gen,data,grid,seed,azgaar)=>{
  //copy 
  let hpack = Object.assign({}, data)
  hpack.cells = Object.assign({}, data.cells)
  //remove what is not needed 
  let keepPack = ["cells", "features", "n", "rivers", "vertices"]
  let keepCells = ["state", "province", "burg", "religion", "culture"]
  Object.keys(hpack).forEach(key=>!keepPack.includes(key) ? delete hpack[key] : null)
  Object.keys(hpack.cells).forEach(key=>keepCells.includes(key) ? delete hpack.cells[key] : null)
  //create history 
  let {pack} = await gen.Azgaar.generate(Object.assign(azgaar, {
    seed: seed + ".history",
    raw: {
      pack: hpack,
      grid
    },
    states: 1
  }))
  //create history from specifics - leave pack alone for generating display 
  let h = {
    cells: {}
  }
  Object.keys(pack).forEach(key=>!keepPack.includes(key) ? h[key] = pack[key] : null)
  Object.keys(pack.cells).forEach(key=>keepCells.includes(key) ? h.cells[key] = pack.cells[key] : null)
  //reduce burgs by pop 
  h.burgs = h.burgs.filter(b=> b.population>15)
  //return 
  return h
}
