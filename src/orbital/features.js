import*as Details from "../data.js"
import {biomesData} from '../../azgaar/main.js';

const biomeGroup = (biome)=>biome.includes('desert') ? 'Desert' : biome.includes('forest') ? "Forest" : ['Taiga', 'Tundra', 'Glacier'].includes(biome) ? 'Cold' : ['Savanna', 'Grassland'].includes(biome) ? "Plains" : biome
const Essence = (RNG)=>RNG.pickone(Object.keys(Details.essence))
const Difficulty = (RNG=chance)=>RNG.weighted([0, 1, 2, 3, 4], [30, 35, 23, 10, 2])

/*
  Features 
*/
export const Features = {
  hazard(RNG, {}) {
    let hazard = ["blight:disease/magical/natural/tech", "barrier:natural/constructed/magical", "techtonic:gysers/lava-pits/volcanic/avalanche", "pitfall:chasm/crevasse/abyss/rift", "ensnaring:bog/mire/tarpit/quicksand", "trap:natural/mechancial/magical", "impairing:mist/fog/murk/gloom/miasma"]
    const site = RNG.weighted(hazard, [1, 1, 1, 2, 2, 1, 2])
    const [type,what] = site.split(":").map((w,i)=>i == 0 ? w : RNG.pickone(w.split("/")))

    let short = what + " [" + type + "]"

    //what's the save / skill 
    const Checks = {
      "blight": "Examine,Survival,Mysticism,Arcana,Medicine,Endure/1,1,2,2,2,2",
      "barrier": "Brawn,Finesse,Survival,Craft/2,1,2,2",
      "techtonic": "Detect,Survival,Dodge/2,1,3",
      "pitfall": "Survival,Examine,Finesse,Dodge/1,1,2,3",
      "ensnaring": "Brawn,Survival,Endure/2,1,2",
      "trap": "Craft,Detect,Dodge,Finesse/2,2,2,1",
      "meteorological": "Survival,Endure/1,1",
      "seasonal": "Survival,Endure/1,1",
      "impairing": "Examine,Survival,Mysticism,Arcana/2,1,1,1"
    }

    return {
      specifics: [type, what],
      short,
      text: "Hazard: " + short,
      siteType: "origin unknown",
      scale: RNG.weighted([0, 1, 2], [5, 4, 1]),
      essence: Essence(RNG),
      isKnown: true,
      check: Checks[type],
      blight: type == "blight"
    }
  },
  remnant(RNG, {}) {
    let site = RNG.weighted(["Remnants", "Oddity"],[4,1])
    let short = site
    let specifics = null
    let isKnown = RNG.pickone([true, false])
    if (site == "Oddity") {
      let matl = RNG.pickone(["metallic", "organic", "fungal", "wood", "stone", "crystalline", "images", "particles"])
      let design = RNG.pickone(["globular", "circular", "blocky", "geometric", "triangular", "asymmetric", "labryrinthine", "wave-like", "astrological", "balanced", "chaotic"])
      let odd = RNG.pickone(["bright", "garish", "concentric", "web", "network", "noisy", "volcanic", "magnetic", "repellant", "smells", "eminates emotions", "tiered"])
      short += ` [${matl}, ${design}, ${odd}]`
      specifics = [site, matl, design, odd]
    } else {
      let what = RNG.pickone(RNG.pickone(["Titanic Bones/Titanic Armor Pieces", "Capital Ship Wreck", "Battle-site", "Blasted Craters"]).split("/"))
      short = what
      specifics = [site, what]
    }

    //hazard to encounter ratio 
    let _he = 2 + RNG.sumDice("1d5")
    let he = `hazard,encounter/${_he},${10 - _he}`

    //base encounter of the landmark, will mix in any encounters of the region
    let encounter = RNG.hash()

    return {
      specifics: [site, specifics],
      short,
      text: "Remnant: " + short,
      siteType: "origin unknown",
      scale: RNG.weighted([0, 1], [6, 4]),
      difficulty: Difficulty(RNG),
      essence: Essence(RNG),
      faction: null,
      isKnown,
      he,
      encounter,
      blight: site == "Oddity",
      symbol: site == "Oddity" ? "oddity" : "tower"
    }
  },
  resource(RNG, region) {
    const site = RNG.weighted(["game/hide/fur", "timber/clay", "herb/spice/dye", "copper/tin/iron", "silver/gold/gems"], [3, 2, 2, 2, 1])
    let what = RNG.pickone(site.split("/"))
    let specifics = [site, what]

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
    let _he = 2 + RNG.sumDice("1d5")
    let he = `hazard,encounter/${_he},${10 - _he}`

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
  outpost(RNG, {}) {
    let type = RNG.pickone(RNG.pickone(["Homestead/Farm/Manor", "Tollhouse/Checkpoint", "Meeting Site/Trading Post", "Camp/Roadhouse/Inn", "Tower/Fort/Base"]).split("/"))

    return {
      specifics: type,
      short: type,
      text: "Outpost: " + type,
      scale: RNG.weighted([0, 1, 2], [4, 2, 1]),
    }
  },
  encounter (RNG = chance, opts = {}) {
    let {plate,cell} = opts
    //aways generates something outside of state inhabitants 
    const BASETROUBLE = 'Beast,Aberration,Dragon,Feral Hives,Outsiders,Artificial,Marauders,Daemon,MiscTrouble/10,22,12,8,8,8,16,10,6'
    let biome = opts.biome || biomesData.name[RNG.pickone(plate.data.cells.biome.filter(b=>b>0))]

    //ceheck for local trouble 
    let what = opts.what || RNG.weightedString(BASETROUBLE)

    //if its a beast id is 1-20 based upon the biome - limited beast variation on a plane 
    let bG = biomeGroup(biome)
    let eid = what == "Beast" ? [plate.id, bG, RNG.randBetween(1, 20)].join(".") : RNG.hash()

    let e = new plate.app.gen.Encounter({
      id: eid,
      what,
      biome: bG
    })

    return {
      text: "Encounter: " + e.short,
      get OSR() {
        return this.e.OSR
      },
      siteType: "origin unknown",
      scale: RNG.weighted([1, 2, 3], [5, 4, 1]),
      essence: e.e,
      isKnown: true,
      e
    }
  },
  generate(plane, opts={}) {
    let {id=chance.natural(), what=null, safety=0} = opts
    const RNG = new Chance(id)

    //always generate f 
    const fR = RNG.d12() + safety
    let f = fR <= 5 ? "encounter" : fR <= 8 ? "hazard" : fR <= 12 ? RNG.weightedString("ruin,remnant,outpost,resource/2,2,1,1") : "outpost"
    //use provided   
    f = what ? what : f

    //assign feature data 
    let data = this[f](RNG, opts)

    const _size = ["1d6+1", "1d8+7", "1d10+15", "1d12+25", "2d8+36"]
    //get site 
    return Object.assign(data, {
      id,
      what: f,
      size: RNG.sumDice(_size[data.scale])
    })
  }
}