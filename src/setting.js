/*
  rainfall =  desert, arid, standard, rainy, wet 
*/

const Planes = {
  "Dreaming Veldt": {
    "name": "Dreaming Veldt",
    "climate": "temperate,sub-tropical,sub-arctic/2,1,1",
    "rainfall" : "arid,standard/1,2",
    "terrain": "plains/1",
    "about" : "Rolling grasslands; A slow stream hidden in a thicket of trees; Broken towers of a past age; Grass rippling like waves; A great herd on the move; A small, quiet lake; Hunks of rusted metal frames dotting a hillside; A storm rolling in like a great wall.",
  },
  "Jagged Reach": {
    "name": "Jagged Reach",
    "climate": "sub-tropical,tropical/1,1",
    "rainfall" : "arid,standard,rainy/1,1,1",
    "terrain": "mountains,highlands/2,1",
    "about" : "Mammoth snow-capped peaks; Cold, rushing rivers; Grueling switchbacks that climb forever; Great forests of pine; Arid, wind-swept plateaus; A hidden, lush valley; Ruins hidden in the cleft of a mountain; A striking blue mountain lake; The rumble of an avalanche far off."
  },
  "Forgotten Isles": {
    "name": "Forgotten Isles",
    "climate": "tropical/1",
    "rainfall" : "standard,rainy,wet/2,1,1",
    "terrain": "island/1",
    "about" : "Atolls adrift in an endless ocean; The sea, forever; A brooding volcanic peak on the horizon; Pods of whales in migration; Forests of kelp teeming with life; Isles like teeth rushing from the waves; Coral reefs with the colors of the rainbow; Palm trees lining a black-sand beach."
  },
  "Mist Shadow": {
    "name": "Mist Shadow",
    "climate": "temperate,sub-arctic/1,1",
    "rainfall" : "rainy,wet/2,1",
    "terrain": "forest,wetland/3,1",
    "about" : "Trees as tall as sky-scrapers; Rain, rain, and more rain; The forest, alive with the sound of wildlife; Never-ending labyrinth of tree-trunks; Mist hanging over everything."
  },
  "Shifting Dunes": {
    "name": "Shifting Dunes",
    "climate": "sub-tropical,temperate/2,1",
    "rainfall" : "desert,arid/3,1",
    "terrain": "desert,badlands/4,1",
    "about" : "Sand dunes like great waves as far as the eye can see; Heat; A cloudless blue sky; A sand-storm that can scour flesh from bone; Lonely hills of windswept-rock; Unrelenting suns; Rare springs of water hidden in sheltered ravines; Cold nights alive with wildlife."
  },
  "Jungles of Memory": {
    "name": "Jungles of Memory",
    "climate": "tropical/1",
    "rainfall" : "standard,rainy,wet/1,1,1",
    "terrain": "forest,wetland/6,1",
    "about" : "More shades of green than could ever be described; The endless cacophony of life; Hot, humid, soaked with sweat; Ruins re-claimed by the jungle; A shadowed world beneath vast canopy."
  },
  "Shattered March": {
    "name": "Shattered March",
    "climate": "temperate/1",
    "rainfall" : "arid/1",
    "terrain": "badlands/1",
    "about" : "Scrublands as far as the eye can see; Spiked rocks, thrusting up like shattered teeth; Tall, lone buttes; Jagged ravines, dark and unknown; Nothing but cacti and stunted scrub-brush; Uncaring arid, heat; Wind that brings the scent of a thunderstorm."
  },
}

const Outlands = {
  // Gate Towns 
  "Ecstacy": {
    "name": "Ecstacy",
    "terrain": "plains",
    "alignment": ["good"],
    "children": [{
      "name": "Ecstacy",
      "what": "settlement",
      "scale": 3
    }],
    "parent": "Outlands"
  }
}

const Factions = {
  "Aasimon": {
    'fronts': 'Misguided Good,Choir of Angels,Construct of Law',
    "class" : "Outsider",
    "alignment": ["good"],
  },
}

export {Planes}
