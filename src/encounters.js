/*
  Contains setting data : elements, magic types, etc 
*/
import*as Details from "./data.js"

/*
  NPC Data 
*/
const Occupations = {
  "Commoner" : ['Beggar','Farmer','Herder','Laborer','Servant','Driver','Porter','Guide'],
  "Merchant": ['raw materials/supplies', 'raw materials/supplies', 'general goods/outfitter', 'general goods/outfitter', 'grain/livestock', 'ale/wine/spirits', 'clothing/jewelry', 'weapons/armor', 'spices/tobacco', 'labor/slaves', 'books/scrolls', 'magic supplies/items'],
  "Diplomat" : ["Envoy","Musician","Artist","Merchant"], 
  "Engineer" : ["Smith","Tinker","Physician","Herbalist"], 
  "Explorer" : ["Scout","Navigator","Hunter"],
  "Tradesman" : ["Tailor","Wright","Baker","Jeweler"],
  "Rogue" : ["Thug","Thief","Con Artist","Spy"],
  "Scholar" : ["Scribe","Scholar","Acolyte","Arcanist"],
  "Soldier" : ["Soldier","Archer","Bodyguard"],
}

/*
Impoverished lifestyle, per week 5 sp
Common lifestyle, per week 20 sp, 8g mo 
Rich lifestyle, per week 200 sp, 80g mo 
*/
const ToHire = {
  "Commoner" : 8,
  "Diplomat" : 30, 
  "Engineer" : 40, 
  "Explorer" : 16,
  "Tradesman" : 25,
  "Rogue" : 20,
  "Scholar" : 40,
  "Soldier" : 30,
}

const Skilled = {
  //Diplomat 
  "Envoy" : "Bond,Sway",
  "Musician" : "Sway,Command", 
  "Artist" : "Sway,Focus",
  "Merchant" : "Sway,Finesse",
  //Engineer
  "Smith" : "Tinker,Focus",
  "Tinker" : "Tinker,Study", 
  "Physician" : "Tinker,Notice", 
  "Herbalist" : "Tinker,Finesse", 
  //Explorer
  "Scout" : "Sneak,Notice", 
  "Navigator" : "Move,Notice", 
  "Hunter" : "Study,Shoot", 
  //Tradesman 
  "Tailor" : "Tinker,Finesse",  
  "Wright" : "Tinker,Muscle", 
  "Baker" : "Tinker,Study", 
  "Jeweler" : "Tinker,Finesse", 
  //Rogue
  "Thug" : "Muscle,Sneak",
  "Thief" : "Finesse,Sneak",  
  "Con Artist" : "Sway,Finesse",
  "Spy" : "Sway,Notice", 
  //Scholar
  "Scribe" : "Finesse,Study", 
  "Scholar" : "Study,Focus", 
  "Acolyte" : "Sway,Focus", 
  "Arcanist" : "Study,Focus", 
  //Soldier
  "Soldier" : "Muscle,Command", 
  "Archer" : "Shoot,Notice",//
  "Bodyguard" : "Muscle,Move",
}

const AlternateTitles = {
  "Musician" : "actor",
  "Tinker" : "locksmith,architect,engineer,inventor",
  "Physician" : "apothecary,alchemist",
  "Herbalist" : "vinter,perfumer",
  "Scout" : "warden",
  "Navigator" : "cartographer,courier",
  "Hunter" : "trapper",
  "Tailor" : "cobbler,tailor,weaver",
  "Wright" : "potter,carpenter,mason,wheelwright",
  "Baker" : "baker,chandler",
  "Thief" : "cutpurse,burglar",
  "Scribe" : "clerk,administrator",
  "Scholar" : "sage,historian",
  "Acolyte" : "missionary,mendicant,preacher",
  "Arcanist" : "channeler",
  "Soldier" : "militia,recruit,foot soldier,knight"
}

const Adventurers = {
  "Arcane" : "Alchemist,Cypher,Sorcerer,Witch,Wizard/2,1,3,1,3",
  "Devout" : "Druid,Luminary,Revelator/2,3,1",
  "Rogue" : "Bard,Dancer,Rogue/3,1,3",
  "Warrior" : "Barbarian,Fighter,Gunslinger,Hunter,Magus,Pugilist,Vanguard/2,4,1,4,1,3,2"
}

const DieRank = ["d4","d6","d8","d10","d12","d14"]

