var DB = localforage.createInstance({
  name: "Outlands.Characters"
});

/*
  Encumberance 
Gems, jewelry, and other small
objects usually aren’t tracked as items, though every full
100 coins counts as one item

A hero can carry a number of Readied items equal
to half their Strength attribute, rounded down.

hero can carry a number of Stowed items equal to
their full Strength score.

Gear Bundles
Item Cost Enc
Artisan’s Equipment 50 sp 5
Criminal Tools 100 sp 3
Dungeoneering Kit 200 sp 6
Noble Courtier Outfit 1,000 sp 2
Performer’s Implements 100 sp 3
Wilderness Travel Gear 100 sp 5

Type Enc
One day of food or water 1
One week of carefully-packed food 4
One night’s load of fire fuel 4
One day’s fodder for a horse or large beast 4
One day’s fodder for a mule or small beast 2
Daily water for a large beast 8
Daily water for a small beast 4

Pack Animal and Porter Loads
Type Enc
Riding horse or warhorse, with laden rider 5
Riding horse or warhorse, pack only 20
Heavy pack horse 30
Mule or donkey 15
Professional porter 12
Two porters carrying a shared litter 30


Beasts and Transport
Item Cost
Horse, riding 200 sp
Horse, draft 150 sp
Horse, battle-trained 2,000 sp
Mule 30 sp
Cow 10 sp
Ox, plow-trained 15 sp
Chicken 5 cp
Pig 3 sp
Dog, working 20 sp
Sheep or goat 5 sp
River ferry, per passenger 5 cp
Ship passage, per expected day 2 sp
Carriage travel, per mile 2 cp
Rowboat 30 sp
Small fishing boat 200 sp
Merchant ship 5,000 sp
War galleon 50,000 sp

Hirelings and Day Labor
Item Cost/day
Bard of Small Repute 2 sp
Dragoman or Skilled Interpreter 10 sp
Elite Courtesan 100 sp
Farmer 1 sp
Guard, ordinary 2 sp
Guard, sergeant, for every ten guards 10 sp
Lawyer or Pleader 10 sp
Mage of Minor Abilities 200 sp
Mundane Physician 10 sp
Porter willing to go into the wilds 5 sp
Porter only for relatively safe roads 1 sp
Navigator 5 sp
Sage, per question answered 200 sp
Sailor 1 sp
Scribe or Clerk 3 sp
Skilled Artisan 5 sp
Unskilled Laborer 1 sp
Veteran Sellsword 10 sp
Wilderness Guide 10 sp

Services and Living Expenses
Item Cost
Impoverished lifestyle, per week 5 sp
Common lifestyle, per week 20 sp
Rich lifestyle, per week 200 sp
Noble lifestyle, per week 1,000 sp
Magical healing of wounds 10 sp/hp*
Magical curing of a disease 500 sp*
Lifting a curse or undoing magic 1,000 sp*
Casting a minor spell 250 sp*
Bribe to overlook a minor crime 10 sp
Bribe to overlook a major crime 500 sp
Bribe to overlook a capital crime 10,000 sp
Hire someone for a minor crime 50 sp
Hire someone for a major crime 1,000 sp
Hire someone for an infamous crime 25,000 sp
*/

