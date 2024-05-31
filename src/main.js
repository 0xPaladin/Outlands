/*
  V0.3
*/

/*
  Mixins for standard functions
  Array, Math, Sting...
*/
import "./mixins.js"

/*
  Chance RNG
*/
import "../lib/chance.slim.js"
const chance = new Chance()

/*
  Storage - localforage
  https://localforage.github.io/localForage/
*/
import "../lib/localforage.min.js"
const DB = {}
DB.games = localforage.createInstance({
  name: "Outlands.Games"
});
DB.state = localforage.createInstance({
  name: "Outlands.State"
});

/*
  SVG
  https://svgjs.dev/docs/3.0/getting-started/
*/

/*
  UI Resources  
*/
//Preact
import {h, Component, render} from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';
// Initialize htm with Preact
const html = _.html = htm.bind(h);

/*
  App Sub UI
*/
import*as UI from './UI.js';
import {Functions} from './functions.js';
import {Planes} from './setting.js';
import * as Scenarios from '../scenarios/index.js';
import*as Gen from './generate.js';

/*
  Game Object 
*/
let Game = {
  "id": "",
  "name": "",
  "fame" : {},
  //items bought 
  "bought" : {},
  /*
    knowledge of Regions and sites
    key = region id 
    value = {
      siteId : # knowledge 
    }
    An empty Region means the party knows of it - useful for travel 
    A site with knowledge means that it is known 
  */
  "knowledge" : new Map(),
  //ways between varions regions : [regionId, regionId] 
  "ways" : new Set(),
  //store for ids - quests, parties, characters, and created regions 
  "toSave": new Set(),
  //log for information 
  "log": [],
  //what is active 
  "active" : {
    time : 1
  }
}

let GameState = {}

/*
  Declare the main App 
*/

class App extends Component {
  constructor() {
    super();
    this.state = {
      show: "AllPlanes",
      reveal: [],
      dialog: "",
      iframe: null,
      saveName: "",
      savedGames: new Set(),
      generated: [],
      toGenerate: "",
      tick : 0,
    };

    //functions 
    this.functions = Functions
    //Scenarios  
    this.scenarios = Scenarios
    //keep generator functions 
    this.gen = Gen
    //keep poi 
    this.poi = Gen.POI
    //global store for generated areas / factions 
    this.activeState = {}
  }

  // Lifecycle: Called whenever our component is created
  async componentDidMount() {
    let id = await DB.games.getItem("lastGame")
    if(id) {
       this.load(id)
    }
    else {
      id = Game.id = chance.natural()
      this.generate(id)
      Gen.Scene.enter(this,"")
      //Gen.Scene.enter(this,"Intro.Begin")
    }

    //updated saved game list 
    let sG = this.state.savedGames
    DB.games.iterate((g,id)=>{
      id != "lastGame" ? sG.add([g.name, id]) : null
    }
    )

    setInterval(()=> {
      this.updateState("tick",this.state.tick+1)
      if(this.activeRegion && this.state.tick%3 == 0){
        this.activeRegion.display()
      }
    }, 1000)
  }

  // Lifecycle: Called just before our component will be destroyed
  componentWillUnmount() {}

  /*
    Core Save Load and Generate 
  */

  generate(id=chance.hash()) {
    //reset 
    GameState = {} 
    this.activeState = {}

    let RNG = new Chance(id)

    //core region maker for planes 
    Object.keys(Planes).forEach(p=> {
      let n = RNG.sumDice("2d3+1")
      _.fromN(n,()=>{
        new Gen.Region(this,{
          id : RNG.hash(),
          plane : p
        })
      })
    })

    //update game  
    Game.id = id
    let _animals = [Gen.Encounter({what:"Animal"}),Gen.Encounter({what:"Animal"})]
    let name = [RNG.randBetween(1,1000),_animals[0].essence[1],_animals[0].tags[1],_animals[1].tags[1]]
    Game.name = name.join(" ")

    console.log(this.activeState, this.game)
    this.refresh()
  }

  save() {
    //first save to game 
    DB.games.setItem("lastGame",Game.id)
    DB.games.setItem(Game.id, Game)

    //now save individual state 
    Game.toSave.forEach(id => DB.state.setItem(id,GameState[id]))

    //refresh 
    this.refresh()
  }