const Professions = {
  adventurer (RNG = chance, base = "random") {
    let what = RNG.shuffle(["Arcane","Devout","Rogue","Warrior"]).slice(0,RNG.randBetween(1,2))
    if(base != "random" && !what.includes(base)) {
      what[0] = base 
    }
    
    return what.map(b => RNG.weightedString(Adventurers[b]))
  } ,
  trade (RNG=chance, type = "random") {
    let trade = RNG.weightedString("Commoner,Diplomat,Engineer,Explorer,Tradesman,Rogue,Scholar,Soldier/30,5,5,10,15,15,5,15")
    trade = type != "random" ? type : trade
    let o = RNG.pickone(Occupations[trade])
    o+= o == "Merchant" ? ","+RNG.pickone(Occupations.Merchant) : ""
    //find an alternate 
    let alt = AlternateTitles[o] && RNG.likely(50) ? _.capitalize(RNG.pickone(AlternateTitles[o].split(","))) : null 
    return [trade,o,alt]
  },
}

// fake lookup for monster compendium 
const MC = {}

//https://www.completecompendium.com/

const airAnimals = ['pteranadon', 'condor', 'eagle/owl', 'hawk/falcon', 'crow/raven', 'heron/crane/stork', 'gull/waterbird', 'songbird/parrot', 'chicken/duck/goose', 'bee/hornet/wasp', 'locust/dragonfly/moth', 'gnat/mosquito/firefly']
const earthAnimals = ['dinosaur/megafauna', 'elephant/mammoth', 'ox/rhinoceros', 'bear/ape/gorilla', 'deer/horse/camel', 'cat/lion/panther', 'dog/wolf/boar/pig', 'snake/lizard/armadillo', 'mouse/rat/weasel', 'ant/centipede/scorpion', 'snail/slug/worm', 'termite/tick/louse', 'alligator/crocodile', 'frog/toad']
const waterAnimals = ['whale/narwhal', 'squid/octopus', 'dolphin/shark', 'turtle', 'shrimp/crab/lobster', 'fish', 'eel/snake', 'clam/oyster/snail', 'jelly/anemone', 'arthropod/barnacle']
const oddities = ['many-heads/no-head', 'profuse sensory organs', 'many limbs/tentacles/feelers', 'shape changing', 'bright/garish/harsh', 'web/network', 'crystalline/glassy', 'gaseous/misty/illusory', 'volcanic/explosive', 'magnetic/repellant', 'multilevel/tiered', 'absurd/impossible']

const IsAquatic = 'whale/narwhal/squid/octopus/dolphin/shark/turtle/shrimp/crab/lobster/fish/eel/clam/oyster/snail/jelly/anemone/arthropod/barnacle/Morkoth/Nereid/Marid/Water Genasi/Sahuagin/Sea Fey/Triton/Locathah/Merfolk'

const Rarity = {
  //type 
  'Aberration': 'small,medium/large/huge/gargantuan',
  'Animal': 'small,medium/large/huge/gargantuan',
  'Automaton': 'small,medium/large/huge/gargantuan',
  'Dragon': 'Kobold/Dragon-kin,Half-dragon,Wyrmling/Very Young,Young,Juvenile/Young Adult,Adult,Mature Adult,Old/Very Old,Wyrm,Great Wyrm',
  'Magical Beast': 'Ankheg,Griffon,Hippogriff,Stirge/Bulette,Carrion Crawler,Owlbear,Shambling Mound,Wyvern/Basilisk,Chimera,Cockatrice,Displacer Beast,Dragonne,Hell Hound,Hydra,Manticore,Naga,Nightmare,Otyugh,Rust Monster,Umber Hulk/Behir,Catoblepas,Gorgon,Mimic,Pegasus,Peryton,Remorhaz,Roc,Purple Worm/',
  'Ooze': 'tiny,small/medium,large/huge/gargantuan',
  'Plant': '/Black Pudding,Gas Spore,Shrieker,Thornslinger,Yellow Musk Creeper,Shambling Mound/Brown Pudding,Choke Creaper,Hangman Tree,Mantrap,Phycomid,Violet Fungus//',
  'Undead': '/Ghoul,Skeleton,Zombie/Shadow,Wight,Ghost,Mummy,Vampire,Wraith,Banshee/Revenant,Death Knight,Lich/',
  'Vermin': 'tiny,small/medium,large/huge/gargantuan',
  //Sub generators 
  'Folk': 'Feathered,Scaled,Fanged,Hooved,Roda,Lago,Finned,Tentacled,Web,Formic,Opteri,Koleo,Shelled/Chirops,Selachii,Bato,Angui,Skoraps///',
  'People' : 'Fire,Water,Mountain,Plains,Forest/Storm,Frost/Time//'
}

