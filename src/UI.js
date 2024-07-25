/*
  Snippets 
*/

const setSelection = (key,val)=>App.refresh(App.state.selection.set(key, val))

/*
  UI Resources  
*/

export const About = (app)=>{
  let html = _.html
  return html`
  <div class="center bg-white-70 pa2" style="width:1200px;">
  <div class="fr pointer dim underline-hover ba br2 pa2 mr2" onClick=${()=>app.show = "Strand"}>X</div>
  <h3>About the Site</h3>
  <p>This is a fan-made science-fantasy setting inspired by the <i>Grimdark Future</i> and <i>Age of Fantasy</i> wargames by <a href="https://www.onepagerules.com/" target="_blank">One Page Rules</a>. It is set in the same galaxy as the Sirius Sector created by OPR, but it takes many of the factions from Sirius and transports them to a distant location and puts them into a new context. It also brings in a number of other factions using models from other amazing creators like: <a href="https://www.myminifactory.com/users/ArchvillainGames" target="_blank">Archvillian Games</a>, <a href="https://www.patreon.com/pipermakes/posts" target="_blank">Piper</a>, <a href="https://www.myminifactory.com/users/MammothFactory" target="_blank">Mammoth Factory</a>, <a href="https://www.myminifactory.com/users/Fleshcraft-Studio" target="_blank">Fleshcraft Studio</a>, and <a href="https://www.myminifactory.com/users/DragonTrappersLodge" target="_blank">The Dragon Trappers Lodge</a>.</p>
  <p>The <i>Cosmic Stand</i> is primarily a work of fiction and a showcase of procedural generation. It uses code to generate whole continents, nations, random encounters and much, much more. Hopefully, it will be a tool that can be used to generate campaigns, battles, sites to explore, encounters, treasure, etc. Down the line there may be conversion notes on how to go from OPR stats to OSR, so that the Strand could also be used as a setting for roleplaying games.</p>
  <h3>A Brief History of the Strand</h3>
  <p>The Strand is an orbital ring: a series of 777 plates, each thousands of kilometers (4900 km) across, all linked together in a giant, spinning ring. 
  The inside of the Strand has standard gravity, an atmosphere and each plate has its own varied terrain and biosphere. It has become the home to many of the peoples of the Sirius Sector. </p> 
  <p>No one knows the Architects of the Strand, it was abandoned when the Saurians first found it a few thousand years ago. 
  But their ruins still dot the surface, and the Architect's quixotic AI still maintains and protects the Strand. </p>
  <h3>The New Strand Era</h3>
  <p>The new era for the Strand began 3428 years ago (0 NSE). The orbital was tucked away in a nebula in the Sirius Sector that hid it from long-range scans and observation. To find the Strand explorers had to intentionally enter and search the nebula.</p>
  <p>The Starhost was the first recorded group to find the Strand - presumably looking for one of their slumbering mages. Hopeful because of the presence of the dragons, they began to search the Strand. They searched for hundreds of years, established a number of cities, but found little besides the warring Aboleth factions. Definitely not the Architects, the Aboleth had actually found the Strand hundreds of years before the Starhost and they took advantage of its abandonment and isolation to claim some of its seas as their own.</p>
  <h3>High Elf Settlement (326 NSE)</h3>
  <p>The next phase of inhabitants came in 326 NSE when a number of ships from the High Elf Fleets entered the nebula to hide from the Robot Legions. They found the Strand and many decided to settle on a number of unpopulated plates. More Fleet ships came and the High Elf population rapidly grew.</p>
  <p>Unfortunately the Robot Legions are relentless, and in 1051 NSE they also found the Strand. A war broke out over and on the Strand, and this hostility triggered the first overt response from the Strand’s AI. The AI enabled the orbital’s defenses and blasted the two fleets out of the sky. Survivors from both factions landed all over the Strand and new pockets of civilization centered around their crash sites.</p>
  <p>Like sharks to blood in the water the psychic disturbance, the Yellow Court and the Daemons of Change found the Strand. Using dimensional magics they slipped through the orbitals space defenses and established themselves throughout the Strand. They separately began to draw on the buried power sources of the Architects to fuel their magic and they each set out to twist and dominate the locals. Concurrently the largest surviving group of the Robot Legion was working to delve deep into the orbital to harness its power as well. </p>
  <p>The AI responded again, and it chose its first avatars: two from among the High Elves and one from among the Saurians. The Wood Elves, Brightsoul Order, and the Drakklings were created to confront these threats to the Strand. The AI re-established the portals to allow rapid travel around the orbital and taught its avatars their secrets. Battles were fought across the Strand for decades, and the AI backed forces slowly achieved victory. The Yellow Court had seemingly fled while the Change Demons and Robot Legions were isolated to small pockets of resistance.</p>
  <p>Then in 1471 NSE the Robot Legions initiated a monumental surprise cyber attack on the AI itself. They had been working for years to find a way to get into the AI’s network and they had always been foiled, but recently they had found a backdoor. Using this they released a virus and initiated an assault using their own AIs. </p>
  <p>For a brief time the Strand’s AI lost control of various systems as the Legion AIs tried to take control. The AI was victorious, but not without cost. The virus caused the nano-compilers to twist the surface into numerous oddities, which continue to birth aberrations. And a nano-phage was released that infected a number of settlements creating the Infected. Also, the AI was unable to destroy or isolate all of the Legion AIs and they are still able to take over systems and regions and manifest as Ghostly Undead.</p>
  <p>Peace settled on the Strand for years and the people went back to their lives. The AI began to manufacture the Corps - robotic servants that function only to do its will. Mostly they seem to try and destroy or contain the oddities and the blight that they spread. While others will be rebuilding portions (but not all) of the ruins.     </p>
  <h3>Eternal Dynasty (1844 NSE)</h3>
  <p>The next wave of inhabitants came in 1844 NSE when deep space explorers from the Eternal Dynasty found the Strand. The AI warned them, but they chose to ignore it, and they wereI shot down. Their emergency beacons brought Dark Elf Raiders, a Dynasty capital ship, and Orcs. The Dynasty and the Orcs engaged in a short battle before they got too close and were brought down by the orbital’s defenses. While the Dark Elves have become a plague to the Strand, using stealth and debris to circumvent the orbitals defenses. They perform regular hit and run raids on settlements across the orbital.</p>
  <p>Again, the renewed activity around the orbital drew dark forces and the Darkbound Covenant, Daemons of Plague and the Shadow Stalkers slipped in. While the Yellow Court and the Change Daemons never really left, and thanks to the power from the oddities experienced a resurgence. Many isolated settlements of the Strand were warped and molded into Havoc Warriors.</p>
  <h3>Aboleth War (1980 NSE)</h3>
  <p>The Aboleth, long quiet and fractious,  in 1980 NSE they united under a powerful sorcerer king. They also drew power from the oddities and with powerful magic they birthed the Kaiju in order to dominate the surface. The AI elected an avatar from amongst the High Elves and the Eternal Dynasty. It created the Sea Elves to fight the Aboleth in the water and the Dynasty Giants to fight the Kaiju on the land. And for 26 years the forces of the AI just kept the Aboleth contained. Eventually the Aboleth nature got the better of them: the sorcerer king fell out of power and the Aboleth empire fractured.</p>
  <h3>Alien Hives and Human Settlement (2791 NSE)</h3>
  <p>The fourth wave of inhabitants to the Shard came in 2791 when the Alien Hives found the orbital. The AI couldn’t communicate with the Hive and it swarmed the orbital seed ships. The defenses destroyed many but many were able to land and establish hive colonies. Not caring about the stability of the orbital, the Hive colonies quickly expanded and began to decimate the local ecologies. The AI started to manufacture Void Frames to combat the Hive and called upon the already chosen avatars to help stop the destruction. </p>
  <p>The forces fought to an uneasy standstill that lasted until 2861 when Humans from the HDF found the Shard. The AI warned them, but they listened and held off to communicate with the AI. They knew the Hive could be reasoned with and taught the AI, which ushered in an era of calm to the Strand. In return the AI allowed the humans to settle on a number of the plates on the Strand. </p>
  <p>Finally in 2875 the renewed traffic in and out of the nebula drew the attention of the Battle Brothers. Not knowing the different human factions, the AI allowed them land just like the other humans. And their coming once again upset the stability of the Strand. They quickly established a number of beacheads and continued their campaign to bring the other humans under their dominion.</p>
  <p>The AI elected another avatar from among the humans and created the Angelic Host to help their defense. Not willing to lose the fight the Brothers called for a reinforcement fleet. And this was the last straw for the AI.</p>
  <h3>The Great Shift (2878 NSE)</h3>
  <p>Tired of all the traffic and chaos and longing for the quiet life again, it created a massive wormhole and took the Strand out of the sector. After which every living creature heard the same edicts:</p>
  <ul>
    <li>No ship is allowed to leave the Strand.</li>
    <li>No open warfare.</li>
    <li>Do not attempt to tamper with or interface with the Strand’s systems.</li>
    <li>Do not attempt to destroy the gates.</li>
    <li>Terminus is open to all, no one people, nation or faction is allowed to control it.</li>
  </ul>
  <p>It let its avatars know that it “needed a break” and was going to sleep for a while. It expected them to follow the rules, get along and maintain order. The Corps would continue their labor, and the Void Frames would act as arbiters of the edicts.</p>
  <p>The AI created gates on every plate on the Strand and it created Terminus, a great city floating over plate 333. All the gates lead to the Terminal on Terminus. And every single plate has a hall dedicated to its gates within the Terminal. Due to its importance, Terminus has become the de facto capital of the Strand. All of the people, nations and factions have established a presence within the city.</p>
  <h3>Current Day (3228 NSE)</h3>
  <p>The year is 3228, the great shift happened 350 years ago and a relative peace exists. Confined to remain on the orbital, the people have turned to exploring and settling the unclaimed territory. Despite all of the influx to the Strand over the 3000 years, much of the orbital remains unsettled and unexplored.</p>
  <p>What legacy will you leave on the Strand?</p>
  <p></p>
  </div>`
}