/*
  CLASSIC
  const Abilities = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"]
  const ShortAbilities = ["STR", "DEX", "CON", "INT", "WIS", "CHA"]

const Skills = {
  "Academics" : "Intelligence",
  "Athletics" : "Dexterity",
  "Battle" : "Intelligence",
  "Boating" : "Dexterity",
  "Common Knowledge" : "Intelligence",
  "Driving" : "Dexterity",
  "Faith" : "Wisdom",
  "Fighting" : "Dexterity",
  "Gambling" : "Intelligence",
  "Healing" : "Intelligence",
  "Intimidation" : "Charisma",
  "Notice" : "Intelligence",
  "Occult" : "Intelligence",
  "Performance" : "Charisma",
  "Persuasion": "Charisma",
  "Piloting" : "Dexterity",
  "Repair" : "Intelligence",
  "Riding" : "Dexterity",
  "Science" : "Intelligence",
  "Shooting" : "Dexterity",
  "Spellcasting" : "Intelligence",
  "Stealth" : "Dexterity",
  "Survival" : "Intelligence",
  "Taunt" : "Intelligence",
  "Thievery" : "Dexterity"
}

const ClassAbility = {
  "Wizard": ["Intelligence","Constitution"],
  "Sorcerer": ["Charisma","Intelligence"],
  "Warlock": ["Wisdom","Constitution"],
  "Cleric": ["Wisdom","Charisma"],
  "Druid": ["Wisdom","Constitution"],
  "Champion": ["Strength","Wisdom"],
  "Rogue": ["Dexterity","Intelligence"],
  "Artificer": ["Intelligence","Constitution"],
  "Bard": ["Charisma","Dexterity"],
  "Fighter": ["Strength","Dexterity"],
  "Barbarian": ["Constitution","Strength"],
  "Monk": ["Dexterity","Strength"],
  "Ranger" : ["Dexterity","Constitution"]
}

  DASH
  Analyze: You observe, gather, scrutinize and study information and anticipate outcomes.
  Finesse: You employ dexterous manipulation or subtle misdirection. 
  Focus: You concentrate to accomplish a task that requires great strength of mind.
  Hunt: You navigate, carefully track targets and shoot.
  Move: You quickly shift to a new position or get out of danger. 
  Muscle: you use your force to move, overcome or wreck the obstacle in front of you.
  Sneak: You traverse skillfully and quietly.
  Sway: You influence with respect, guile, charm, or argument.
  Tinker: You understand, create, or repair complex mechanisms or organisms.

  CHARGE

  *Physique*
  Finesse
  Move 
  Muscle
  Sneak

  *Insight*
  Notice, you observe the situation and anticipate outcomes.
  Shoot, you carefully track and shoot at a target
  Study, you scrutinize details and interpret evidence.
  Tinker

  *Resolve* 
  Bond, you reassure and socialize with friends and contacts.
  Command, you compel swift obedience with skills and respect.
  Focus
  Sway   
*/

const ActionsBySave = {
  "Physique": ["Finesse", "Move", "Muscle", "Sneak"],
  "Insight": ["Notice", "Shoot", "Study", "Tinker"],
  "Resolve": ["Bond", "Command", "Focus", "Sway"]
}
const AllActions = ["Finesse", "Move", "Muscle", "Sneak", "Notice", "Shoot", "Study", "Tinker", "Bond", "Command", "Focus", "Sway"]

const ClassAdvance = {
  "Artificer": ["Tinker,Finesse,Focus", "Tinker", "Focus", "random", "Tinker", "random", "random", "Tinker", "random", "random"],
  "Barbarian": ["Muscle,Move,Shoot", "Muscle", "Move", "random", "Muscle", "random", "random", "Muscle", "random", "random"],
  "Bard": ["Sway,Command,Bond", "Sway", "Bond", "random", "Sway", "random", "random", "Sway", "random", "random"],
  "Cleric": ["Focus,Bond,Notice", "Focus", "Bond", "random", "Focus", "random", "random", "Focus", "random", "random"],
  "Fighter": ["Muscle,Shoot,Command", "Muscle", "Command", "random", "Muscle", "random", "random", "Muscle", "random", "random"],
  "Monk": ["Muscle,Move,Focus", "Move", "Muscle", "random", "Move", "random", "random", "Move", "random", "random"],
  "Ranger": ["Shoot,Move,Notice", "Shoot", "Notice", "random", "Shoot", "random", "random", "Shoot", "random", "random"],
  "Rogue": ["Sneak,Finesse,Move", "Sneak", "Move", "random", "Sneak", "random", "random", "Sneak", "random", "random"],
  "Wizard": ["Focus,Study,Tinker", "Focus", "Study", "random", "Focus", "random", "random", "Focus", "random", "random"],
}

//weapon, armor, equipment, power  
const StartingGear = {
  "Artificer": ["Equipment.Tools", "Power.Design"],
  "Barbarian": ["Weapon.Heavy Melee", "Magical.Attire"],
  "Bard": ["Equipment.Implements", "Power.Spell"],
  "Cleric": ["Armor.Medium", "Power.Blessing"],
  "Fighter": ["Weapon.Melee", "Armor.Medium"],
  "Monk": ["Power.Maneuver", "Magical.Jewelry"],
  "Ranger": ["Weapon.Ranged", "Equipment.Gear"],
  "Rogue": ["Equipment.Gear", "Magical"],
  "Wizard": ["Power.Spell", "Equipment.Implements"],
}

