
var DB = localforage.createInstance({
  name: "Areas"
});

const Difficulty = (RNG=chance)=>RNG.weighted([0, 1, 2, 3, 4], [30, 35, 23, 10, 2])

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

const Safety = (RNG=chance,{base="neutral", alignment})=>{
  //based of parent alignment
  let _alignment = RNG.weighted(...Aligment[base])
  _alignment = alignment ? alignment : _alignment
  //safety roll mod by alignment
  const sR = RNG.d12() + AligmentMod[_alignment]
  const _safety = sR <= 1 ? 3 : sR <= 3 ? 2 : sR <= 9 ? 1 : 0
  const safety = ["perilous", "dangerous", "unsafe", "safe"][_safety]

  return {
    alignment: _alignment,
    _safety,
    safety
  }
}

/*
  Terrain generation 
   "water","swamp","desert","plains","forest","hills","mountains"
*/
const TerrainTypes = {
  "waterside": ["swamp/forest", "plains", "hills", "desert/mountains"],
  "swamp": ["swamp", "waterside/forest", "plains/forest", "plains"],
  "desert": ["desert", "hills", "plains/mountains", "waterside"],
  "plains": ["plains", "forest", "waterside/hills", "swamp/desert"],
  "forest": ["forest", "plains", "hills/waterside", "swamp/mountains"],
  "hills": ["hills", "mountains", "plains/desert/forest", "waterside"],
  "mountains": ["mountains", "hills", "forest", "desert/waterside"],
}
const Biomes = {
  name: ["Marine", "Hot desert", "Cold desert", "Savanna", "Grassland", "Tropical seasonal forest", "Temperate deciduous forest", "Tropical rainforest", "Temperate rainforest", "Taiga", "Tundra", "Glacier", "Wetland"],
  habitability: [0, 4, 10, 22, 30, 50, 100, 80, 90, 12, 4, 0, 12]
}

//plains,mountains,highlands,island,forest,wetland,desert,badlands
const CLIMATECOLORS = {
  deepWater: "RGB(0, 51, 76)",
  water: "RGB(0, 102, 153)",
  shallowWater: "RGB(153, 204, 255)",
  beach: "RGB(255, 248, 153)",
  marsh: "RGB(132, 206, 148)",
  swamp: "RGB(173, 222, 165)",
  grasslands: "RGB(231, 247, 156)",
  jungle: "RGB(77, 143, 90)",
  forest: "RGB(122, 173, 67)",
  forestHeavy: "RGB(61, 86, 33)",
  forestHills: "RGB(142, 189, 82)",
  forestMountain: "RGB(135, 146, 51)",
  mountain: "RGB(178, 128, 0)",
  hills: "RGB(231, 206, 90)",
  badlands: "RGB(205, 155, 0)",
  desert: "RGB(204, 204, 0)",
}
const BASECOLOR = {
  plains: 'grasslands',
  mountains: 'mountain',
  highlands: 'hills',
  island: 'water',
  forest: 'forest',
  wetland: 'marsh',
  desert: 'desert',
  badlands: 'badlands'
}
const HEXCONTENTS = {
  plains: 'grasslands,hills,lake/7,2,1',
  mountains: 'mountain,hills,lake/4,5,1',
  highlands: 'mountain,hills,grasslands,lake/1,5,3,1',
  island: 'water,beach,grasslands,mountain/5,2,2,1',
  forest: 'forest,grasslands,forestHills,forestMountain,lake/5,1,2,1,1',
  wetland: 'marsh,swamp,jungle,lake/4,4,1,1',
  desert: 'desert,badlands,hills,mountain/4,4,1,1',
  badlands: 'badlands,hills,mountain/6,2,2'
}
const HEXICON = {
  grasslands: "grasslands/1",
  hills: "hill/1",
  forest: "forest/1",
  mountain: "mountain/1",
  forestHills: "hill/1",
  forestMountain: "mountain/1",
  jungle: "jungle/1",
  marsh: "wetland/1",
  swamp: "wetland/1",
  desert: "sand,cactus,/2,1,4",
  badlands: "cactus,mesa,/1,2,4",
  deepWater: "waves/1",
  shallowWater: "waves/1",
  water: "waves/1",
}

