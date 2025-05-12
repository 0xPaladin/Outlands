import { Chance, _ } from "./helper.js";
import { FeatureGen } from "./features.js";
import { Encounter } from "./encounter.js";
import { SVG } from "https://cdnjs.cloudflare.com/ajax/libs/svg.js/3.2.4/svg.esm.min.js";
//import { HexDisplay } from "https://codepen.io/nejt/pen/bNNddEM.js";

const Cap = _.capitalize;
let prng = new Chance();

const Realms = {
    OL: {
        name: "Outlands",
        water: "land,lake,bay,coast,fjord,peninsula/2,1,1,1,1,1",
    }
}

const TerrainsByName = {
    'mountain': ['range', 'ridge', 'peak', 'mount', 'summit', 'height', 'pinnacle'],
    'hill': ['hill'],
    'forest': ['wood', 'forest', 'grove', 'thicket'],
    'desert': ['sand', 'desert', 'dune'],
    'swamp': ['bog', 'marsh', 'swamp', 'fen', 'mire', 'moor'],
    'plains': ['country'],
    'water': ['water']
}
const TerrainCheck = (name) => {
    let _name = name.toLowerCase();
    let terrain = "";
    //loop through every terrain time and string to check the name 
    Object.entries(TerrainsByName).forEach(([t, arr]) => {
        arr.forEach(str => _name.includes(str) ? terrain = t : null)
    }
    )

    //let difficulty = 'mountain,swamp'.includes(terrain) ? 3 : 'forest,hill,water'.includes(terrain) ? 2 : 1;
    return terrain;
}

const RegionSize = {
    small: ["1d4", "2d12"],
    sizable: ["2d6", "1d4+2"],
    large: ["3d8", "2d6+3"],
    expansive: ["4d10", "4d6+10"],
    vast: ["5d12", "6d6+24"]
};

const AlignmentMods = {
    evil: 3,
    chaotic: 5,
    neutral: 0,
    lawful: -5,
    good: -3
};

export class Region {
    constructor(o = {}) {
        let { seed = prng.AlphaSeed(14) } = o;
        //outlands
        seed = seed.length == 16 ? seed : "OL" + seed

        this.seed = seed;

        let PRNG = new Chance(seed);

        //used for reference later 
        let _realm = this.realm.name;

        //climate and terrain
        let _prclimate = this.realm.climate;
        let _climate = PRNG.WS(_prclimate != null ? _prclimate : "frigid,temperate,torrid/2,8,2");
        _climate = o.climate || _climate;

        //rainfall 
        let _rainfall = PRNG.WS("arid,normal,wet/2,6,2");

        //terrain
        let _terrain = PRNG.WS("highland,lowland,standard/2,2,6");

        //foliage
        let foliageTypes = {
            arid: 'barren,woodland,standard/5,1,4',
            normal: 'barren,woodland,wetland,standard/2,3,2,3',
            wet: 'wetland,woodland,standard/3,5,2'
        }[_rainfall];
        let _foliage = PRNG.WS(foliageTypes);

        //islands, bay, lake, etc
        let _water = PRNG.WS(this.realm.water || "land,lake,bay,coast,fjord,island,archipelago/1.5,1.5,1,1,1,2,2");

        //size of region - # of features, and time to cross
        let _size = _realm == "Prime" ? PRNG.WS("large,expansive/2,1") : "sizable";
        let _nF = PRNG.Dice(RegionSize[_size][0]);
        let _travel = PRNG.Dice(RegionSize[_size][1]);
        //number of hex across - half day hex size - 12 mi - 3 miles per hour, 8 hour travel day
        let wHex = _travel * 2;

        //alignment and safety
        let _alignment = PRNG.WS(this.realm.alignment || "evil,chaotic,neutral,lawful,good/1,2,6,2,1");
        let _am = AlignmentMods[_alignment];
        let _safe = PRNG.DicePick("0,1,2,3/1,3,9", PRNG.d12() + _am);
        let _safety = ["safe", "unsafe", "dangerous", "perilous"][_safe];
        let _safetyMod = [3, 2, 1, 0][_safe];

        //PS string
        let psSeed = PRNG.natural();
        let pstags = [_alignment, _water, _terrain, _foliage, _safety]

        Object.assign(this, {
            _climate,
            _terrain,
            _foliage,
            _water,
            _size,
            _travel,
            ps: {
                seed: psSeed,
                tags: pstags,
                href: `./PS/?seed=${psSeed}&tags=${pstags.join()}&w=${wHex * 85}&h=${wHex * 85}&hexes=1`
            },
            _alignment,
            _safe,
            _safety,
            _safetyMod
        });

        //native people 
        this._people = [FeatureGen.people(this, {
            seed: this.seed + ".people"
        })];

        //local creatures
        this._creatures = _.fromN(8, j => {
            let opts = {
                seed: [this.seed, "c", j].join("."),
                base: PRNG.weighted(['Monster', 'Beast'], [4, 5])
            }
            return FeatureGen.creature(this, opts)
        })

        //numbers for tracking 
        this._n = {
            c: 0,
            h: 0
        }
        //track features
        this._factions = []
        this._sites = []
        //now calculate features
        for (let j = 0; j < _nF; j++) {
            let _what = PRNG.DicePick("creature,hazard,dungeon,site,faction,people/4,7,9,11,12", PRNG.d12() + _safetyMod);
            let opts = {
                seed: [this.seed, "f", j].join(".")
            };

            //create feature
            let F = FeatureGen[_what](this, opts);
            F._faction ? F._faction._feature = F : null;

            //add to region 
            switch (_what) {
                case "people":
                    this._people.push(F);
                    break;
                case "creature":
                    'Humanoid,Local'.includes(F.base) ? this._people.push(F) : this._n.c++;
                    break;
                case "hazard":
                    this._n.h++;
                    break;
                case "site":
                    this._sites.push(F)
                    break;
                case "dungeon":
                    this._sites.push(F)
                    break;
                case "faction":
                    this._factions.push(F)
                    F._feature = {
                        what: "region"
                    };
                    break;
            }
        }

        //routes to other planes 
        let nRoute = PRNG.weighted([1, 2], [4, 1]);
        this._routes = _.fromN(nRoute, () => {
            return {
                what: "route",
                _terrain: 'plains,forest,mountain,swamp',
                seed: "OL" + PRNG.AlphaSeed(14)
            }
        }
        );
    }

