import { Chance, _ } from "./helper.js";
let prng = new Chance();

//actions 
import * as Actions from "./actions.js";

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

/*
  Starting Backgrounds for play 
  Glide 
  https://sasquatchgames.itch.io/glide
  Hardy (abbreviated to H) characters can survive in the harsh environment
  of Eridoor, possesses strong physical ability, and great resolve.
  Knowledgeable (abbreviated to K) characters know where to search
  for items, how to navigate the world on their Glider, and are skilled
  with technologies.
  Resourceful (abbreviated to R) characters know how to solve a
  problem with minimal resources, where to look to find answers, and
  always have a solution on-hand.
*/
const Backgrounds = {
  "soldier": [6, 4, 5],
  "merchant": [5, 6, 4],
  "explorer": [5, 4, 6],
  "scoundrel": [4, 5, 6],
  "navigator": [4, 6, 5],
  "freelancer": [6, 5, 4],
}


export class Game {
  constructor() {
    //pull data 
    let { day, region } = window.App;

    this.seed = prng.AlphaSeed();
    //plane and hex 
    this._plane = region.seed;
    this._hex = region.start;
    //points and time : day, pts, time, total pts, total time
    this._pt = [day, 0, 0, 0, 0];
    //fame
    this.fame = 0;
    //items - coin, supply, trinkets, relics
    this._items = {
      coin: 50,
      supply: [3, 3],
      trinkets: [0, 5],
      relics: [0, 1],
      quest: 0,
    };
    //stats 
    this._bg = prng.pickone(Object.keys(Backgrounds));
    this.stats = Backgrounds[this._bg].slice();
    //stamina
    this.stamina = [5, 5];
    this._camp = true;

    this.pace = "Normal";

    //get known routes and exploration 
    this._routes = []
    this.known = localStorage.getItem(this._plane) ? JSON.parse(localStorage.getItem(this._plane)) : [this.plane.name];

    _.fromN(2, () => this.addRoute(region.seed + "|" + "OL" + prng.AlphaSeed(14)));
  }

  addRoute(r) {
    let added = !this._routes.includes(r)
    added ? this._routes.push(r) : null;

    //find route 
    added ? window.App.state.pullRoutes.push(r.slice(17)) : null;

    return added;
  }

  /*
    Point Functions
  */
  get points() {
    return this._pt[1];
  }
  addPoints(p) {
    this._pt[1] += p;
    this._pt[3] += p;
  }

  /*
    Time Functions
  */
  get time() {
    return this._pt[2];
  }

  addTime(t) {
    let encounter = false;
    if (t < 0) {
      this._pt[2] += t;
      this._pt[4] += t;
      return;
    }
    //8 hour chunks 
    while (t > 0) {
      let _t = t > 8 ? 8 : t;
      //add time 
      this._pt[2] += _t;
      this._pt[4] += _t;
      t -= _t;

      //if time puts active hours over 16, sleep and mark new day 
      if (this.time % 24 > 16) {
        this.newDay();
        encounter = true;
      }
    }
    return encounter;
  }

  newDay() {
    this._pt[2] += 8;
    this._pt[4] += 8;
    //stamina 
    this._camp = this._camp ? false : this.reduceStamina();
    //TODO weather 
  }

