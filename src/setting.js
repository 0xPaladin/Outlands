/*
  Factions 
    'n','pnew','exp','align','allies','govt' 
*/
const _Factions = {
  'Dragons': [0, 0, 0, 0, '', '', '', ''],
  'Deep Dwellers': [22, 1, 1.5, 2, '45,.20,.15', 'evil', '', 'Monarchy,Theocracy,Anarchy,None/4,1,1,1'],
  'Saurian Starhost': [42, 1, 1, 2, '50,.3,.2', 'neutral,good', 'neutral,good', 'Monarchy,Union,Anarchy,None/1,1,1,1'],
  'High Elf Fleets': [38, 0.8, 2, 5, '90,.26,.22,.16,.14,.12', 'neutral,good,lawful', 'neutral,good,lawful', 'Monarchy,Republic,Union/1,1,1'],
  'Robot Legions': [7, 0.8, 1, 2, '100,.60,0.4', 'evil', '', 'Monarchy/1'],
  'Yellow Court': [12, 0, 1, 2, '90,.45,.45', 'evil', 'evil', 'Monarchy/1'],
  'Daemons of Change': [16, 0, 0, 2, '40,.2,.2', 'evil,chaotic', 'evil,chaotic', 'None/1'],
  'Havoc Beastmen': [11, 0, 0, 0, '', 'evil,chaotic', 'same', 'None/1'],
  'Daemons of War': [18, 0, 0, 3, '100,40,30,30', 'evil', 'evil', 'Monarchy/1'],
  'Brightsoul Order': [9, 0, 1, 2, '100,.55,.45', 'good,lawful', 'good,lawful', 'Monarchy,Republic,Union/1,3,3'],
  'Drakklings': [11, 0, 2, 3, '70,.3,.2,.2', 'neutral,good', 'neutral,good', 'Monarchy,Republic,Union/1,1,1'],
  'Wood Elves': [23, 0, 2, 3, '50,3,2,2', 'neutral,good', 'neutral,good', 'Monarchy,Union,Anarchy/1,1,1'],
  'Aberrations': [0, 0, 0, 0, '', '', '', ''],
  'Phage': [7, 0, 0, 0, '', 'chaotic', 'evil,chaotic', 'None/1'],
  'Ghosts': [16, 0.5, 0, 2, '25,.20,.5', 'evil', 'evil,chaotic', 'Monarchy/1'],
  'Corps': [7, 1, 1, 2, '100,1,1', 'lawful', 'good,lawful', 'Monarchy/1'],
  'Beastmen': [12, 0.5, 2, 2, '40,.2,.2', 'neutral', 'neutral,good', 'Anarchy,None/1,1'],
  'Eternal Dynasty': [14, 0.7, 2, 2, '90,.5,.4', 'neutral,lawful', 'neutral,good,lawful', 'Monarchy,Republic/3,1'],
  'Dwarves': [12, 1, 2, 2, '90,.5,.4', 'neutral,lawful', 'neutral,good,lawful', 'Monarchy,Republic,Union/1,3,3'],
  'Orc Marauders': [12, 0, 0, 0, '', 'evil,chaotic', 'evil,chaotic', 'None/1'],
  'Orcs': [5, 0, 3, 2, '30,.2,.1', 'neutral', 'neutral,good', 'Anarchy,None/1,1'],
  'Dark Elf Raiders': [5, 0.5, 0, 1, '20,.2', 'evil', 'evil,chaotic', 'Monarchy,Anarchy/1,1'],
  'Darkbound Covenant': [13, 0, 0, 0, '', 'evil', 'evil,chaotic', 'Monarchy,Anarchy/1,1'],
  'Daemons of Plague': [18, 0, 0, 2, '50,.3,.2', 'evil', 'evil,chaotic', 'None/1'],
  'Shadow Stalkers': [6, 0.5, 0, 1, '50,.5', 'evil,neutral', 'same', 'Monarchy,Anarchy/1,1'],
  'Havoc Warriors': [23, 0, 0, 0, '', 'evil,chaotic', 'evil,chaotic', 'None/1'],
  'Kaiju': [17, 0, 0, 0, '', 'chaotic', '', 'None/1'],
  'Sea Elves': [17, "Deep Dwellers", 2, 4, '80,.25,.2,.2,.15', 'neutral,good', 'neutral,good', 'Monarchy,Union,Anarchy/1,1,1'],
  'Giants': [4, "Kaiju", 0, 3, '60,.25,.2,.15', 'neutral', 'neutral,good', 'Monarchy/1'],
  'Alien Hives': [18, 0.8, 2, 2, '90,55,35', 'neutral,lawful', 'neutral,good,lawful', 'Monarchy/1'],
  'Feral Hives': [18, 0.8, 2, 2, '60,30,30', 'chaotic,evil', '', 'Monarchy/1'],
  'Silver': [7, "Corps", 0.5, 1, '100,1', 'lawful', 'good,lawful', 'Monarchy/1'],
  'Human Defense Force': [24, 0.8, 3, 8, '50,11,7,6,6,6,5,5,4', 'neutral,good,lawful', 'neutral,good,lawful', 'Monarchy,Republic,Union/1,3,3'],
  'Battle Brothers': [12, "Human Defense Force", 2, 3, '100,40,30,30', 'lawful', '', 'Monarchy/1'],
  'Kindom of Angels': [5, "Battle Brothers", 1, 2, '90,45,45', 'good,lawful', 'good,lawful', 'Monarchy,Republic,Union/1,3,3'],
}
export let nSuperStates = 0
export const Factions = Object.fromEntries(Object.keys(_Factions).map(id=>{
  nSuperStates += _Factions[id][3]
  let keys = ['n', 'pnew', 'expand', 'superState', 'stateP', 'alignment', 'allies', 'govern']
  return [id, Object.fromEntries(_Factions[id].map((d,i)=>[keys[i], d]))]
}
))