const CalculateBiome = (region)=>{
  let RNG = new Chance(region.id)

  //climate 
  let climate = region.climate = RNG.weightedString(region.parent.climate)

  //primary terrain 
  let tB = RNG.weightedString(region.parent.terrain)
  region.terrain = tB

  //rainfall
  let rain = RNG.weightedString(region.parent.rainfall)
  region.rainfall = rain == "standard" ? "" : rain

  //relative altitude - low, standard, high 
  let rA = region._rA = RNG.pickone([0, 1, 2])

  // base suitability derived from biome habitability
  //region.s = Biomes.habitability[Biomes.name.indexOf(region.biome)]
}

/*
  PerilousShores
*/

const PerilousShores = (region)=>{
  //alignment = ["neutral","chaotic","evil","good","lawful","perilous","safe"] 
  //terrain = ["difficult","island","archipelago","barren","bay","coast","higland","lake","land","lowland","peninsula","wetland","woodland"]
  //["civilized"]

  let RNG = new Chance(region.id)
  let seed = RNG.natural()

  //"islands", "costal", "lake", "barren", "wetland", "woodland", "lowlands","highlands","standard"
  let T = region.terrain
    , B = region.biome
    , P = region.lookup("people").map(p=>p.tags).flat();
  let base = T == "islands" ? RNG.pickone(["island", "archipelago"]) : T == "costal" ? RNG.pickone(["bay", "coast", "peninsula"]) : T == "lake" ? "lake" : "land"
  //give aquatics somehwere to live 
  base = P.includes("aquatic") && base == "land" ? "lake" : base
  //start with base terrain, alignment and safety 
  let tags = [base, region.alignment, region.safety]

  //used in terrain below 
  const LikelyPush = (P,what)=>{
    if (Likely(P, RNG))
      tags.push(what)
  }

  //add terrain tags 
  if (base == "land") {
    tags.push(T)
    if (T != "barren" && Likely(10, RNG)) {
      tags[0] = "lake"
    }
  }
  if ((B.includes("forest") || B == "Taiga") && !tags.includes("woodland")) {
    tags.push("woodland")
  }
  if (["barren", "highlands"].includes(T)) {
    LikelyPush(50, "difficult")
  }

  //check for parent plane stylings, but default to options 
  let pPS = region.parent.PS
  if (!region.opts.terrain && pPS) {
    if (pPS.base) {
      tags[0] = WeightedString(pPS.base, RNG)
    }
  }

  //count settlements
  if (region.lookup("settlement").length > 2) {
    tags.push("civilized")
  }

  //get url string 
  region.iframe = "https://watabou.github.io/perilous-shores/?seed=" + seed + "&tags=" + tags.join(",") + "&hexes=1"
}

/*
  Features 
*/
import {Encounter, Professions} from "./encounters.js"
import*as Details from "./data.js"
const Essence = (RNG)=>RNG.pickone(Object.keys(Details.essence))