    get name() {
        return this.ps.raw.name;
    }

    get realm() {
        return Realms[this.seed.slice(0, 2)] || {}
    }

    get factions() {
        let all = []
        this._sites.forEach(o => o._faction ? all.push(o._faction) : null);

        return this._factions.concat(all);
    }

    get primaryFaction() {
        return this._factions[0];
    }

    get pantheons() {
        return this._factions.filter(f => f.isPantheon).map(f => f._faction);
    }

    get primaryPantheon() {
        return this.pantheons.length == 0 ? {} : Pantheons[this.pantheons[0]] || {}
    }

    get settlements() {
        return Object.entries(this.ps.features).filter(([name, d]) => d.cityscape).sort((a, b) => (a[1].scale || 0) < (b[1].scale || 0))
    }

    get dungeons() {
        //track  dungeons 
        let rd = this._sites.filter(s => s.what == "dungeon");
        let psd = Object.entries(this.ps.features).filter(([name, d]) => d._terrain == "dungeon");
        return rd.length > psd ? psd.concat(rd.slice(psd.length)) : psd;
    }

    get creatures() {
        let known = App.game && App.game.known ? App.game.known : [];
        return this._creatures.filter(c => known.includes(c.seed.slice(17)));
    }

    get roads() {
        return this.ps.raw.islands.map(isle => isle.network.roads).flat()
    }

    get coast() {
        return this.ps.raw.dcel.faces.filter(({ data }) => data.coastal);
    }

    get water() {
        return this.ps.raw.dcel.faces.filter(({ data }) => data.aboveSea < 0);
    }

    get openCountry() {
        return this.ps.raw.dcel.faces.filter(({ data }) => data.name == "Open Country");
    }

    get start() {
        let coast = this.coast.filter(({ data }) => data.name == "Open Country")
        return this.settlements.length > 0 ? this.settlements[0][1].cell.face._id : coast.length == 0 ? this.openCountry[0]._id : coast[0]._id;
    }

    /*
        Manage Routes  
    */