  //Stamina 
  reduceStamina() {
    this.stamina[0]--;
    if (this.stamina[0] == 0 && this._items.supply[0] > 0) {
      this._items.supply[0]--;
      this.stamina[0] = 3;
    }
    else if (this.stamina[0] == 0) {
      window.Swal.fire({
        title: 'No Stamina & No Supply!',
        text: '-5 points! You are out of stamina and supply. You must rest to regain stamina.'
      })
    }
  }

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
  get gameStats() {
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
    Handle actions
  */
  async act(id) {
    const SettlementActions = ["Rest", "Resupply", "SellTrinkets", "RelicForFame"];
    if (id == "Explore") {
      return this.search();
    }
    else if (SettlementActions.includes(id)) {
      return Actions.SettlementAction(this, id);
    }
    else {
      Actions[id](this);
      //save 
      this.save();
    }
  }

  skillCheck(skill, d) {
    let { stats } = this;
    let abrv = ["H", "K", "R"];
    //track skill used
    let _skill = "";
    //find max skill if multiple are provided
    let val = skill.split("").reduce((max, id) => {
      let _v = stats[abrv.indexOf(id)]
      _skill = _v > max ? id : _skill;
      return max > _v ? max : _v;
    }, -1);
    //roll d10 
    let roll = _.fromN(d, () => prng.d10());
    //provide results 
    return roll.reduce((res, r) => {
      res[1].push(r <= val);
      res[0] = res[0] && r <= val
      return res;
    }, [true, [], roll, _skill, val])
  }

  /*
    Reward
  */
  reward(id, val) {
    if ('coin,quest'.includes(id)) {
      this._items[id] += val;
    }
    else if (this._items[id]) {
      this._items[id][0] += val;
      this._items[id][0] > this._items[id][1] ? this._items[id][0] = this._items[id][1] : null;
    }
    else {
      id == "hours" ? this.addTime(val) : id == "points" ? this.addPoints(val) : null;
    }
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
    let _encounter = this.addTime(this.getTravelTime(h2));
    //move to hex 
    window.App.face = null;
    this._hex = h2.face._id;
    //encounter
    _encounter ? this.plane.encounter(this.hex.data, false) : null;
    this.save();
  }

  changePlane(R) {
    //plane and hex 
    this._plane = R.seed;
    this._hex = R.start;
    this.known = localStorage.getItem(this._plane) ? JSON.parse(localStorage.getItem(this._plane)) : [this.plane.name];

    //advance time 1d4 days 
    let hrs = prng.Range(16, 96);
    this._pt[2] += hrs;
    this._pt[4] += hrs;
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
    //requires stamina 
    this.reduceStamina();
    //search time
    let st = this.searchTime;
    //add time and push hex 
    this.addTime(st);
    //push explored
    this.known.push(this._hex);
    //check for encounter 
    this.plane.encounter(this.hex.data, true);
    //save 
    this.save();
  }
  /*
    Save and Load 
  */
  save() {
    let { seed, _plane, _hex, _pt, _bg, fame, stats, stamina, _items, _routes, known } = this;
    let data = {
      seed, _plane, _hex, _pt, _routes, _bg, fame, stats, stamina, _items
    }
    //save game data 
    localStorage.setItem("game", JSON.stringify(data));
    //save knowns 
    localStorage.setItem(this._plane, JSON.stringify(known));
  }
  static load(data) {
    let _day = window.App.day;
    //load game data
    data._pt = data._pt[0] == _day ? data._pt : [_day, 0, 0, data._pt[3], data._pt[4]];
    //return new game
    return Object.assign(new Game(), data);
  }
  get UI() {
    let { html, App } = window;
    let { points, time, fame, gameStats, stats, stamina, _items } = this;
    let { coin, supply, trinkets, relics } = _items;

    //final layout 
    return html`
    <div class="ba pa1">
    <div class="f4 bg-white-40 ba pa2" style="width:300px">
      <h4 class="ma0 flex justify-between items-center">
        <span>Day</span>
        <span>${App.time.slice(0, -1).join(":")}</span>
        <div class="pointer dim ba pv1 ph2" onclick=${() => App.setSelect("about", "Main")}>?</div>
      </h4>
      <div class="mt1 flex justify-between">
        <div>${fame} fame</div>
        <div>${points.toFixed(0)} points</div>
        <div>${(time / 24).toFixed(1)} days</div>
      </div>
      <div class="mv1 flex justify-between">
        <div>${gameStats.planes} plane${gameStats.planes.length == 1 ? '' : 's'}</div>
        <div>${gameStats.hex} hex</div>
        <div>${gameStats.creature} creatures</div>
      </div>
      <div class="pt2 flex justify-between bt">
        ${["H", "K", "R"].map((s, i) => html`<div>${s}${stats[i]}</div>`)}
        <div>St ${stamina.join("/")}</div>
      </div>
      <div class="mv1 flex items-center justify-between">
        <div>₡ ${coin}</div>
        <div class="flex items-center"><img src="src/assets/meat.svg" width="20" height="20"></img>${supply.join("/")}</div>
        <div class="flex items-center"><img src="src/assets/porcelain-vase.svg" width="20" height="20"></img>${trinkets.join("/")}</div>
        <div class="flex items-center"><img src="src/assets/locked-chest.svg" width="20" height="20"></img>${relics.join("/")}</div>
      </div>
    </div>
    </div>`
  }
}

//let dice = `<img src="src/assets/d10-outline.svg" width="40" height="40" />`