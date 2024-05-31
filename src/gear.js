import*as Details from "./data.js"
import {Professions} from "./encounters.js"
import {RandBetween, SumDice, Likely, Difficulty, ZeroOne, Hash, BuildArray, SpliceOrPush, WeightedString, capitalize, chance} from "./random.js"

/*
  Naming For powers 
*/
const PowerTypes = ["Maneuver", "Blessing", "Spell", "Trick", "Design"]

const Form = 'Armor,Arrow,Aura,Bane,Beast,Blade,Blast,Blessing,Blob,Blood,Bolt,Bond,Boon,Brain,Burst,Call,Charm,Circle,Claw,Cloak,Cone,Crown,Cube,Cup,Curse,Dagger,Dart,Demon,Disturbance,Door,Eye,Eyes,Face,Fang,Feast,Finger,Fissure,Fist,Gate,Gaze,Glamer,Globe,Golem,Guard,Guide,Guise,Halo,Hammer,Hand,Heart,Helm,Horn,Lock,Mantle,Mark,Memory,Mind,Mouth,Noose,Oath,Oracle,Pattern,Pet,Pillar,Pocket,Portal,Pyramid,Ray,Rune,Scream,Seal,Sentinel,Servant,Shaft,Shield,Sigil,Sign,Song,Spear,Spell,Sphere,Spray,Staff,Storm,Strike,Sword,Tendril,Tongue,Tooth,Trap,Veil,Voice,Wall,Ward,Wave,Weapon,Weave,Whisper,Wings,Word'
const Noun = 'Acid,Aether,Air,Anger,Ash,Avarice,Balance,Blight,Blood,Bone,Bones,Brimstone,Clay,Cloud,Copper,Cosmos,Dark,Death,Deceit,Despair,Destiny,Dimension,Doom,Dust,Earth,Ember,Energy,Envy,Fear,Fire,Fog,Force,Fury,Glory,Gluttony,Gold,Greed,Hate,Hatred,Health,Heat,History,Hope,Ice,Iron,Justice,Knowledge,Lead,Lies,Life,Light,Lightning,Lore,Love,Lust,Metal,Might,Mist,Moon,Mud,Nature,Oil,Pain,Perception,Plane,Plant,Poison,Quicksilver,Revulsion,Rot,Salt,Shadow,Sight,Silver,Smoke,Soil,Soul,Souls,Sound,Spirit,Stars,Steam,Steel,Stone,Storm,Sun,Terror,Time,Treasure,Truth,Vanity,Venom,Vermin,Void,Water,Will,Wind,Wisdom,Wood,Youth'
const Adjective = 'All-Knowing,All-Seeing,Arcane,Befuddling,Binding,Black,Blazing,Blinding,Bloody,Bright,Cacophonous,Cerulean,Concealing,Confusing,Consuming,Crimson,Damnable,Dark,Deflecting,Delicate,Demonic,Devastating,Devilish,Diminishing,Draining,Eldritch,Empowering,Enlightening,Ensorcelling,Entangling,Enveloping,Erratic,Evil,Excruciating,Expanding,Extra-Planar,Fearsome,Flaming,Floating,Freezing,Glittering,Gyrating,Helpful,Hindering,Icy,Illusory,Incredible,Inescapable,Ingenious,Instant,Invigorating,Invisible,Invulnerable,Liberating,Maddening,Magnificent,Many-Colored,Mighty,Most Excellent,Omnipotent,Oozing,Penultimate,Pestilential,Piercing,Poisonous,Prismatic,Raging,Rejuvenating,Restorative,Screaming,Sensitive,Shimmering,Shining,Silent,Sleeping,Slow,Smoking,Sorcerer’s,Strange,Stupefying,Terrible,Thirsty,Thundering,Trans-planar,Transmuting,Ultimate,Uncontrollable,Unseen,Unstoppable,Untiring,Vengeful,Vexing,Violent,Violet,Viridian,Voracious,Weakening,White,Wondrous,Yellow'
const FNA = {
  Form,
  Noun,
  Adjective
}

