/*
  Contains setting data : elements, magic types, etc 
*/
import*as Details from "./data.js"
import*as Setting from "./setting.js"

/*
  NPC Data 
*/
const Occupations = {
  "Commoner": ['Beggar', 'Farmer', 'Herder', 'Laborer', 'Servant', 'Driver', 'Porter', 'Guide'],
  "Merchant": ['raw materials/supplies', 'raw materials/supplies', 'general goods/outfitter', 'general goods/outfitter', 'grain/livestock', 'ale/wine/spirits', 'clothing/jewelry', 'weapons/armor', 'spices/tobacco', 'labor/slaves', 'books/scrolls', 'magic supplies/items'],
  "Diplomat": ["Envoy", "Musician", "Artist", "Merchant"],
  "Engineer": ["Smith", "Tinker", "Physician", "Herbalist"],
  "Explorer": ["Scout", "Navigator", "Hunter"],
  "Tradesman": ["Tailor", "Wright", "Baker", "Jeweler"],
  "Rogue": ["Thug", "Thief", "Con Artist", "Spy"],
  "Scholar": ["Scribe", "Scholar", "Acolyte", "Arcanist"],
  "Soldier": ["Soldier", "Archer", "Bodyguard"],
}

/*
Impoverished lifestyle, per week 5 sp
Common lifestyle, per week 20 sp, 8g mo 
Rich lifestyle, per week 200 sp, 80g mo 
*/
const ToHire = {
  "Commoner": 8,
  "Diplomat": 30,
  "Engineer": 40,
  "Explorer": 16,
  "Tradesman": 25,
  "Rogue": 20,
  "Scholar": 40,
  "Soldier": 30,
}

const Skilled = {
  //Diplomat 
  "Envoy": "Bond,Sway",
  "Musician": "Sway,Command",
  "Artist": "Sway,Focus",
  "Merchant": "Sway,Finesse",
  //Engineer
  "Smith": "Tinker,Focus",
  "Tinker": "Tinker,Study",
  "Physician": "Tinker,Notice",
  "Herbalist": "Tinker,Finesse",
  //Explorer
  "Scout": "Sneak,Notice",
  "Navigator": "Move,Notice",
  "Hunter": "Study,Shoot",
  //Tradesman 
  "Tailor": "Tinker,Finesse",
  "Wright": "Tinker,Muscle",
  "Baker": "Tinker,Study",
  "Jeweler": "Tinker,Finesse",
  //Rogue
  "Thug": "Muscle,Sneak",
  "Thief": "Finesse,Sneak",
  "Con Artist": "Sway,Finesse",
  "Spy": "Sway,Notice",
  //Scholar
  "Scribe": "Finesse,Study",
  "Scholar": "Study,Focus",
  "Acolyte": "Sway,Focus",
  "Arcanist": "Study,Focus",
  //Soldier
  "Soldier": "Muscle,Command",
  "Archer": "Shoot,Notice",
  //
  "Bodyguard": "Muscle,Move",
}

const AlternateTitles = {
  "Musician": "actor",
  "Tinker": "locksmith,architect,engineer,inventor",
  "Physician": "apothecary,alchemist",
  "Herbalist": "vinter,perfumer",
  "Scout": "warden",
  "Navigator": "cartographer,courier",
  "Hunter": "trapper",
  "Tailor": "cobbler,tailor,weaver",
  "Wright": "potter,carpenter,mason,wheelwright",
  "Baker": "baker,chandler",
  "Thief": "cutpurse,burglar",
  "Scribe": "clerk,administrator",
  "Scholar": "sage,historian",
  "Acolyte": "missionary,mendicant,preacher",
  "Arcanist": "channeler",
  "Soldier": "militia,recruit,foot soldier,knight"
}

