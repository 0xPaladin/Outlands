const Scenes = {
  "Find a Caravan" : {
    
  },
  "Begin": {
    header: `Welcome to the <i>Outlands</i>`,
    text: 'Let’s begin. Who are you?',
    gen: {
      char: {
        n: 4,
        what: "Character",
        option: {
          text: (d)=>`${d.name}, ${d.people} ${d.advClass}`,
          f: "findAlly",
          _data : {"id":"id"},
          scene: "Intro.StartingRegion"
        }
      }
    },
  },
  "StartingRegion": {
    header: 'The Outlands is Vast',
    text: `<p>There is no end to the Outlands. No one knows its beginning, but myths speak of a terrible war that shattered the first world. The reality is that the Outlands is made up of uncountable Regions - a bit of stable land that takes, at most, a few days to cross on foot. Once you leave the bounds of a Region you enter the Wilds, a trackless, dangerous, and shifting expanse. If you know the Ways you can find a path that leads to another Region, otherwise you could be lost in the Wilds forever.</p>
      <p>Regions are grouped into Planes by their common terrain, and the Planes have been given various names. The Regions of the Dreaming Veldt are all rolling plains and grasslands. While the Jungles of Memory are all Regions covered in thick jungle. It is easier to travel between the Regions within a Plane. </p>
      <p>Where do you want to start your adventure?</p>`,
    get: {
      startR: {
        what: "Region",
        f: (R)=>{
          return chance.shuffle(R.filter(r=>r.plane != "Forgotten Isles" && r.lookup("settlement").length > 0 && r.lookup("landmark").length > 0)).slice(0, 5);
        }
        ,
        option: {
          text: (d)=>`${d.name} [${d.plane}]`,
          f: "enterRegion",
          scene: "Intro.FindFirstAlly"
        }
      }
    }
  },
  "FindFirstAlly": {
    header: `An Ally is Waiting`,
    text: (d)=>`<p>You got a letter from ${d.ally.name}, asking for your help. You've been friends for a while, so you booked passage with the first caravan that you could. You've arrived in ${d.region.name}, 
    but now you have to find ${d.ally.name}.
        <ul>
          <li>Select '${d.region.plane}' to go the plane where ${d.mainC} is.</li>
          <li>Select your character.</li>
          <li>Select "Gather Information".</li>
        </ul>
      </p>
      <p>Every party of characters can perform two actions per day. Gather information allows you to ask around town looking for information. You may discover Way's to new regions, information (dark) about the planes, 
      or patrons looking to hire you for a job.</p>`,
    defs: {
      town : "activeParty.location",
      region: "activeParty.region",
      mainC: "activeParty.characters[0].name"
    },
    gen: {
      ally: {
        n: 1,
        what: "Character"
      }
    },
    onExit: [{
      f: "addQuest",
      data: {
        qid: "Intro.FirstAlly",
      }
    }],
    options: [{
      text: (d)=>`Go find ${d.ally.name}`,
    }]
  },
  "FirstQuest": {
    header: `First Quest`,
    text: (d)=>`<p>You got a letter from ${d.ally.name}, asking for your help. You've been friends for a while, so you booked passage with the first caravan that you could. You've arrived in ${d.region.name}, 
    but now you have to find ${d.ally.name}.
        <ul>
          <li>Select '${d.region.plane}' to go the plane where ${d.mainC} is.</li>
          <li>Select your character.</li>
          <li>Select "Gather Information".</li>
        </ul>
      </p>
      <p>Every party of characters can perform two actions per day. Gather information allows you to ask around town looking for information. You may discover Way's to new regions, information (dark) about the planes, 
      or patrons looking to hire you for a job.</p>`,
    defs: {
      town : "activeParty.location",
      region: "activeParty.region",
      mainC: "activeParty.characters[0].name"
    },
    gen: {
      ally: {
        n: 1,
        what: "Character"
      }
    },
    onExit: [{
      f: "addQuest",
      data: {
        qid: "Intro.FirstAlly",
      }
    }],
    options: [{
      text: (d)=>`Go find ${d.ally.name}`,
    }]
  }
}

const Quests = {
  "FirstAlly": {
    act: "gather",
    reward: {
      f: "findAlly",
      data : {
        id : "id"
      }
    },
    scene : "Intro.FirstQuest",
    text: (d)=>[`${d.name} is waiting in ${d.region}.`, `You found your first ally.`],
    unique : true,
    state: {
      where: "town.id",
      id: "ally.id",
      name: "ally.name",
      region: "region.name"
    }
  }
}

export {Scenes,Quests}
