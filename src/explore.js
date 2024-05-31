import {RandBetween, SumDice, Likely, BuildArray, DiceArray, WeightedString, Hash, chance} from "../random.js"

let explorer = null
let html = null
let app = null

//manage rolling 
const Roll = (eDice,pool)=>{
  let {exp, act, support} = explorer.explore
  //player 
  let player = DiceArray(eDice)
  //mod 
  let mod = exp.actions.primary == act ? 0 : exp.actions.mod[act] 
  player[0][1] = player[0][1]-mod < 1 ? 1 : player[0][1]-mod
  //sort 
  player = player.sort((a,b) => b[1]-a[1])
  //opposition and sort 
  let opp = DiceArray(pool).sort((a,b) => b[1]-a[1])
  //result 
  explorer.explore.roll = [player,opp]
  //account for modifiers 
  app.refresh()
}

//Finish and Reward Exploration 
const FinishAndReward = (exp)=>{
  let rwd = exp.reward
  //take data for saving 
  let data = rwd.data.slice()
  if (rwd.what == "NPC") {
    //hired for a month 
    data.t = app.game.time + 30
    explorer.state.inventory.push(data)
    app.notify(`A ${rwd.text} has agreed to join ${explorer.name}`)
  } else if (rwd.what == "Explorer") {
    let opts = {
      id: data[0]
    }
    //add an explorer
    let C = new Explorer(app,opts)
    C.hire()
    app.notify(`${C.name} has joined your explorer roster.`)
  } else {
    //add to inventory
    explorer.state.inventory.push(data)
    //notify save and update 
    app.notify(`You have won ... ${rwd.text}`)
  }
  app.save("characters", explorer.id)
  //close dialog 
  app.updateState("dialog", "")
  delete explorer.explore
}

//Flee from chalalenge 
const Flee = ()=>{
  app.updateState("dialog", "")
}

//assign damage and reset / reward 
const AssignDamage = (stress)=>{
  let {exp, support, takeDamage} = explorer.explore
  //apply stress to challenge 
  exp.cohesion -= stress
  //take damage 
  explorer.takeDamage(takeDamage)
  //Mark usage for items 
  explorer.markUse(support)
  //reset exploration 
  Object.assign(explorer.explore, {
    oppAct: exp.actions,
    opp: exp.dice,
    act: "",
    support: new Map(),
    takeDamage: new Map(),
    roll: []
  })

  //reward and clear 
  if (exp.cohesion <= 0) {
    FinishAndReward(exp)
  }

  app.refresh()
}

/*
  Steps 
  1. Select an Action - which may unlock items to be used 
  2. Select item(s)/Allies to support 
  3. Roll 
  4. Assign dice that score 4+ to attack (do stress to challenge) or defend (block damage)
  5. Assign damage from challenge 
  5a. check usage 
  6. Check challenge cohesion and go back to 1 or resolve and reward 
*/