/*
  Force rosters for random generation 
*/
export const Roster = {
  "Beastmen": [['Kemba Brute Boss', 'commander', 130, 1], ['Ndwarit Centaur Boss', 'commander', 65, 1], ['Ndoli Beast Lord', 'commander', 55, 1], ['Waheni Hunt Master', 'commander', 25, 1], ['Waheni Shaman', 'commander', 65, 1], ['Light Charriot', 'special', 90, 1], ['Heavy Charriot', 'special', 120, 1], ['Slimey Beast', 'monster', 310, 1], ['Kemba Brute Giant', 'monster', 260, 1], ['Silombi Cyclops', 'monster', 275, 1], ['Crazed Boar', 'monster', 50, 1], ['Ndoli Elite', 'elite', 20, 1], ['Kemba Brute', 'elite', 55, 1], ['Waheni Hunter', 'squad', 20, 3], ['Ndoli Warrior', 'squad', 30, 3], ['Waheni Raider', 'squad', 40, 3], ['Ndwari Centaur', 'squad', 20, 1], ['Hapari Harpy', 'squad', 40, 3], ['Hound', 'beast', 40, 3]],
  "Sea Elves": [['Sea Master', 'commander', 45, 1], ['Scholar', 'commander', 35, 1], ['Sea Caster', 'commander', 75, 1], ['Giant War-Turtle', 'special', 340, 1], ['War-Shark Rider', 'special', 160, 1], ['Giant Kraken', 'monster', 270, 1], ['Great Water Elemental', 'monster', 145, 1], ['Water Elemental', 'monster', 60, 1], ['Giant Crab', 'monster', 55, 1], ['Depth Horror', 'monster', 45, 1], ['Sea-Wyrm Rider', 'elite', 55, 1], ['War-Eel Rider', 'elite', 20, 1], ['Sea Guard', 'squad', 35, 3], ['Elf Thrall', 'squad', 40, 3], ['Elf Reaver', 'squad', 20, 1], ['Octopus Hybrid', 'beast', 35, 3]],
  "Ghosts": [['Grim Leader', 'commander', 45, 1], ['Grim Soul Guardian', 'commander', 85, 1], ['Champion', 'commander', 35, 1], ['Champion Soul Guardian', 'commander', 75, 1], ['Ancient Wraith', 'commander', 80, 1], ['Ancient Banshee', 'commander', 95, 1], ['Ghost Swarm', 'monster', 45, 1], ['Ghost Horde', 'monster', 30, 3], ['Wraith', 'elite', 25, 1], ['Banshee', 'elite', 30, 1], ['Hexed Knight', 'elite', 25, 1], ['Glaive Stalker', 'elite', 20, 1], ['Ghost Reaper', 'squad', 45, 3], ['Mourner Banshee', 'squad', 45, 3], ['Scythed Ghost', 'squad', 45, 3], ['Craven Shooter', 'squad', 40, 2], ['Dread Knight', 'squad', 20, 1], ['Ghost Revenant', 'squad', 20, 1]],
  "Havoc Warriors": [['Havoc Master', 'commander', 55, 1], ['Havoc Sorcerer', 'commander', 95, 1], ['Barbarian Champion', 'commander', 25, 1], ['Barbarian Sorcerer', 'commander', 65, 1], ['Harbinger of Havoc', 'commander', 160, 1], ['Havoc Biker', 'special', 90, 1], ['Votex Beast', 'monster', 315, 1], ['Chimera', 'monster', 265, 1], ['Slaughter Beast', 'monster', 365, 1], ['Havoc Shrine', 'monster', 285, 1], ['Daemon Spawn', 'monster', 125, 1], ['Havoc Troll', 'monster', 55, 1], ['Drake Centaur', 'monster', 55, 1], ['Daemonic Guard Knight', 'elite', 65, 1], ['Havoc Knight', 'elite', 25, 1], ['Barbarian Horsemen', 'squad', 40, 3], ['Barbarian', 'squad', 20, 3], ['Warrior', 'squad', 30, 2], ['Mutant', 'squad', 20, 1], ['Havoc Ogre', 'beast', 35, 1], ['Havoc Fury', 'beast', 45, 3], ['Havoc Hound', 'beast', 40, 3]],
  "Daemons of Change": [['Harbinger of Change', 'commander', 190, ], ['Champion of Change', 'commander', 70, 1], ['Change Caster', 'commander', 110, 1], ['Screecher Charriot', 'special', 225, 1], ['Change Daemon Spawn', 'monster', 150, 1], ['Great Scorcher', 'monster', 190, 1], ['Scorcher', 'monster', 70, 1], ['Screecher', 'monster', 70, 1], ['Change Horror', 'elite', 50, 1], ['Change Fury', 'squad', 20, 1], ['Change Warrior', 'squad', 40, 2], ['Changelings', 'squad', 30, 3], ['Lesser Change Horror', 'beast', 40, 1]],
  "Daemons of War": [['Harbinger of War', 'commander', 175, 1], ['Champion of War', 'commander', 65, 1], ['Cannon Chariot', 'special', 185, 1], ['Cerberus Hound', 'monster', 155, 1], ['War Daemon Spawn', 'monster', 140, 1], ['Beast Rider', 'elite', 65, 1], ['War Fury', 'squad', 40, 2], ['Blood Warrior', 'squad', 45, 3], ['Blood Hound', 'beast', 30, 1]],
  "Daemons of Plague": [['Harbinger of Plague', 'commander', 175, 1], ['Champion of Plague', 'commander', 65, 1], ['Plague Caster', 'commander', 105, 1], ['Plague Beast', 'monster', 150, 1], ['Plague Daemon Spawn', 'monster', 140, 1], ['Plague Fly Rider', 'elite', 65, 1], ['Plague Fury', 'squad', 40, 2], ['Plague Warrior', 'squad', 45, 3], ['Plague Swarm', 'beast', 20, 1]],
  "Wood Elves": [['Glade Champion', 'commander', 55, 1], ['Glade Spell Weaver', 'commander', 95, 1], ['Eternal Leader', 'commander', 35, 1], ['Eternal Spell Weaver', 'commander', 75, 1], ['Treeman Elder', 'commander', 30, 1], ['Revenant Elder', 'commander', 50, 1], ['Revenant Elder Weaver', 'commander', 90, 1], ['Tree Giant', 'monster', 270, 1], ['Treeman Brute', 'monster', 40, 1], ['Treeman Hunter', 'monster', 60, 1], ['Giant Eagle', 'beast', 55, 1], ['Revenant Bug Rider', 'elite', 60, 1], ['Hawk Rider', 'elite', 60, 1], ['Eternal Guardians', 'elite', 30, 3], ['Deer Brother', 'squad', 40, 2], ['Forest Guard', 'squad', 40, 2], ['Forest Rider', 'squad', 40, 2], ['Forest Scout', 'squad', 40, 2], ['Ranger', 'squad', 40, 2], ['Tree Revenant', 'squad', 40, 2], ['Deer Sister', 'squad', 25, 1], ['Treeman', 'squad', 25, 3], ['War Dancer', 'squad', 25, 1], ['Wild Watcher', 'squad', 25, 1]],
  "Alien Hives": [['Hive Lord', 'commander', 360, 1], ['Snatcher Lord', 'commander', 125, 1], ['Prime Warrior', 'commander', 105, 1], ['Veteran Warrior', 'commander', 50, 1], ['Invasion Artillery Spore', 'special', 200, 1], ['Invasion Carrior Spore', 'special', 160, 1], ['Psycho-Rex', 'monster', 450, 1], ['Toxico-Rex', 'monster', 455, 1], ['Carnivo-Rex', 'monster', 305, 1], ['Rapacious Beast', 'monster', 205, 1], ['Flamer Beast', 'monster', 195, 1], ['Mortar Beast', 'monster', 170, 1], ['Ravenous Beast', 'beast', 50, 1], ['Massive Spores', 'beast', 50, 1], ['Spore', 'beast', 45, 3], ['Hive Swarm', 'beast', 20, 1], ['Venom Floater', 'elite', 65, 1], ['Synapse Floater', 'elite', 60, 1], ['Shadow Leaper', 'elite', 65, 1], ['Hive Guardian', 'elite', 55, 1], ['Psycho-Grunt', 'squad', 30, 2], ['Soul-Snatcher', 'squad', 30, 1], ['Assault Grunts', 'squad', 35, 3], ['Shooter Grunts', 'squad', 40, 3], ['Support Grunt', 'squad', 40, 1], ['Hive Warrior', 'squad', 45, 1], ['Winged Grunts', 'squad', 45, 3]],
  "Battle Brothers": [['Master Destroyer', 'commander', 155, 1], ['Master Brother', 'commander', 65, 1], ['Master Archivist', 'commander', 105, 1], ['Elite Pathfinder', 'commander', 50, 1], ['Elite Pathfinder Archivist', 'commander', 90, 1], ['Light Gunship', 'special', 300, 1], ['Attack Walker', 'special', 370, 1], ['Attack Speeder', 'special', 215, 1], ['APC', 'special', 210, 1], ['Attack APC', 'special', 205, 1], ['Heavy Exo-Suit', 'special', 185, 1], ['Support Bike', 'special', 175, 1], ['Brother Biker', 'elite', 95, 1], ['Destroyer', 'elite', 75, 1], ['Pathfinder Biker', 'elite', 75, 1], ['Pathfinder', 'squad', 50, 2], ['Assault Brother', 'squad', 30, 1], ['Battle Brother', 'squad', 30, 1], ['Support Brother', 'squad', 45, 1]],
  "Orcs": [['Ultra Boss', 'commander', 85, 1], ['Ultra Boss Shaman', 'commander', 125, 1], ['Boss Leader', 'commander', 45, 1], ['Boss Leader Shaman', 'commander', 85, 1], ['Orc Leader', 'commander', 35, 1], ['Goblin Champ', 'commander', 20, 1], ['Bomber Plane', 'special', 215, 1], ['Attack Plane', 'special', 320, 1], ['Orc Walker', 'special', 310, 1], ['Combat Kart', 'special', 250, 1], ['Truck', 'special', 170, 1], ['Goblin Tank', 'elite', 70, 1], ['Orc Mini-Copter', 'elite', 70, 1], ['Goblin Walker', 'elite', 65, 1], ['Boss Biker', 'elite', 70, 1], ['Goblin Artillery', 'elite', 60, 1], ['Ultra Boss', 'elite', 55, 1], ['Orc', 'squad', 30, 2], ['Boss', 'squad', 20, 1], ['Commando', 'squad', 20, 1], ['Goblin Herd', 'squad', 20, 3], ['Jetpack Orc', 'squad', 20, 1], ['Specialist Orc', 'squad', 30, 1], ['Orc Pirate', 'squad', 40, 1], ['Orc Biker', 'squad', 55, 1]],
  "Robot Legions": [['Robot Lord', 'commander', 70, 1], ['Robot Lord Technomancer', 'commander', 110, 1], ['Annihilator Lord', 'commander', 150, 1], ['Tri-Scorpian Lord', 'commander', 210, 1], ['Tripod Walker', 'monster', 205, 1], ['Forge Spider', 'monster', 185, 1], ['Heavy Annhilator', 'monster', 250, 1], ['Tri-Scorpian Pistoleer', 'monster', 195, 1], ['Bot Swarms', 'beast', 50, 2], ['Hover Bike', 'elite', 90, 1], ['Annihilator', 'elite', 95, 1], ['Tri-Scorpion', 'elite', 85, 1], ['Guardian', 'squad', 25, 1], ['Warrior', 'squad', 50, 2], ['Flesh-Eater', 'squad', 30, 1], ['Eternal', 'squad', 35, 1], ['Sniper', 'squad', 35, 1], ['Robot Snake', 'squad', 60, 1]],
  "Phage": [['Manstrous Tyrant', 'commander', 170, 1], ['Great Hunter', 'commander', 85, 1], ['Infected Leader', 'commander', 35, 1], ['Infected Mad Scientist', 'commander', 75, 1], ['Attack Buggy', 'special', 200, 1], ['Combat Walker', 'special', 180, 1], ['Abomination', 'monster', 370, 1], ['Corrupted Beast', 'monster', 75, 1], ['Infected Vulture', 'monster', 60, 1], ['Leech Swarm', 'beast', 30, 2], ['Rabid Dog', 'beast', 25, 1], ['Crazed Raven', 'beast', 30, 1], ['Boomer', 'elite', 55, 1], ['Weapon', 'elite', 50, 1], ['Infected', 'squad', 30, 2], ['Infected Gunner', 'squad', 25, 1], ['Hunter', 'squad', 30, 1], ['Runners', 'squad', 30, 3], ['Zombies', 'squad', 30, 3]],
  "Dark Elf Raiders": [['Dark Lord', 'commander', 65, 1], ['Elite Raider', 'commander', 45, 1], ['Gene-Tech Master', 'commander', 45, 1], ['Gene-Tech Soul Carrier', 'commander', 85, 1], ['Court Henchman', 'commander', 60, 1], ['Razor Fighter', 'special', 265, 1], ['Engine of Suffering', 'special', 190, 1], ['Leech Engine', 'special', 180, 1], ['Heavy Jetbike', 'special', 195, 1], ['Light Skimmer', 'special', 250, 1], ['Clawed Beast', 'monster', 90, 1], ['Gene-Brute', 'monster', 80, 1], ['Crow Swarm', 'beast', 35, 1], ['Blood Hound', 'beast', 20, 1], ['Jetbike Rider', 'elite', 70, 1], ['Shadow Warrior', 'elite', 50, 1], ['Gene-Warrior', 'squad', 30, 2], ['Warrior', 'squad', 40, 2], ['Witch', 'squad', 20, 1], ['Nightmare', '', 30, 1], ['Winged Warrior', 'squad', 30, 1], ['Hoverboard Rider', 'squad', 35, 1]],
  "Darkbound Covenant": [['Dark Master', 'commander', 130, 1], ['Shadow Host', 'commander', 70, 1], ['Kingeater Nothric', 'commander', 175, 1], ['Shadowreaper Rhakai', 'commander', 75, 1], ['Gloomlock', 'commander', 110, 1], ['Darkspawn Annihilator ', 'monster', 415, 1], ['Invoked', 'monster', 115, 1], ['Shadowmaster Morthiel', 'monster', 195, 1], ['Umbralisk', 'monster', 60, 1], ['Light Seeker', 'beast', 20, 1], ['Umbraculus', 'beast', 30, 3], ['Black Oath Curator', 'elite', 60, 1], ['Soul Harvester', 'elite', 45, 1], ['Darkspawn Raider', 'elite', 40, 1], ['Black Oath Acolytes', 'squad', 15, 5], ['Darkspawn Acolyte', 'squad', 25, 1], ['Darkspawn Shadow Blades', 'squad', 40, 3]]
}
Roster["Havoc Beastmen"] = Roster.Beastmen.slice()
Roster["Orc Marauders"] = Roster.Orcs.slice()
Roster["Feral Hives"] = Roster["Alien Hives"].slice()
Roster["Kaiju"] = Roster["Alien Hives"].slice()