    get routes() {
        return !App.game ? [] : App.game._routes.filter(r => r.includes(this.seed)).map(r => {
            let [pa, pb] = [r.slice(0, 16), r.slice(17)];
            let destination = pa == this.seed ? pb : pa;
            let _name = localStorage.getItem(destination) ? JSON.parse(localStorage.getItem(destination))[0] : "";
            return [destination, _name];
        })
    }

    /*
        Generate encounter 
    */
    encounter(h, isSearch) {
        Encounter(this, h, isSearch);
    }

    linkToPS(raw, islands) {
        let PRNG = new Chance([this.seed, "PSLink"].join("."))
        let nh = this._n.h;
        //run through isle faces and init sites and areas
        let features = {}
        raw.dcel.faces.forEach(f => {
            let { data } = f;
            //make id from center point 
            let _id = [Math.round(data.center.x), Math.round(data.center.y)].join(".");
            f._id = data._id = _id;

            let name = data.aboveSea < 0 ? 'Water' : 'Open Country';
            let _terrain = name == 'Water' ? 'water' : 'plains'
            //initiate site or terrain
            if (null != data.site) {
                _terrain = data.site.cityscape ? "settlement" : "dungeon";
                name = data.site.name;
                data._feature = features[data.site.name] = Object.assign(data.site, { _terrain });
                _terrain == "dungeon" ? data._feature._dungeon = FeatureGen.dungeon(this, {
                    seed: [this.seed, "dungeon", _id].join(".")
                }) : null;
            } else if (null != data.terrain && data.terrain.area) {
                !data.terrain.area.name ? data.terrain.area.rollName() : null;
                //name for quick ref 
                name = data.terrain.area.name;
                //terrain
                _terrain = TerrainCheck(name);
                //hazard 
                let hazard = FeatureGen.hazard({ rough: true });
                if (nh > 0 && !features[name]) {
                    hazard = FeatureGen.hazard({
                        seed: [this.seed, "hazard", nh].join("."),
                        terrain: _terrain
                    })
                    nh--;
                }
                //define feature object 
                let f = features[name] || {
                    name,
                    align: data.terrain.area.align.toString(),
                    faces: [],
                    _terrain,
                    hazard,
                    diff: PRNG.weighted([1, 2, 3], [2, 3, 1])
                };
                f.faces.push(data);
                data._feature = features[name] = f;
            }
            else {
                //define feature object 
                let f = features[name] || {
                    name,
                    faces: [],
                    _terrain,
                    hazard: FeatureGen.hazard({ rough: true }),
                    diff: PRNG.weighted([1, 2, 3], [2, 3, 1])
                };
                f.faces.push(data);
                data._feature = features[name] = f;
            }

            Object.assign(data, { name, _terrain });
        }
        );

        //assign results 
        Object.assign(this.ps, {
            raw,
            islands,
            features
        })

        //terrain features 
        let terrainFeatures = Object.entries(features).filter(([name, f]) => !f.seed);
        //work through sites and assign hexes 
        this._sites.concat(this._routes).forEach(s => {
            //terrain of the site 
            let terrain = s._terrain || PRNG.WS('plains,forest,mountain,swamp/1,1,1,1');
            //filter face to only give corresponding terrain
            let pickFrom = terrainFeatures.filter(([id, f]) => {
                return !f.seed && (terrain == 'any' || terrain.includes(f._terrain));
            });
            pickFrom = pickFrom.length == 0 ? terrainFeatures : pickFrom;
            //pick hex and assign
            let _feature = PRNG.pickone(pickFrom);
            s.face = PRNG.pickone(_feature[1].faces);
            s.face._site = s;
        }
        )

        let nameSize = ["OUTPOST", "HAMLET", "VILLAGE", "KEEP", "TOWN", "CITY"];
        //develop settlements
        this.settlements.forEach((s, i) => {
            let opts = {
                seed: [this.seed, "town", i].join("."),
                sz: nameSize.indexOf(s[1].type._hx_name)
            }
            //assign settlement data and pull hex 
            Object.assign(s[1], FeatureGen.settlement(this, opts));
        }
        )

        this.overlay()
        SVGActions(this);
    }

