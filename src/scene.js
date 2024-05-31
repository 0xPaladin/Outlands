class Quest {
  constructor(app, state) {
    this.app = app
    this.what = state.w = "Quest"
    this.id = state.id = state.id || chance.hash()

    //save to states 
    app.game.toSave.add(this.id)
    app.game.state[this.id] = state
    app.activeState[this.id] = this
  }
  get state() {
    return this.app.game.state[this.id] || null
  }
  get quest() {
    let[sid,qid] = this.state.qid.split(".")
    return this.app.scenarios.Quests[sid][qid]
  }
  get text() {
    return this.quest.text(this.state)[this.state.done ? 1 : 0]
  }
  async complete (party) {
    let {reward,scene} = this.quest
    let state = this.state
    //complete 
    this.state.done = true

    //reward 
    if(reward.f) {
      let data = Object.fromEntries(Object.entries(reward.data).map(([key,sid])=> [key,state[sid]]))
      Functions[reward.f](this,data)
    }
    else {
      party.reward(reward)
    }
    
    //check for new scene 
    scene ? await Scene.enter(this.app, scene, this) : null
    //save 
    this.app.save()
  }
}

class Scene {
  constructor(app, id) {
    this.app = app
    this.id = id

    let[sid,_id] = id.split(".")
    let _scene = this._scene = app.scenarios.Scenes[sid][_id]

    //start data, options 
    let D = this.data = {}
    let O = this.options = []

    //first get definitions 
    Object.entries(_scene.defs || {}).forEach(([key,path])=>D[key] = _.deepGet(app, path, null))

    //make option function 
    let makeOption = ({text, f, scene, data, _data})=>{
      O.push({
        text: _.wrapToHTML(text, data),
        f,
        scene,
        data : _data || data
      })
    }

    //run gen 
    Object.entries(_scene.gen || {}).forEach(([key,{what, n=1, state={}, option={}}])=>{
      //function per generate 
      let gen = ()=>{
        let data = new app.gen[what](app,Object.apply({}, state))
        if (option.text) {
          option.data = data
          option._data = option._data ? Object.fromEntries(Object.entries(option._data).map(([key,id])=>[key,data[id]])) : null
          makeOption(option)
        }
        return data
      }
      //set data run gen 
      D[key] = n == 1 ? gen() : _.fromN(n, ()=>gen())
    }
    )

    //get data functions 
    Object.entries(_scene.get || {}).forEach(([key,{what, f, option={}}])=>{
      //set data run gen 
      D[key] = f(what == "data" ? D : Object.values(app.activeState).filter(obj=>obj.what == what))
      //create options 
      if (option.text) {
        [D[key]].flat().forEach(obj=>{
          option.data = obj
          option._data = option._data ? Object.fromEntries(Object.entries(option._data).map(([key,id])=>[key,obj[id]])) : null
          makeOption(option)
        }
        )
      }
    }
    )

    //do text & header 
    this.header = _.wrapToHTML(_scene.header || "", D)
    this.text = _.wrapToHTML(_scene.text || "", D)

    //options 
    let opts = _scene.options || []
    opts.forEach(o=>makeOption(Object.assign({
      data: D
    }, o)))
  }
  static async enter(app, id="", from) {
    let F = app.functions
    app.game.active.scene = id
    if (id == "") {
      app.dialog = ""
    } else {
      let scene = app.scene = new Scene(app,id)
      //run on enter functions 
      let _onEnter = scene._scene.onEnter || []
      _onEnter.forEach(e=>F[e.f](scene, e.data))
      //show dialog 
      app.dialog = "scene"
    }
  }
  async exit(o) {
    let F = this.app.functions
    //run on exit functions 
    let _onExit = this._scene.onExit || []
    _onExit.forEach(e=>F[e.f](this, e.data))

    //run option function if provided
    o.f ? F[o.f](this, o.data) : null

    //change scene 
    await Scene.enter(this.app, o.scene, this)
    //save 
    this.app.save()
  }
  get UI() {
    let {header="", text, options=[]} = this

    return _.html`
    <div style="width:600px;max-height:75vh;">
      <h2 class="ma0">${header}</h2>
      <div class="pa2">
        <div>${text}</div>
        <div>
          ${options.map(o=>_.html`<div class="tc pointer dim bg-light-gray br2 ma1 pa2" onClick=${()=>this.exit(o)}>${o.text}</div>`)}
        </div>
      </div>
    </div>`
  }
}

export {Scene, Quest}