const Threat = {
    //type 
  'Aberration': 'small,medium/large/huge/gargantuan',
  'Animal': 'small,medium/large/huge/gargantuan',
  'Automaton': 'small,medium/large/huge/gargantuan',
  'Dragon': 'Kobold,Dragon-kin/Half-dragon,Wyrmling,Very Young,Young/Juvenile,Young Adult,Adult/Mature Adult,Old,Very Old/Wyrm,Great Wyrm',
  'Magical Beast': 'Stirge/Bulette,Chimera,Carrion Crawler,Cockatrice,Displacer Beast,Shambling Mound,Griffon,Dragonne,Manticore,Naga,Rust Monster,Nightmare,Hell Hound,Hippogriff,Stirge,Wyvern,Mimic,Pegasus,Peryton/Ankheg,Bulette,Owlbear,Wyvern,Basilisk,Hydra,Otyugh,Umber Hulk,Behir,Catoblepas,Gorgon,Remorhaz/Roc,Purple Worm/',
  'Ooze': 'tiny,small,medium/large/huge/gargantuan',
  'Plant': '/Black Pudding,Gas Spore,Shrieker,Thornslinger,Yellow Musk Creeper,Shambling Mound/Brown Pudding,Choke Creaper,Hangman Tree,Mantrap,Phycomid,Violet Fungus//',
  'Undead': '/Ghoul,Skeleton,Zombie/Shadow,Wight,Ghost,Mummy,Vampire,Wraith,Banshee/Revenant,Death Knight,Lich/',
  'Vermin': 'tiny,small/medium,large/huge/gargantuan',
  'Folk': 'Feathered,Scaled,Fanged,Hooved,Roda,Lago,Finned,Tentacled,Web,Formic,Opteri,Koleo,Shelled,Chirops,Selachii,Bato,Angui,Skoraps////',
  'People' : 'Fire,Water,Storm,Frost,Time,Mountain,Plains,Forest////'
}

const Split = (val,str)=>{
  let base = str.split("/")
  let max = base.reduce((m,s,i)=>s.length > 0 ? i : m, 0)
  let min = base.reduce((m,s,i)=> s.length > 0 && m == -1 ? i : m, -1)

  let i = val > max ? max : val < min ? min : val 

  return {
    val,
    base: base[i].split(","),
    min, 
    max,
    delta: val > max ? val-max : val < min ? val-min : 0 
  }
}

const Essence = (RNG)=>RNG.pickone(Object.keys(Details.essence))