/*
  Crews 
*/
export const Teams = (app)=>{
  let _h = _.html
  let {crews} = app

  return _h`
  <div class="flex ba pa1 mv1">
    <div class="w-two-thirds br pr1 ">
      <div class="flex items-center justify-between">
        <h3 class="ma0">Armies/Strike Teams</h3>
        <div class="pointer dim b tc white bg-green br2 pa1 mr2" onClick=${()=> app.dialog = "EditTeam"}>Add</div>
      </div>
    </div>
    <div class="w-third mh2">
      
    </div>
  </div>`
}

/*
  Factions  
*/
  
const ALIGNMENTS = ["lawful","good","neutral","evil","chaotic"]
export const Factions = (app)=>{
  let _h = _.html
  const {factions,states=[]} = app.setting.Strand
  let {selection} = app.state
  //filter for plates 
  let[topo="All",climate="All",faction="All",pfid=1] = selection.get("plate-filter") || []

  //update state 
  const setSelection = (key,val)=>app.refresh(app.state.selection.set(key, val))

  //selected faction 
  let [_tier=1,_fid="All",align="All",si=-1] = selection.get("faction-filter") || []
  let FF = states.filter(s=>{
    return s.i!=0 && ["All",s.tier].includes(_tier) && ["All",s.alignment].includes(align) && ["All",s._faction].includes(_fid)
  }
  )
  let _selected = FF.find(s=>s.i == si)

  //selected UI 
  const selectedFacton = !_selected ? "" : _h`
  <h4 class="ma0">${_selected.fullName} ${_.romanNumeral(_selected.tier)}</h4>
  <div>${_selected._faction}</div>
  <div><b>Plates:</b> ${_selected._nations.map((s,i)=>_h`<span class="dib pointer underline-hover" onClick=${()=>setSelection("plate-filter", [topo, climate, faction, s])}>${s}</span>${i==_selected._nations.length-1?"":", "}`)}</div>
  <div class="pointer dim w-100 tc b white bg-green br2 pa2" onClick=${()=>setSelection("gen-mission",app.gen.Mission(_selected))}>Generate Mission</div>`

  //mission
  let _mission = selection.get("gen-mission") || null
  let missionUI = !_mission ? "" : _h`${_mission.text}`
  
  //faction filter 
  const filter = _h`
  <h3 class="ma0">Factions</h3> 
  <div class="flex items-center bg-light-gray">
    <div class="pa1">
      <span class="b mr1">Faction:</span>
      <select class="pa1" value=${_fid} onChange=${(e)=>setSelection("faction-filter", ["All", e.target.value, "All", -1])}>
        <option value="All">All</option>
        ${Object.entries(factions).filter(e=>e[1].nations.size > 0).sort((a,b)=>a[0].localeCompare(b[0])).map(e=>_h`<option value=${e[0]}>${e[0]}</option>`)}
      </select>
    </div>
    <div class="dropdown">
      <div class="tc pointer dim underline-hover pa2"><b>Tier:</b> ${_tier == "All" ? "All" : _.romanNumeral(_tier)}</div>
      <div class="w-100 dropdown-content bg-white ba bw1 pa1">
        <div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>setSelection("faction-filter", ["All", _fid, align,si])}>All</div>
        ${_.fromN(5,i=>i+1).map(t=>_h`<div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>setSelection("faction-filter", [t, _fid, align,si])}>${_.romanNumeral(t)}</div>`)}
      </div>
    </div>
    <div class="dropdown">
      <div class="tc pointer dim underline-hover pa2"><b>Alignment:</b> ${align}</div>
      <div class="w-100 dropdown-content bg-white ba bw1 pa1">
        <div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>setSelection("faction-filter", [_tier, _fid, "All",si])}>All</div>
        ${ALIGNMENTS.map(a=>_h`<div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>setSelection("faction-filter", [_tier, _fid, a, si])}>${a}</div>`)}
      </div>
    </div>
  </div>`

  return _h`
  <div class="flex ba pa1">
    <div class="w-two-thirds br pr1 ">
      ${filter}
      <div><b>Factions:</b> ${FF.map((s,i)=>_h`<span class="dib pointer underline-hover" onClick=${()=>setSelection("faction-filter", [_tier, s._faction, "All", s.i],selection.set("gen-mission",null))}>${s.fullName}</span>${i==FF.length-1?"":", "}`)}</div>
    </div>
    <div class="w-third mh2">
      <div class="mv1">${selectedFacton}</div>
      ${missionUI}
    </div>
  </div>`
}

