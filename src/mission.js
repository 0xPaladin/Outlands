import*as Setting from "./setting.js"
import {Naming} from './site.js'

const POI = {
  "Wilderness":'Depot,Stronghold,Mine,Facility,Industrial Complex',
  "Architect Ruin":'Archive,Facility,Depot,Stronghold,Mine,Factory,Settlement',
  "Oddity":'Archive,Facility,Factory,Stronghold',
  "POI" : 'Archive,Facility,Depot,Stronghold,Mine,Factory,Settlement,Industrial Complex'
}

const PRIMARY = ["Clean Sweep", "Target Defense", "Retrieval", "Investigation", "Area Search", "Delivery", "Assassination", "Take Ground"]
const SECONDARY = ["Interrogate", "Safeguard", "Capture", "Sabotage", "Scavenge", "Escort", "Gather Intel", "Snatch and Grab", "Tear It Down"]

const TARGETWEIGHTS = {
  "enemy" : 1,
  "rival" : 0.5,
  "neutral" : 0.25
}

const DIFFICULTY = ["Normal",'Challenging','Hard','Very Hard']

export const Mission = (patron) => {
  let {orbital,diplomacy,app} = patron
  let ti = diplomacy.map((d,i)=>i).filter(i=> ["enemy","rival"].includes(diplomacy[i]))
  let target = orbital.states[chance.pickone(ti)]

  //target plate 
  let _plate = chance.pickone(target._nations.concat(target._settlements,patron._nations,patron._settlements))
  let pset = app.state.selection.get("plate-filter") || ["All","All","All",_plate]
  pset[3] = _plate
  let isLocal = patron._nations.concat(patron._settlements).includes(_plate)

  //location
  let loc = chance.pickone(["Wilderness","POI","Architect Ruin","Oddity"])
  let poi = chance.pickone(POI[loc].split(","))

  //goals 
  let goals = [chance.pickone(PRIMARY),chance.pickone(SECONDARY)]

  //difficulty
  let diff = chance.weighted([0,1,2,3],[5,3.5,1,0.5])

  let name = Naming.dungeon(chance)

  let res = {
    goals,
    patron,
    target,
    plate : orbital.plates.all.find(p=> p.i==_plate),
    pset,
    loc,
    poi,
    diff,
    get text () {
      let {loc,poi,pset,goals,diff,plate} = this 
      let _loc = `${loc}, ${poi}`
      return _.html`
      <div class="ba br2 pa1">
        <div><b>Target:</b> ${this.target._faction}</div>
        <div class="pointer underline-hover" onClick=${()=>app.state.selection.set("plate-filter", pset)}><b>Location:</b> Plate #${plate.i}, ${_loc}</div>
        <div><b>Objectives:</b> ${goals[0]}/${goals[1]}</div>
        <div><b>Difficulty:</b> ${DIFFICULTY[diff]}</div>
      </div>`
    }
  }
  
  console.log(res)
  return res 
}