const SAFETY = ["perilous", "dangerous", "unsafe", "safe"]
import {biomesData} from '../../azgaar/main.js';
const biomeGroup = (biome)=>biome.includes('desert') ? 'Desert' : biome.includes('forest') ? "Forest" : ['Taiga', 'Tundra', 'Glacier'].includes(biome) ? 'Cold' : ['Savanna', 'Grassland'].includes(biome) ? "Plains" : biome
const BASETROUBLE = 'Beast,Aberration,Dragon,Feral Hives,Outsiders,Artificial,Marauders,Daemon,MiscTrouble/10,22,12,8,8,8,16,10,6'

/*


  Region Class 


*/

class PlaneRegion {
  constructor(plate, data) {
    this.plate = plate
    this.i = data.i
    this.d = data
    this.name = data.fullName || ""
    this._show = []
  }
  set show(what) {
    let i = this._show.indexOf(what)
    i > -1 ? this._show.splice(i, 1) : this._show.push(what)
  }
  get svg() {
    return SVG(`#${this.what}_${this.i}`)
  }
}

class Cell extends PlaneRegion {
  constructor(plate, data, h) {
    super(plate, data);
    this.what = "cells"

    this.area = data.area
    this.p = data.p
    this.population = data.pop
    this._safety = data.safety
    this.safety = SAFETY[data.safety]
    this.biome = biomesData.name[data.biome]

    //history
    this.h = h
  }

  get ruin() {
    return this.h.burg == 0 ? null : this.plate.ruins[this.h.burg]
  }

  get feature() {
    return this.d.feature == 0 ? null : this.plate.features[this.d.feature]
  }

  get closestOddity() {
    if (this.feature && this.feature.specifics && this.feature.specifics.includes("Oddity")) {
      return [0, this.feature]
    }
    let d = Infinity
      , cell = null;
    let oddity = this.plate.featuresByType.remnant.filter(f=>f.specifics.includes("Oddity"))
    //filter remnant and find dinstance
    oddity.forEach(f=>{
      let p = this.plate.data.cells.p[f.cell]
      let _d = this.p.map((v,i)=>(v - p[i]) ** 2).reduce((sum,v)=>sum + v, 0)
      if (_d < d) {
        d = _d
        cell = f.cell
      }
    }
    )
    return [Math.sqrt(d), this.plate.cells[cell].feature]
  }

  /*
    Manage encounters 
  */

  get encounter() {
    //has a feature that's an encounter 
    let feature = this.feature && this.feature.what == "encounter"
    //use local 75%, othrise returr province 
    return feature && RNG.weighted(75) ? this.feature.e.random() : this.province.encounter
  }

  get trouble() {
    let hazard = this.feature && this.feature.what == "hazard" ? this.feature : null
    let enc = this.encounters
    //50/50 hazard if exists; otherwise pick encounter 
    return chance.likely(hazard ? 50 : 0) ? hazard : enc.length > 0 ? chance.pickone(enc) : this.randomEncounter
  }

  get neighbors() {
    return this.d.c.map(id=>this.plate.cells[id])
  }

  get burg() {
    return this.d.burg != 0 ? this.plate.burgs[this.d.burg] : null
  }

  get province() {
    return this.plate.provinces[this.d.province]
  }

  get nation() {
    return this.plate.nations[this.d.state]
  }
}

class Province extends PlaneRegion {
  constructor(plate, data, h) {
    super(plate, data);
    this.what = "provinces"

    this.selected = null
    //generated data 
    this.generated = ""
  }

  //select 
  select() {
    this.nation.select(this.i)
  }

  /*
    Encounters 
  */
  get encounter () {
    let RNG = chance 
    //local trouble from nation faction 
    let local = ["evil", "chaotic"].includes(this.nation.alignment)
    let neighbors = this.neighbors
    //use local 50%, use local feature encounter, otherwise random 
    let what = RNG.weighted(["local","cell","neighbor","random"],[local?75:0,65,25,10])
    //return based on what 
    if(what=="local"){
      return this.nation.faction.e.random()
    }
    else if(what=="cell"){
      return this.contents.Encounters.length > 0 ? RNG.pickone(this.contents.Encounters).e.random() : RNG.pickone(neighbors).encounter
    }
    else if(what=="neighbor"){
      return RNG.pickone(neighbors).encounter
    }
    else{
      return new this.plate.app.gen.Encounter({what:RNG.weightedString(BASETROUBLE)}).random()
    }
  }