const UI = (e)=>{
  //base for other function usage 
  explorer = e
  app = e.app
  html = e.app.html

  let _act = Object.assign({}, e.actions, e.saves)
  let {exp, where, oppAct, opp, act, support, takeDamage} = e.explore
  let[player=[],against=[]] = e.explore.roll
  let {cohesion, challenge, focus, rank} = exp
  //current explore opposition dice  
  let {k, pool} = opp
  //what inventory an be added to explore 
  let {maySupport, mayTakeDamage} = e.exploreInventory
  //dice string 
  let eDice = [act != "" ? _act[act][1] : "d4"]
  support.forEach(item=>{
    if(item.die) {
      eDice.push(item.die)
    }
  })
  //number to keep 
  let ek = 1 + e.state.inventory.filter(item=>support.has(item[0]) && item[1] == "NPC").length
  //determine stress to challenge and damage to player 
  let stress = 0
  let damage = against.reduce((sum,v,i)=>sum + (i < k && v[1] > 3 ? 1 : 0), 0)
  let soak = 0
  //account for player roll  
  player.forEach(d=>d[2] == 0 ? stress++ : d[2] == 1 ? soak++ : null)
  //account for damage taken 
  takeDamage.forEach((v,id)=>soak += v)

  //determine if may flee 
  let mayFlee = player.length == 0
  let showAssignDamage = player.length > 0 && (soak == damage)

  //handle who/what will take damage 
  const TakeDamage = (what,amt)=>{
    if (damage == soak && amt > 0)
      return
    let dmg = (takeDamage.get(what.id) || 0) + amt
    if (dmg <= 0) {
      takeDamage.delete(what.id)
    } else {
      takeDamage.set(what.id, dmg)
    }

    e.app.refresh()
  }

  //manage attack defense 
  const SetAtkDef = (v,pa,i)=>{
    let PA = e.explore.roll[0]

    PA[i][2] = PA[i][2] == v ? -1 : v
    e.app.refresh()
  }

  //manages selected action / gear / allies 
  const AddSelected = (a)=>{
    if (typeof a == "string") {
      e.explore.act = a
    } else if (e.explore.support.has(a.id)) {
      //delete Implements if spell deleted 
      support.forEach((item,id)=>a.data[2] == "Spell" && item.data[2] == "Implements" ? e.explore.support.delete(id) : null)
      e.explore.support.delete(a.id)
    } else {
      e.explore.support.set(a.id, a)
    }
    e.app.refresh()
  }

  //individual damage allotment 
  const DamageTaker = (what,txt,health)=>html`
    <div class="flex b items-center">
      <div class="bg-light-gray w-100 pointer tc b pa1">${txt} ${health}♥</div>
      <div class="pointer bg-green fw9 tc pa1 ph3" onClick=${()=>TakeDamage(what, 1)}>+</div>
      ${!takeDamage.has(what.id) ? "" : html`
      <div class="bg-light-gray tc b pa1 ph2">${takeDamage.get(what.id)}♥</div>
      <div class="pointer bg-green tc b pa1 ph3" onClick=${()=>TakeDamage(what, -1)}>-</div>`}
    </div>`
  //damage listing 
  const DamageList = html`
    <div class="mh1">
      <div class="b">Who/What will take the damage?</div>
      ${DamageTaker(e, e.name, e.health)}
      ${Object.values(mayTakeDamage).map(item=>DamageTaker(item, item.text, item.health.now))}
    </div>`

  //displays attack/defense image for a successful roll 
  let dImg = ["./img/explore-swords.svg", "./img/explore-shield.svg"]
  const AtkDef = (v,pa,i)=>html`
    <div>
      ${dImg.map((img,j)=>html`<div class="${v == j ? "bg-green" : "bg-gray"} pointer pa1" onClick=${()=>SetAtkDef(j, pa, i)}><img class="db" src=${img} height="17"></img></div>`)}
    </div>`
  //displays image of the die with the value of the roll over it 
  const DiceImg = ([d,val=-1,atk],pa="a",i)=>html`
    <div class="flex items-center justify-center">
      ${pa == "p" && val > 3 && i < ek ? AtkDef(atk, pa, i) : ""}
      <div class="relative tc mh1">
        <img src=${"./img/" + d + (val != -1 ? "-outline" : "-fill") + ".svg"} width="50"></img>
        ${val == -1 ? "" : html`<div class="centered f2 b ${val >= 4 ? "green" : "red"}">${val}</div>`}
      </div>
    </div>`

  //dice display 
  const DiceDisplay = html`
    <div class="flex items-center justify-center">
      <div class="tc mh1">
        <div>Keep: ${ek}</div>
        <div class="flex">${player.length > 0 ? player.map((d,i)=>DiceImg(d, "p", i)) : eDice.map(d=>DiceImg([d]))}</div>
        ${stress == 0 ? "" : html`<div>Cohesion Damage: ${stress}</div>`}
      </div>
      <div class="f3"><i>Vs</i></div>
      <div class="tc mh1"> 
        <div>Keep: ${k}</div>
        <div class="flex">${player.length > 0 ? against.map((d,i)=>DiceImg(d, "a", i)) : pool.map(d=>DiceImg([d]))}</div>
        ${damage > 0 || takeDamage.size != 0 ? html`<div>Explorer Damage: ${damage}</div>` : ""}
      </div>
    </div>
    `

  //action options 
  const ActionOptions = html`
    <div class="b">What action do you take?</div>
    ${oppAct.list.map(a=>html`<div class="${act == a ? "bg-green white" : "bg-light-gray"} pointer tc b br2 underline-hover mv1 pa2" onClick=${()=>AddSelected(a)}>${a} [${_act[a][1]}]</div>`)}
    ${Object.keys(maySupport).length == 0 ? "" : html`<div class="b">Use the following Allies/Gear</div>`}
    ${Object.values(maySupport).map(item=>html`<div class="${support.has(item.id) ? "bg-green white" : "bg-light-gray"} pointer tc b br2 underline-hover mv1 pa2" onClick=${()=>AddSelected(item)}>${item.text}</div>`)}
    `

  //explore UI - no close button - have to flee  
  return html`
    <div style="width:600px">
      <h3 class="ma0 mb1">${e.name} Exploring ${where.text}</h3>
      <h4 class="ma0 mb1">Challenge > ${challenge}: ${focus} > Cohesion ${cohesion}</h4>
      <div class="mh5">
        ${player.length > 0 ? "" : ActionOptions}
        ${DiceDisplay}
        ${damage > 0 ? DamageList : ""}
        <div class="flex">
          ${!showAssignDamage ? "" : html`<div class="w-100 bg-green white pointer tc b underline-hover ma1 pa2" onClick=${()=>AssignDamage(stress)}>Assign Damage</div>`}
          ${player.length > 0 ? "" : html`<div class="w-100 bg-green white pointer tc b underline-hover ma1 pa2" onClick=${()=>Roll(eDice, pool)}>Roll!</div>`}
          ${!mayFlee ? "" : html`<div class="w-100 bg-green white pointer tc b underline-hover ma1 pa2" onClick=${()=>Flee()}>Flee</div>`}
        </div>
      </div>
    </div>`
}

export {UI}