const Adventurers = {
  "Arcane": "Alchemist,Cypher,Sorcerer,Witch,Wizard/2,1,3,1,3",
  "Devout": "Druid,Luminary,Revelator/2,3,1",
  "Rogue": "Bard,Dancer,Rogue/3,1,3",
  "Warrior": "Barbarian,Fighter,Gunslinger,Hunter,Magus,Pugilist,Vanguard/2,4,1,4,1,3,2"
}

const DieRank = ["d4", "d6", "d8", "d10", "d12", "d14"]

const Professions = {
  adventurer(RNG=chance, base="random") {
    let what = RNG.shuffle(["Arcane", "Devout", "Rogue", "Warrior"]).slice(0, RNG.randBetween(1, 2))
    if (base != "random" && !what.includes(base)) {
      what[0] = base
    }

    return what.map(b=>RNG.weightedString(Adventurers[b]))
  },
  trade(RNG=chance, type="random") {
    let trade = RNG.weightedString("Commoner,Diplomat,Engineer,Explorer,Tradesman,Rogue,Scholar,Soldier/30,5,5,10,15,15,5,15")
    trade = type != "random" ? type : trade
    let o = RNG.pickone(Occupations[trade])
    o += o == "Merchant" ? "," + RNG.pickone(Occupations.Merchant) : ""
    //find an alternate 
    let alt = AlternateTitles[o] && RNG.likely(50) ? _.capitalize(RNG.pickone(AlternateTitles[o].split(","))) : null
    return [trade, o, alt]
  },
}

// fake lookup for monster compendium 
const MC = {}

//https://www.completecompendium.com/

const airAnimals = ['pteranadon', 'condor', 'eagle/owl', 'hawk/falcon', 'crow/raven', 'heron/crane/stork', 'gull/waterbird', 'songbird/parrot', 'chicken/duck/goose', 'bee/hornet/wasp', 'locust/dragonfly/moth', 'gnat/mosquito/firefly']
const earthAnimals = ['dinosaur/megafauna', 'elephant/mammoth', 'ox/rhinoceros', 'bear/ape/gorilla', 'deer/horse/camel', 'cat/lion/panther', 'dog/wolf/boar/pig', 'snake/lizard/armadillo', 'mouse/rat/weasel', 'ant/centipede/scorpion', 'snail/slug/worm', 'termite/tick/louse', 'alligator/crocodile', 'frog/toad']
const waterAnimals = ['whale/narwhal', 'squid/octopus', 'dolphin/shark', 'turtle', 'shrimp/crab/lobster', 'fish', 'eel/snake', 'clam/oyster/snail', 'jelly/anemone', 'arthropod/barnacle']
const oddities = ['many-heads/no-head', 'profuse sensory organs', 'many limbs/tentacles/feelers', 'shape changing', 'bright/garish/harsh', 'web/network', 'crystalline/glassy', 'gaseous/misty/illusory', 'volcanic/explosive', 'magnetic/repellant', 'ooze/fungal/plant-based']

const IsAquatic = 'whale/narwhal/squid/octopus/dolphin/shark/turtle/shrimp/crab/lobster/fish/eel/clam/oyster/snail/jelly/anemone/arthropod/barnacle/Morkoth/Nereid/Marid/Water Genasi/Sahuagin/Sea Fey/Triton/Locathah/Merfolk'

const SIZES = "small,medium,large,huge,gargantuan"

const Essence = (RNG)=>{
  let e = RNG.pickone(Object.keys(Details.essence))
  return [e, RNG.pickone(Details.essence[e].split(","))]
}

const SetHD = (q)=>{
  return {
    "solitary": 2,
    "group": 1.5,
    "throng": 1,
  }[q]
}
const OSRHD = {
  "small": 0.5,
  "medium": 1,
  "large": 2,
  "huge": 4,
  "gargantuan": 8
}
const DAMAGE = {
  "small": 4,
  "medium": 6,
  "large": 8,
  "huge": 10,
  "gargantuan": 12
}

