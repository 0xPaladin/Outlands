import { Chance, _ } from "./helper.js";
import { Creature, Generators } from "./creatures.js";

const WSPick = (str, split, PRNG) => PRNG.pickone(PRNG.WS(str).split(split));

/*
  Safety and Alignment 
*/
const Aligment = {
  good: [
    ["evil", "chaotic", "neutral", "lawful", "good"],
    [1, 2, 2, 2, 5]
  ],
  lawful: [
    ["evil", "chaotic", "neutral", "lawful", "good"],
    [2, 1, 2, 5, 2]
  ],
  neutral: [
    ["evil", "chaotic", "neutral", "lawful", "good"],
    [1, 2, 6, 2, 1]
  ],
  chaotic: [
    ["evil", "chaotic", "neutral", "lawful", "good"],
    [2, 7, 0, 1, 2]
  ],
  evil: [
    ["evil", "chaotic", "neutral", "lawful", "good"],
    [5, 2, 2, 2, 1]
  ]
};

const HazardsByTerrain = {
  _pitfall: (what) => {
    return {
      what,
      skill: "H",
      enc(pass) {
        return {
          text: `A ${this.what} suddenly looms before you. You ${pass ? 'manage to avoid it' : 'take a fall and suffer minor injuries'}.`,
          hrs: pass ? 1 : 3
        }
      }
    }
  },
  _ensnaring: (what) => {
    return {
      what,
      skill: "HR",
      enc(pass) {
        return {
          text: `You've come across ${what} and become ${pass ? 'partially' : 'completely'} ensnared.`,
          hrs: pass ? 1 : 3
        }
      }
    }
  },
  _rough: (what) => {
    return {
      skill: "H",
      what,
      enc(pass) {
        return {
          text: `The ${what} is rough and slows you down.`,
          hrs: pass ? 0 : 2
        }
      }
    }
  },
  _obstacle: (what) => {
    return {
      skill: "HR",
      what,
      enc(pass) {
        return {
          text: `You approach a ${what}.`,
          hrs: pass ? 0 : 2
        }
      }
    }
  },
  _dangerous: (what, str) => {
    return {
      what,
      skill: "H",
      str,
      enc(pass) {
        return {
          text: `${this.str || 'You approach a'} ${what}.`,
          hrs: pass ? 0 : 2
        }
      }
    }
  },
  'any': (PRNG) => {
    let what, text, extra, skill;

    let specifics = {
      impairing: () => {
        skill = "KR";
        what = PRNG.pickone("mist,fog,murk,gloom,miasma".split(","));
        text = () => `A ${what} has set in, impairing visibility and slowing you down.`;
      },
      oddity: () => {
        skill = "K";
        extra = ["oddity"]
        what = Generators._oddity(PRNG);
        text = () => `You've come across a ${what} oddity, causing you to waste time and resources.`;
      },
      trap: () => {
        skill = "R";
        what = PRNG.pickone(`natural,mechancial,${Generators._magic(PRNG)}`.split(","));
        text = (pass) => pass ? `You've come across a ${what} trap, and managed to avoid it.` : `You've stubled into a ${what} trap.`;
      },
      defense: () => {
        skill = "KR";
        what = PRNG.pickone(`natural,mechancial,${Generators._magic(PRNG)}`.split(","));
        text = (pass) => `You've come across a ${what} barrier, ${pass ? 'but manage to find a way through.' : 'have to spend time navigating around it.'}`;
      }
    }

    //run to create hazard  
    specifics[PRNG.WS("impairing,oddity,trap,defense/1,1,1,1")]()

    return {
      what,
      extra,
      text,
      skill,
      enc(pass) {
        return {
          text: this.text(pass),
          hrs: pass ? 0 : 2
        }
      }
    }

    //meteorological: `blizzard,thunderstorm,sandstorm,${Generators._element
  },
  'mountain': (PRNG, pass) => {
    let specifics = {
      pitfall: () => HazardsByTerrain._pitfall(PRNG.pickone("chasm,crevasse,abyss,rift,ravine".split(","))),
      seasonal: () => HazardsByTerrain._dangerous("avalanche", "You get caught in an"),
      obstacle: () => HazardsByTerrain._obstacle(PRNG.pickone("cliff,escarpment,crag,bluff".split(","))),
      dangerous: () => HazardsByTerrain._dangerous(PRNG.pickone("gyser,volcanic vent,volcanic fissure".split(",")))
    }

    return specifics[PRNG.WS("pitfall,seasonal,obstacle,dangerous/1,1,1,1")]()
    //traversable: "river,ravine,crevasse,chasm,abyss"
  },
  'hill': (PRNG) => {
    let specifics = {
      pitfall: () => HazardsByTerrain._pitfall(PRNG.pickone("chasm,crevasse,abyss,rift,ravine".split(","))),
      seasonal: () => HazardsByTerrain._dangerous("avalanche", "You get caught in an"),
      obstacle: () => HazardsByTerrain._obstacle(PRNG.pickone("cliff,escarpment,crag,bluff".split(","))),
    }

    return specifics[PRNG.WS("pitfall,seasonal,obstacle/1,1,1")]()
  },
  'forest': (PRNG) => {
    let specifics = {
      ensnaring: () => HazardsByTerrain._ensnaring(PRNG.pickone("marsh,quicksand".split(","))),
      pitfall: () => HazardsByTerrain._pitfall(PRNG.pickone("chasm,crevasse".split(","))),
      seasonal: () => HazardsByTerrain._dangerous(PRNG.pickone("fire,flood".split(",")), "You get caught in a"),
      rough: () => HazardsByTerrain._rough("dense forest"),
    }

    return specifics[PRNG.WS("pitfall,ensnaring,seasonal,rough/1,1,1,1")]()
  },
  'desert': (PRNG) => {
    let specifics = {
      ensnaring: () => HazardsByTerrain._ensnaring(PRNG.pickone("tarpit,quicksand".split(","))),
      pitfall: () => HazardsByTerrain._pitfall(PRNG.pickone("chasm,crevasse".split(","))),
    }

    return specifics[PRNG.WS("pitfall,ensnaring/1,1")]()
    //sandstorm 
  },
  'swamp': (PRNG) => {
    let specifics = {
      ensnaring: () => HazardsByTerrain._ensnaring(PRNG.pickone("mire,bog,marsh,tarpit,quicksand".split(","))),
      seasonal: () => HazardsByTerrain._dangerous("flood", "You get caught in a"),
    }

    return specifics[PRNG.WS("ensnaring,seasonal/1,1")]()
  },
  'plains': (PRNG) => {
    let specifics = {
      ensnaring: () => HazardsByTerrain._ensnaring(PRNG.pickone("mire,marsh,tarpit".split(","))),
      seasonal: () => HazardsByTerrain._dangerous(PRNG.pickone("fire,flood".split(",")), "You get caught in a"),
    }

    return specifics[PRNG.WS("ensnaring,seasonal/1,1")]()
  },
  'water': (PRNG) => { }
}