const Templates = 'Noun.Form,Adjective.Form,Adjective.Noun,Form.of.Noun,Form.of.Adjective.Noun/3,3,3,2,2'
const Joins = ["", "Blessed", "Heroic", "Magnificent", "Epic", "Transcendent"]
const Competence = ["", "Blessed", "Heroic", "Magnificent", "Epic", "Transcendent"]

/*
  Item Forms 
*/

const Forms = {
  "Magical": {
    "Attire": 'shoes/boots,pants/skirt,dress/robe,shirt/blouse,belt,gloves/gauntlets,cape/cloak,hat/hood,scarf/shawl',
    "Bauble": 'pouch/bag/quiver/vial,rope/chain,cup/goblet/chalice,book/scroll,ornament,miniature/statue/figurine,toy,box/case,wand/staff/rod',
    "Jewelry": 'earings,ring,bracelet/anklet/armband,brooch/pin,belt,necklace/locket,scepter/orb,circlet/crown',
  },
  "Weapon": {
    "Simple": 'Club,Dagger,Hatchet,Staff,Spear,Sling/1,1,1,1,1,1',
    "Light Melee": 'Hand Axe,Mace,Short Sword/1,1,1',
    "Light Ranged": 'Small Bow,Hand Crossbow/1,1',
    "Melee": 'War Axe,War Hammer,Mace,Long Sword/1,1,1,1',
    "Ranged": 'Longbow,Crossbow,Flintlock/10,10,1',
    "Heavy Melee": 'Greatclub,Maul,Greatsword/1,1,1',
    "Heavy Ranged": 'Great Bow,Longarm/10,1',
  },
  "Armor": {
    "Light": 'War Shirt,Leather',
    "Medium": 'Mail Shirt,Curiass,Scale Mail',
    "Heavy": 'Mail Hauberk,Plate Mail',
    "Shield": 'Shield'
  },
  "Materials": {
    "Materials": "martial,potions,clothing,equipment,jewelry",
    "Essence": Object.keys(Details.essence).join(",")
  }
}

/*
  Pricing
*/
const Pricing = {
  whatIndex: {
    Resource: ["game/hide/fur", "timber/clay", "herb/spice/dye", "copper/tin/iron", "silver/gold/gems"],
    Equipment: ["Documents", "Gear", "Implements", "Supplies", "Tools", "Instrument"],
    Armor: ["Light", "Medium", "Heavy", "Shield"],
    Weapon: ["Simple", "Light Melee", "Melee", "Heavy Melee", "Light Ranged", "Ranged", "Heavy Ranged"],
    Potion: ["Healing"]
  },
  formIndex : {
    Materials: ["martial", "potions", "clothing", "equipment", "jewelry"],
  },
  base: {
    //by what 
    Materials: [1, 1, 0.5, 1, 2.5],
    Essence: [20],
    Healing : [1],
    //by base 
    Resource: [2, 2, 5, 4, 10],
    Equipment: [1, 20, 20, 10, 20, 20],
    Armor: [3, 25, 120, 1],
    Weapon: [1, 1, 2, 5, 1, 2, 5],
    Potion: [2.5],
    Magical: [50],
    Power: [50],
  }
}

/*
  Challenge / Action Reference 
*/
const Challenges = ['Cypher', 'Combat', 'Mechanism', 'Diplomacy', 'Obstacle']
const Actions = ["Finesse", "Move", "Muscle", "Sneak", "Notice", "Shoot", "Study", "Tinker", "Bond", "Command", "Focus", "Sway", "Phyique", "Insight", "Resolve"]

/*
  Die by Rank 
*/
const DieRank = ["d4", "d6", "d8", "d10", "d12", "d14"]

