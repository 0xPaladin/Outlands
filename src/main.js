/*
  V0.3
*/

//svg support 
//import "../lib/svg.parser.min.js"
//import "../lib/svg.import.min.js"

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
DB.game = localforage.createInstance({
  name: "Game"
});
DB.teams = localforage.createInstance({
  name: "Teams"
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
import * as Setting from './setting.js';
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
      show: "Strand",
      reveal: new Set(["strand-about","plateByFaction"]),
      selection: new Map([["team-edit",{}]]),
      favorites : new Set(),
      dialog: "",
      iframe: null,
      saveName: "",
      savedGames: new Set(),
      saved: {
        teams : []
      },
      generated: [],
      toGenerate: "",
      tick : 0,
    };

    this.db= DB 
    //functions 
    this.functions = Functions
    //Scenarios  
    this.scenarios = Scenarios
    //keep generator functions 
    this.gen = Gen
    //orbital 
    this.Strand = Gen.Strand
    //global store for generated areas / factions 
    this.activeState = {}
  }

  // Lifecycle: Called whenever our component is created
  async componentDidMount() { 
    this.generate() 

    DB.game.getItem("favorites").then(res => {
      this.state.favorites = new Set(res||[])
    })
    
    DB.teams.iterate((team,key)=>{
      this.state.saved.teams.push([key,team.name])
    }
    )

    //set super states 
    this.Strand.setSuperStates(this)

    setInterval(()=> {
      this.updateState("tick",this.state.tick+1)
      DB.game.setItem("favorites",this.state.favorites)
      
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

    //load plates
    Setting.Plates.forEach(p => {
      new Gen.Plane(this,Gen.Strand.plates.all.find(_p=>_p.i == p.i))
    })

    let RNG = new Chance(id)

    //update game  
    Game.id = id
    let _animals = [new Gen.Encounter({what:"Animal"}),new Gen.Encounter({what:"Animal"})]
    let name = [RNG.randBetween(1,1000),_animals[0].e[1],_animals[0].tags[2],_animals[1].tags[2]]
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

  get setting () {
    return {
      Factions : Setting.Factions,
      Strand : Gen.Strand
    }
  }

  get game() {
    return Object.assign({state:GameState},Game) 
  }

  get planes() {
    return Object.values(this.activeState).filter(p=>p.what == "Plane" && p.name).map(p => {
      return p 
    })
  }

  get crews () {
    return Object.values(this.activeState).filter(o=>o.what == "Crew")
  }

  /*
    Render functions 
  */

  toggle (what) {
    let reveal = this.state.reveal
    reveal.has(what) ? reveal.delete(what) : reveal.add(what)
  }

  toggleFavorite (id) {
    let favorites = this.state.favorites
    favorites.has(id) ? favorites.delete(id) : favorites.add(id)
    this.refresh()
  }

  //main function for updating state 
  async updateState(what, val) {
    let s = {}
    s[what] = val
    await this.setState(s)

    //check for view 
    if(what == "show" && val.includes("Plate")){
      let P = this.activeState[val.split(".")[1]]
      P ? P.init() : null
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

    //final layout 
    return html`
    <div class="${view=='Plate'?"":"body-img"} fixed left-0 right-0 top-0 bottom-0"></div>
    <div class="fixed left-0 pa2 z-2">
      <h1 class="pointer underline-hover ma0" onClick=${()=>this.show = "Strand"}>Cosmic Strand</h1>
    </div>
    <div class="fixed right-0 pa2 z-2">
      <div class="flex items-center"></div>
    </div>
    <div class="absolute z-1 w-100 mt4 pa2">
      ${this.show}
    </div>
    ${this.dialog}
    `
  }
}

render(html`<${App}/>`, document.getElementById("app"));

/*
<div class="dropdown rtl">
          <div class="f4 b pointer link dim bg-light-gray br2 pa2">⚙</div>
          <div class="f4 rtl w-100 dropdown-content bg-white-70 db ba bw1 pa1">
            <div class="tc link pointer dim underline-hover hover-orange pa1" onClick=${()=>this.save()}>Save</div>
            <div class="tc link pointer dim underline-hover hover-orange pa1" onClick=${()=>this.generate()}>Generate New</div>
            ${[...savedGames].map(sg=> sg[1] == Game.id ? "" : html`<div class="tc link pointer dim underline-hover hover-orange pa1" onClick=${()=>this.load(sg[1])}>Load ${sg[0]}</div>`)}
          </div>
        </div>



<div>This is a fan made project by xPaladin.</div>
      <div>
        Amazing maps are generated by <a href="https://azgaar.github.io/Fantasy-Map-Generator/" target="_blank">Azgaar's Fantasy Map Generator</a> & <a href="https://watabou.github.io/" target="_blank">Watabou's Procgen Arcana</a>
      </div>
*/