  async load(id) {
    //pull game 
    let game = await DB.games.getItem(id)
    if (!game) {
      return
    }

    //first generate 
    this.generate(id)
    //write state 
    let sets = ["toSave","ways"]
    Object.keys(Game).forEach(k=> Game[k] = sets.includes(k) ? new Set(game[k]) : game[k])

    //load saved
    let nl = 0
    await Game.toSave.forEach(async id => {
      GameState[id] = await DB.state.getItem(id)
      this.activeState[id] = new Gen[GameState[id].w](this,GameState[id])
      await this.refresh()
      nl++     
      //go to scene after load 
      nl == Game.toSave.size ? game.active.scene == "freeplay" ? null : Gen.Scene.enter(this,game.active.scene,null) : null
    })
  }

  /*
    Game Functions 
  */
  
  act(f, opts) {
    //call the function 
    f(opts)
    //save
    //refresh 
    this.refresh()
  }

  /*
    Get functions 
  */

  get game() {
    return Object.assign({state:GameState},Game) 
  }

  get planes() {
    return Object.values(Planes).map(p => {
      p.children = this.regions.filter(r => r.plane == p.name)
      p.parties = p.children.map(r=> r.parties).flat()
      return p 
    })
  }

  get regions() {
    return Object.values(this.activeState).filter(p=>p.what == "Region")
  }

  get parties () {
    return Object.values(this.activeState).filter(p=>p.what == "Party")
  }

  get quests() {
    return Object.values(this.activeState).filter(p=>p.what == "Quest")
  }

  get activeParty() {
    return this.activeState[Game.active.party]
  }

  get activeRegion() {
    let [w,id] = this.state.show.split(".")
    return w== "Plane" ? this.regions.find(r=> r.id==id) : null
  }

  /*
    Render functions 
  */

  //main function for updating state 
  async updateState(what, val) {
    let s = {}
    s[what] = val
    await this.setState(s)

    //check for view 
    if(what == "show" && val.includes("Plane") && this.activeRegion){
      this.activeRegion.display()
    }
  }

  //main functions for setting view - usine set/get of show 

  refresh() {
    this.show = this.state.show
  }

  set show(what) {
    this.updateState("show", what)
  }

  get show() {
    let[what,id] = this.state.show.split(".")
    return UI[what] ? UI[what](this) : this[what][id].UI ? this[what][id].UI() : ""
  }

  set dialog(what) {
    this.updateState("dialog", what)
  }

  get dialog() {
    let[what,id] = this.state.dialog.split(".")
    return what == "" ? "" : UI.Dialog(this)
  }

  /*
    Render 
  */

  //main page render 
  render(props, {show, savedGames}) {
    let view = show.split(".")[0]
    let rids = this.regions.map(r=>r.id)

    //final layout 
    return html`
    <div class="fixed left-0 pa2 z-2">
      <h1 class="pointer underline-hover ma0" onClick=${()=>this.show = "AllPlanes"}>Outlands</h1>
    </div>
    <div class="fixed right-0 pa2 z-2">
      <div class="flex items-center">
        <div class="f5 b i mh2">${Game.name}</div>
        <div class="dropdown rtl">
          <div class="f4 b pointer link dim bg-light-gray br2 pa2">⚙</div>
          <div class="f4 rtl w-100 dropdown-content bg-white-70 db ba bw1 pa1">
            <div class="tc link pointer dim underline-hover hover-orange pa1" onClick=${()=>this.save()}>Save</div>
            <div class="tc link pointer dim underline-hover hover-orange pa1" onClick=${()=>this.generate()}>Generate New</div>
            ${[...savedGames].map(sg=> sg[1] == Game.id ? "" : html`<div class="tc link pointer dim underline-hover hover-orange pa1" onClick=${()=>this.load(sg[1])}>Load ${sg[0]}</div>`)}
          </div>
        </div>
      </div>
      <div>${this.parties.map(p=> html`<div class="pointer dim bg-lightest-blue mv1 pa1" onClick=${()=>this.show = ["Plane", p.region.id].join(".")}>${p.characters.map(c=>c.name).join(", ")}</div>`)}</div>
      <div>${[...this.quests].map(q=> q.state.done ? "" : html`<div class="pointer dim bg-light-yellow mv1 pa1">${q.text}</div>`)}</div>
    </div>
    <div class="absolute z-1 w-100 mt5 pa2">
      ${this.show}
    </div>
    ${this.dialog}
    `
  }
}

render(html`<${App}/>`, document.getElementById("app"));