const Generators = {
  quantity(RNG=chance, sz) {
    let q = {
      "small": "solitary,group,throng/2,7,3",
      "medium": "solitary,group,throng/4,6,2",
      "large": "solitary,group/9,3",
      "huge": "solitary,group/11,1",
      "gargantuan": "solitary,group/11,1",
    }[sz]
    return RNG.weightedString(q)
  },
  size(RNG=chance, o={}) {
    return RNG.weightedString(o.sz || 'small,medium,large,huge,gargantuan/20,25,35,15,5')
  },
  _animal(RNG=chance, aew='') {
    if (aew == '')
      aew = RNG.weighted(['a', 'e', 'w'], [3, 6, 2])

    if (aew == 'a')
      return _.capitalize(RNG.pickone(RNG.pickone(airAnimals).split("/")))
    else if (aew == 'e')
      return _.capitalize(RNG.pickone(RNG.pickone(earthAnimals).split("/")))
    else if (aew == 'w')
      return _.capitalize(RNG.pickone(RNG.pickone(waterAnimals).split("/")))
  },
  /*
    Crature Type Generators 
  */
  Aberration(RNG=chance, o={}) {
    let {rarity} = o
    let size = this.size(RNG, o)

    //make a chimera, give it an oddity 
    let chimera = [Generators._animal(RNG), Generators._animal(RNG)]
    chimera[1] = chimera[0] == chimera[1] ? Generators._animal(RNG) : chimera[1]
    let odd = RNG.pickone(RNG.pickone(oddities).split("/"))

    let what = `${chimera.join("/")} (${odd})`

    let tags = waterAnimals.join(",").includes(chimera[0].toLowerCase()) || waterAnimals.join(",").includes(chimera[1].toLowerCase()) ? [size, "aquatic"] : [size]

    return ["Aberration", what, tags]
  },
  Animal(RNG=chance, o={}) {
    let {rarity} = o
    let size = this.size(RNG, o)

    const byBiome = {
      "Marine": "a,e,w/3,2,6",
      "Desert": "a,e,w/3,6,2",
      "Plains": "a,e,w/4,5,2",
      "Forest": "a,e,w/3,6,2",
      "Cold": "a,e,w/5,4,2",
      "Wetland": "a,e,w/1,1,1",
    }

    let animal = (aew)=>Generators._animal(RNG, aew)
    let _aew = ()=>o.biome ? RNG.weightedString(byBiome[o.biome]) : RNG.weightedString("a,e,w/3,6,2")

    //air earth water - 10% chance chimera 
    let aew = RNG.likely(10) ? [_aew(), _aew()] : [_aew()]
    aew = o.aew == "c" ? [_aew(), _aew()] : o.aew ? [o.aew] : aew

    let what = aew.map(id=>animal(id)).join("/")
    let tags = aew.includes("w") ? [size, what, "aquatic"] : [size, what]

    return ["Animal", what, tags]
  },
  Automaton(RNG=chance, o={}) {
    let {rarity} = o
    let size = this.size(RNG, o)

    //material 
    let matl = RNG.pickone(["Clockwork", "Organic", "Crystalline", "Mechanical"])
    let shape = RNG.pickone(["Humanoid", "Boxy", "Geometric", "Globular"])
    let tags = [size]
    let what = `${matl} ${shape} Automaton`

    return ["Automaton", what, tags]
  },
  Dragon(RNG=chance, o={}) {
    let {rarity} = o
    //age 
    let age = RNG.pickone(RNG.pickone(['Hatchling,Very Young', 'Young,Juvenile,Young Adult,Adult', 'Mature Adult,Old,Very Old', 'Venerable,Ancient'], [45, 35, 15, 5]).split(","))
    let form = RNG.weightedString('Wyrm,Drake,Wyvern,Linwyrm,Dragon/1,2,2,1,1')

    //size 
    let sz = 'Hatchling,Very Young'.includes(age) ? RNG.pickone(["small", "medium"]) : 'Mature Adult,Old,Very Old'.includes(age) ? "large" : 'Venerable,Ancient'.includes(age) ? RNG.pickone(["huge", "gargantuan"]) : "medium"

    let _color = RNG.bool() ? ["White", "Black", "Green", "Blue", "Red"] : ["Brass", "Copper", "Bronze", "Silver", "Gold"]
    let color = RNG.weighted(_color, [2, 3, 3, 3, 1])
    return ["Dragon", color + ` ${form} ${age}`, [sz, color, age]]
  },
  Vermin(RNG=chance, o={}) {
    let {rarity} = o
    let size = this.size(RNG, o)
    let animal = RNG.bool() ? ["Ant", "Bee", "Beetle", "Centipede", "Dragonfly", "Fly", "Leech", "Termite", "Tick", "Wasp"] : ["Rat", "Slug", "Snake", "Toad"]
    return ["Vermin", RNG.pickone(animal), [size]]
  },
  Generic(RNG=chance, o={}) {
    let tags = Setting.Factions[o.type] ? ["medium", "faction"] : ["medium"]
    return [o.type, o.type, tags]
  },
  /*
    Major generators 
  */
  People(RNG=chance, o={}) {
    let {rarity, terrain} = o
    let base = RNG.pickone(["Elemental", "Folk"])

    let _terrain = ()=>terrain.includes('desert') ? 'Desert' : terrain.includes('forest') ? "Forest" : ['Taiga', 'Tundra', 'Glacier'].includes(terrain) ? 'Cold' : ['Savanna', 'Grassland'].includes(terrain) ? "Plains" : terrain

    let noTerrain = 'Fire,Water,Mountain,Plains,Forest,Storm,Frost,Time/2,2,2,2,2,1,1,0.5::Feathered,Scaled,Fanged,Hooved,Roda,Lago,Finned,Tentacled,Web,Formic,Opteri,Koleo,Shelled,Chirops,Selachii,Bato,Angui,Skoraps/2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1'
    let withTerrain = {
      "Marine": "Water,Storm,Plains,Time/4,2,1,0.5::Feathered,Fanged,Finned,Tentacled,Shelled,Selachii,Bato,Angui/1,1,2,2,2,1,1,1",
      "Desert": "Fire,Storm,Time,Plains,Mountain/3,1,0.5,2,2::Feathered,Scaled,Fanged,Hooved,Roda,Lago,Web,Formic,Opteri,Koleo,Chirops,Skoraps/1,1,1,1,1,1,1,1,1,1,1,1",
      "Plains": "Fire,Water,Plains,Forest,Storm,Frost,Time/1,1,3,1,2,1,0.5::Feathered,Scaled,Fanged,Hooved,Roda,Lago,Web,Formic,Opteri,Koleo,Chirops,Skoraps/1,1,1,1,1,1,1,1,1,1,1,1",
      "Forest": "Water,Mountain,Forest,Storm,Frost,Time/2,1,3,2,1,0.5::Feathered,Scaled,Fanged,Hooved,Roda,Lago,Web,Formic,Opteri,Koleo,Chirops,Skoraps/1,1,1,1,1,1,1,1,1,1,1,1",
      "Cold": "Mountain,Plains,Forest,Storm,Frost,Time/2,1,1,1,3,0.5::Feathered,Scaled,Fanged,Hooved,Roda,Lago,Chirops,Web,Formic,Opteri,Koleo/2,2,2,2,2,2,2,1,1,1,1",
      "Wetland": "Water,Forest,Storm,Time/3,2,1,1::Feathered,Scaled,Fanged,Hooved,Roda,Lago,Finned,Tentacled,Web,Formic,Opteri,Koleo,Shelled,Chirops,Bato,Angui,Skoraps/2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1"
    }
    //determine the people 
    let str = terrain ? withTerrain[_terrain()] : noTerrain
    str = str.split("::")[base == "Elemental" ? 0 : 1]
    let _p = RNG.weightedString(str)

    let noFolk = 'Roda,Lago,Formic,Opteri,Koleo,Chirops,Selachii,Bato,Angui,Skoraps'
    _p += noFolk.includes(_p) ? '' : '-folk'

    //size 
    let size = RNG.weightedString('small,medium,large/15,70,15')

    let aquatic = 'Finned,Tentacled,Shelled,Selachii,Bato,Angui'
    //tags 
    let tags = [size, _p]
    _p == "Water" || aquatic.includes(_p) ? tags.push("aquatic") : null

    return ["People", _p, tags]
  }
}