const Features = {
  hazard(RNG, region) {
    let H = region.lookup("hazard")
    //TODO trap created by local creature /faction
    let hazard = ["blight:disease/magical/natural/tech", "barrier:natural/constructed/magical", "techtonic:gysers/lava-pits/volcanic", "pitfall:chasm/crevasse/abyss/rift", "ensnaring:bog/mire/tarpit/quicksand", "trap:natural/mechancial/magical", "meteorological:blizzard/thunderstorm/sandstorm", "seasonal:fire/flood/avalanche", "impairing:mist/fog/murk/gloom/miasma"]
    //const obstacle = RNG.weighted(["impenetrable:cliff/escarpment/crag/bluff", "penetrable:forest/jungle/morass", "traversable:river/ravine/crevasse/chasm/abyss"], [2, 3, 3, 3])
    const site = RNG.weighted(hazard, [1, 1, 1, 2, 2, 1, 3, 1, 1])
    const [type,what] = H.length > 1 || (H.length == 1 && RNG.bool()) ? RNG.pickone(H).specifics.slice() : site.split(":").map((w,i)=>i == 0 ? w : RNG.pickone(w.split("/")))

    let short = what + " [" + type + "]"

    //what's the save / skill 
    const Checks = {
      "blight" : "Examine,Survival,Mysticism,Arcana,Medicine,Endure/1,1,2,2,2,2",
      "barrier" : "Brawn,Finesse,Survival,Craft/2,1,2,2",
      "techtonic" : "Detect,Survival,Dodge/2,1,3",
      "pitfall" : "Survival,Examine,Finesse,Dodge/1,1,2,3",
      "ensnaring" : "Brawn,Survival,Endure/2,1,2",
      "trap" : "Craft,Detect,Dodge,Finesse/2,2,2,1",
      "meteorological" : "Survival,Endure/1,1",
      "seasonal" : "Survival,Endure/1,1",
      "impairing" : "Examine,Survival,Mysticism,Arcana/2,1,1,1"
    }

    return {
      specifics: [type, what],
      short,
      text: "Hazard: " + short,
      siteType: "origin unknown",
      scale: RNG.weighted([0, 1, 2], [5, 4, 1]),
      essence: Essence(RNG),
      isKnown: true,
      check : Checks[type],
      blight : type == "blight"
    }
  },
  wilderness(RNG, region, opts={}) {
    return {
      specifics: "wilderness",
      text: "Wilderness",
      siteType: "origin unknown",
      scale: 4,
      difficulty: null,
      essence: Essence(RNG),
      options: ["Explore"]
    }
  },
  landmark(RNG, region) {
    let Sites = {
      "Remnants": ["Titanic Bones/Titanic Armor Pieces", "Capital Ship Structure", "Battle-site", "Blasted Craters"],
      "Meeting Place": ["Tollhouse/Checkpoint", "Meeting Site/Trading Post", "Camp/Roadhouse/Inn", "Tower/Fort/Base"],
    }
    let site = RNG.pickone(["Remnants", "Meeting Place", "Oddity"])
    let short = site
    let specifics = null
    let isKnown = site == "Meeting Place" ? true : RNG.pickone([true, false])
    if (site == "Oddity") {
      let matl = RNG.pickone(["metallic", "organic", "fungal", "wood", "stone", "crystalline", "images", "particles"])
      let design = RNG.pickone(["globular", "circular", "blocky", "geometric", "triangular", "asymmetric", "labryrinthine", "wave-like", "astrological", "balanced", "chaotic"])
      let odd = RNG.pickone(["bright", "garish", "concentric", "web", "network", "noisy", "volcanic", "magnetic", "repellant", "smells", "eminates emotions", "tiered"])
      short += ` [${matl}, ${design}, ${odd}]`
      specifics = [site, matl, design, odd]
    } else {
      let what = RNG.pickone(RNG.pickone(Sites[site]).split("/"))
      short = what + ` [${short}]`
      specifics = [site, what]
    }

    //hazard to encounter ratio 
    let _he = 2+RNG.sumDice("1d5")
    let he = `hazard,encounter/${_he},${10-_he}`

    //base encounter of the landmark, will mix in any encounters of the region
    let encounter = RNG.hash()

    return {
      specifics: [site, specifics],
      short,
      text: "Landmark: " + short,
      siteType: "origin unknown",
      scale: RNG.weighted([0, 1], [6, 4]),
      difficulty: Difficulty(RNG),
      essence: Essence(RNG),
      faction : null,
      isKnown,
      he,
      encounter,
      blight : site == "Oddity",
      symbol : site == "Oddity" ? "oddity" : "tower"
    }
  },
  resource(RNG, region) {
    let R = region.lookup("resource")

    const site = RNG.weighted(["game/hide/fur", "timber/clay", "herb/spice/dye", "copper/tin/iron", "silver/gold/gems"], [3, 2, 2, 2, 1])
    let what = RNG.pickone(site.split("/"))
    let specifics = R.length > 1 || (R.length == 1 && RNG.bool()) ? RNG.pickone(R).specifics.slice() : [site, what]

    return {
      specifics,
      short: specifics[1],
      text: "Resource: " + specifics[1],
      siteType: "origin unknown",
      scale: RNG.weighted([0, 1, 2, 3], [4, 4, 2, 2]),
      difficulty: Difficulty(RNG),
      essence: Essence(RNG),
      isKnown: true
    }
  },
  ruin(RNG) {
    const type = RNG.weighted(["caves/caverns", "homestead/settlement", "prison", "hive/nest", "mine/quarry/excavation", "tomb/crypt/necropolis", "lair/den/hideout", "stronghold/fortress", "shrine/temple/sanctuary", "archive/laboratory", "origin unknown"], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3])
    const short = RNG.pickone(type.split("/"))

    //hazard to encounter ratio 
    let _he = 2+RNG.sumDice("1d5")
    let he = `hazard,encounter/${_he},${10-_he}`

    //base encounter of the landmark, will mix in any encounters of the region
    let encounter = RNG.hash()

    return {
      specifics: type,
      text: "Ruin: " + short,
      siteType: type,
      scale: RNG.weighted([0, 1, 2, 3, 4], [4, 4, 2, 1, 1]),
      difficulty: Difficulty(RNG),
      essence: Essence(RNG),
      short,
      symbol: "ruins",
      isKnown: RNG.pickone([true, false]),
      he,
      encounter
    }
  },
  encounter(RNG, region) {
    let id = RNG.hash()
    const enc = region.encounter({
      id
    })

    return {
      id,
      siteType: "origin unknown",
      scale: RNG.weighted([1, 2, 3], [5, 4, 1]),
      essence: Essence(RNG),
      difficulty: enc.rank,
      hasJobs: enc.lair == "Camp",
      encounter: enc,
      isKnown: true,
      get short() {
        return this.encounter.short
      },
      get text() {
        return `${this.encounter.lair}: ${this.encounter.short}`
      }
    }
  },
  settlement(RNG, {_safety=0, alignment="neutral", water=false}) {
    let names = ["Outpost", "Hamlet", "Village", "Keep", "Town", "City"]
    const r = RNG.d12() + _safety
    const sz = r < 3 ? 0 : r < 5 ? 1 : r < 8 ? 2 : r < 10 ? 3 : r < 13 ? 4 : 5
    const who = names[sz]

    //develop string for MFCG - use new rng 
    let MR = new Chance(RNG.seed)
    let size = [3, 7, 15, 25, 35, 45][sz]
    let mseed = MR.natural()
    //greens=1&farms=1&citadel=1&urban_castle=1&plaza=1&temple=1&walls=1&shantytown=1&gates=-1&river=1&coast=1&sea=1.8
    let dmfcg = [size, mseed].concat(Array.from({
      length: 9
    }, ()=>MR.pickone([0, 1])), [water ? 1 : 0, 0, 0])
    //create link string 
    let mids = ["size", "seed", "greens", "farms", "citadel", "urban_castle", "plaza", "temple", "walls", "shantytown", "gates", "river", "coast", "sea"]
    //https://watabou.github.io/city-generator/?size=17&seed=1153323449&greens=1&farms=1&citadel=1&urban_castle=1&plaza=1&temple=1&walls=1&shantytown=1&coast=1&river=1&gates=-1&sea=1.8
    let mfcg = "https://watabou.github.io/city-generator/?" + mids.map((mid,i)=>mid + "=" + dmfcg[i]).join("&")

    //based of parent alignment
    alignment = RNG.weighted(...Aligment[alignment])

    return {
      text: who + " [" + alignment + "]",
      siteType: "origin unknown",
      scale: sz - 1 == -1 ? 0 : sz - 1,
      short: who,
      mfcg,
      options: ["Gather Information"],
      symbol: sz == 0 ? "barn" : sz < 4 ? "village" : "castle",
      isKnown: true
    }
  }
}

