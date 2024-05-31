
/*
  Useful Functions 
*/
import {BuildArray, SpliceOrPush, chance} from "./random.js"

/*
  UI Resources  
*/

const Main = (app)=>{
  const {html} = app
  const {savedGames} = app.state 

  return html`
  <div class="flex flex-column justify-center m-auto mw6">
    <div class="f3 tc link pointer dim underline-hover hover-orange bg-white-70 db br2 mv1 pa2" onClick=${()=>app.show = "AllPlanes"}>Explore the Planes</div>
    <div class="f3 tc link pointer dim underline-hover hover-orange bg-white-70 db br2 mv1 pa2" onClick=${()=>app.show = "Factions"}>Factions</div>
    <div class="f3 tc link pointer dim underline-hover hover-orange bg-white-70 db br2 mv1 pa2" onClick=${()=>app.show = "Pantheons"}>Pantheons</div>
    <div class="f3 tc link pointer dim underline-hover hover-orange bg-white-70 db br2 mv1 pa2" onClick=${()=>app.generate()}>Generate New</div>
    <div class="dropdown">
      <div class="f3 tc link pointer dim underline-hover hover-orange bg-white-70  br2 mv1 pa2">Load</div>
      <div class="w-100 dropdown-content bg-white ba bw1 pa1">
        ${savedGames.map(([name,id])=> html`<div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>app.load(id)}>Load ${name}</div>`)}
      </div>
    </div>
  </div>
  `
}

//Main Explorer Display
const Explorers = (app)=>{
  const {html, characters, game} = app

  const Character = (C) => html`
  <div class="bg-white-70 br2 mw6 ma1 pa1">
    <div class="flex flex-wrap justify-between">
      <h3 class="ma0 mv1">${C.name}</h3>
      <div class="pointer b white underline-hover br1 pa1 ${C.isHired ? "bg-green" : "bg-light-blue"}" onClick=${()=> C.hire()}>${C.isHired ? "Hired" : "Hire"}</div>
    </div>
    <div class="ph1">
      <div class="flex justify-between">
        <div>${C.people.short}</div>
        <div>${C.cost/10} gp/month</div>
      </div>
      <div>LV: ${C.level} ${C.level>1 ? C.classes.join("/") : C.classes[0]}</div>
      <div class="flex justify-center">
        ${Object.entries(C.saves).map(([save,val],i)=> html`
        <div class="mh2">
          <div class="f4"><b>${save}</b> +${val}</div>
          ${C.actionsBySave[i].map(a => html`<div><b>${a[0]}</b> ${a[1]}</div>`)}
        </div>`)}
      </div>
      <div><b>Location:</b> <span class="link pointer dim underline-hover blue mh1" onClick=${()=>app.show = ["areas", C.location.id].join(".")}>${C.location.parent.name}, ${C.location.name}</span></div>
    </div>
  </div>
  `

  //final html
  return html`
  <div class="flex justify-center">
    ${Object.values(characters).map(Character)}
  </div>
  `
}

//Main Plane Display
const AllPlanes = (app)=>{
  let html = _.html
  const {planes, areas} = app

  return html`
  <div class="flex flex-wrap justify-center">
    <div class="bg-white-70 db br1 mh1 pa1">${planes.map(p=>html`
      <div class="ba br2 mv1 pa1">
        <h2 class="mv1" onClick=${()=>app.show = ["Plane", p.children[0].id].join(".")}><span class="pointer underline blue">${p.name}</span> [${p.children.length}]</h2>
        <div>${p.about}</div>
        <div class="flex">
          ${p.children.map(r=> r.parties.map(rp=> _.html`<div class="pointer dim bg-lightest-blue br2 pa2">${rp.characters.map(c=>c.name).join(", ")}</div>`))}
        </div>
      </div>`)}
    </div>
  </div>
  `
}

const Plane = (app)=>{
  let html = _.html
  const {planes, regions} = app
  const {reveal,show} = app.state
  let [_show,rid] = show.split(".")
  let region = regions.find(r=>r.id==rid)
  let plane = region.parent

  return html`
  <div class="mh2">
    <h2 class="ma0">
      <div class="dib dropdown">
        <div class="pointer underline-hover hover-blue">➢${plane.name}</div>
        <div class="dropdown-content bg-white ba bw1 pa1">
          ${plane.children.map(c=> c.id==rid ? "" : html`<div class="f5 link pointer dim underline-hover hover-orange ma1" onClick=${()=>app.show = ["Plane",c.id].join(".")}>${c.name}</div>`)}
        </div>
      </div>
    </h2>
    <p class="mh2">${plane.about}</p>
    <div class="flex justify-center center">
      <div class="bg-white-70" style="width:400px">${region.UI()}</div>
      <svg id="map" class="bg-white-70" height="600px" width="600px" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs">
        <g id="hex"></g>
      </svg>
    </div>
  </div>
  `
}