/*
  Magical Item Ability by Rank 
*/
const MagicItemAbility = ["boon,multiclass,healing/1,1,1", "swampwalk,aquatic,mountainwalk,split,multiclass/1,1,1,3,3", "flying,haste,healing,takex,multiclass/1,1,2,2,2", "healing,takex,multiclass/1,1,1", "healing,takex,multiclass/1,1,1", "healing,takex,multiclass/1,1,1"]
const MagicItemText = {
  swampwalk() {
    return `of Swamp Walk`
  },
  aquatic() {
    return `of Aquatic Adaptation`
  },
  mountainwalk() {
    return `the Mountain Strider`
  },
  flying() {
    return `of Flying`
  },
  haste() {
    return `of Mobility`
  },
  boon(rank, d) {
    return `of Blessed ${d}`
  },
  healing(rank, d) {
    return `of ${Joins[rank]} Healing (${DieRank[d]})`
  },
  split(rank, d) {
    return `of Resourceful ${d}`
  },
  takex(rank, d) {
    return Challenges.includes(d) ? `of ${d} Mastery [${rank}]` : `of ${Joins[rank]} ${d}s [${rank}]`
  },
  multiclass(rank, d) {
    return `multiclass ${d}`
  },
}

/*
  Main Class for Items 
*/