  //random trouble generation 
  get trouble() {
    return 
    chance.pickone(this.cells).encounter()
    //check for coastal province 
    let isCoastal = this.cells.map(c=>c.d.harbor).reduce((sum,v)=>sum + v, 0) > 0
    //pull local trouble and encounters from neighbors
    let {Encounters, Hazards} = this.contents
    let nEncounter = this.neighbors.map(n=>n.contents.Encounters).flat().filter(e=>(e.e.tags.includes("aquatic") && isCoastal) || !e.e.tags.includes("aquatic"))
    //are locals a problem ? 
    let locals = ["evil", "chaotic"].includes(this.nation.alignment) ? [{
      text: "Local Patrol"
    }] : null
    //pull trouble from local 90% of the time 
    let useN = this.selected ? 0 : 1
    let _T = chance.weighted([locals, Encounters.concat(Hazards), nEncounter], (locals ? [5, 4, useN] : [0, 9, useN]))
    let T = chance.pickone(_T.length == 0 ? nEncounter : _T)
    console.log(T)
    return T
  }

  //get information for display 
  get area() {
    return this.cells.reduce((sum,c)=>sum + c.area, 0)
  }
  get cells() {
    return this.plate.cells.filter(c=>c.d.province == this.i)
  }
  get burgs() {
    return this.cells.filter(c=>c.burg).map(c=>c.burg)
  }
  get portals() {
    return this.plate.portals.filter(p=>p.cell.d.province == this.i)
  }
  get ruins() {
    return this.cells.filter(c=>c.ruin).map(c=>c.ruin)
  }
  get features() {
    return this.plate.features.filter(f=>f.province == this.i)
  }
  get capital() {
    return this.d.burg == 0 ? null : this.plate.burgs[this.d.burg]
  }
  get nation() {
    return this.plate.nations[this.d.state]
  }
  get neighbors() {
    return this.d.neighbors.filter(id=>id != 0).map(id=>this.plate.provinces[id])
  }
  get faction() {
    return this.plate.originPlate ? this.nation.faction : this.portals[0].settlement
  }
  get codes() {
    let C = this.contents
    let symbols = {
      Resources: "💎",
      "Ancient Ruins": "♜",
      Encounters: "⚔",
      Hazards: "⚠",
      Oddity: "☣",
    }
    let _has = Object.keys(symbols).filter(s=>C[s].length > 0)
    return _has.map(s=>symbols[s])
  }
  get contents() {
    let allF = this.features

    return {
      Neighbors: this.neighbors.sort((a,b)=>a.name.localeCompare(b.name)),
      Settlements: this.burgs.sort((a,b)=>a.name.localeCompare(b.name)),
      Outposts: allF.filter(f=>f.text.includes("Outpost")),
      Resources: allF.filter(f=>f.text.includes("Resource")),
      "Ancient Ruins": this.ruins,
      Remnants: allF.filter(f=>f.what == "remnant" && f.specifics.includes("Remnants")),
      Ruins: allF.filter(f=>f.text.includes("Ruin")),
      Encounters: allF.filter(f=>f.what == "encounter"),
      Hazards: allF.filter(f=>f.text.includes("Hazard")),
      Oddity: allF.filter(f=>f.text.includes("Oddity")),
    }
  }
  get short () {
    return `${this.name}${this.codes}`
  }
  get UI() {
    let {capital, selected, plate, portals} = this

    const select = (f)=>{
      this.selected = f
      let i = f.cell.i || f.cell
      SVG.find(".cell.selected").forEach(s=>s.removeClass("selected"))
      SVG(`#cells_` + i).addClass("selected")
    }

    const Gen = ()=>{
      this.generated = this.encounter 
    }

    let Neighbor = (n,i)=>_.html`<span class="pointer underline-hover hover-blue" onClick=${()=>n.nation.select(n.i)}>${n.name}${n.d.state != this.d.state ? ` [${n.nation.d.name}]` : ""}</span>${i == this.neighbors.length - 1 ? "" : ", "}`
    let Settlement = (s)=>_.html`<div class="pointer underline-hover hover-blue" onClick=${()=>select(s)}>${this.d.burg == s.i ? "★" : ""}${s.short}</div>`
    let Feature = (what,f)=>_.html`<div class="pointer underline-hover hover-blue" onClick=${()=>["Ancient Ruins", "Outposts", "Remnants", "Ruins", "Oddity"].includes(what) ? select(f) : null}>${f.e ? f.e.short : f.short}</div>`

    return _.html`
    <div class="mh1">
      <h3 class="${plate.originPlate ? "dn" : ""} mv1">${this.name}${this.codes}</h3>
      <div class="${plate.originPlate ? "dn" : ""}">${this.faction.id}</div>
      <div class="pointer dim b tc bg-light-green br2 mb1 pa2" onClick=${()=>Gen()}>${selected ? (selected.name || _.capitalize(selected.short)) + " " : "Province "}Random Encounter</div>
      <div class="tc ma1">${this.generated}</div>
        <div class="${portals.length == 0 ? "dn" : ""}"><b>Portal:</b> <div class="dib">${portals[0] ? Settlement(portals[0]) : ""}</div></div>
        ${Object.entries(this.contents).map(([key,data])=>_.html`
        <div class="${data.length == 0 ? "hidden" : ""}">
          <div class="b pointer underline-hover" onClick=${()=>this.show = key}>${key} [${data.length}]</div>
          <div class="${!this._show.includes(key) ? "hidden" : ""} mh1">
            ${data.map((_data,i)=>key == "Settlements" ? Settlement(_data) : key == "Neighbors" ? Neighbor(_data, i) : Feature(key, _data))}
          </div>
        </div>
        `)}
      </div>`
  }
}

