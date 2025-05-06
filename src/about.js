const close = (App,hrml) => html`<div class="w-25 pointer dim bg-light-blue br1 mh1 pa2 tc b" onclick=${()=> App.setSelect("about",null)}>Close</div>`

export const Main = () => window.html`
<h1 class="ma0">Outlands</h1>
<div class="pa2">
  <p>This is a game of exploration. You are the blue diamond. Click on the map to move from place to place. At any time 
you can explore where you are.</p> 
  <p>You gain points by exploring. You will find new routes, resources, people, ruins... But every time you move or explore it takes time. Exploring isn't easy - you can face setbacks. 
All of which takes more time.</p>
  <p>The game will reset every week. How many points can you get? How many points in the least amount of time?</p>
</div>
<div class="flex justify-center">
  <div class="w-25 pointer dim bg-light-blue br1 mh1 pa2 tc b" onclick=${()=>App.setSelect("about","Points")}>Points?</div>
  ${close(window.App,window.html)}
  <div class="w-25 pointer dim bg-red br1 mh1 pa2 tc white b" onclick=${()=> window.App.reset()}>Reset</div>
</div>
<div class="tc mt2">Maps are created by <a href="https://watabou.github.io/realm.html">Perilous Shores</a> by Watabou.</div>
<div class="tc">The cozy exploration game was inspired by <a href="https://sleepysasquatch.itch.io/glide">Glide</a> by Sleepy Sasquatch Games.</div>
`

export const Points = () => window.html`
<h1 class="ma0">Outlands :: Points</h1>
<div class="pa2">
  <p>Points are an abstraction of XP and gold in a standard RPG. They are earned through exploration - searching a hex.</p>
  <div><b>Terrain Hex:</b> You earn 3 points. The time it takes depends upon the hex terrain. 
    You may encounter creatures, hazards or locals depending upon the safety of the plane. 
    You may discover hidden sites - outposts, resources, landmarks, and secret dungeons when you search. These will earn you more points.  
  </div>
  <div><b>Settlements:</b> You will earn 3 plus a number of points depending upon how big the settlement is. It takes 12 hours to search a settlement. 
    You will always encounter the locals when you search a settlement. You may also find routes to new planes.</div>
  <div><b>Dungeons:</b> When you search a ruin you will earn 10 points. You will have the same encounters as on a Terrain Hex.</div>
  <div class="mt2"><b>Encounters:</b> Every encounter can result in a positive/negative outcome. The odds vary depending upon the encounter: 
    creatures (25% positive), hazards (50%) or locals (75%). A positive outcome provides points. A negative outcome always results in a setback which adds more time to your clock.
  </div>
</div>
<div class="flex justify-center">
  ${close(window.App,window.html)}
</div>
`