/*
  Enable jobs and quests 
*/
import*as Quests from "./quests.js"

/*
  Core Class for a Region 
  Generates from options 
*/
import {Site, Area} from "./site.js"

class Region extends Area {
  constructor(app, state={}) {
    super(app, state);
    this.what = this.state.w = "Region"
    this.addClass("region")

    //state that is saved 
    //features
    this.state.f = new Map(state.f || [])
    // faction assets
    this.state.claims = state.claims || {}

    //generates all data 
    //pull data from options to be used for generation 
    let {alignment=[], children=[]} = this.state

    //establish seeded random 
    const RNG = new Chance(this.id)

    //alignment 
    this.alignment = RNG.pickone(alignment.concat(this.parent.alignment || ["neutral"]))
    //safety 
    Object.assign(this, Safety(RNG, {
      base: this.alignment
    }))

    //terrain, climate, altitude, moisture, biome
    CalculateBiome(this)
    //name 
    this._name = Names.Region(this.id, this.terrain, this.alignment).short

    //overal size of the area
    //1 hour per 3 mi hex 
    let size = RNG.bool() ? "small" : "standard"
    let nF = 2 + RNG.d4() + (size == "standard" ? RNG.d6() : 0)

    /*
      FEATURES 
      automatically generate the following
    */
    this.state.f.set(RNG.natural(), ["resource"])
    this.state.f.set(RNG.natural(), [RNG.pickone(["ruin", "landmark", "resource", "encounter"])])

    //number of features 
    //build random 
    _.fromN(nF - 2, ()=>this.state.f.set(RNG.natural(), [null]))

    //set children - adds all features / people 
    this.children = [...this.state.f.entries()].map(([key,val])=>this.genFeature(key, ...val))

    //add people for every settlement 
    let nS = this.lookup("settlement").length
    _.fromN(nS, ()=>this.state.f.set(RNG.natural(), ["people", "People"]))

    //set children again, after people - adds all features / people 
    this.children = [...this.state.f.entries()].map(([key,val])=>{
      let c = this.genFeature(key, ...val)
      c.parent = this
      return c
    }
    )

    //get number of hex 
    let _siteWhat = ["ruin", "landmark", "settlement"]
    let _sites = this.children.filter(c=>_siteWhat.includes(c.what))
    let m = 1.4 + (RNG.d6() / 10)
    let nH = Math.round(_sites.length * m)
    nH = nH < 2 ? 2 : nH

    //get hex array
    this.setHex(nH)
    this.hexTerrain = _.fromN(nH, ()=>{
      let t = RNG.weightedString(HEXCONTENTS[this.terrain])
      return t == "lake" ? RNG.pickone(["water", "deepWater", "shallowWater"]) : t
    }
    )
    this.hexIcon = this.hexTerrain.map(t=>{
      let icon = HEXICON[t] ? RNG.weightedString(HEXICON[t]) : null
      return icon != "" ? icon : null
    }
    )

    //match children to hex 
    let _h = RNG.shuffle(this.hex)
    _sites.forEach((s,i)=>{
      s.hex = _h[i]
      _h[i].site = s
    }
    )

    //set PS
    //PerilousShores(this)
  }

