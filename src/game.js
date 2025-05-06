import { Chance, _ } from "./helper.js";
let prng = new Chance();

/*
  Soruce
  https://thealexandrian.net/wordpress/46101/roleplaying-games/5e-hexcrawl-part-2-wilderness-travel
*/

//base travle distance per hour depending upon pace
const BaseTravelD = {
  Fast: 4.5,
  Normal: 3,
  Slow: 2,
  Exploration: 1.5
};

// Highway, road/trail, trackless, get lost, nav dc, forage dc
const TerrainMod = {
  desert: [1, 0.5, 0.5, 2, 12, 20],
  forest: [1, 1, 0.5, 2, 16, 14],
  hill: [1, 0.75, 0.5, 2, 14, 12],
  jungle: [1, 0.75, 0.25, 4, 16, 14],
  mountain: [0.75, 0.75, 0.5, 3, 16, 18],
  plains: [1, 1, 0.75, 1, 12, 12],
  settlement: [1, 1, 1, 1, 10, 10],
  dungeon: [1, 0.5, 0.5, 1, 10, 10],
  swamp: [1, 0.75, 0.5, 3, 15, 16],
  water: [2, 2, 2, 2, 10, 10],
};

//COndition Mods
const ConditionMod = {
  NonTemperate: 0.75,
  Epic: 0.75,
  PoorVisibility: 0.5,
  SnowCover: 0.5,
  Storm: 0.75,
  StormPowerful: 0.5
};

export const Explore = (R, h1) => {
  //hazards
  let hz = R._hazards.filter(_hz => _hz._terrain == 'any' || _hz._terrain.includes(h1._terrain));
}
export const Travel = (R, h1, h2) => {
  //hazards
  let hz = R._hazards.filter(_hz => _hz._terrain == 'any' || _hz._terrain.includes(h1._terrain) || _hz._terrain.includes(h2._terrain));
  //distance between
  let d = 12;
  //time to travel 
}

//R = starting region
export class Game {
  constructor() {
    //pull data 
    let { week, region } = window.App;

    this.seed = prng.AlphaSeed();
    //format data into JSON 
    this.week = week;
    //plane and hex 
    this._plane = region.seed;
    this._hex = region.start;
    //points and time 
    this.points = 0;
    this.time = 0;
    //harm 
    this.wounds = [0, 0, 0, 0];
    //pace
    this.pace = "Normal"

    //get known routes and exploration 
    this._routes = []
    this.known = localStorage.getItem(this._plane) ? JSON.parse(localStorage.getItem(this._plane)) : [this.plane.name];

    _.fromN(2, () => this.addRoute(region.seed + "=" + "OL" + prng.AlphaSeed(14)));
  }

  addRoute(r) {
    let added = !this._routes.includes(r)
    added ? this._routes.push(r) : null;

    //find route 
    added ? window.App.state.pullRoutes.push(r.slice(17)) : null;

    return added;
  }

  /*
    Time Functions
  */

  addTime(t) {
    //8 hour chunks 
    while (t > 0) {
      let _t = t > 8 ? 8 : t;
      //add time 
      this.time += t;
      t -= _t;

      //if time puts active hours over 16, sleep and mark new day 
      if (this.time % 24 > 16) {
        this.time += 8;
        this.newDay();
      }
    }
  }

  newDay() { }

  takeWound(rank) {
    this.wounds[rank] == 2 ? this.takeWound(rank + 1) : null;
    this.wounds[rank]++;
  }

  /*
    Location Information
  */