class Party {
  constructor(app, state={}) {
    this.app = app
    this.what = state.w = "Party"
    this.id = state.id = state.id || chance.hash()

    //save to states 
    app.game.toSave.add(this.id)
    app.game.state[this.id] = state
    app.activeState[this.id] = this

    state.coin = state.coin || 0
  }
  get state() {
    return this.app.game.state[this.id] || null
  }
  get ids() {
    return this.state.ids
  }
  get characters() {
    return this.ids.map(id=>this.app.activeState[id])
  }
  get region() {
    return this.state.loc ? this.app.activeState[this.state.loc[0]] : null
  }
  get location() {
    let site = this.region.children.find(c=>c.id == this.state.loc[1])
    return site || this.region.hex[this.state.loc[1]]
  }
  get hex () {
    return this.location.hex || this.location
  }
  get coin () {
    return this.state.coin
  }
  swap (c,to) {
    //give character their share of party coin 
    let _coin = Math.floor(this.coin / this.ids.length)
    this.state.coin -= _coin 
    c.state.coin = _coin
    //add to other party 
    to.add(c)
  }
  add(c) {
    !this.ids.includes(c.id) ? this.ids.push(c.id) : null
    let _coin = c.state.coin 
    this.state.coin += _coin 
    c.state.coin = 0 
  }
  rm(c) {
    let i = this.ids.indexOf(c.id)
    i > -1 ? this.ids.splice(i, 1) : null
  }
  moveTo(where) {
    this.state.loc = where.slice()
  }
  reward (what) {
    
  }
  async takeAction([_,act,id]) {
    //get quests 
    let Q = this.app.quests
    if (act == "moveHex") {
      //move party 
      this.state.loc[1] = id
      //trouble
      this.region.trouble()
    }
    if (act == "gather") {
      let q = Q.find(q=>q.state.where == id && q.quest.act == act)
      //complete quest
      q ? await q.complete(this) : null
      //what do they get - die roll based upon influence 
      let nd = Math.round(this.characters.reduce((max,c)=> max > c.skills.Influence ? max : c.skills.Influence,0) / 2)
      const check = chance.dicePool(nd+"d6",[5,6])
      console.log(check)
    }
    this.app.refresh()
  }
  // what actions can be taken by the party 
  get actions() {
    let loc = this.location
    let options = []
    //at a settlement 
    if(loc.what == "settlement"){
      //
      options.push(["Explore the Region","explore",loc.id],["Gather Information","gather",loc.id],["Rest & Recover","rest",loc.id])
    }

    //get neighbor hexes 
    let RH = this.region.hex
    let D = ["E","NE","NW","SE","SW","W"]
    let nh = [2,1,7,3,5,6].map((d,i)=> {
      let n = this.region._hex.neighborOf(this.hex,d, { allowOutside: false })
      return [D[i],n]
    }).filter(h=>h[1]).map(([d,h])=> [d,RH.find(rh => rh.q == h.q && rh.s == h.s)])
    //otherwise go to neighbor
    nh.forEach(([d,h])=> options.push([`Travel ${d}`, "moveHex", h.i]))
    return options
  }
  get regionUI() {
    let cList = this.characters.map(c=>c.name).join(", ")
    return _.html`
    <div class="dropdown mv1">
      <div class="b tc pointer dim bg-lightest-blue br2 pa1">${cList}</div>
      <div class="dropdown-content bg-white ba bw1 pa1">
        ${this.actions.map(a=>_.html`<div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>this.takeAction(a)}>${a[0]}</div>`)}
      </div>
    </div>`
  }
}