class Item {
  constructor(d) {
    this.data = d
    this.isKnown = false
    this.mayEquip = false

    let[id=null,base,what=null,rank=null] = d
    this.data[0] = id === null ? chance.hash() : id

    //generator 
    let RNG = new Chance(this.id)
    this._rank = rank === null ? Difficulty(RNG) : null

    //sub divide base into what 
    const What = {
      "Power": ()=>RNG.pickone(PowerTypes),
      "Potion": ()=>rank == 0 || Likely(50, RNG) ? "Healing" : RNG.pickone(Actions),
      "Magical": ()=>RNG.pickone(["Attire", "Bauble", "Jewelry"]),
      "Equipment": ()=>WeightedString('Documents,Gear,Implements,Tools/1,2,1,2', RNG),
      "Weapon": ()=>WeightedString('Simple,Light Melee,Melee,Heavy Melee,Light Ranged,Ranged,Heavy Ranged/4,2,2,1,2,2,1', RNG),
      "Armor": ()=>WeightedString('Light,Medium,Heavy,Shield/4,2,1,4', RNG),
      "Materials": ()=>WeightedString('Materials,Essence/3,1', RNG),
      "Loot": ()=>RNG.pickone(['Trinket', 'Gold']),
      "Resource" : ()=> RNG.pickone(["game/hide/fur", "timber/clay", "herb/spice/dye", "copper/tin/iron", "silver/gold/gems"])
    }
    //determine what if it doesn't exist 
    this._what = what === null ? What[base]() : null

    //usage 
    const Usage = {
      "Weapon": ()=>RNG.weighted([6, 8, 10, 12], [1, 5, 3, 1]),
      "Equipment": ()=>RNG.weighted([4, 6, 8, 10, 12], [1, 2, 4, 2, 1]),
      "Materials": ()=>(3 + rank) * 2
    }
    this._usage = !Usage[base] ? null : Usage[base]()

    //amount of something 
    const Amount = {
      "Potion": ()=>this.what == "Healing" ? ["1d2", "1d4", "1d6", "1d8", "1d10", "1d12"][this.rank] : [0, 0, 1, 3, 9, 30][this.rank],
      "Loot": ()=>SumDice(["1d4", "2d6", "4d6+25", "5d20+100", "4d100+400", "8d200+1600"][rank], RNG) / (this.what == "Trinket" ? 2 : 1),
      "Materials": ()=>SumDice(["1d4", "2d6", "4d6+25", "5d20+100", "4d100+400", "8d200+1600"][rank], RNG)
    }
    this.amt = !Amount[base] ? null : Amount[base]()

    //does it have a form 
    this._form = Forms[base] ? base == "Weapon" ? WeightedString(Forms[base][this.what], RNG) : RNG.pickone(RNG.pickone(Forms[base][this.what].split(",")).split("/")) : base=="Resource" ? RNG.pickone(this.what.split("/")) : null 

    //name it 
    this.name = null
    if ('Power,Magical'.includes(base)) {
      let _n = WeightedString(Templates, RNG).split(".")
      this.name = _n.map(w=>FNA[w] ? RNG.pickone(FNA[w].split(",")) : w).join(" ")
    }

    //does it apply to a challenge
    const Challenge = {
      "Power": ()=>RNG.pickone(Challenges),
      "Magical": (ability)=>ability == "boon" ? RNG.pickone(Actions) : 'split,takex'.includes(ability) ? RNG.pickone(RNG.pickone([Challenges, PowerTypes])) : ability == "multiclass" ? Professions.adventurer(RNG)[0] : null,
      "Potion": ()=>this.what,
      "Weapon": ()=> "Combat",
      "Documents": 'Cypher',
      "Gear": 'Obstacle',
      "Tools": 'Mechanism',
      "Implements": 'Spell',
      "Contact": "Diplomacy",
    }
    //magical ability 
    this.ability = base === "Magical" ? WeightedString(MagicItemAbility[rank], RNG) : null 
    this._challenge = Challenge[base] ? Challenge[base](this.ability) : Challenge[what] ? Challenge[what] : null

    //essence 
    this._essence = 'Armor,Weapon'.includes(base) && this.rank > 2 ? RNG.pickone(Object.keys(Details.essence)) : null
    if (base == "Power") {
      //essence based on name 
      let _essence = this.name.split(" ").reduce((all,word)=>{
        Object.entries(Details.essence).forEach(([e,tags])=>{
          if (tags.includes(word)) {
            all.push(e)
          }
        }
        )
        return all
      }
      , [])
      this._essence = _essence.join()
    }
  }
  get id() {
    return this.data[0]
  }
  get base() {
    return this.data[1]
  }
  get what() {
    return this._what || this.data[2]
  }
  get form() {
    return this.data.f || this._form
  }
  get rank() {
    return this._rank || this.data[3]
  }
  get die () {
    const hasDie = 'Power,Equipment,Weapon,Contact'
    return hasDie.includes(this.base) || hasDie.includes(this.what) ? DieRank[this.rank] : null 
  }
  get usage() {
    let used = (this.data.u || 0) * 2
    return this._usage ? this._usage - used : null
  }
  get challenge() {
    let c = this.data.c || this._challenge
    return 'Magical,Power'.includes(this.base) ? this.isKnown ? c : null : c
  }
  get essence() {
    return this.data.e || this._essence
  }
  get price() {
    let {base, what, rank, form} = this

    //based on rank 
    let multiplier = [1, 2, 4, 8, 16, 32][rank]

    //price index and price 
    let pi = Pricing.whatIndex[base] ? Pricing.whatIndex[base].indexOf(what) : Pricing.formIndex[what] ? Pricing.formIndex[what].indexOf(form) : 0
    pi = pi < 0 ? 0 : pi 
    let basePrice = base == "Loot" ? this.amt : Pricing.base[what] ? Pricing.base[what][pi] : Pricing.base[base][pi]

    return basePrice * multiplier 
  }
  get mPrice () {
    //takes into account set price multiplier 
    let p = (this.pm || 1) * this.price
    return Number(p.toFixed(1) )
  }
  get enc() {
    let eq = 'Documents,Gear,Implements,Tools'
    let wp = 'Simple,Light Melee,Melee,Heavy Melee,Light Ranged,Ranged,Heavy Ranged'
    let ar = 'Light,Medium,Heavy,Shield'

    let enc = {
      "Power": this.mayEquip ? 0.1 : 1,
      "Magical": 1,
      "Potion": 0.25,
      "Equipment": [0.25, 3, 1, 2][eq.split(",").indexOf(this.what)],
      "Weapon": [0.5, 0.5, 1, 2, 0.5, 1, 2][wp.split(",").indexOf(this.what)],
      "Armor": [1, 2, 4, 1][ar.split(",").indexOf(this.what)],
      "Materials": 1,
      "Essence": 1,
      "Trinket": 1,
      "Resource": 1,
      "Contact": 0,
    }
      
    return enc[this.what] ? enc[this.what] : enc[this.base]
  }
  get text() {
    let D = DieRank[this.rank]
    
    let text = {
      "Power": ()=>`${this.what}: ${this.name} ${this.isKnown ? "(" + this.challenge + ")" : ""} ${D}`,
      "Potion": ()=>`Potion of ${Joins[this.rank]} ${this.what} (${this.amt})`,
      "Magical": ()=>`Magical ${this.form} ${MagicItemText[this.ability](this.rank, this._challenge)}`,
      "Equipment":()=> `${this.what} (${this.challenge}) ${D}`,
      "Weapon":()=> `${this.form} ${D}`,
      "Armor":()=> `${this.form} [${this.rank}]`,
      "Materials": ()=>`${this.what} ${this.form} ${D}`,
      "Loot":()=> this.what == "Trinket" ? `Trinket [${this.rank}]` : `${this.amt} Gold`,
      "Resource":()=> `Resource: ${this.form}`,
      "Ally":()=> `${this.what} ${D}`
    }
      
    return text[this.base]()
  }
  //for armor 
  get health() {
    let dmg = this.data[5]
    let what = this.what
    let max = what == "Medium" ? 2 : what == "Heavy" ? 3 : 1
    return {
      now: max - dmg,
      max
    }
  }
}