//get the string to determine the actual result 
const StringGenerate = {
  Beast(RNG) {
    return RNG.weightedString('Animal,Vermin/4,1')
  },
  Outsiders(RNG) {
    return RNG.weightedString('Deep Dwellers,Yellow Court,Darkbound Covenant,Shadow Stalkers/40,25,20,15')
  },
  Artificial(RNG) {
    return RNG.weightedString('Robot Legions,Ghosts/35,65')
  },
  Marauders(RNG) {
    return RNG.weightedString('Havoc Beastmen,Havoc Warriors,Dark Elf Raiders,Orc Marauders/30,35,10,25')
  },
  Daemon(RNG) {
    return RNG.weightedString('Daemons of Change,Daemons of Plague,Daemons of War/30,30,40')
  },
  MiscTrouble(RNG) {
    return RNG.weightedString('Phage,Battle Brothers/50,50')
  },
  //Neutral/Ally encounter 
  Elves(RNG) {
    return RNG.weightedString('High Elf Fleets,Wood Elves,Sea Elves/45,30,25')
  },
  Saurians(RNG) {
    return RNG.weightedString('Saurian Starhost,Drakklings/60,40')
  },
  Humans(RNG) {
    return RNG.weightedString('Human Defense Force,Battle Brothers/70,30')
  },
  Independents(RNG) {
    return RNG.weightedString('Beastmen,Orcs,Giants/50,40,10')
  },
  Celestial(RNG) {
    return RNG.weightedString('Brightsoul Order,Kindom of Angels/45,55')
  },
  Proxies(RNG) {
    return RNG.weightedString('Corps,Silver,Automaton/55,25,25')
  },
  Misc(RNG) {
    return RNG.weightedString('Eternal Dynasty,Dwarves/50,50')
  }
}

