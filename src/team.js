const DB = localforage.createInstance({
  name: "Teams"
});

//const CREWTYPES = ["Enclave","Engineers","Mercenaries","Merchants","Shadows"]

//unit = faction, id, n, xp, traits, notes 
//rapport = state id, val 

export class Team {
  constructor(app,state={}) {
    this.what = "Team"
    this.app = app 
    this.id = chance.hash()

    //crew state 
    this.state = Object.assign({
      name : "New Crew",
      type : "",
      points : 0,
      vp : 0, 
      rep : 0,
      tier : 0,
      notes : "",
      rapport : [],
      units : []
    },state)

    app.activeState[this.id] = this
  }
  get editor () {
    let _h = _.html 
    let app = this.app
    let {selection,saved} = app.state 
    let crewID = selection.get("load-crew") || ""

    const load = async () => app.refresh(selection.set("crew-edit",await DB.getItem()))
    const save = () => null

    return _h`
    <div style="width:800px;">
      <div class="flex items-center">
        <select value=${crewID} onChange=${()=>app.refresh(selection.set("load-crew",e.target.value))}>${saved.crews.map(c=> _h`<option value=${c[0]}>${c[1]}</option>`)}</select>
        <div class="b white tc link pointer dim underline-hover hover-orange bg-green db br1 pa2" onClick=${()=>load()}>Load</div>
      </div>
      <div class="flex mv1">
        
      </div>
      <div>
       
      </div>
      <div class="b white tc link pointer dim underline-hover hover-orange bg-green db br2 mv1 pa2" onClick=${()=>save()}>Save</div>
      <div class="b white tc link pointer dim underline-hover hover-orange bg-green db br2 mv1 pa2" onClick=${()=>app.dialog=""}>Close</div>
    </div>`
  }
}