const STATS = ["Might", "Dexterity", "Awareness", "Logic", "Presence", "Luck"]
const RANDOMSTATS = [555443, 555532, 65443, 655432, 664333, 664432, 665322, 744442, 744433, 754332, 755222, 764222]
const KEYSTATS = {
  Alchemist: "Logic",
  Barbarian: "Might",
  Bard: "Presence",
  Cypher: "Logic",
  Dancer: "Dexterity",
  Druid: "Awareness",
  Fighter: "Might/Dexterity",
  Gunslinger: "Awareness",
  Hunter: "Awareness",
  Luminary: "Awareness",
  Magus: "Logic",
  Pugilist: "Might",
  Revelator: "Might",
  Rogue: "Dexterity",
  Sorcerer: "Presence",
  Vanguard: "Might",
  Witch: "Awareness",
  Wizard: "Logic"
}
const SKILLS = {
  "Might" : ["Brawn","Melee"],
  "Dexterity" : ["Finesse","Sneak"],
  "Awareness" : ["Detect","Mysticism","Survival","Vibe","Ranged"],
  "Logic" : ["Arcana","Craft","Examine","Lore","Medicine"],
  "Presence" : ["Influence","Performance"]
}
const SKILLSBYCLASS = {
  Alchemist: [["Ranged","Craft"],3,["Arcana","Examine","Lore","Medicine","Survival"]],
  Barbarian: [["Melee","Brawn"],2,["Detect","Influence","Mysticism","Survival","Vibe"]],
  Bard: [["Performance"],3,["Brawn","Melee","Finesse","Sneak","Detect","Mysticism","Survival","Vibe","Ranged","Arcana","Craft","Examine","Lore","Medicine","Influence"]],
  Cypher: [["Melee","Lore"],3,["Arcana","Craft","Examine","Medicine","Mysticism","Vibe"]],
  Dancer: [["Finesse","Performance"],2,["Brawn","Influence","Sneak","Vibe"]],
  Druid: [["Melee","Mysticism"],2,["Brawn","Craft","Detect","Lore","Medicine","Survival","Vibe"]],
  Fighter: [["Melee","Ranged","Brawn/Finesse"],2,["Brawn","Detect","Finesse","Sneak","Vibe"]],
  Gunslinger: [["Ranged","Detect"],2,["Brawn","Examine","Finesse","Influence","Sneak","Survival","Vibe"]],
  Hunter: [["Ranged","Survival"],3,["Brawn","Craft","Detect","Examine","Finesse","Lore","Medicine","Mysticism","Sneak","Vibe"]],
  Luminary: [["Mysticism","Melee"],2,["Brawn","Craft","Detect","Examine","Influence","Lore","Medicine","Vibe"]],
  Magus: [["Melee","Arcana"],2,["Brawn","Detect","Examine","Finesse","Influence","Mysticism","Sneak","Vibe"]],
  Pugilist: [["Brawn"],2,["Detect","Examine","Finesse","Influence","Medicine","Sneak","Vibe"]],
  Revelator: [["Melee","Influence"],2,["Brawn","Detect","Mysticism","Vibe"]],
  Rogue: [["Ranged","Finesse","Sneak"],2,["Brawn","Melee","Finesse","Sneak","Detect","Mysticism","Survival","Vibe","Ranged","Arcana","Craft","Examine","Lore","Medicine","Influence"]],
  Sorcerer: [["Influence"],2,["Arcana","Brawn","Lore","Mysticism","Performance","Vibe"]],
  Vanguard: [["Melee","Brawn"],2,["Detect","Influence","Medicine","Survival","Vibe"]],
  Witch: [["Mysticism"],2,["Arcana","Craft","Examine","Influence","Lore","Medicine","Survival","Vibe"]],
  Wizard: [["Arcana"],3,["Craft","Detect","Examine","Lore","Mysticism","Vibe"]]
}

class Character {
  constructor(app, state={}) {
    this.app = app
    this.what = state.w = "Character"

    this._state = state
    let id = this.id = state.id = state.id || chance.hash()

    state.xp = state.xp || 0
    state.supply = state.supply || 6
    state.inventory = state.inventory || new Map()

    //establish for generation
    let RNG = new Chance(id)

    //name 
    this.name = RNG.firstName()

    //get people and classes 
    let base = app.gen.Encounter({
      id,
      what: RNG.pickone(["People", "Folk"]),
      adventurer: "random"
    })

    this.advClass = base.adventurer[0]
    this.people = base.data[2]
    this._tags = base.tags.slice()

    //get random stat array 
    let _stats = RNG.pickone(RANDOMSTATS).toString().split('').map(Number)
    //prime stats from classes 
    let primeStat = RNG.pickone(KEYSTATS[base.adventurer[0]].split("/"))
    let maxStat = _stats[0]
    //get stats 
    _stats = RNG.shuffle(_stats)
    //swap stats for max 
    let j = _stats.indexOf(maxStat)
    let moveTo = STATS.indexOf(primeStat)
    let valAt = _stats[moveTo]
    _stats[moveTo] = maxStat
    _stats[j] = valAt
    //finished with stats 
    state.stats = state.stats || _stats
    //create stamina
    state.stamina = state.stamina || Math.floor(3+(state.stats[0]+state.stats[4])/2)

    //skills 
    let sbc = SKILLSBYCLASS[this.advClass]
    let _skills = sbc[0].map(s=> RNG.pickone(s.split("/")))
    let ts = _skills.length+sbc[1]
    while (_skills.length < ts) {
      let ns = RNG.pickone(sbc[2])
      _skills.includes(ns) ? null : _skills.push(ns)
    }
    
    state.skills = state.skills || _skills 
  }