  get routes() {
    return this._routes.filter(r => r.includes(this._plane)).map(r => r.slice(17));
  }
  get plane() {
    return window.App.region;
  }
  get hex() {
    return this.plane.ps.raw.dcel.faces.find(f => f._id == this._hex);
  }
  get neighbourIds() {
    return this.hex.getNeighbours().map(({ _id }) => _id);
  }
  get stats() {
    //get ids of planes
    let _ids = this._routes.reduce((ids, r) => {
      //get plane ids 
      [r.slice(0, 16), r.slice(17)].forEach(_id => {
        ids.includes(_id) ? null : ids.push(_id);
      });
      return ids;
    }, [])
    //reduce routes to stats
    return _ids.reduce((stat, _id) => {
      if (!localStorage.getItem(_id)) {
        return stat;
      }
      //get data from local storage
      let data = JSON.parse(localStorage.getItem(_id)).slice(1);
      stat.planes += data.length > 0 ? 1 : 0;
      data.forEach(d => d.includes("c") ? stat.creature++ : stat.hex++);
      //return stats
      return stat;
    }, { planes: 0, hex: 0, creature: 0 })
  }

  /*
    Travel Functions 
  */
  getTravelTime(h2) {
    if (!h2._terrain || !this.neighbourIds.includes(h2.face._id)) {
      return -1;
    }

    let h1 = this.hex.data;
    //get road ids and check for roads 
    let roads = this.plane.roads.flat().map(({ _id }) => _id);
    let r1 = roads.includes(this._hex);
    let r2 = roads.includes(h2.face._id);
    //get travel mods based on terrain and roads 
    let tm1 = TerrainMod[h1._terrain][r1 ? 1 : 2];
    let tm2 = TerrainMod[h2._terrain][r2 ? 1 : 2];
    //calculate time - 6 miles in each hex
    let basemph = BaseTravelD[this.pace];
    return 6 / (basemph * tm1) + 6 / (basemph * tm2);
  }

  moveTo(h2) {
    //add time 
    this.addTime(this.getTravelTime(h2));
    //move to hex 
    window.App.face = null;
    this._hex = h2.face._id;
    //encounter
    this.save();
  }

  changePlane(R) {
    //plane and hex 
    this._plane = R.seed;
    this._hex = R.start;
    this.known = localStorage.getItem(this._plane) ? JSON.parse(localStorage.getItem(this._plane)) : [this.plane.name];

    //advance time 1d4 days 
    let hrs = prng.Range(16, 96);
    this.time += hrs;
    //save 
    this.save();
  }
  /*
    Search Functions
  */
  get searchTime() {
    //a search requires 3mi * 6 of travel (small hex within big), but at an Exploration pace 
    let time = 18 / BaseTravelD.Exploration;
    //terrain is always trackless 
    time /= TerrainMod[this.hex.data._terrain][2]
    return time;
  }

  //search current hex 
  search() {
    let st = this.searchTime;
    //add time and push hex 
    this.addTime(st);
    //push explored
    this.known.push(this._hex);
    //check for encounter 
    this.plane.encounter(this.hex.data);
    //save 
    this.save();
  }
  /*
    Save and Load 
  */
  save() {
    let { seed, week, _plane, _hex, points, time, wounds, _routes, known } = this;
    let data = {
      seed, week, _plane, _hex, points, time, wounds, _routes
    }
    //save game data 
    localStorage.setItem("game", JSON.stringify(data));
    //save knowns 
    localStorage.setItem(this._plane, JSON.stringify(known));
  }
  static load(week, data) {
    return Object.assign(new Game(), data);
  }
  get UI() {
    let { html, App } = window;
    let { points, time, stats } = this;

    //final layout 
    return html`
    <div class="ba pa1">
    <div class="f4 bg-white-40 ba pa2" style="width:300px">
      <h4 class="ma0 flex justify-between items-center">
        <span>Week</span>
        <span>${App.time.slice(0, -1).join(":")}</span>
        <div class="pointer dim ba pv1 ph2" onclick=${() => App.setSelect("about", "Main")}>?</div>
      </h4>
      <div class="mt1 flex justify-between">
        <div>${points.toFixed(1)} points</div>
        <div>${(time / 24).toFixed(1)} days</div>
      </div>
      <div class="mt1 flex justify-between">
        <div>${stats.planes} plane${stats.planes.length == 1 ? '' : 's'}</div>
        <div>${stats.hex} hex</div>
        <div>${stats.creature} creatures</div>
      </div>
    </div>
    </div>`
  }
}