/*
  Exports 
*/
const BASETROUBLE = 'Beast,Aberration,Dragon,Feral Hives,Outsiders,Artificial,Marauders,Daemon,MiscTrouble/10,22,12,8,8,8,16,10,6'
const BASEENCOUNTER = 'Alien Hives,Elves,Saurians,Humans,Independents,Celestial,Proxies,Misc/10,20,20,20,15,5,5,5'
const isFaction = ''

class Encounter {
  constructor(o={}) {
    let id = this.id = o.id || chance.hash()
    let RNG = new Chance(id)
    let {threat=true, rank=null, biome=null, size} = o

    //pick from list 
    let type = o.what != null ? o.what : RNG.weightedString(threat ? BASETROUBLE : BASEENCOUNTER)
    let gen = StringGenerate[type] ? StringGenerate[type](RNG) : type

    //gen result 
    let opts = {
      id,
      type: gen,
      size,
      rank,
      biome
    }
    let[base,short,tags=[]] = Generators[gen] ? Generators[gen](RNG, opts) : Generators.Generic(RNG, opts)
    this.short = short

    //tags 
    if (!tags.includes("aquatic") && IsAquatic.includes(short)) {
      tags.push("aquatic")
    }
    tags = this.tags = [base, ...tags]

    //get quantity and base HD 
    let _sz = this.size = tags.filter(t=>SIZES.includes(t))[0]
    let q = Generators.quantity(RNG, _sz)
    this.q = q = base == "Dragon" ? "solitary" : q

    //if not faction determine what it is 
    let isGeneric = Setting.Roster[base] ? false : true
    this.roster = RNG.pickone(Object.keys(Setting.Roster))
    this.unit = isGeneric ? RNG.pickone(Setting.Roster[this.roster].filter(r=>q=="solitary"?r[3]==1:r[3]>1)) : null
    
    //HD 
    this.HD = SetHD(q)

    //atatcks 
    let natk = RNG.pickone([1, 2, 3], [4, 4, 2])
    let dmg = DAMAGE[_sz] + (q == "solitary" ? 2 : 0)
    let atks = ([[0], [-2, -2], [-2, -4, -4]][natk - 1])
    this.atks = atks.map(mod=>dmg + mod == 2 ? 3 : dmg + mod == 0 ? 2 : dmg + mod).map(d=>"1d" + d)
    //attack mods 
    let _atkMod = ()=>RNG.weighted(["", "reach", "near/far", "forceful", "slashing", "+1", "AP"], [4, 1, 1, 1, 1, 1, 1])
    this.atkMod = _.fromN(RNG.d12() == 12 ? 2 : 1, ()=>_atkMod()).filter(m=>m != "").join("/")

    //Armor 
    this.armor = RNG.weighted([0, 1, 2, 3, 4, 5], [3, 4, 2, 1, 1, 1])

    //essence 
    this.e = Essence(RNG)
  }
  get base() {
    return this.tags[0]
  }
  get people() {
    return this.tags[1]
  }
  get number() {
    let nd = {
      "solitary": 1,
      "group": "1d6+1",
      "throng": "3d6+5"
    }[this.q]
    return nd == 1 ? 1 : chance.sumDice(nd)
  }
  get OSR() {
    let hd = this.HD * OSRHD[this.size]
      , AC = 10 + this.armor * 2
      , BAB = Math.round(hd);
    return _.html`
      <div>
        <div>${this.short}</div>
        <div class="f6">${this.base.toLowerCase()}, ${this.size}, ${this.q} [${this.number}]</div>
        <div>${hd} HD, AC ${AC}, Atk +${BAB}: ${this.atks.join("/")}${this.atkMod.length > 0 ? ` [${this.atkMod}]` : ""}</div>
      </div>`
  }
  random(mod = 0) {
    let _roster = Setting.Roster[this.base] || Setting.Roster["Havoc Warriors"]
    let _available = [...new Set(_roster.map(r=>r[1]))]
    let roster = Object.fromEntries(_available.map(t=> [t,_roster.filter(r=>r[1]==t)]))
    //establish RNG 
    let RNG = chance
    
    //generators for units in force 
    let squad = () => {
      let r = roster[RNG.weightedString("squad,beast,elite/65,15,20")] || roster.squad
      return RNG.pickone(r) 
    } 
    let special = () => {
      let t = RNG.pickone(["special","monster"].filter(id=>roster[id]))
      return RNG.pickone(roster[t])
    }
    let commander = () => {
      return RNG.pickone(roster.commander)
    }
    let unit = () => {
      let {unit,q,short} = this 
      let f = q == "solitary" ? [unit.slice()] : _.fromN(RNG.weighted([3,4,5],[3,2,1]),()=>unit.slice())
      f.forEach(u => u.short=short)
      return f
    }
    
    //type of encounter 
    let type = this.unit ? "unit" : RNG.weighted(["squad","special","commander"],[4,1,1])
    //number in encounter 
    let force = {
      squad : () => _.fromN(RNG.weighted([3,4,5],[3,2,1]),()=>squad()),
      special : () => [special(),..._.fromN(RNG.weighted([1,2],[1,1]),()=>squad())],
      commander : () => [commander()].concat(RNG.weighted([[],[special()]],[1,1]),_.fromN(2,()=>squad())),
      unit : () => unit()   
    }[type]()

    //string 
    let str = this.base+": "+force.map(f=> `${f[3]>1?f[3]+" ":""}${f.short || f[0]}`).join(", ")
    
    console.log(type,this.base,force)
        
    return str
  }
}

export {Encounter, Professions}