  /*
    Simple get functions for view 
  */
  get state() {
    return this.app.game.state[this.id] ? this.app.game.state[this.id] : this._state
  }

  get level() {
    let _xp = this.state.xp
    return 1 + Math.floor(Math.log10(_xp))
  }

  get inventory() {
    //equipped 
    let magic = this.state.magic
    let gen = this.app.gen
    let mayOffload = this.allies.length > 0

    return this.state.inventory.filter(item=>item[1] != "NPC").map(d=>{
      let item = new Gear.Item(d)
      item.isKnown = this.app.game.known.has(d[0])
      //if power 
      item.options = !this.isHired ? null : "Power,Magical".includes(item.base) ? !magic.has(item.id) ? ["Bond"] : null : null
      item.maySell = magic.has(item.id) ? false : true

      return item
    }
    )
  }

  //stats and skills 
  get stats () {
    let _stats = this.state.stats 
    return Object.fromEntries(STATS.map((s,i)=> [s,_stats[i]]))
  }
  
  get skills () {
    let stats = this.stats 
    let _skills = this.state.skills
    return Object.fromEntries(Object.entries(SKILLS).map(([s,skills])=> {
      return skills.map(skill => [skill,_skills.includes(skill) ? 2*stats[s] : stats[s]])
    }).flat())
  }

  get saves () {
    let stats = this.stats 
    return {
      "Dodge" : stats.Dexterity+stats.Awareness,
      "Endure" : stats.Might*2,
      "Will" : stats.Presence+stats.Logic
    }
  }

  /////

  get toUnbond() {
    let magic = this.state.magic
    let coin = this.state.coin
    return coin < 10 ? [] : this.inventory.filter(item=>magic.has(item.id))
  }

  get allies() {
    let coin = this.state.coin
    let E = this.app.gen.Encounter

    return this.state.inventory.filter(item=>item[1] == "NPC").map(d=>{
      let npc = E()
      npc.data = d
      npc.options = ["Let Go"]
      if (coin >= npc.price) {
        npc.options.unshift("Add Month " + npc.price + "g")
      }

      return npc
    }
    )
  }

  get health() {
    return this.state.health[0]
  }

  set coin(d) {
    return this.state.coin += d
    //save 
    this.app.save("characters", this.id)
  }

  get coin() {
    return this.state.coin
  }

  get load() {
    let {Bond, Command, Muscle} = this.actions
    let items = this.inventory
    let allies = this.allies

    let _load = items.reduce((sum,item)=>sum + item.enc, 0)
    let allyLoad = allies.reduce((sum,a)=>sum + a.load, 0)
    let maxLoad = 8 + 2 * Muscle[0]
    let maxAllies = 1 + Math.max(0, Bond[0], Command[0])

    return {
      items: [_load, allyLoad + maxLoad],
      allies: [allies.length, maxAllies]
    }
  }

  get mayAct() {
    return this.state.action < this.app.game.time && this.isHired
  }

  /*
    Location 
  */
  get region() {
    return this.party.region
  }

  get location() {
    return this.party.location
  }

  /*
    Marktplace Actions / Buying 
  */

  mayBuy(what, cost) {
    let coin = this.state.coin
    let[c,max] = what == "item" ? this.load.items : this.load.allies

    return c < max && coin > cost
  }

