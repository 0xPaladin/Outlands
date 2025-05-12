//https://pure-css.github.io/start/
//https://picocss.com/docs

import { Chance, _ } from "./helper.js";
const Cap = _.capitalize;
import { Region } from "./region.js";

//The Game 
import { Game } from "./game.js"

//Preact with htm 
import { html, Component, render } from "https://unpkg.com/htm/preact/standalone.module.js";

//About 
import * as About from "./about.js"

//Sweet Alert Scenes
import { EnterScene, Swal } from "./scenes.js"


let prng = new Chance()

class App extends Component {
    constructor() {
        super();
        // Initialise our state. For now we only store the input value
        this.state = {
            mode: 'create',
            selected: new Map(),
            pullRoutes: [],
            changePlane: null,
            tick: 0
        };

        //pull game data 
        let _game = localStorage.getItem("game") || null;
        _game = _game == null ? {} : JSON.parse(_game);
        //has to be same week 
        let seed = _game._plane ? _game._plane : 'OL' + prng.AlphaSeed(14);

        //use game data 
        this.region = new Region({ seed });
        this.PSView = null;

        window.App = this;
        window.html = html;
        window.Swal = Swal;
    }

    // Lifecycle: Called whenever our component is created
    async componentDidMount() {
        localStorage.getItem("game") ? null : this.setSelect('about', 'Main');
        //timer 
        setInterval(() => {
            this.state.tick++;
            this.region.ps.raw ? this.region.overlay() : null;
            this.refresh();
        }
            , 1000)
    }

    refresh() {
        this.update();
        this.forceUpdate();
    }

    setSelect(id, val) {
        this.state.selected.set(id, val);
        this.refresh();
    }

    alert(data) {
        return Swal.fire(data);
    }

    enterScene(data, noEscape) {
        EnterScene(data, noEscape);
    }

    get time() {
        let _now = Date.now();
        let _d = Date.now() - (new Date(2025, 0, 1));
        let _day = 1000 * 60 * 60 * 24;
        let nDay = _d / _day;
        let nHr = 24 * (nDay % 1);
        let nMin = 60 * (nHr % 1);

        return [Math.floor(nDay), Math.floor(nHr), Math.floor(nMin), Math.floor(60 * (nMin % 1))]
    }

    get day() {
        return this.time[0]
    }

    //clear all saved data 
    reset() {
        Swal.fire({
            title: `Reset all game data?`,
            text: 'You will erase all of your points/time, and start over on a new plane. Ok?',
            showCancelButton: true,
            confirmButtonColor: "red",
            confirmButtonText: "Reset",
        }).then(res => {
            //clear data, reload page
            if (res.isConfirmed) {
                localStorage.clear();
                location.reload(true);
            }
        })
    }

    //post confirmation 
    travelRequest([seed, name]) {
        Swal.fire({
            title: `Travel to ${name}?`,
            text: 'All travel between planes takes 1-6 days.',
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            confirmButtonText: "Go!",
        }).then(res => {
            //handle move 
            if (res.isConfirmed) {
                this.state.selected.set('selFeature', null)
                this.state.changePlane = name;
                this.region = new Region({ seed })
            }
        })
    }

    update() {
        let { changePlane, pullRoutes } = this.state;

        //Initialise
        if (pullRoutes.length > 0 && this.region.findRoute == null) {
            this.region.findRoute = new Region({ seed: pullRoutes[0] });
        }
        //pull route data 
        if (document.getElementById('route') && pullRoutes.length > 0) {
            let seed = pullRoutes[0];
            //check for iframe
            let rframe = document.getElementById('route');
            let { PSMap = {} } = rframe.contentWindow;
            if (PSMap.name && this.region.findRoute.ps.seed == PSMap.bp.seed) {
                //set name 
                localStorage.setItem(seed, JSON.stringify([PSMap.name]))
                //remove find route 
                this.region.findRoute = null;
                //remove pullroute
                this.state.pullRoutes.shift();
            }
        }
        //skip if no map or already loaded
        if (!document.getElementById('psmap') || this.region == null || this.region.ps.raw) {
            return
        }

        //pull data from iframe 
        const iframe = document.getElementById('psmap');
        let { PSMap = {} } = this.iWindow = iframe.contentWindow;

        //do not process if awaiting new plane
        if (PSMap.name && changePlane && PSMap.name != changePlane) {
            return;
        }

        let islands = PSMap.islands ? PSMap.islands.map(isle => isle.faces.map(({ data, __id__ }) => {
            null != data.site ? data.site.init() : null != data.terrain ? data.terrain.init() : null;
            return __id__;
        })) : []
        if (islands.length == 0) {
            return;
        }

        //link gen to PS 
        this.region.linkToPS(PSMap, islands);

        //new game ?
        if (!this.game) {
            let _game = localStorage.getItem("game") ? JSON.parse(localStorage.getItem("game")) : null;
            this.game = _game != null ? Game.load(_game) : new Game();
        }

        //Initialise in storage 
        localStorage.getItem(this.region.seed) ? null : localStorage.setItem(this.region.seed, JSON.stringify([PSMap.name]));

        //move planes?
        if (changePlane != null) {
            this.game.changePlane(this.region);
            this.state.changePlane = null;
        }

        //adjust PS display 
        this.PSView = this.iWindow.PSView;
        this.PSView.applyPreset("cartoon");
        this.PSView.view.compass.set_visible(0);
        this.PSView.view.matte.set_visible(0);
        this.PSView.view.header.set_visible(0);
        this.PSView.view.setGrid(0);

        console.log(this.region)
        console.log(this.PSView)
        console.log(this.game)
    }

    render(props, { selected }) {
        let _about = selected.get("about") || null

        let { ps } = this.region;
        //get data from iframe once loaded 
        let { name, viewHeight } = ps.raw || {}
        //window sizing 
        const width = window.innerWidth;
        const height = window.innerHeight;
        let w = viewHeight > width ? width : viewHeight;
        w = w < height ? height : w;

        //final layout 
        return html`
    <iframe id="psmap" class="center-div" title="Perilous Shores Map - watabou.github.io"
        width=${w - 10}
        height=${w - 10}
        src=${ps.href}
      >
    </iframe>
    <svg id="overlay" class="center-div" width=${w} height=${w} xmlns="http://www.w3.org/2000/svg">
      </svg>
    <div class="fixed top-0 left-0 pa2">
      ${this.region.UI}
    </div>
    <div class="fixed top-0 right-0 pa2">
      ${this.game ? this.game.UI : ''}
    </div>
    <div class=${_about == null ? 'dn' : 'center-div w-50 bg-white-80 top-2 pa2 f4'}>
        ${_about != null ? About[_about]() : ''}
    </div>`
    }
}

render(html`<${App}/>`, document.getElementById('app'));