  /*
    Get functions for region 
  */

  get plane() {
    return this.state.plane
  }

  get planeData () {
  }

  //parent handling of plane  
  get parent() {
    return this.plane && Planes[this.plane] ? this.app.planes.find(p=>p.name == this.plane) : null
  }

  get parties() {
    return Object.values(this.app.activeState).filter(p=>p.what == "Party" && p.region && p.region.id == this.id)
  }

  get claims() {
    return this.state.claims
  }

  //lookup child 
  lookup(what) {
    let F = this.app.factions
    return what != "faction" ? this.children.filter(c=>c.what == what) : Object.keys(this.claims).map(id=>F[id])
  }

  /*
    Generate Random based upon region 
  */

  random(gen, data) {
    let app = this.app
    let {generated} = app.state

    //handle an array of data 
    data = Array.isArray(data) ? chance.pickone(data) : data
    /*
      "wilderness" : ["Random Encounter","Explore","Get a Job","Generate a NPC"],
    "settlement" : ["Explore","Get a Job","Generate a NPC"]
    */
    if (gen == "Explore") {
      //generate an explore value 
      generated.push(["Explore", this.explore(data)])
      app.setState({
        generated
      })
    } else if (gen == "Get a Job") {
      generated.push(["Job", Quests.Jobs(null, this)])
      app.setState({
        generated
      })
    } else if (gen == "Generate a NPC") {
      generated.push(["NPC", this.NPC(data)])
      app.setState({
        generated
      })
    } else if (gen == "Random Encounter") {
      let enc = this.encounter({
        useLocal: true,
        data
      })
      generated.push(["Encounter", enc])
      app.setState({
        generated
      })
    } else if (gen == "New Portal") {
      this.portal = chance
      app.refresh()
    } else if (gen == "Remove Faction") {
      delete this.claims[data.id]
      app.refresh()
    } else if (gen == "Remove People") {
      //find what was selected and delete 
      let ppl = this.lookup("people")
      ppl.forEach(d=>this.state.f.delete(d.id))
      //update children 
      this.children = [...this.state.f.entries()].map(([key,val])=>this.genFeature(key, ...val))
      app.refresh()
    } else if (gen == "Remove") {
      //find what was selected and delete 
      this.lookup(data.what).forEach(d=>this.state.f.delete(d.id))
      //update children 
      this.children = [...this.state.f.entries()].map(([key,val])=>this.genFeature(key, ...val))
      //UI 
      app.refresh()
    } else if (gen == "View Market") {
      app.updateState("dialog", ["areas", this.id, "marketUI"].join("."))
    }
  }