  marketBuy(item, rid) {
    //reduce coin 
    this.state.coin -= item.mPrice
    //add 
    let data = item.data.slice()
    if (data[1] == "NPC") {
      //hired for a month 
      data[6] = this.app.game.time + 30
    }
    //add to known and inventory
    if ('Power,Magical'.includes(data[1])) {
      this.app.game.known.add(data[0])
    }
    this.state.inventory.push(data)
    //reduce qty in region market by pushing to bought 
    let bid = Hash([rid, data[1] == "NPC" ? item.id : item.text])
    this.app.game.bought[bid] = this.app.game.bought[bid] ? this.app.game.bought[bid] + 1 : 1
    //save and refresh 
    this.app.save("characters", this.id)
    this.app.notify(`${this.name} has bought ${item.text}`)
  }

  marketSell(item, val) {
    //remove from inventory
    let i = this.state.inventory.map(item=>item[0]).indexOf(item.id)
    this.state.inventory.splice(i, 1)
    //give coin
    this.state.coin += val
    //save and refresh 
    this.app.save("characters", this.id)
    this.app.notify(`Sold ${item.text} for ${val}g`)
  }

  /*
    Cost, Hiring, Activate  
  */
  activate() {
    this.app.game.toSave.add(this.id)
    this.app.game.state[this.id] = this.state
    this.app.activeState[this.id] = this
  }

  get cost() {
    return Cost[this.level - 1]
  }

  get isHired() {
    return this.app.game.characters.has(this.id)
  }

  get mayHire() {
    let {fame, characters} = this.app.game
    let _fame = fame.slice()
    //get characters at rank and reduce fame 
    characters.forEach((atR,id)=>_fame[Math.floor(this.app.characters[id].level / 2)]--)
    //determine fame rank for explorer  
    let reqFameRank = Math.floor(this.level / 2)

    //allowed to have more 0 level explorers 
    return _fame[reqFameRank] > (reqFameRank == 0 ? -3 : 0) && !this.isHired
  }

  hire() {
    let game = this.app.game
    //hire 
    this.state.hired = game.time
    //remove from explorer roster 
    game.explorers.delete(this.id)
    //save and refresh 
    this.app.save("characters", this.id)
  }

  /*
    Party 
  */
  startParty() {
    let P = new Party(this.app,{
      ids: [this.id]
    })
    return P.id
  }

  get party() {
    return Object.values(this.app.activeState).find(p=>p.ids && p.ids.includes(this.id))
  }

  /*
    Values for action / save display 
  */

  get saves() {
    let _act = this.actions
    return Object.fromEntries(Object.entries(ActionsBySave).map((([save,acts])=>{
      let val = acts.reduce((sum,a)=>sum + (_act[a][0] > 0 ? 1 : 0), 0)
      return [save, [val, DieRank[val]]]
    }
    )))
  }

  get actions() {
    let lv = this.level
    let _act = this._actions = {}
    let RNG = new Chance(this.id)

    //always 4 random action advances 
    RNG.shuffle(AllActions).slice(0, 4).forEach(a=>_act[a] = _act[a] ? _act[a] + 1 : 1)

    //write actions based upon level advances 
    ClassAdvance[this._adv].slice(0, lv).forEach(adv=>{
      adv.split(",").forEach(a=>{
        a = a == "random" ? RNG.pickone(AllActions) : a
        _act[a] = _act[a] ? _act[a] + 1 : 1
      }
      )
    }
    )

    return Object.fromEntries(AllActions.map(a=>{
      let val = (this._actions[a] || 0)
      return [a, [val, DieRank[val]]]
    }
    ))
  }

  get actionsBySave() {
    return Object.values(ActionsBySave).map((list,i)=>list.map(a=>[a, this.actions[a]]))
  }

  /*
    Exploration Functions 
  */

  //what inventory may be added during an exploration 
  get exploreInventory() {
    let {exp, where, oppAct, opp, act} = this.explore
    let {cohesion, challenge, focus, rank} = exp

    let spell = ""
    this.explore.support.forEach((item,id)=>item.data[2] == "Spell" ? spell = "Spell" : null)

    let maySupport = {}
      , mayTakeDamage = {};

    //get allies with action skill 
    let allies = this.allies.forEach(a=>{
      if (a.trade.skills.includes(act)) {
        maySupport[a.id] = a
      }
      //all allies can take damage 
      mayTakeDamage[a.id] = a
    }
    )
    //get items with action 
    let items = this.inventory.forEach(item=>{
      if (item.options !== null) {
        return
      }

      let ic = item.challenge
      if ([challenge, act, focus, spell].join().includes(ic)) {
        maySupport[item.id] = item
      }
      if (item.data[1] == "Armor" && 'Trap,Thieves,Melee,Firefight,Precarious'.includes(focus)) {
        mayTakeDamage[item.id] = item
      }
    }
    )

    return {
      maySupport,
      mayTakeDamage
    }
  }

