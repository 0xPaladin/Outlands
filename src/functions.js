const Functions = {
  /*
    Functions for Actions 
  */
  "Gather Information": (party)=>{
    //skill roll - use Influence and roll pool of d6 for multiple success 
  }
  ,
  "Resupply": (party)=>{
    //pay cost 
  }
  ,
  "Sell Loot": (party)=>{}
  ,
  "Rest & Recuperate": (party)=>{
    //pay cost 
  }
  ,
  "Look for or Complete a Job": (party)=>{}
  ,
  "Explore the Region": (party)=>{}
  ,
  "Travel To": (party,dest)=>{}
  ,
  "Explore Site": (party)=>{}
  ,
  "Camp": (party)=>{}
  ,
  /*
    Functions for General Use
  */
  //find an ally and add it to the active party 
  "findAlly": ({app},data={})=>{
    let c = new app.gen.Character(app,Object.assign({}, data))
    c.activate()
    //game state 
    app.game.active.party ? app.activeParty.add(c) : app.game.active.party = c.startParty()
    //notify 
  }
  ,
  //add a quest 
  "addQuest" : ({app,data}, qdata) => {
    let qid = qdata.qid
    let[sid,_qid] = qid.split(".")
    let quest = app.scenarios.Quests[sid][_qid]

    if ((quest.unique || false) && app.quests.map(q=>q.state.qid).includes(qid)) {
      //don't re-give unique quests 
      return;
    }

    let state = {
      qid
    }
    //populate state 
    for (let key in quest.state) {
      let path = quest.state[key]
      state[key] = _.deepGet(data, path)
    }
    //create quest 
    new app.gen.Quest(app,state)
  },
  //enter a region 
  "enterRegion" : ({app}, R) => R.enter(app.activeParty),
}

export {Functions}
