import*as Setting from "../setting.js"
import {Plane} from "./plate.js"
export {Plane}

class StrandFaction {
  constructor(orbital,id, i, state) {
    this.app = orbital.app 
    this.orbital = orbital 
    
    let RNG = new Chance(["Cosmic Strand", id, i].join("."))
    
    this._faction = id
    this.i = i

    this._nations =[...this.orbital.factions[this._faction].nations].map(id => plates.find(p=>p.i == id)).filter(p=> p.factions.filter(f=> f._super==this.i).length>0).map(n=>n.i)
    this._settlements =[...this.orbital.factions[this._faction].settlements].map(id => plates.find(p=>p.i == id)).filter(p=> p.settlements.filter(f=> f._super==this.i).length>0).map(n=>n.i)

    let {alignment,govern} = this.faction
    //create alignment 
    this.alignment = RNG.pickone(alignment.split(","))

    if(i == 0){
      this.fullName = "Independent"
      return
    }
    
    //copy data 
    let d = ['diplomacy','form','formName','fullName','name']
    d.forEach(k => this[k] = state[k])

    //govt 
    let govt = RNG.weightedString(govern)
    govt = govt == "None" ? "Monarchy" : govt
    let g2 = FactionGovt[govt] ? RNG.weightedString(FactionGovt[govt]) : govt
    //see if govt alread exists in state and handle change 
    if (this.form != govt) {
      this.form = govt
      this.formName = g2
      this.fullName = `${this.formName} of ${this.name}`
    }

    //tier 
    this.tier = RNG.weighted([1,2,3,4,5],[15,20,15,10,5]) 
      //RNG.shuffle([[3, 2, 1], [5, 4, 2], [7, 6, 3]][r].map(v=>RNG.bool() ? v + 1 : v))
  }
  get faction() {
    return Setting.Factions[this._faction]
  }
  get nations () {
    return
  }
  get settlements () {
    return
  }
}

/*
  Safety and Alignment 
*/
const AligmentDiplomacyIndex = ["lawful","good","neutral","evil","chaotic"]
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

const Safety = (RNG=chance,opts={})=>{
  let {base="neutral", alignment, isState=false} = opts
  //based of parent alignment
  let _alignment = RNG.weighted(...Aligment[base])
  _alignment = alignment ? alignment : _alignment
  //safety roll mod by alignment
  const sR = RNG.d12() + AligmentMod[_alignment]
  let _safety = sR <= 1 ? 3 : sR <= 3 ? 2 : sR <= 9 ? 1 : 0
  _safety = _.clamp(_safety, 0, 3)
  const safety = SAFETY[_safety]

  return {
    alignment: _alignment,
    _safety,
    safety
  }
}

/*
  Create the Base Orbital from factions 
*/
const Heightmaps = 'lowIsland,continents,archipelago,mediterranean,peninsula,pangea,isthmus,shattered,oldWorld,fractious,manyIslands/5,15,15,5,5,5,5,15,15,5,10'
const Topography = {
  'lowIsland': 'Island',
  'continents': 'Continents',
  'archipelago': "Archipelago",
  'mediterranean': 'Central Sea',
  'peninsula' : "Peninsula",
  'pangea': 'Continents',
  'isthmus': "Isthmus",
  'shattered': 'Continents',
  'oldWorld': 'Continents',
  'fractious': "Fractured",
  'manyIslands': "Archipelago"
}
//determine globe placement  - size,lattitude
const ClimateProbability = 'sub-arctic,temperate,sub-tropical,tropical,sub-tropic-temperate,temperate-sub-tropic,temperate-sub-arctic,sub-arctic-temperate,sweep-up,sweep-down/10,20,20,10,9,9,9,9,2,2'
const PrecipProbability = 'wet,rainy,standard,arid,desert/10,25,45,25,5'
//Government Types 
const FactionGovt = {
  Monarchy: "Kingdom,Tsardom,Duchy,Shogunate/3,1,2,1",
  Republic: "Republic,Federation/2,1",
  Union: "Union,League,Confederation,United Republic,United Provinces,Commonwealth/3,2,1,1,2,2",
  Theocracy: "Theocracy,Holy State/20,2",
  Anarchy: "Free Territory,Free Cities,Council,Community/3,2,2,1",
  None: "Outlands,Wilds/1,1"
}