  //what is a map of id => damage 
  takeDamage(what) {
    //what inventory an be added to explore 
    let {mayTakeDamage} = this.exploreInventory
    what.forEach(id=>{}
    )
  }

  markUse(items) {
    let marks = 'Gear,Implements,Tools,Weapon,Essence'
    let destroys = 'Documents,Contact'
    let i = this.state.inventory.map(item=>item.id)

    items.forEach(item=>{
      let what = item.what
      let r = marks.includes(what) ? RandBetween(1, item.usage) : 99
      //remove as necissary 
      //this.state.inventory.splice(i.indexOf(item.id), 1)
    }
    )
  }

  /*
    Take action 
  */
  takeAction(act, d) {
    if (act == "View Market") {
      this.app.updateState("dialog", ["areas", this.location.region.id, "marketUI", this.id].join("."))
    } else if (act == "transferCoin") {
      this.app.game.coin -= d
      this.state.coin += d
      //save and refresh 
      this.app.save("characters", this.id)
      this.app.notify(`You have transferred ${d}g to ${this.name}`)
    } else if (act == "UsePortal") {
      let rid = d.location.id
      let sid = d.location.lookup("settlement")[0].id
      //move there 
      this.state.location = [rid, sid]
      //save & update stae 
      this.app.save("characters", this.id)
      this.app.updateState("dialog", "")
      this.app.show = ["areas", rid].join(".")
      this.app.notify(`${this.name} has used the portal to ${d.location.name}`)
    } else if (act == "Move") {
      let to = d
      //set location 
      this.state.location[1] = to.what == "portal" ? 0 : to.id
      //time to move 
      let time = 1
      this.state.action += time
      //save and refresh 
      this.app.updateState("dialog", "")
      this.app.save("characters", this.id)
    }//establish exploration 
    else if (act == "Explore") {
      let time = 'settlement,dungeon'.includes(d.what) ? 0.125 : 1
      let exp = this.location.region.explore(d)
      this.explore = {
        where: d,
        exp,
        oppAct: exp.actions,
        opp: exp.dice,
        act: "",
        support: new Map(),
        takeDamage: new Map(),
        roll: []
      }
      this.app.updateState("dialog", ["characters", this.id, "ExploreUI"].join("."))
      console.log(time, this.explore)
    } else if (act == "learnDark") {
      //reduce coin 
      this.state.coin -= 5
      //pick id 
      let kid = chance.pickone(d)
      this.app.game.known.add(kid)
      //save and refresh 
      this.app.save("characters", this.id)

      let _what = this.location.region.children.find(c=>c.id == kid)
      this.app.notify(`You have been told of a... ${_what.text}`)
    } else if (act == "Bond") {
      this.state.magic.add(d.id)
      //save and refresh 
      this.app.save("characters", this.id)
    } else if (act == "unbond") {
      //reduce coin 
      this.state.coin -= 10
      //get d and remove from bound magic
      this.state.magic.delete(d.id)
      //save and refresh 
      this.app.save("characters", this.id)
    } else if (act.includes("Add Month")) {
      //pay price 
      let cost = d.price
      this.state.coin -= cost
      //increase time 
      let item = this.state.inventory.find(_item=>_item[0] == d.id)
      item[6] += 30
      //save and refresh 
      this.app.save("characters", this.id)
    } else if (act == "Let Go") {
      let i = this.state.inventory.map(item=>item[0]).indexOf(d.id)
      this.state.inventory.splice(i, 1)
      //save and refresh 
      this.app.save("characters", this.id)
    }
  }

  applyMods() {}

  /*
    Save and Load 
  */

  save() {
    let data = {
      gen: "Explorer",
      opts: this.opts,
      state: this.state
    }
    DB.setItem(this.id, data)
  }

  static async load(app, id) {
    //load state 
    let {opts, state} = await DB.getItem(id)
    opts.id = id
    //create new explorer and apply state 
    let E = new Explorer(app,opts)
    Object.assign(E.state, state)
    E.applyMods()

    return E
  }