class Nation extends PlaneRegion {
  constructor(plate, s) {
    super(plate, s);
    this.what = "nations"

    this.area = s.area
    
    let F = s._faction
    this._faction = F
    this.alignment = F.alignment
    this._safety = F._safety
    this.safety = F.safety

    //ui 
    this.selected = null
  }
  get attributes() {
    return Object.fromEntries(["Force", "Cunning", "Wealth"].map((t,i)=>[t, this.d.attr[i]]))
  }
  get maxAttribute() {
    return Object.entries(this.attributes).reduce((max,attr)=>{
      return attr[1] > max[1] ? attr : max
    }
    , ["", 0])[0]
  }
  get faction() {
    return this._faction ? Object.assign({},this._faction,{e:this.d.e}) : null
  }
  get features() {
    return this.plate.features.filter(f=>f.state == this.i)
  }
  get capital() {
    return this.plate.burgs[this.d.capital]
  }
  get neighbors() {
    return this.d.neighbors.map(id=>this.plate.nations[id])
  }
  get provinces() {
    return this.d.provinces.map(id=>this.plate.provinces[id])
  }
  get burgs() {
    return this.provinces.filter(p=>p.capital).map(p=>p.capital)
  }
  get portals() {
    return this.plate.portals.filter(p=>p.cell.d.state == this.i)
  }
  get contents() {
    let allF = this.features

    return {
      "Provinces": this.provinces.sort((a,b)=>a.name.localeCompare(b.name)),
      "Major Ancient Ruins": this.provinces.map(p=>p.ruins.filter(r=>r.population > 40000)).flat(),
      "Resources": allF.filter(f=>f.what == "resource"),
      "Remnants": allF.filter(f=>f.what == "remnant" && f.specifics.includes("Remnants")),
      "Encounters": allF.filter(f=>f.what == "encounter"),
      "Hazards": allF.filter(f=>f.what == "hazard"),
      "Oddity": allF.filter(f=>f.text.includes("Oddity"))
    }
  }

  select(i=-1) {
    //remove others 
    SVG.find(".selected").forEach(s=>s.removeClass("selected"))
    SVG.find(".state").forEach(s=>s.hide())

    if (i == -1) {
      this.selected = null
    } else {
      this.selected = this.provinces.find(p=>p.i == i)
      this.selected.svg.addClass('selected')
      console.log(this.selected)
    }
    //show this one 
    if (this.plate.state.factions.length > 0) {
      this.plate._show = this
      this.svg.show()
    } else {
      this.plate._show = this.selected
    }
  }

  get UI() {
    let {states} = this.plate.app.Strand
    let {name, area, capital, faction, plate, attributes, selected,contents,portals} = this
    let {alignment, safety} = faction
    let _state = faction && faction._super != 0 ? states.find(s=>s._faction==faction.id && s.i == faction._super) : null
    let si = selected ? selected.i : -1

    if(!this.provinceText){
      this.provinceText = this.provinces.map(p=>p.short).sort((a,b)=>a.localeCompare(b))
    }

    const Province = (p,i)=>si == -1 || p.i == si ? _.html`
    <div class="${p.i == si ? "bg-light-gray pa1" : ""}">
      <div class="pointer underline-hover hover-blue ${p.i == si ? "b" : ""}" onClick=${()=>this.select(p.i)}>${capital.cell.d.province == p.i ? "★" : ""}${this.provinceText[i]}</div>
      ${si == p.i ? selected.UI : ""}
    </div>` : ""

    const contentsUI = ["Provinces","Major Ancient Ruins","Resources","Oddity"].map(key => _.html`
    <div><span class="b">${key}:</span> ${contents[key].length}</div>`)
    
    return _.html`
    <div class="mb1">
      <h4 class="ma0">${plate._show&&plate._show.i == this.i ? "➢" : ""}${name}</h4>
      <div class="f6 mb1">${faction ? faction.id + ", " : ""} ${_state?_state.fullName:""}</div>
      <div class="f6 mh1">${alignment}, ${safety}, ${area} km<sup>2</sup></div>
      <div class="f6 mh1 mb1">${Object.entries(attributes).map(([attr,val])=>_.html`<span class="mr1">${attr}: ${val}</span> `)}</div>
      <div><b>Portals:</b> ${portals.map((p,i)=> _.html`<span class="pointer underline-hover">${p.short}</span>${i==2?"":", "}`)}</div>
      ${contentsUI}
    </div>`
  }
}

export {Nation,Province,Cell}