    closestFace(px, py) {
        let faces = this.ps.raw.dcel.faces;
        //find closest face
        let closest = faces.reduce((d, f, i) => {
            let { x, y } = f.data.center;
            //distance from center point
            let dist = Math.sqrt(Math.pow(px - x, 2) + Math.pow(py - y, 2));
            return dist < d[1] ? [i, dist] : d;
        }
            , [-1, Infinity])

        //get name and face data
        let { data } = faces[closest[0]];
        return {
            name: data.name,
            face: data,
            feature: data._feature
        }
    }

    overlay() {
        let { App } = window;
        let { game = null, face = null } = App;
        let { height, width } = this.ps.raw;

        //get iframe attributes
        let ifattr = document.getElementById("psmap").attributes;
        let [iw, ih] = [ifattr.width.value, ifattr.height.value].map(Number);
        const screenAdust = ({ x, y }) => [(x + width / 2) * iw / width, (y + height / 2) * ih / height];

        //get svg and set click 
        let svg = SVG('svg')
        svg.clear();
        let gp = svg.group().attr("id", "points")
        let gh = svg.group().attr("id", "hex")

        if (game == null || game._plane != this.seed) {
            return;
        }
        //get player hex and set marker 
        let gHex = game.hex;
        let [px, py] = screenAdust(gHex.data.center);
        gp.rect(20, 20).move(px - 10, py - 10).addClass('player').rotate(45);

        //whats been explored 
        let explored = game.known || [];
        //show moveable area 
        gHex.getNeighbours().forEach(_h => {
            let { data } = _h
            let poly = _h.getPoly().map(p => {
                let [x, y] = screenAdust(p)
                return `${x},${y}`
            }).join(" ")
            // create a polygon from a hex's corner points
            const polygon = gh
                .polygon(poly)
                .addClass("hex")
                .click(function() {
                    console.log(_h);
                });
        });

        let fid = face == null ? -1 : face.face._id;
        let [hx, hy] = face == null ? [-10, -10] : screenAdust(face.center);
        gp.circle(20).move(hx - 10, hy - 10).addClass('moveTo').rotate(45).fill(explored.includes(fid) ? "yellow" : "green");

        //show knowns 
        this._sites.forEach(s => {
            let _known = game.known.includes(s.face._id);
            let [sx, sy] = screenAdust(s.face.center);
            _known ? gp.text("⚑").font({ size: 30 }).fill('green').move(sx - 10, sy - 15) : null;
        })
    }
    get UI() {
        return UI(this);
    }
}

/*
    Manage Interactions with the SVG overlay 
*/
const SVGActions = (R) => {
    let { App } = window;
    let { height, width } = R.ps.raw;
    //get iframe attributes
    let ifattr = document.getElementById("psmap").attributes;
    let ifwh = [ifattr.width, ifattr.height];
    //get svg and set click 
    let svg = SVG('svg')

    svg.click(function(e) {
        //get iframe width and height
        let [iw, ih] = ifwh.map(v => Number(v.value));
        //offset x and y
        let [ex, ey] = [e.offsetX, e.offsetY];
        //get x and y of click - adjust for iframe size and origin at center
        const fx = (ex * width / iw) - width / 2;
        const fy = (ey * height / ih) - height / 2;
        //face data
        let { name, face } = R.closestFace(fx, fy);
        //
        App.face = face;
        App.setSelect('selFeature', name);
        console.log(name, face);
    })
}

/*
    Actions available on the map by terrain type
*/
const SettlementActions = ["Explore/Explore", "Rest/Rest", "Resupply/Resupply", "Sell Trinkets/SellTrinkets", "Trade Relic for Fame/RelicForFame"];
const WildActions = ["Camp/Camp", "Explore/Explore"]
/*
    User Interface
*/