/*
  Main data exports to be used by others 
*/

export let plates = []
  , factions = {};

/*
  Orbital Class 
*/

class Orbital {
  constructor() {
    let RNG = new Chance("Cosmic Strand")
    this.seed = RNG.hash()

    //add culture to a plate based on a faction
    const addCulture = (id,superId,opts={})=>{
      let {alignment, allies, govern, stateP} = Setting.Factions[id]
      //create alignment 
      let _align = RNG.pickone(alignment.split(","))
      //allies 
      let allyAlign = allies == "" ? [] : allies == "same" ? [_align] : allies.split(",")
      let possilbeAlly = Object.entries(Setting.Factions).filter(([aid,e])=>e.alignment.split(",").reduce((allowed,ca)=>allowed ? true : allyAlign.includes(ca) && e.allies.includes(_align), false)).map(([aid,e])=>aid)
      let pop = [RNG.randBetween(1, 35), RNG.randBetween(1, 10)]
      //govt 
      let govt = RNG.weightedString(govern)
      //safety of state 
      let {_safety, safety} = Safety(RNG, {
        isState: true,
        alignment: _align
      })
      //super state 
      let sp = stateP.split(",").map(Number)
      let _super = RNG.likely(sp[0]) ? (superId == -1 ? RNG.weighted(_.fromN(sp.length - 1, j=>j + 1), sp.slice(1)) : superId) : 0
      //push faction and second ally 
      return {
        id,
        alignment: _align,
        govt: [govt, FactionGovt[govt] ? RNG.weightedString(FactionGovt[govt]) : govt],
        pop,
        second: possilbeAlly.length == 0 ? null : RNG.pickone(possilbeAlly),
        safety,
        _safety,
        _super
      }
    }

    let bT = this.byTemplate = {}

    plates = _.fromN(777, _i=>{
      let i = _i + 1
      let heightmap = RNG.weightedString(Heightmaps)
      bT[heightmap] ? bT[heightmap].push(i) : bT[heightmap] = [i]

      //generate settlements 
      let settlements = _.fromN(RNG.randBetween(3, 6), j=>this.randomFaction(RNG)).map(id=>{
        return Object.assign(addCulture(id, -1), {
          govt: RNG.pickone([["None", "Outlands"], ["Anarchy", "Free Cities"]])
        })
      }
      )

      return {
        i,
        seed: RNG.hash(),
        factions: [],
        precip: RNG.weightedString(PrecipProbability),
        climate: RNG.weightedString(ClimateProbability),
        heightmap,
        home: false,
        settlements
      }
    }
    )

    //reset 
    RNG = new Chance("Cosmic Strand Factions")

    let empty = RNG.shuffle(_.fromN(777, i=>i + 1))
    let populated = new Set()

    //run through factions 
    Object.entries(Setting.Factions).forEach(([id,F])=>{
      RNG = new Chance("Cosmic Strand Factions " + id)

      let {n, pnew, superState, stateP} = F
      factions[id] = {
        nations : new Set(),
        settlements : new Set()
      }
      let f = factions[id].nations

      //get plate ids 
      let pids = _.fromN(n, j=>{
        //pick plane 
        let pid = typeof pnew === "number" ? RNG.likely(pnew * 100) ? empty.shift() : RNG.pickone([...populated]) : RNG.pickone([...factions[pnew].nations])
        f.add(pid)
        populated.add(pid)

        //determine Strand super-state for the plate 
        let sp = stateP.split(",").map(Number)
        let _super = superState == 0 ? 0 : RNG.weighted(_.fromN(superState, j=>j + 1), sp.slice(1))

        //has the faction split into multiple cultures?
        let split = RNG.weighted([1, 2, 3, 4], [45, 30, 15, 5])
        let _p = plates.find(p=>p.i == pid)
        _p.factions.push(..._.fromN(split, ()=>addCulture(id, _super)))
        _p.home = true
        delete _p.settlements
      }
      )

    }
    )

    RNG = new Chance("Cosmic Strand Named Plates")
    //loop through and apply data  
    Setting.Plates.forEach(p=>{
      let _p = plates.find(_p=>_p.i == p.i)
      _p.factions = p.setFactions ? p.setFactions.map(f=>addCulture(f.id, -1, f)) : _p.factions
    }
    )

    RNG = new Chance("Cosmic Strand Settlements")
    //loop through and track settlements 
    plates.forEach(p=>{      
      if (populated.has(p.i)) {
        //diplomacy
        p.factions.forEach((f,i)=> f._diplomacy = f._super > 0 ? null : p.factions.map((ds,j)=> i == j ? "self" : RNG.weightedString(Setting.Diplomacy.general[f.alignment][AligmentDiplomacyIndex.indexOf(ds.alignment)])))
        return;
      }

      p.settlements.forEach((s,i)=>{
        factions[s.id].settlements.add(p.i)
        //diplomacy
        s._diplomacy = s._super > 0 ? null : p.settlements.map((ds,j)=> i == j ? "self" : RNG.weightedString(Setting.Diplomacy.general[s.alignment][AligmentDiplomacyIndex.indexOf(ds.alignment)]))
      })
    }
    )    

    //UI 
    this.select = {
      id: 1,
      patron : "",
      mission : {
        text:""
      }
    }
  }
  //set super states, called after load 
  setSuperStates(app) {
    this.app = app
    //generate fake map to create super state factions 
    let azgaar = {
      seed: this.seed,
      w: 4000,
      h: 4000,
      prec: "wet",
      template: "shattered",
      size: 10,
      latitude: 38,
      cultures: Setting.nSuperStates,
      states: Setting.nSuperStates
    }
    //fake super faction map
    app.gen.Azgaar.generate(azgaar).then(({pack, grid})=>{
      let RNG = new Chance(this.seed)
      let i = 0
        , _states = pack.states.slice(1)
        , states = [];
      Object.entries(Setting.Factions).forEach(([id,F])=>{
        let {n,superState} = F
        let ns = n==0 && superState==0 ? 0 : superState+1
        //loop through each Faction for super states and generate govt.
        _.fromN(ns, (sid)=>{
          states.push(new StrandFaction(this,id,sid,_states[i]))
          //match to super state 
          i = sid != 0 ? i+1 : i 
        }
        )
      }
      )
      //set states 
      this.states = states
      
      //Diplomacy 
      this.states.forEach((s,i)=> {
        s.si = i 
        s.diplomacy = this.states.map((ds,j)=> (s.i == 0 || ds.i == 0) ? "X" : i == j ? "self" : RNG.weightedString(Setting.Diplomacy.general[s.alignment][AligmentDiplomacyIndex.indexOf(ds.alignment)]))
      })
      
      console.log(this)
    }
    )
  }
  //generate random faction based upon expansionism 
  randomFaction(RNG) {
    let idWeights = Object.entries(Setting.Factions).map(([key,data])=>[key, data.expand]).filter(d=>d[1] > 0)
    return RNG.weighted(idWeights.map(d=>d[0]), idWeights.map(d=>d[1]))
  }
  //factions and the home plates 
  get factions() {
    return Object.fromEntries(Object.entries(factions).map(([id,data])=>{
      data.states = (this.states || []).filter(s=>s._faction == id)
      return [id, data]
    }
    ))
  }
  get plates() {
    let named = Setting.Plates.map(p=>p.i)
    let all = plates.map(p=>Object.assign(Object.assign(p, Setting.Plates.find(sp=>sp.i == p.i) || {}), {
      topo: Topography[p.heightmap]
    }))
    let populated = all.filter(p=>p.factions.length > 0)

    return {
      all,
      populated,
      active: populated.filter(p=>p.factions.length > 3),
      trouble: populated.filter(p=>!p.factions.reduce((t,f)=>t || ["neutral", "good", "lawful"].includes(f.alignment), false)),
      empty: all.filter(p=>p.factions.length == 0)
    }
  }
  get platesByTopography() {
    let topo = {}
    this.plates.all.forEach(p=>{
      let _t = Topography[p.heightmap]
      topo[_t] ? topo[_t].push(p.i) : topo[_t] = [p.i]
    }
    )
    return topo
  }
}
//export created orbital 
export const Strand = new Orbital()