  /*
    Mod features of a region  
  */

  add(what, o={}) {
    let {save=false} = o
    let id = o.id ? o.id : o.RNG ? o.RNG.natural() : chance.natural()

    //["People","Resource","Landmark","Hazard","Encounter","Dungeon"]
    if (what == "Faction") {
      this.app.updateState("show", this.app.state.show + ".AddFaction")
    } else if (what == "AddFaction") {
      let F = this.app.factions[o.id].addClaim(this)
      this.app.updateState("show", this.app.state.show.split(".").slice(0, 2).join("."))
    } else {
      this.state.f.set(id, [what.toLowerCase()])
    }

    if (save) {
      this.app.game.areas.add(this.id)
    }

    //set children 
    this.children = [...this.state.f.entries()].map(([key,val])=>this.genFeature(key, ...val))

    //refresh UI 
    if (!["Faction", "AddFaction"].includes(what)) {
      this.app.refresh()
    }
  }

  rm(id) {
    this.state.f.delete(id)
    //set children 
    this.children = [...this.state.f.entries()].map(([key,val])=>this.genFeature(key, ...val))
  }

  //add a feature to the region 
  genFeature(id=chance.natural(), what=null, o={}) {
    let res = null

    if (what == "people") {
      res = this.encounter({
        id,
        what: o
      })
      res.what = "people"
    } else {
      const RNG = new Chance(id)

      //always generate f 
      const fR = RNG.d12() + this._safety
      let f = fR <= 4 ? "encounter" : fR <= 7 ? "hazard" : fR <= 11 ? RNG.weightedString("ruin,landmark,resource/3,2,1") : "settlement"
      //use provided   
      f = what ? what : f

      //assign feature data 
      let data = Features[f](RNG, this, o)

      const _size = ["1d6+1", "1d8+7", "1d10+15", "1d12+25", "2d8+36"]
      //get site 
      res = Object.assign(data, {
        id,
        what: f,
        parent: this,
        size: RNG.sumDice(_size[data.scale])
      })
    }

    return res
  }

  addSite(what) {
    let opts = {
      id: what.id,
      parent: this.id,
      scale: what.scale == 4 ? 0 : what.scale,
      type: what.siteType
    }

    //establish site 
    what.site = new Site(this.app,opts)
    what.site.addClass("feature")
    what.site.addClass(what.what)

    return
    if (data.scale == 4) {
      opts.parent = S.id
      opts.scale = null
      let n = SumDice("2d3", RNG)

      S._children = BuildArray(n, (v,j)=>{
        opts.id = RNG.hash()
        opts.text = f == "wilderness" ? data.text : null

        let s = new Site(this.app,opts)
        return s.id
      }
      )
    }
  }

  NPC(o={}) {
    let RNG = new Chance(o.id || chance.hash())
    o.trade = o.trade || "random"

    //use local encounters 
    let local = this.lookup("encounter").map(e=>e.encounter).concat(this.lookup("people"))
    let lData = local.length > 0 && Likely(85, RNG) ? RNG.pickone(local).data.slice() : null

    let npc = this.encounter(Object.assign({}, o))
    //reasign data and profession if picked from base 
    if (!o.what && lData) {
      let prof = npc.data[4]
      npc.data = lData.slice()
      npc.data[0] = o.id || RNG.seed
      npc.data[3] = o.rarity === undefined ? npc.data[3] : o.rarity
      npc.data[4] = prof
    }

    return npc
  }

  /*
    Save and Load 
  */