const UI = R => {
    let { html, App } = window;
    let { game = {} } = App;
    let { stamina = [0, 0], _items = {} } = game;
    let { coin = 0, supply = [0, 0], trinkets = [0, 0], relics = [0, 0] } = _items;
    let { selected } = App.state;
    let { seed, realm, _people, _size, creatures, ps, routes = [], findRoute = null } = R;
    let _face = App.face || {};
    let _id = _face._id || -1;
    let _known = game.known ? game.known.includes(_id) : false

    //monitor for transit 
    let _terrain = "", tt = -1, st = -1;
    if (game.seed && game._plane == R.seed) {
        //game terrain 
        _terrain = game.hex.data._terrain;

        //travel & search time 
        tt = _id != -1 && game._hex != _id ? game.getTravelTime(_face) : -1;
        st = _id == game._hex && !game.known.includes(_id) && _terrain != "water" ? game.searchTime : -1;
    }

    //determine actions 
    let _act = {
        move: html`<div class="pointer dim bg-light-blue ba-white br2 pa2 tc b" onclick=${() => game.moveTo(_face)}>Move To (${tt.toFixed(1)} hrs)</div>`,
        wild: html`${WildActions.map(id => {
            let [text, act] = id.split("/")
            //limit actions
            if (_terrain == "water" || (act == "Explore" && (st == -1 || stamina[0] == 0)) || (act == 'Camp' && stamina[0] == stamina[1])) {
                return ''
            }
            let hrs = act == "Camp" ? 8 : st.toFixed(0)
            return html`<div class="w-50 pa1"><div class="pointer dim bg-light-blue ba-white br2 pa2 mh1 tc b" onclick=${() => game.act(act)}>${text} (${hrs} hrs)</div></div>`
        })}`,
        settlement: html`${SettlementActions.map(id => {
            let [text, act] = id.split("/")
            //limit actions
            if ((act == "Explore" && st == -1) || (act == 'Resupply' && (supply[0] == supply[1] || coin < 5)) || (act == 'SellTrinkets' && trinkets[0] == 0) || (act == 'Rest' && stamina[0] == stamina[1]) || (act == 'RelicForFame' && relics[0] == 0)) {
                return ''
            }
            let hrs = act == "Explore" ? st : 8
            return html`<div class="w-50 pa1"><div class="pointer dim bg-light-blue ba-white br2 pa2 tc b" onclick=${() => game.act(act)}>${text} (${hrs} hrs)</div></div>`
        })}`
    }[tt != -1 ? "move" : _terrain == "settlement" ? "settlement" : "wild"];

    //route frame 
    const routeFrame = html`<iframe id="route" width="1" height="1" src=${findRoute != null ? findRoute.ps.href : ""}></iframe>`

    //display routes 
    const travelRoutes = html`
    <div>
        <h4 class="ma0 mt1">Routes</h4>
        ${routes.map(r => html`
        <div class="f5 pointer dim bg-light-blue ba-white br2 ma1 pa1 tc b" onclick=${() => App.travelRequest(r)}>
            ${r[1]}
        </div>`)}
    </div>`

    //what feature is selected
    let _sf = selected.get('selFeature') || "";
    let _f = _sf == '' ? {} : ps.features[_sf] || {};
    let nff = _sf == '' ? 0 : _f.seed ? 0 : _f.faces ? _f.faces.length : _sf.includes("Open") ? R.openCountry.length : R.water.length;

    //get data from iframe once loaded 
    let { name, viewHeight } = ps.raw || {}

    //final layout 
    return html`
    <div class="pa1 ba">
  <div class="f4 bg-white-40 pa2 ba" style="width:400px;">
    <h2 class="ma0">${name || seed}</h2>
    <div class="b">${realm.name}, ${Cap(_size)}</div>
    <div>${findRoute != null ? routeFrame : ''}${ps.tags.filter(t => t != 'standard').join(', ')}</div>
    <div class="pa2">
        <div class="mv1"><b>People:</b> ${_people.map(p => p.text).join(", ")}</div>
        <div class="mv1 ${creatures.length == 0 ? 'dn' : ''}"><b>Creatures:</b> ${creatures.map((c, i) => c.text).join(", ")}</div>
    </div>
    <div class=${_sf == '' ? 'dn' : ''}>
        <h4 class="ma0">${_sf}${nff != 0 ? ` (${nff})` : ''}</h4>
        <div class="mh2">${_face.site && _known ? html`<b>Site:</b> ${_face.site.text}` : ''}</div>
        <div class="w-100 flex flex-wrap justify-center">${_act}</div>
    </div>
    ${routes.length > 0 ? travelRoutes : ''}
  </div>
  </div>`
}

/*
let R = new Region();
console.log(R.featureHex,R.hexGrid.length)
HexDisplay(R);
*/