const Ally = ([id=chance.hash(),what=null,rank=null],region)=>{
  let RNG = new Chance(id)
  //Explorer, NPC, Contact  
  what = what === null ? WeightedString('Explorer,NPC,Contact/2,4,4', RNG) : what 

  if (what == "NPC") {
    return region.NPC({
      id,
      rarity : rank 
    })
  }

  return new Item([id, "Ally", what, rank])
}

/*
  Give rewards based upon exploration 
*/

const ExploreRewards = {
  "wilderness": "Loot,Weapon,Armor,Power,Resource,Materials/4,1,1,1,2,2",
  "landmark": "Loot,Weapon,Armor,Power,Resource,Materials.Essence/4,1,1,1,2,2",
  "hazard": "Loot,Resource,Materials.Essence,Equipment.Gear,Equipment.Implements/3,3,1,2,1",
  "resource": "Resource,Materials.Essence,Loot,Equipment.Tools/5,1,2,2",
  "encounter": "Loot,Materials,Weapon,Armor,Equipment.Implements/2,4,2,1,1",
  "dungeon": "Loot,Materials.Essence,Power,Magical,Weapon,Armor,Equipment/3,3,1,1,2,2,2",
  "settlement": "Loot.Trinket,Materials,Weapon,Armor,Magical,Power,Ally/1,2,1,1,1,1,3",
  "faction": "Loot,Ally/3,7",
}

//Rewars based upon what action was done 
const Rewards = (region,exploration)=>{
  let RNG = chance
  let {diff, where, rank} = exploration
  let[base,what=null] = WeightedString(ExploreRewards[where], RNG).split(".")

  //set reward
  exploration.reward = base == "Ally" ? Ally([RNG.natural(),what,rank], region) : new Item([RNG.natural(), base, what, rank])

  //set extra on data for Resource or Essence 
  if(base == "Resource" && where == "resource"){
    exploration.reward.data.f = RNG.pickone(region.lookup("resource").map(r => r.specifics[1]))
  }
  else if (exploration.reward.what == "Essence" && !'dungeon,faction'.includes(where)){
    exploration.reward.data.e = RNG.pickone(region.children.filter(c => c.essence).map(c => c.essence))
  }
  
  return exploration
}

export {Item, Ally, Rewards}