const Generators = {
  size(RNG=chance, what) {
    const p = [20, 30, 10, 25][what]
    return RNG.bool({
      likelihood: p
    }) ? RNG.pickone(["Small ", "Large "]) : ""
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
  _chimera(RNG=chance) {
    return [Generators._animal(RNG), Generators._animal(RNG)].join("/")
  },
  Lycanthrope(RNG=chance, o={}) {
    return "Were" + RNG.weighted(["bear", "boar", "bat", "fox", "rat", "tiger", "wolf"], [2, 2, 1, 1, 2, 1, 4])
  },
  /*
    Crature Type Generators 
  */
  Aberration(RNG=chance, o={}) {
    //base determines size 
    let {base, rarity, max, delta} = o
    let size = o.size || RNG.pickone(base)

    //make a chimera, give it an oddity 
    let chimera = [Generators._animal(RNG), Generators._animal(RNG)]
    let odd = RNG.pickone(RNG.pickone(oddities).split("/"))
    let essence = Essence(RNG)

    let tags = waterAnimals.includes(chimera[0]) || waterAnimals.includes(chimera[1])? ["aquatic"] : []
    tags.push(essence)
    if(size != "medium"){
      tags.push(size)
    }

    let what = `${chimera.join("/")} [${size}, ${odd}, ${essence}]`
    
    return ["Aberration", what,tags]
  },
  Animal(RNG=chance,o={}) {
    //base determines size 
    let {base, rarity, max, delta} = o
    let size = o.size || RNG.pickone(base)

    //air earth water 
    const aew = RNG.weighted(['a', 'e', 'w', 'c'], [3, 6, 2, 1])

    let what = (aew == 'c' ? Generators._chimera(RNG) : Generators._animal(RNG, aew))
    let tags = aew == "w" || waterAnimals.reduce((isAquatic,a)=> isAquatic || a.includes(what),false) ? [what,"aquatic"] : [what]
    if(size != "medium"){
      tags.push(size)
    }
    
    return ["Animal", what + " ["+size+"]",tags]
  },
  Automaton(RNG=chance, o={}) {
    //base determines size 
    let {base, rarity, max, delta} = o
    let size = o.size || RNG.pickone(base)

    //material 
    let matl = RNG.pickone(["Clockwork","Organic","Crystalline","Mechanical"])
    let shape = RNG.pickone(["Humanoid","Boxy","Geometric","Globular"])
    let tags = size != "medium" ? [size] : []

    let what = `${matl} ${shape} [${size}]`
    
    return ["Automaton", what,tags]
  },
  Dragon(RNG=chance, o={}) {
    //base may be creature or age 
    let {base, rarity, max, delta} = o
    //age 
    let age = 'Wyrmling,Very Young,Young,Juvenile,Young Adult,Adult,Mature Adult,Old,Very Old,Wyrm,Great Wyrm'
    let what = RNG.pickone(base)
    
    let _color = RNG.bool() ? ["White", "Black", "Green", "Blue", "Red"] : ["Brass", "Copper", "Bronze", "Silver", "Gold"]
    let color = RNG.weighted(_color, [2, 3, 3, 3, 1])
    return ["Dragon",  [color,age.includes(what) ? "Dragon" : what].join(" "), [color,what,age.includes(what)]]
  },
  "Magical Beast"(RNG=chance, o={}) {
    let {base, rarity, max, delta} = o
    return ["Magical Beast", RNG.pickone(base),[]]
  },
  Ooze(RNG=chance, o={}) {
    //base determines size 
    let {base, rarity, max, delta} = o
    return ["Ooze", ["Ooze",Generators._animal(RNG),"["+RNG.pickone(base)+"]"].join(" "),[]]
  },
  Plant(RNG=chance, o={}) {
    let {base, rarity, max, delta} = o
    return ["Plant", RNG.pickone(base),[]]
  },
  Undead(RNG=chance, o={}) {
    let {base, rarity, max, delta} = o
    return ["Undead", RNG.pickone(base),[]]
  },
  Vermin(RNG=chance, o={}) {
    //base determines size 
    let {base, rarity, max, delta} = o
    let animal = RNG.bool() ? ["Ant", "Bee", "Beetle", "Centipede", "Dragonfly", "Fly", "Leech", "Termite", "Tick", "Wasp"] : ["Rat", "Slug", "Snake", "Toad"]
    return ["Vermin",[RNG.pickone(animal),"["+RNG.pickone(base)+"]"].join(" "),[]]
  },
  /*
    Major generators 
  */
  People(RNG=chance,o={}) {
    let {base, rarity, max, delta} = o
    let e = RNG.pickone(base)
    let size = RNG.weightedString('small,medium,large/15,70,15')
    
    let tags = size != "medium" ? [size,e] : [e]
    e=="Water" ? tags.push("aquatic") : null 
    
    let what = `${e}-folk`+(size!='medium'?` [${size}]`:``)

    return ["People",what,tags]
  },
  Folk(RNG=chance,o={}) {
    let noFolk = 'Roda,Lago,Formic,Opteri,Koleo,Chirops,Selachii,Bato,Angui,Skoraps'
    let aquatic = 'Finned,Tentacled,Shelled,Selachii,Bato,Angui'
    let {base, rarity, max, delta} = o
    
    let animal = RNG.pickone(base)
    let size = RNG.weightedString('small,medium,large/15,70,15')
    let tags = size != "medium" ? [size] : []

    let what = animal+(noFolk.includes(animal)?"":"-folk")+(size!='medium'?` [${size}]`:``)

    //check for people 
    if(RNG.likely(10)){
      let e = RNG.pickone('Fire,Water,Storm,Frost,Time,Mountain,Plains,Forest'.split(","))
      what = `${e} ${what}`
      tags.push(e)
    }    
    aquatic.includes(animal) || tags.includes("Water") ? tags.push("aquatic") : null
    
    return ["People",what,tags]
  }
}

//get the string to determine the actual result 
const StringGenerate = {
  Beast(RNG, where) {
    let what = RNG.weightedString('Animal,Vermin/4,1',RNG)
    return [what, where[what]]
  },
  Monster(RNG, where) {
    let what = RNG.weightedString('Aberration,Automaton,Dragon,Magical Beast,Ooze,Plant,Undead,Vermin/2,1,1,1,1,2,2,2',RNG)
    return [what, where[what]]
  },
}

/*
  Exports 
*/


const Encounter = (o={})=>{
  let id = o.id || chance.hash()
  let RNG = new Chance(id)
  let {threat = null, rarity = null, str=null, size} = o
  let rank = threat !== null ? threat : rarity !== null ? rarity : RNG.weighted([0, 1, 2, 3], [45, 35, 15, 5]) 

  //threat or rarity 
  let TR = threat !== null ? Threat : Rarity
  
  //pick from list 
  let type = o.what != null ? o.what : RNG.weightedString("People,Folk,Beast,Monster/20,25,30,35") 

  //pulls string 
  let[gen,_str] = o.str != null ? [type, o.str] : TR[type] ? [type, TR[type]] : StringGenerate[type](RNG, TR)

  //gen result 
  let opts = Object.assign({id,type,size},Split(rank, _str))
  let [base,short,tags=[]] = Generators[gen](RNG, opts)

  //tags 
  if(!tags.includes("aquatic") && IsAquatic.includes(short)){
    tags.push("aquatic")
  }
  tags = [base,...tags]

  //get trade 
  let [_trade,_occ] = o.trade ? o.trade.split(",") : []
  let trade = Professions.trade(RNG, _trade || "random")
  if(_occ){
    trade = [_trade,_occ,null]
  }
  //adventurer 
  let adv = Professions.adventurer(RNG, o.adventurer || "random")
  let prof = o.trade ? trade : o.adventurer ? adv : []

  //extra fluff
  //age 
  let age = RNG.weightedString("child,youth,adult,old,elderly/1,2,4,2,1",RNG)
  tags.push(age)

  //essence 
  let e = Essence(RNG)
  let _essence = [e,RNG.pickone(Details.essence[e].split(","))]

  //format result
  //[id,"NPC",short,rank,prof,tags,timeEmployed,damage]
  return {
    data : [id,"NPC",short,rank,prof,tags,_essence],
    get id () {return this.data[0]},
    get nameBase () {return Math.abs(parseInt(Hash(this.data),16)%43) },
    get base () {return this.tags[0]},
    get people () {return this.tags[1]},
    get rank () {return this.data[3]},
    get die () {return DieRank[this.rank]},
    get tags () {return this.data[5]},
    get essence () {return this.data[6]},
    get outsider () {return this.base == "Outsider" ? this.tags[1] : null},
    get trade () { 
      if(this.data[4].length != 3) {
        return null 
      }

      let m = [1, 2, 4, 8, 16, 32][this.rank]
      let [trade,occ,alt] = this.data[4]
      return  {
        short : alt ? alt : occ.includes("Merchant") ? occ.split(",").join(" of ") : occ,
        skills : Skilled[occ] ? Skilled[occ].split(",") : [],
        toHire : ToHire[trade] * m 
      }
    },
    get adventurer () {return this.trade ? null : this.data[4] },
    get lair () { return 'Fey,People,Outsider'.includes(this.base) },
    get hasJobs () { return 'Dragon,Fey,People,Outsider'.includes(this.base)},
    get short () { return `${this.data[2]} ${this.trade ? this.trade.short : this.adventurer ? this.adventurer.join("/") : ""}`},
    get text () { return `${this.data[2]} ${this.trade ? this.trade.short : this.adventurer ? this.adventurer.join("/") : ""} ${this.die}`},
    //price to hire 
    get price () {return this.trade ? this.trade.toHire : null },
    //load that they can carry 
    get load () {
      let sz = ["small","large","huge","gargantuan"]
      let _sz = this.tags.find(t => sz.includes(t))
      let m = _sz ? [0.5,3,10,50][sz.indexOf(_sz)] : 1 
      return 10 * m 
    },
    //time remains if hired 
    timeRemain (now) {
      let t = this.data.t || -1 
      return t == -1 ? 0 : t-now 
    },
    takeDamage (x) {
      this.data[7] += x 
      return this.data[7]
    },
    get health () {
      let dmg = this.data.d || 0
      //basic 2 * rank 
      let max = this.rank == 0 ? 1 : this.rank*2 
      return {
        now : max-dmg,
        max 
      }
    }
  }
}


export {Encounter, Professions}