export const FeatureGen = {
  people: (region, o = {}) => {
    let base = region.realm.people || "";
    return Creature(Object.assign(o, { base: 'Local' }));
  },
  creature: (region, o = {}) => {
    if (region.realm.creature) {
      return region.realm.creature(region, o);
    }

    return Creature(o)
  },
  hazard: (o = {}) => {
    let { seed, terrain, rough = false } = o;
    if (rough) {
      return HazardsByTerrain._rough("land")
    }

    let PRNG = new Chance(seed);
    let _terrain = terrain ? PRNG.weighted([terrain, 'any'], [2, 1]) : "any"
    let _hazard = HazardsByTerrain[_terrain](PRNG);
    return _hazard;

    //extras unnatural or natural
    let extra = PRNG.d12() == 1 ? null : Generators[PRNG.WS("_magic,_element,_aspect/4,2,1")];

    //faction
    let _faction = _type == "trap" ? FeatureGen.faction(region, o) : null;

    return {
      what: "hazard",
      extra: hasE ? extra : null,
      _faction,
      _type,
      type,
      _terrain,
      text
    }
  },
  _dungeon: (o) => {
    let { seed } = o;
    let PRNG = new Chance(seed);

    let type = WSPick(
      "caves|caverns,ruined settlement,prison,mine,crypt|tomb|necropolis,lair|den|hideout,stronghold|fortress,temple|sanctuary|shrine,archive|laboratory,origin unknown/1,1,1,1,1,1,1,1,1,3",
      "|",
      PRNG
    );
    let lair = WSPick(
      "caves|caverns,ruined settlement,prison,mine,crypt|tomb,stronghold|fortress,origin unknown/3,3,1,1,1,1,2",
      "|",
      PRNG
    );

    const depth = PRNG.weighted(
      [1, 2, PRNG.d4() + 1, PRNG.Range(3, 8)],
      [8, 8, 3, 1]
    )

    type = o.type || type;
    let specifics = "lair|den|hideout".includes(type) ? lair : null;
    let text = type + (specifics ? ` [${specifics}]` : '')

    return { type, specifics, depth, text };
  },
  dungeon: (region, o = {}) => {
    let { seed } = o;
    let PRNG = new Chance(seed);

    let data = {
      what: "dungeon",
      text: ''
    };
    let _faction = PRNG.bool() ? FeatureGen.faction(region, o) : Creature(Object.assign(o, { base: "Monster" }));
    let _terrain = PRNG.WS('plains,forest,mountain,swamp/1,1,1,1');

    let specifics = {
      dungeon: () => FeatureGen._dungeon(o),
      lair: () => {
        let l = PRNG.WS("a,b,c/6,3,3");
        let opts = {
          a: { type: "lair" },
          b: {
            text: PRNG.pickone("den|burrow|hive|aerie|nest".split("|")),
            inhabitants: [Creature({ base: PRNG.WS("Beast,Monster/2,1") })]
          },
          c: {
            type: "ruined settlement",
            size: "small",
            text: PRNG.pickone(
              "hovel|encampment|farmstead|homestead".split("|")
            )
          }
        };
        return FeatureGen._dungeon(Object.assign({}, o, opts[l]));
      },
      ruin: () => {
        let r = WSPick(
          "crypt|tomb|necropolis,temple|sanctuary|shrine,mine|quarry|excavation,stronghold|fortress,ruined settlement/2,3,2,3,2",
          "|",
          PRNG
        );
        return FeatureGen._dungeon(Object.assign({}, o, { type: r }));
      }
    }

    return Object.assign(data, specifics[PRNG.pickone(["dungeon", "lair", "ruin"])](), { _faction, _terrain })
  },
  site: (region, o = {}) => {
    let { seed } = o;
    let PRNG = new Chance(seed);

    let data = {
      what: "site",
      text: '',
      _terrain: ''
    };

    let type = data.type = PRNG.WS("landmark,resource/2,1");
    let _faction = null;
    let text = type;

    let specifics = {
      landmark: () => {
        let _odd = Generators._oddity(PRNG);
        let _magic = Generators._magic(PRNG);
        let _statue = PRNG.pickone(['megalith', 'obelisk', 'statue']);

        let type = PRNG.pickone([`oddity-based [${_odd}]`, 'plant-based', 'earth-based', 'water-based', 'faction', _statue, _magic + ' magic']);
        type == 'faction' ? _faction = FeatureGen.faction(region, o) : null;

        let text = `landmark [${type == 'faction' ? _faction.type + ' faction' : type}]`;

        //determine routes - landmark always a route to another plane 
        let route = "OL" + PRNG.AlphaSeed(14);

        //get terrain 
        data._terrain = type.includes('oddity') || type == 'water-based' || type.includes('magic') ? 'any' : 'mountain,hill,forest,plains,swamp'

        return { type, text, route }
      },
      resource: () => {
        let _odd = Generators._oddity(PRNG);
        let _magic = Generators._magic(PRNG);

        let type = PRNG.weighted([`oddity-based [${_odd}]`, 'game|hide|fur', 'timber|clay', 'herb|spice|dye', 'copper|tin|iron', 'silver|gold|gems', _magic + ' magic'], [1, 3, 2, 2, 2, 1, 1]);
        type = type.includes('|') ? PRNG.pickone(type.split('|')) : type
        const text = `resource [${type}]`

        //get terrain
        if (type.includes('oddity') || 'game|hide|fur|herb|spice|dye'.includes(type) || type.includes('magic')) {
          data._terrain = 'any'
        }
        else if ('copper|tin|iron|silver|gold|gems'.includes(type)) {
          data._terrain = 'mountain,hill'
        }
        else if (type == 'timber') {
          data._terrain = 'forest,swamp'
        }
        else if (type == 'clay') {
          data._terrain = 'plains,swamp'
        }

        return { type, text }
      }
    };

    data[type] = specifics[type]();
    data.text = data[type].text || data.text;
    data._faction = _faction;

    return data
  },
  faction: (region, o = {}) => {
    let { seed } = o;
    let PRNG = new Chance(seed);

    let type = PRNG.pickone(
      PRNG.pickone(
        "commoner,criminal,revolutionary,military|mercenary,religious,craft|guild,trade,labor|industrial,nationalist,outsider,academic|arcane,noble".split(
          ","
        )
      ).split("|")
    );
    let goal = PRNG.WS(
      "hunt|oppose,spy|sabotage|infiltrate,hold territory,expand territory,establish outpost,locate|exploit,map territory,establish trade|maintain trade,seek knowledge/2,1,1,1,1,2,1,2,1"
    );
    let state = PRNG.WS(
      "failing,nascent,stable,expanding,dominating/3,2,4,2,1"
    );

    let text = `${type} [${state}, ${goal}]`;

    return {
      what: "faction",
      type,
      goal,
      state,
      text
    }
  },
  settlement: (region, o = {}) => {
    let { seed } = o;
    let PRNG = new Chance(seed);

    let names = ["Outpost", "Hamlet", "Village", "Keep", "Town", "City"];
    const r = PRNG.d12() + region._safetyMod;
    let sz = r < 3 ? 0 : r < 5 ? 1 : r < 8 ? 2 : r < 10 ? 3 : r < 13 ? 4 : 5;
    sz = o.sz && o.sz > -1 ? o.sz : sz;
    const who = names[sz];

    //routes to other planes 
    let nRoute = PRNG.pickone([0, 1]) + (sz > 2 ? sz - 2 : 0);
    let routes = nRoute == 0 ? [] : _.fromN(nRoute, () => "OL" + PRNG.AlphaSeed(14));

    //develop string for MFCG - use new rng
    let size = [3, 7, 15, 25, 35, 45][sz];
    let mseed = PRNG.natural();
    //greens=1&farms=1&citadel=1&urban_castle=1&plaza=1&temple=1&walls=1&shantytown=1&gates=-1&river=1&coast=1&sea=1.8
    let dmfcg = [size, mseed].concat(
      Array.from(
        {
          length: 9
        },
        () => PRNG.pickone([0, 1])
      ),
      [region._water != "land" ? 1 : 0, 0, 0]
    );
    //create link string
    let mids = [
      "size",
      "seed",
      "greens",
      "farms",
      "citadel",
      "urban_castle",
      "plaza",
      "temple",
      "walls",
      "shantytown",
      "gates",
      "river",
      "coast",
      "sea"
    ];
    //https://watabou.github.io/city-generator/?size=17&seed=1153323449&greens=1&farms=1&citadel=1&urban_castle=1&plaza=1&temple=1&walls=1&shantytown=1&coast=1&river=1&gates=-1&sea=1.8
    let mfcg =
      "https://watabou.github.io/city-generator/?" +
      mids.map((mid, i) => mid + "=" + dmfcg[i]).join("&");

    //based of parent alignment
    let alignment = PRNG.weighted(...Aligment[region._alignment]);

    return {
      what: "settlement",
      text: who + " [" + alignment + "]",
      scale: sz - 1 == -1 ? 0 : sz - 1,
      short: who,
      mfcg,
      routes,
      _faction: FeatureGen.faction(region, o)
    }
  }
};