  save() {
    let data = {
      gen: "Region",
      opts: Object.assign({}, this.opts, {
        name: this.name
      }),
      state: this.state
    }

    DB.setItem(this.id, data)
  }

  static async load(app, id, Gen) {
    //load state 
    let {opts, state} = await DB.getItem(id)
    opts.id = id
    //if it doesn't exist create it 
    let R = app.areas[id] || new Gen(app,opts)
    Object.assign(R.state, state)
    //update feature map 
    R.state.f = new Map(state.f)
    //update children
    R.children = [...R.state.f.entries()].map(([key,val])=>R.genFeature(key, ...val))

    return R
  }

  /*
    Actions 
  */

  enter(who) {
    let towns = this.lookup("settlement").concat(this.lookup("landmark").filter(s=> s.specifics[0]=="Meeting Place"))
    //go to settlement or start in hex 0 
    let wid = towns.length > 0 ? towns[0].id : 0
    who.moveTo([this.id, wid])
    //check for any waiting triggers 
  }

  explore(where) {
    let Gen = this.app.gen
    let _where = where.what ? where.what : where.class[0]
    let diff = where.difficulty || null
    return Gen.Rewards(this, Quests.Exploration(_where, this._safety, diff))
  }

  /*
    Encounter  
  */

  encounter(o={}) {
    let RNG = new Chance(o.id || chance.hash())

    //use local encounters 
    let local = this.lookup("encounter").map(e=>e.encounter).concat(this.lookup("people"))
    if (o.useLocal && local.length > 0 && Likely(85, RNG)) {
      return RNG.pickone(local)
    }

    //pull encounter from parent plane - always Planar, Petitioner, Beast... 
    let {encounters={}} = this.parent
    let base = encounters.base ? encounters.base : "People,Beast,Monster/45,30,35"

    //base inital result on safety 
    //all encounters build a list of types of creatures 
    let what = o.what ? o.what : RNG.likely(30 + (this._safety * 10), RNG) ? "People" : RNG.weightedString(base)
    //see if encounters provides a specific rarity string 
    let str = encounters[what]

    let opts = Object.assign(o, {
      what,
      str
    })

    //set basic result
    return Encounter(opts)
  }

  /*
    SVG
  */
  display() {
    //get group to display 
    let g = SVG("#hex")
    let app = this.app

    //empty hex 
    g.find(".hex").forEach(h=>h.remove())
    g.find(".site").forEach(h=>h.remove())
    g.find(".siteIcon").forEach(h=>h.remove())
    g.find(".dText").forEach(h=>h.remove())

    let {isKnown, features} = this.view()
    //assume hex display 
    this.hex.forEach((hex,i)=>{
      let {x, y} = hex
      let sz = hex.dimensions.xRadius
      const circle = g.circle(sz * 0.75).attr({
        cx: x,
        cy: y,
        fill: CLIMATECOLORS[this.hexTerrain[i]]
      }).addClass('site').data({
        i
      }).click(function() {
        console.log(this.data('i'))
      })

      this.parties.forEach(p=>{
        if (p.hex.i == i) {
          g.circle(sz * 0.25).attr({
            cx: x,
            cy: y - (sz * 1.1) / 2,
            fill: "blue"
          }).addClass('site')
        }
      }
      )

      //icon 
      let isz = 0.75 * sz
      if (this.hexIcon[i]) {
        g.image(`./img/noun-${this.hexIcon[i]}.svg`).attr({
          x: x - isz / 2,
          y: y - isz / 2,
          width: isz,
          height: isz
        }).addClass('siteIcon')
      }

      //create outer circle
      g.circle(sz * 1.1).attr({
        cx: x,
        cy: y,
        'fill-opacity': 0,
        fill: "white",
        stroke: "gray"
      }).addClass('site')

      //feature icon 
      if (hex.site && isKnown.includes(hex.site.id)) {
        //adjust icon size and create icon 
        isz *= 0.5
        g.image(`./img/symbol-${hex.site.symbol}.svg`).attr({
          x: x - isz / 2,
          y: y + (sz * 1.1) / 2 - isz / 2,
          width: isz,
          height: isz
        }).addClass('siteIcon')
      }
    }
    )

    const box = g.bbox()
    SVG("#map").attr('viewBox', [box.x, box.y, box.width, box.height].join(" "))
  }