/*
  Diplomacy 
*/
export const Diplomacy = {
  "general": {
    lawful: ['ally,neutral/1,1', 'ally,neutral/1,1', 'ally,neutral,rival/1,2,1', 'neutral,rival,enemy/1,3,3', 'enemy/1'],
    good: ['ally,neutral/1,1', 'ally/1', 'ally,neutral,rival/2,2,1', 'enemy/1', 'rival,enemy/1,1'],
    neutral: ['ally,neutral,rival/1,2,1', 'ally,neutral,rival/2,2,1', 'ally,neutral,rival/1,2,1', 'neutral,rival,enemy/1,3,3', 'rival,enemy/1,1'],
    evil: ['neutral,rival,enemy/1,3,3', 'enemy/1', 'neutral,rival,enemy/1,3,3', 'neutral,rival,enemy/1,3,3', 'rival,enemy/1,1'],
    chaotic: ['enemy/1', 'rival,enemy/1,1', 'neutral,rival,enemy/1,3,3', 'rival,enemy/1,1', 'rival,enemy/1,1'],
  },
  "specific": {
    "High Elf Fleets": {
      'enemy/1': ['Robot Legions', 'Ghosts', 'Dark Elf Raiders']
    },
    "Robot Legions": {
      'enemy/1': ['High Elf Fleets', 'Brightsoul Order', 'Corps', 'Dark Elf Raiders', 'Wood Elves', 'Sea Elves', 'Silver'],
      'ally,neutral/1,1': ['Robot Legions', 'Ghosts'],
    },
    "Battle Brothers": {
      'rival,enemy/1,1': ['Human Defense Force', 'Kindom of Angels']
    },
    "Wood Elves": {
      'enemy/1': ['Havock Beastmen', 'Robot Legions']
    },
    "Sea Elves": {
      'enemy/1': ['Deep Dwellers', 'Kaiju of the Rift']
    },
    "Kindom of Angels": {
      'rival,enemy/1,1': ['Battle Brothers']
    },
    "Giants": {
      'enemy/1': ['Kaiju of the Rift']
    },
  }
}