//
const CLIMATE = 'sub-arctic,temperate,sub-tropical,tropical,sub-tropic-temperate,temperate-sub-tropic,temperate-sub-arctic,sub-arctic-temperate,sweep-up,sweep-down'
const TOPO = {
  'lowIsland': 'Island',
  'continents': 'Continents',
  'archipelago': "Archipelago",
  'mediterranean': 'Central Sea',
  'peninsula': "Peninsula",
  'pangea': 'Continents',
  'isthmus': "Isthmus",
  'shattered': 'Continents',
  'oldWorld': 'Continents',
  'fractious': "Fractured",
  'manyIslands': "Archipelago"
}
//Main Plane Display
export const Strand = (app)=>{
  let html = _.html
  const {planes, setting, state} = app
  const {selection,favorites} = state
  let _favs = [...favorites].filter(key=>!key.includes(".")).sort((a,b)=>a-b)
  const Strand = setting.Strand
  let {platesByTopography, plates, factions} = Strand

  //update state 
  const setSelection = (key,val)=>app.refresh(app.state.selection.set(key, val))
  const reveal = (id)=>state.reveal.has(id) ? "" : "dn"

  //filter for plates 
  let[topo="All",climate="All",faction="All",pfid=1] = selection.get("plate-filter") || []
  let PF = plates.all.filter(p=>{
    let pf = ['All'].concat(p.settlements ? p.settlements.map(_f=>_f.id) : p.factions.map(_f=>_f.id))
    return ["All", p.topo].includes(topo) && ["All", p.climate].includes(climate) && pf.includes(faction)
  }
  ).map(p=>p.i)
  let _selected = Strand.plates.all.find(p=>p.i == pfid)

  const selectedPlate = html`
  <div class="flex items-center justify-between">
    <h3 class="ma0"><span class="pointer ${favorites.has(pfid)?"gold":"gray"}" onClick=${()=> app.toggleFavorite(pfid)}>★</span> #${_selected.i} ${_selected.topo}, ${_selected.climate}${_selected.precip == "standard" ? "" : ", " + _selected.precip}</h3> 
    <div class="tc white b pointer dim bg-green br2 pa2" onClick=${()=>showPlate()}>View</div>
  </div>
  <div class="flex">
    <div class="f5 b mr2">${_selected.home ? "Nations" : "Settlements"}:</div>
    ${[...new Set(_selected[_selected.home ? "factions" : "settlements"].map(f=>f.id))].sort((a,b)=>a.localeCompare(b)).join(", ")}
  </div>
  ${_selected.about ? html`<div class="mt1"><b>${_selected.name}:</b> ${_selected.about}</div>` : ""}
  `

  //view selected plate 
  const showPlate = ()=>{
    new app.gen.Plane(app,_selected)
    app.show = ["Plate", _selected.seed].join(".")
  }
  
  //header 
  const header = html`
  <div class="flex items-center mv1">
    <h2 class="ma0">The Strand</h2> 
    <div class="i b tc pointer dim underline-hover ba br2 mh1 pv1 ph2" onClick=${()=>app.toggle("strand-about")}>i</div>
    <div class="tc pointer dim underline-hover ba br2 pa1" onClick=${()=>app.show = "About"}>📖</div>
  </div>
  <div class="ma2 ${reveal("strand-about")}">The Strand is an orbital ring: a series of 777 plates, each thousands of kilometers (4900 km) across, all linked together in a giant, spinning ring. 
    The inside of the Strand has standard gravity, an atmosphere and each plate has its own varied terrain and biosphere. It has become the home to many of the peoples of the Sirius Sector. 
  </div>
  `

  //plate filter 
  const plateFilter = html`
  <h3 class="ma0">Plates</h3> 
  <div class="flex items-center justify-between">
    <div class="dropdown">
      <div class="tc pointer dim underline-hover bg-light-gray br2 pa2"><b>Topography:</b> ${topo}</div>
      <div class="w-100 dropdown-content bg-white ba bw1 pa1">
        <div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>setSelection("plate-filter", ["All", climate, faction])}>All</div>
        ${Object.keys(platesByTopography).map(_topo=>html`<div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>setSelection("plate-filter", [_topo, climate, faction])}>${_topo}</div>`)}
      </div>
    </div>
    <div class="dropdown">
      <div class="tc pointer dim underline-hover bg-light-gray br2 pa2"><b>Climate:</b> ${climate}</div>
      <div class="w-100 dropdown-content bg-white ba bw1 pa1">
        <div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>setSelection("plate-filter", [topo, "All", faction])}>All</div>
        ${CLIMATE.split(",").map(_c=>html`<div class="link pointer dim underline-hover hover-orange ma1" onClick=${()=>setSelection("plate-filter", [topo, _c, faction])}>${_c}</div>`)}
      </div>
    </div>
    <div class="bg-light-gray br2 pa1">
      <span class="b mr1">Faction:</span>
      <select class="pa1" value=${faction} onChange=${(e)=>setSelection("plate-filter", [topo, climate, e.target.value])}>
        <option value="All">All</option>
        ${Object.entries(Strand.factions).filter(e=>e[1].nations.size > 0).sort((a,b)=>a[0].localeCompare(b[0])).map(e=>html`<option value=${e[0]}>${e[0]}</option>`)}
      </select>
    </div>
    <div class="bg-light-gray br2 pa1">
      <span class="b mr1">Plate:</span>
      <select class="pa1" value=${pfid} onChange=${(e)=>setSelection("plate-filter", [topo, climate, faction, e.target.value])}>
        ${PF.map(_id=>html`<option value=${_id}>${_id}</option>`)}
      </select>
    </div>
  </div>
  `

  return html`
  <div class="center bg-white-70 pa2" style="width:1200px;">
    ${header}
    <div class="w-100 flex items-top justify-between ba pa1">
      <div class="w-two-thirds br pr2 mr1">${plateFilter}</div>
      <div class="w-third mh2">${selectedPlate}</div>
    </div>
    <div class="ba mv1 pa1">
      <div class="flex items-center">
        <h4 class="ma0 mr2">Named:</h4>
        <div>${planes.sort((a,b)=>a.i - b.i).map((p,i)=>html`<span class="dib pointer underline-hover" onClick=${()=>setSelection("plate-filter", [topo, climate, faction, p.i])}>${p.name} [#${p.i}]</span>${i==planes.length-1?"":", "}`)}</div>
      </div>
      <div class="flex items-center">
        <h4 class="ma0 mr2">Favorites:</h4>
        <div>${_favs.length == 0 ? "None" : _favs.map((id,i)=>html`<span class="dib pointer underline-hover" onClick=${()=>setSelection("plate-filter", [topo, climate, faction, id])}>${id}</span>${i==_favs.length-1?"":", "}`)}</div>
      </div>
    </div>
    ${Factions(app)}
    ${Teams(app)}
  </div>
  `
}

export const Plate = (app)=>{
  let html = _.html
  const {planes, regions} = app
  const {reveal, show} = app.state
  let[_show,pid] = show.split(".")
  let plane = app.activeState[pid]
  let {zoom, _showWhat, nations, factions=[], factionGroup} = plane
  let si = plane._show ? plane._show.i : -1

  const select = (i=-1)=>i == -1 ? plane._show = null : plane.nations[i].select(-1)

  const hasFactions = Object.entries(factionGroup).map(([key,data=[]])=>_.html`
  <h3 class="mv1">${key}</h3>
  <div>
  ${data.sort((a,b)=>a.name.localeCompare(b.name)).map(n=>_.html`<div class="ba pa1 mb1">${n.UI}</div>`)}
  </div>`)

  return html`
    <div class="flex justify-center center ph2">
      <div style="width:400px;">
        <h2 class="ma0"><div>${plane.name || `Plate #${plane.i}`}</div></h2>
        <p class="mh2">${plane.state.about}</p>
        <div class="mh1 overflow-y-auto" style="max-height:800px;">
          <h3 class="pointer underline-hover hover-blue mv1 ${factions.length == 0 ? "dn" : ""}" onClick=${()=>select()}>Faction ${plane.originPlate ? "Nations" : "Settlements"}</h3>
          ${hasFactions}
        </div>
      </div>
      <div>
        <div class="flex mv1">
          <div class="f4 b pointer dim white hover-black bg-light-blue br2 pa1 ph2" onClick=${()=>plane.display(!zoom)}>Zoom ${zoom ? "Out" : "In"}</div>
        </div>
        <svg id="map" class="bg-white-70" height="600px" width="600px" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs"></svg>
      </div>
    </div>
  `
}

const EditTeam = (app)=>{
  //constants 
  const TYPE = ["Army", "Fire Team"]
  //faction, id, n, xp, traits, notes
  const UNIT = ["","",1,0,"",""]  

  //DATA 
  let _h = _.html
  let DB = app.db.teams
  let {selection, saved} = app.state
  //manage list for rapport 
  const {factions,states=[]} = app.setting.Strand
  let stateForRapport = states.filter(s=>s.i!=0).map(s=>[s._faction,s.fullName].join(" - ")).sort((a,b)=>a.localeCompare(b))
  
  let tid = selection.get("load-team") || ""
  let T = selection.get("team-edit")

  const load = async()=>app.refresh(selection.set("team-edit", Object.assign({
    id: tid
  }, await DB.getItem(tid))))
  const save = ()=>{
    let _id = T.id || chance.hash()
    DB.setItem(_id, T)
    saved.teams[_id] = T.name
    console.log(T)
  }

  const addToArray = (key,val) => T[key] ? T[key].push(val) : T[key] = [val]

  //generic input field 
  const InputField = (label,val,set,w=100)=>_.html`
  <div class="flex items-center mh1 w-${w}">
    <div class="b mr2">${label}</div>
    <input class="w-100" type="text" value=${val} onInput=${(e)=>set(e.target.value)}></input>
  </div>`

  const SelectField = (label,val,data,set)=>_.html`
  <div class="flex items-center mh1">
    <div class="b mr2">${label}</div>
    <select class="w-100 pa1" value=${val} onChange=${(e)=>set(e.target.value)}>${data.map(d=>_h`<option value=${d}>${d}</option>`)}</select>
  </div>`

  return _h`
    <div style="width:800px;">
      <h3 class="ma0">Edit Army/Fire Team</h3>
      <div class="items-center ${saved.teams.length==0?"dn":"flex"}">
        <select class="w-100 pa1" value=${tid} onChange=${(e)=>setSelection("load-team", e.target.value)}>${saved.teams.map(c=>_h`<option value=${c[0]}>${c[1]}</option>`)}</select>
        <div class="b white tc link pointer dim underline-hover hover-orange bg-green db br1 pa2" onClick=${()=>load()}>Load</div>
      </div>
      <div class="flex justify-between mv1">
        ${InputField("Name", T.name||"New Team", (v)=>T.name = v,50)}
        ${SelectField("Type", T.type, TYPE, (v)=>T.type = v,100)}
        ${InputField("Pts", T.points||0, (v)=>T.points = v,10)}
        ${InputField("VP", T.vp||0, (v)=>T.vp = v,10)}
      </div>
      <div class="mh1">
        <div class="b">Notes</div>
        <textarea class="w-100" rows="4" value=${T.notes} onChange=${(e)=>T.notes=e.target.value}></textarea>
      </div>
      <div class="bb pv1 mh1">
        <div class="flex items-center justify-between bb pb1 mb1">
          <h4 class="ma0 mt2">Faction Rapport</h4>
          <div class="pointer dim b tc white bg-green br2 pa1 mr2" onClick=${()=> addToArray("rapport",["",0])}>Add</div>
        </div>
        <div class="flex justify-between">
          ${(T.rapport||[]).map((r,i)=> _h`
          ${SelectField("Faction", T.rapport[i][0], stateForRapport, (v)=>T.rapport[i][0] = v,100)}
          ${SelectField("Rapport", T.rapport[i][1], _.fromN(21,j=>j-10), (v)=>T.rapport[i][1] = v,100)}`)}
        </div>
      </div>
      <div class="bb pv1 mh1">
        <div class="flex items-center justify-between bb pb1">
          <h4 class="ma0 mt2">Units</h4>
          <div class="pointer dim b tc white bg-green br2 pa1 mr2" onClick=${()=> addToArray("units",UNIT.slice())}>Add</div>
        </div>
        <div class="flex justify-between">
          ${(T.units||[]).map((u,i)=> _h`
          ${SelectField("Faction", T.units[i][0], Object.keys(factions).sort((a,b)=>a.localeCompare(b)), (v)=>T.units[i][0] = v,100)}`)}
        </div>
      </div>
      <div class="b white tc link pointer dim underline-hover hover-orange bg-green db br2 mv1 pa2" onClick=${()=>save()}>Save</div>
      <div class="b white tc link pointer dim underline-hover hover-orange bg-green db br2 mv1 pa2" onClick=${()=>app.dialog = ""}>Close</div>
    </div>`
}

const D = {
  EditTeam
}

export const Dialog = (app)=>{
  let[what,id=null,ui=null] = app.state.dialog.split(".")
  //<div class="fr pointer dim underline-hover hover-red bg-gray br2 white b pa1" onClick=${()=>app.updateState("dialog","")}>X</div>

  return _.html`
  <div class="fixed z-2 top-1 left-1 bottom-1 right-1 flex items-center justify-center">
    <div class="overflow-y-auto o-90 bg-washed-blue br3 shadow-5 pa2">
      ${app[what] ? app[what][id][ui] : D[what] ? D[what](app) : ""}
    </div>
  </div>`
}