  /*
    UI
  */

  get ExploreUI() {
    return ExploreUI(this)
  }

  get RegionOptionsUI() {
    let html = this.app.html
    let {region, atFeature} = this.location
    let {isKnown} = region.view()

    //core options 
    let options = [["Explore", "Explore", atFeature]]
    //add market 
    if (atFeature.what == "settlement") {
      options.push(["View Market", "View Market", atFeature])
    }
    //add moves 
    region.children.forEach(c=>{
      if (c.text != atFeature.text && isKnown.includes(c.id) && !"people".includes(c.what)) {
        options.push(["Move", "Move to " + c.text, c])
      }
    }
    )
    //handle portal moves 
    if (atFeature.what == "portal") {
      options.push(["UsePortal", "Use the Portal to " + region.portal.short, region.portal])
    } else {
      options.push(["Move", "Move to Portal", region.portal])
    }

    //options in a top down button array 
    return html`
    <div class="fr pointer dim underline-hover hover-red bg-gray br2 white b pa1" onClick=${()=>this.app.updateState("dialog", "")}>X</div>
    <div style="width:600px">
      <h3 class="ma0 mb1">${this.name} Options</h3>
      <div class="mh5">
        ${options.map(o=>html`<div class="pointer tc b bg-light-gray br2 underline-hover mv1 pa2" onClick=${()=>this.takeAction(o[0], o[2])}>${o[1]}</div>`)}
      </div>
    </div>`
  }

  get UI() {
    let {app, inventory, allies, load, isHired} = this
    let {html, game} = app
    let {characters, explorers} = game

    const Allies = ()=>html`
    <div class="flex justify-between">
      <div class="f5 b">Allies</div>
      <div><b>Max</b> ${load.allies[1]}</div>
    </div>
    <div class="ph2">${allies.sort((a,b)=>a.data[2].localeCompare(b.data[2])).map(a=>html`
      <div class="dropdown">
        <div class="pointer link blue underline-hover">${a.text} (${a.timeRemain(game.time)} days)</div>
        <div class="dropdown-content bg-white ba bw1 pa1">
          ${a.options.map(o=>html`<div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>this.takeAction(o, a)}>${o}</div>`)}
        </div>
      </div>`)}
    </div>`

    return html`
  <div class="bg-white-70 br2 mw6 ma1 pa1">
    <div class="flex flex-wrap justify-between">
      <h3 class="ma0 mv1">${this.name}</h3>
      ${this.mayHire ? html`<div class="pointer b white underline-hover br1 pa1 bg-light-blue" onClick=${()=>this.hire()}>Hire</div>` : isHired ? "" : html`<span class="b i">Need More Fame</span>`}
    </div>
    <div class="ph1">
      <div>${this.people.short}</div>
      <div>LV: ${this.level} ${this.advClass}</div>
      <div class="flex justify-center">
        ${Object.entries(this.saves).map(([save,val],i)=>html`
        <div class="mh2">
          <div class="f4"><b>${save}</b> ${val[1]}</div>
          ${this.actionsBySave[i].map(a=>html`<div><b>${a[0]}</b> ${a[1][1]}</div>`)}
        </div>`)}
      </div>
      <div><b>Location:</b> <span class="link pointer dim underline-hover blue mh1" onClick=${()=>app.show = ["areas", this.location.region.id].join(".")}>${this.location.region.parent.name}, ${this.location.region.name}</span></div>
      <div class="flex justify-between">
        <div class="f5 b">Inventory</div>
        <div><b>Load</b> ${load.items.join("|")}</div>
      </div>
      <div class="ph2">${inventory.sort((a,b)=>a.text.localeCompare(b.text)).map(item=>html`
        <div class="flex justify-between">
          ${item.options ? html`
          <div class="dropdown">
            <div class="pointer link blue underline-hover">${item.text}</div>
            <div class="dropdown-content bg-white ba bw1 pa1">
              ${item.options.map(o=>html`<div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>this.takeAction(o, item)}>${o}</div>`)}
            </div>
          </div>` : html`<div>${item.text}</div>`}
        </div>`)}
      </div>
      ${allies.length > 0 ? Allies() : ""}
    </div>
  </div>
  `
  }
}

export {Character, Party}