/*
  rainfall =  desert, arid, standard, rainy, wet 
  faction size = l1,l,m,s,s1 
*/

export const Plates = [{
  "i": 333,
  "seed": "9321d1d7411ce501bdd6b335abcdf46993214f16",
  "name": "Terminus Prime",
  "climate": "temperate",
  "precip": "standard",
  "heightmap": "shattered",
  "about": "The plate home to the gateway city of Terminus.",
  "setFactions": [{
    "id": "Saurian Starhost"
  }, {
    "id": "High Elf Fleets"
  }, {
    "id": "Drakklings"
  }, {
    "id": "Wood Elves"
  }, {
    "id": "Eternal Dynasty"
  }, {
    "id": "Dwarves"
  }, {
    "id": "Orcs"
  }, {
    "id": "Sea Elves"
  }, {
    "id": "Alien Hives"
  }, {
    "id": "Human Defense Force"
  }, {
    "id": "Battle Brothers"
  }]
}, {
  "i": 739,
  "seed": "8167d1d7308ce501bdd6b335ceecf46998224f16",
  "name": "Dreaming Veldt",
  "climate": "temperate",
  "precip": 85,
  "heightmap": "lowIsland",
  "about": "Rolling grasslands; A slow stream hidden in a thicket of trees; Broken towers of a past age; Grass rippling like waves; A great herd on the move; A small, quiet lake; Hunks of rusted metal frames dotting a hillside; A storm rolling in like a great wall.",
}, {
  "i": 404,
  "seed": "2a67d1d7308ce501bdd6b335ceecf46998224f16",
  "name": "Jagged Reach",
  "climate": "tropical",
  "precip": "standard",
  "heightmap": "isthmus",
  "about": "Mammoth snow-capped peaks; Cold, rushing rivers; Grueling switchbacks that climb forever; Great forests of pine; Arid, wind-swept plateaus; A hidden, lush valley; Ruins hidden in the cleft of a mountain; A striking blue mountain lake; The rumble of an avalanche far off."
}, {
  "i": 685,
  "seed": "f240069c06d7f7b085fdf599e0988563e6b2795f",
  "name": "Forgotten Isles",
  "climate": "tropical",
  "precip": 150,
  "heightmap": "manyIslands",
  "about": "Atolls adrift in an endless ocean; The sea, forever; A brooding volcanic peak on the horizon; Pods of whales in migration; Forests of kelp teeming with life; Isles like teeth rushing from the waves; Coral reefs with the colors of the rainbow; Palm trees lining a black-sand beach."
}, {
  "i": 687,
  "seed": "22f950f75a0ab1b2b36af9fe7bac2dc7c8eb88e6",
  "name": "Mist Shadow",
  "climate": "sub-arctic",
  "precip": "rainy",
  "heightmap": "oldWorld",
  "about": "Trees as tall as sky-scrapers; Rain, rain, and more rain; The forest, alive with the sound of wildlife; Never-ending labyrinth of tree-trunks; Mist hanging over everything."
}, {
  "i": 506,
  "seed": "34414149b4f049dc627bb87cda41358630a2c176",
  "name": "Shifting Dunes",
  "climate": "sub-tropic-temperate",
  "precip": "desert",
  "heightmap": "continents",
  "about": "Sand dunes like great waves as far as the eye can see; Heat; A cloudless blue sky; A sand-storm that can scour flesh from bone; Lonely hills of windswept-rock; Unrelenting suns; Rare springs of water hidden in sheltered ravines; Cold nights alive with wildlife."
}, {
  "i": 244,
  "seed": "5d9c87a72a3a1a8bb0c7d9a9ed2aed09a365f60f",
  "name": "Jungles of Memory",
  "climate": "tropical",
  "precip": "wet",
  "heightmap": "oldWorld",
  "about": "More shades of green than could ever be described; The endless cacophony of life; Hot, humid, soaked with sweat; Ruins re-claimed by the jungle; A shadowed world beneath vast canopy."
}, {
  "i": 517,
  "seed": "da60e71cfbdf6e35ddbc6df0fcaeae334efa719a",
  "name": "Shattered March",
  "climate": "temperate",
  "precip": "arid",
  "heightmap": "fractious",
  "about": "Scrublands as far as the eye can see; Spiked rocks, thrusting up like shattered teeth; Tall, lone buttes; Jagged ravines, dark and unknown; Nothing but cacti and stunted scrub-brush; Uncaring arid, heat; Wind that brings the scent of a thunderstorm."
}, ]
