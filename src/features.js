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
  hazard: (region, o = {}) => {
    let { seed } = o;
    let PRNG = new Chance(seed);

    if (PRNG.bool()) {
      return FeatureGen.obstacle(region, o)
    }

    let _type = PRNG.WS(
      "oddity,techtonic hazard,volcanic hazard,unseen pitfall,ensnaring,trap,meteorological,seasonal,impairing/1,0.5,0.5,2,2,1,3,1,1"
    );

    let specifics = {
      oddity: `${Generators._oddity(PRNG)} oddity`,
      meteorological: `blizzard,thunderstorm,sandstorm,${Generators._element(
        PRNG
      )}-storm`,
      ensnaring: "bog,mire,tarpit,quicksand",
      "unseen pitfall": "chasm,crevasse,abyss,rift",
      trap: `natural trap,mechancial trap,${Generators._magic(PRNG)} trap`,
      seasonal: "seasonal fire,seasonal flood,seasonal avalanche",
      impairing: "mist,fog,murk,gloom,miasma"
    };

    //extras unnatural or natural
    let hasE = PRNG.d12() == 1;
    let extra = PRNG.WS("taint|blight|curse,_magic,_element,_aspect/5,4,2,1");
    extra = Generators[extra]
      ? Generators[extra](PRNG)
      : PRNG.pickone(extra.split("|"));

    //faction
    let _faction = _type == "trap" ? FeatureGen.faction(region, o) : null;

    //array of extra text
    let eArr = [];
    let type = specifics[_type] ? PRNG.pickone(specifics[_type].split(",")) : _type;
    hasE ? eArr.push(extra) : null;

    let text = `${type}${eArr.length > 0 ? ` [${eArr.join(", ")}]` : ""
      }`;

    //determine terrain type 
    let _terrain = 'any'
    if ('bog,mire,tarpit'.includes(type)) {
      _terrain = 'swamp'
    }
    else if (_type == "unseen pitfall" || type.includes('avalanche')) {
      _terrain = 'mountain,hill'
    }
    else if (type.includes('fire')) {
      _terrain = 'forest,plains,mountain,hill'
    }
    else if (type.includes('flood')) {
      _terrain = 'forest,plains,swamp'
    }
    else if (type.includes('sand')) {
      _terrain = 'desert'
    }

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
  obstacle: (region, o = {}) => {
    let { seed } = o;
    let PRNG = new Chance(seed);

    let _type = PRNG.WS(
      "oddity,defensive,impenetrable,penetrable,traversable/1,2,3,3,3"
    );
    let specifics = {
      oddity: `${Generators._oddity(PRNG)} oddity`,
      defensive: `natural defense,mechancial defense,${Generators._magic(
        PRNG
      )} defense`,
      impenetrable: `cliff,escarpment,crag,bluff,${Generators._magic(
        PRNG
      )} barrier`,
      penetrable: "dense forest,gyser field",
      traversable: "river,ravine,crevasse,chasm,abyss"
    };
    let type = specifics[_type] ? PRNG.pickone(specifics[_type].split(",")) : type;

    //extras unnatural or natural
    let extra =
      PRNG.d12() == 1
        ? Generators[PRNG.WS("_magic,_element,_aspect/7,4,1")](PRNG)
        : null;

    //faction
    let _faction = _type == "defensive" ? FeatureGen.faction(region, o) : null;
    let text = `${type}` + (extra ? ` [${extra}]` : "");

    //determine terrain type 
    let _terrain = 'any'
    if ('cliff,escarpment,crag,bluff'.includes(type)) {
      _terrain = 'mountain'
    }
    else if (type.includes('forest')) {
      _terrain = 'forest'
    }
    else if ('ravine,crevasse,chasm,abyss'.includes(type)) {
      _terrain = 'mountain,hill,forest,plains,swamp'
    }

    return {
      what: "obstacle",
      _faction,
      _type,
      _terrain,
      type,
      text,
      extra
    };
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

    type = o.type || type;
    let specifics = "lair|den|hideout".includes(type) ? lair : null;
    let text = type + (specifics ? ` [${specifics}]` : '')

    return { type, specifics, text };
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

    let type = data.type = PRNG.pickone(["outpost", "landmark", "resource"]);
    let _faction = null;
    let text = type;

    let specifics = {
      outpost: () => {
        //faction
        _faction = FeatureGen.faction(region, o);

        let text = WSPick(
          "tollhouse|checkpoint,meeting|trading post,camp|roadhouse|inn,tower|fort|base/2,3,3,1",
          "|",
          PRNG
        );

        //get terrain 
        data._terrain = PRNG.WS('plains,forest,mountain/4,2,1');

        return {
          text
        };
      },
      landmark: () => {
        let _odd = Generators._oddity(PRNG);
        let _magic = Generators._magic(PRNG);
        let _statue = PRNG.pickone(['megalith', 'obelisk', 'statue']);

        let type = PRNG.pickone([`oddity-based [${_odd}]`, 'plant-based', 'earth-based', 'water-based', 'faction', _statue, _magic + ' magic']);
        type == 'faction' ? _faction = FeatureGen.faction(region, o) : null;

        let text = `landmark [${type == 'faction' ? _faction.type + ' faction' : type}]`;

        //determine routes - landmark always a route to another plane 
        let route = PRNG.pickone(["=", ">"]) + "OL" + PRNG.AlphaSeed(14);

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
    let routes = nRoute == 0 ? [] : _.fromN(nRoute, () => PRNG.pickone(["=", ">"]) + "OL" + PRNG.AlphaSeed(14));

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