//Manage faction display 
const Factions = (app)=>{
  const {html, activeFactions} = app
  const {toGenerate} = app.state

  //create a new faction 
  const newFaction = (opts = {})=>{
    new app.gen.Faction(app,opts)
    app.refresh()
  }

  //pull lists for selection of new factions 
  const [Sigil,Outsiders] = Object.entries(app.gen.Factions).reduce((all,[name,f],i)=>{
    all[f.class == "Sigil" ? 0 : 1].push(name)
    return all
  }
  , [[], []])

  //used in selection 
  const Select = {
    Sigil,Outsiders,
    "Non-Aligned" : app.gen.Fronts
  }

  //lists of existing factions 
  const Existing = {
    Sigil : activeFactions.filter(f=>f.hasClass("Sigil")),
    Outsiders : activeFactions.filter(f=>f.hasClass("Outsider")),
    "Non-Aligned" : activeFactions.filter(f=>f.class.length == 1)
  }

  //final html
  return html`
  <div class="flex flex-wrap justify-center">
    ${Object.entries(Existing).map(([title,eF])=> html`
    <div class="ma1">
      <div class="flex flex items-center justify-between">
        <h2 class="mv1">${title}</h2>
        <div class="flex">
          <select class="pa1" value=${toGenerate} onChange=${(e)=> app.updateState("toGenerate",e.target.value)}>
            ${Select[title].map(name=>html`<option value=${name}>${name}</option>`)}
          </select>
          <div class="dim pointer underline-hover b white bg-gray br2 pa1" onClick=${()=>newFaction({template:toGenerate, name:toGenerate})}>Add</div>
        </div>
      </div>
      ${eF.map(f => f.UI)}
    </div>
    `)}
  </div>
  `
}

//Manage pantheon display 
const Pantheons = (app)=>{
  const {html, pantheons} = app

  const newPantheon = ()=>{
    new app.gen.Pantheon(app)
    app.refresh()
  }

  //final html
  return html`
  <div class="m-auto mw6">
    <div class="f3 tc link pointer dim underline-hover hover-orange bg-white-70 db br2 mv1 pa2" onClick=${()=>newPantheon()}>Add New Pantheon</div>
  </div>
  <div class="flex flex-wrap justify-center">
    ${pantheons.map(p=>html`
    <div class="bg-white-40 ba br2 mh1 pa1">
      <h3 class="mv1">${p.name}</h3>
      <div class="ph1">${p.children.map((c,i)=>c.UI)}</div>
    </div>`)}
  </div>
  `
}

//Site Display 
const Site = (app)=>{
  const {html, areas, area} = app
  const {view, iframe, generated} = app.state
  const {region} = area
  const {delves} = region

  //content of an area 
  let ccolors = ["hazard", "red", "discovery", "blue", "creature", "orange", "leader", "purple"]
  const perContent = ([c,i])=>html`
  <div class="flex items-center tc pointer ${"bg-" + ccolors[ccolors.indexOf(c) + 1]} br2 white b dim pa1">
    <span>${i}</span>
    <img src=${"img/" + c + ".png"} width="17" height="17"></img>
  </div>
  `

  const perArea = (a,i)=>html`
  <div class="flex items-center justify-between">
    <div class="flex items-center"> 
      <div class="f6 link dim dib bg-gray br2 tc white b pa1" style="min-width:45px;">#${i + 1}</div>
      <div class="mh2">${a.text}</div>
    </div> 
    <div class="flex items-center">${Object.entries(a.contents).map(perContent)}</div>
  </div>`

  //show site data for ruins/dungeons 
  return html`
  <div class="bb bw2 flex items-center justify-between ma1">
    <div class="f4">${region.name}, ${region.terrain}, ${region.alignment} [${region.safety}]</div>
    <div class="br2 bg-light-blue dim pointer tc b white ma1 pa1" onClick=${()=>app.setArea(region.id)}>Return to Region</div>
  </div>
  <div class="mh2 pt2">
    <div class="f4">${area.text}</div>
    <div><span class="b">Themes:</span> ${area.themes.join(", ")}</div>
    <div class="f5 ba mv1 pa1">
      ${area.children.map(perArea)}
    </div>
  </div>
  `
}

const Dialog = (app)=>{
  let[what,id=null,ui=null] = app.state.dialog.split(".")
  //<div class="fr pointer dim underline-hover hover-red bg-gray br2 white b pa1" onClick=${()=>app.updateState("dialog","")}>X</div>

  return _.html`
  <div class="fixed z-2 top-1 left-1 bottom-1 right-1 flex items-center justify-center">
    <div class="overflow-y-auto o-90 bg-washed-blue br3 shadow-5 pa2">
      ${id==null? app[what].UI : app[what][id][ui]}
    </div>
  </div>`
}

export {Main, AllPlanes, Plane, Dialog, Explorers, Pantheons, Factions}