  /*
    UI / UX 
  */

  get marketUI() {
    return MarketUI(this)
  }

  //supports UI by pulling a list of viewable features 
  view() {
    let html = _.html
    let known = this.app.game.knowledge.get(this.id) || {}
    const isKnown = this.children.filter(c=>known[c.id] || c.isKnown).map(c=>c.id)

    //Make a format for dropdown options - optins,text,data 
    let res = []

    //always add settlement / people data 
    let sHtml = html`
    <div>Settlements: ${this.lookup("settlement").map(p=>p.short).join(", ")}</div>
    <div class="mh2">People: ${this.lookup("people").map(p=>p.short).join(", ")}</div>`
    this.lookup("settlement").length > 0 ? res.push([sHtml, this.lookup("settlement")]) : null

    //pull for display - but don't show what isn't known 
    let f = ["landmark", "ruin"]
    f.forEach(w=>{
      let feature = this.lookup(w).filter(c=>isKnown.includes(c.id))
      //isKnown.includes(c.id)
      feature.forEach(c=>res.push([c.text, [c]]))
    }
    )

    return {
      isKnown,
      features: res
    }
  }
  UI() {
    let html = _.html
    let {activeFactions, game} = this.app
    let {generated, show, toGenerate} = this.app.state
    let {isKnown, features} = this.view()

    let mode = "Explorer"
    let view = show.split(".")

    let rh = {
      resource: {},
      hazard: {}
    }
    Object.keys(rh).forEach(what=>{
      let all = this.lookup(what)
      let unique = all.reduce((u,w)=>{
        u.includes(w.short) ? null : u.push(w.short)
        return u
      }
      , []).join("; ")
      rh[what] = {
        all,
        unique
      }
    }
    )

    //splice generated objects 
    const GenSplice = (i)=>{
      generated.splice(i, 1)
      this.app.updateState("generated", generated)
    }

    const header = html`
    <div>
      <h3 class="ma0 mh1" onClick=${()=>console.log(this)}>${this.name}</h3>
      <h4 class="ma0 mh3">${this.terrain}, ${this.climate}${this.rainfall == "" ? "" : ", " + this.rainfall}, ${this.alignment}, ${this.safety}</h4>
      ${Object.entries(rh).map(([what,d])=>{
      return d.all.length == 0 ? "" : _.html`<div class="mh3">${_.capitalize(what)}s: ${d.unique}</div>`
    }
    )}
    </div>`

    //svg div 
    const svg = html`
    <svg id="map" height="600px" width="600px" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs">
      <g id="hex"></g>
    </svg>`

    const Build = (opts,data)=>html`
    <div class="dropdown-content bg-white ba bw1 pa1">
      ${opts.map(o=>html`<div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>this.random(o, data)}>${o}</div>`)}
    </div>
    `

    //handle drowdown for every features 
    const dropdown = ([text,data,opts])=>html`
    <div class="pointer dropdown f5 mv1">
      <div class="flex items-center">
        <div class="f6 white link dim dib bg-gray tc br2 pa1" style="min-width:45px;"><span class="hex-marker">⬢</span></div>
        <div class="mh1">${text}</div>
      </div>
      ${mode == "Explorer" ? "" : Build(opts, data)}
    </div>
    `

    //return final UI 
    return html`
    <div class="ma1 pa1">
      ${header}
      <div class="ma1 mh2">
        <div class="b white pointer link dim bg-green tc br2 pa1" onClick=${()=>this.app.functions.enterRegion(this,this,this.app.functions.findAlly(this))}>Create Party</div>
        ${this.parties.map(p=>_.html`${p.regionUI}`)}
      </div>
      <div class="mh2 mv2">${features.map(dropdown)}</div>
      ${generated.length > 0 ? html`<h3 class="mh2 mv0">Generated</h3>` : ""}
      ${generated.map(([what,data],i)=>html`
      <div class="mh2 flex justify-between items-center">
        <div>${what}: ${data.short}</div>
        <div class="pointer white hover-red link dim dib bg-gray tc br2 pa1" onClick=${()=>GenSplice(i)}>X</div>
      </div>`)}
    </div>
    `
  }
}

export {Area, Site, Region}
