const Difficulty = (RNG=chance)=>RNG.weighted([0, 1, 2, 3, 4], [30, 35, 23, 10, 2])

/*
  Use Honeycomb for Hex tools 
*/
import {HexFromIds} from "./hex.js"

/*
  Hex layout
*/
const Neighboors = [[1, -1], [1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1]]
//create a random grid based a walk, trying to pick the last chosen id 
const RandomWalk = (seed=chance.integer(),n)=>{
  const RNG = new Chance(seed)
  n = n || 10 + SumDice('2d20', RNG)

  const ids = ["0.0"]
  let last = "0.0"
    , i = 0;

  while (ids.length < n) {
    let use = i < 3 ? last : RNG.pickone(ids)
    //pick Neighboor 
    const _N = RNG.pickone(Neighboors)
    //pick hex - split to xy and then add Neighboor 
    const qr = use.split(".").map((v,j)=>Number(v) + _N[j]).join(".")
    //check if exists 
    if (!ids.includes(qr)) {
      //if not push to ids and set to last 
      ids.push(qr)
      i = 0
      last = qr
    }
    i++
  }

  return ids
}

class Area {
  constructor (app, state = {}) {
    this.app = app  

    this.class = ["area"]
    this.children = []
    
    //establish id 
    this.id = state.id = state.id || chance.hash()

    //state - object only 
    app.game.state[this.id] = state
    //active - class 
    this.app.activeState[this.id] = this 
  }

  get state () {
    return this.app.game.state[this.id] ? this.app.game.state[this.id] : this._state || null 
  }

  get parent () {
    return this.state.parent ? this.app.activeState[this.state.parent] : null
  }

  get name() {
    return this.state.name ? this.state.name : this._name || ""
  }

  //calculate trouble 
  trouble (party,from) {
    //use the safety of the area 
    let s = this._safety ? 4 - this._safety : 2 
    //keep half  
    let nt = _.fromN(s,()=>chance.bool()).filter(b=> b)

    //pull a difficulty 
    let D = from.difficulty || Difficulty()
    
    let trouble = ["hazard","encounter"].map(what=> this.lookup(what)).flat()
    let res = nt.map(_=> {
      let what = trouble.length == 0 || chance.bool() ? this.encounter({what:"Monster"}) : chance.pickone(trouble)
      let check = chance.weightedString(what.check || 'Ranged,Melee/1,1')

      let chars = party.characters.map(c=> {
        let nd = c.skills[check] - D 
        let roll = nd > 1 ? chance.dicePool(nd+"d6",[6]) : 
        return [c.name]
      })
    }) 

    console.log(nt,res)
  }
  
  //class functionality 
  addClass (c) {
    this.class.push(c)
  }
  
  rmClass (c) {
    let i = this.class.indexOf(c)
    if(i != -1)
      this.class.splice(i,1)
  }
  
  hasClass (c) {
    return this.class.includes(c)
  }
  
  //get total size based upon all children 
  get size () {
    return this.children.reduce((sum,c) => sum+c.size,0)
  }
  //enter and exit functionality - usually overridden 
  onEnter () {}
  onExit () {}
  //hex layout 
  setHex (n = this.childDisplay.length) {
    //get hex layout  
    this.hexIds = RandomWalk(this.id, n)
    this._hex = HexFromIds(this.hexIds)
    this.hex = HexFromIds(this.hexIds).toArray().map((h,i) => {
      h.i = i 
      h.parent = this 
      return h 
    })
  }
  
  //which children to display 
  get childDisplay () {
    return this.children
  }
  
  display () {
    if(this.iframe)
      return
    
    //get group to display 
    let g = SVG("#hex")
    let app = this.app

    //empty hex 
    g.find(".hex").forEach(h=>h.remove())
    g.find(".dText").forEach(h=>h.remove())
    
    //assume hex display 
    this.hex.forEach((hex,i) => {
      // create a polygon from a hex's corner points
      const polygon = g.polygon(hex.corners.map(({x, y})=>`${x},${y}`)).addClass('hex').data({
        i
      }).click(function() {
        app.selectHex(this.data('i'))
      })

      //simple id 
      g.text("#" + (i + 1)).move(hex.x, hex.y).addClass('dText')
    })
    
    const box = g.bbox()
    SVG("#map").attr('viewBox', [box.x,box.y,box.width,box.height].join(" "))
  }
}

export {Area}