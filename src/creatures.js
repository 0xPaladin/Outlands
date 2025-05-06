import { Chance, _ } from "./helper.js";

let prng = new Chance();

const airAnimals = [
  "pteranadon",
  "condor",
  "eagle/owl",
  "hawk/falcon",
  "crow/raven",
  "heron/crane/stork",
  "gull/waterbird",
  "songbird/parrot",
  "chicken/duck/goose",
  "bee/hornet/wasp",
  "locust/dragonfly/moth",
  "gnat/mosquito/firefly"
];
const earthAnimals = [
  "dinosaur/megafauna",
  "elephant/mammoth",
  "ox/rhinoceros",
  "bear/ape/gorilla",
  "deer/horse/camel",
  "cat/lion/panther",
  "dog/wolf/boar/pig",
  "snake/lizard/armadillo",
  "mouse/rat/weasel",
  "ant/centipede/scorpion",
  "snail/slug/worm",
  "termite/tick/louse",
  "alligator/crocodile",
  "frog/toad"
];
const waterAnimals = [
  "whale/narwhal",
  "squid/octopus",
  "dolphin/shark",
  "turtle",
  "shrimp/crab/lobster",
  "fish",
  "eel/snake",
  "clam/oyster/snail",
  "jelly/anemone",
  "arthropod/barnacle"
];
const oddities = [
  "many-heads/no-head",
  "profuse sensory organs",
  "many limbs/tentacles/feelers",
  "shape changing",
  "bright/garish/harsh",
  "web/network",
  "crystalline/glassy",
  "gaseous/misty/illusory",
  "volcanic/explosive",
  "magnetic/repellant",
  "ooze/fungal/plant-based"
];

const IsAquatic =
  "whale/narwhal/squid/octopus/dolphin/shark/turtle/shrimp/crab/lobster/fish/eel/clam/oyster/snail/jelly/anemone/arthropod/barnacle/Morkoth/Nereid/Marid/Water Genasi/Sahuagin/Sea Fey/Triton/Locathah/Merfolk";
const SIZES = "small,medium,large,huge,gargantuan";

const ExtraExclude =
  "medium,dragon,giant,monster,aberration,elemental,humanoid";
//crerate string from extra array
const ExtraString = (arr) =>
  `${arr.filter((e) => !ExtraExclude.includes(e)).join(", ")}`;

export const Generators = {
  _color(PRNG) {
    return PRNG.pickone(
      "red,blue,green,purple,black,yellow,orange,white,gold,silver,bronze,brass,copper,amethyst,emerald,sapphire,ruby,topaz,crystal".split(
        ","
      )
    );
  },
  _quantity(RNG, sz) {
    let q = {
      small: "solitary,group,throng/2,7,3",
      medium: "solitary,group,throng/4,6,2",
      large: "solitary,group/9,3",
      huge: "solitary,group/11,1",
      gargantuan: "solitary,group/11,1"
    }[sz];
    return RNG.WS(q);
  },
  _size(PRNG, o = {}) {
    return o.sz && !o.sz.includes(",") ? o.sz : PRNG.WS(o.sz || "small,medium,large,huge,gargantuan/20,25,35,15,5");
  },
  _ability(PRNG) {
    const what = () =>
      PRNG.pickone(
        PRNG.pickone(
          "bless/curse,entrap/paralyze,levitate/fly/teleport,telepathy/mind control,mimic/camouflage,seduce/hypnotize,dissolve/disintegrate,drain life/drain magic,_aspect/_aspect,_element/_element,_magic/_magic".split(
            ","
          )
        ).split("/")
      );

    return (PRNG.d12() == 12 ? [what(), what()] : [what()]).map((a) => {
      return Generators[a] ? Generators[a](PRNG) : a;
    });
  },
  //
  _magic: (PRNG) => {
    let what = PRNG.WS(
      "necromancy,evocation,conjuration,illusion,enchantment,transformation,warding,_element,healing,divination/1,2,1,1,1,1,1,2,1,1"
    );
    return what == "_element" ? Generators._element(PRNG) : what;
  },
  _element: (PRNG) =>
    PRNG.pickone(
      PRNG.WS(
        "void|cosmos,death|darkness,fire|metal,earth,water|ice,air|storm,light|life/2,1,2,2,2,2,1"
      ).split("|")
    ),
  _aspect: (PRNG, region) => {
    return PRNG.pickone(
      PRNG.pickone([
        "war/destruction",
        "hate/envy",
        "power/strength",
        "trickery/dexterity",
        "time/constitution",
        "lore/intelligence",
        "nature/wisdom",
        "culture/charisma",
        "luck/fortune",
        "love/admiration",
        "peace/balance",
        "glory/divinity"
      ]).split("/")
    );
  },
  _oddity: (PRNG) => {
    let odd = () =>
      PRNG.pickone(
        PRNG.pickone(
          "bright|garish|harsh,geometric|concentric,web|network,crystalline|glassy,fungal|slimy|moldy,gaseous|misty|illusory,volcanic|explosive,magnetic|repellant,multilevel|tiered,absurd|impossible".split(
            ","
          )
        ).split("|")
      );
    return PRNG.d12() > 10 ? [odd(), odd()].join("/") : odd();
  },
  //
  _animal(PRNG, aew = "") {
    if (aew == "") aew = PRNG.weighted(["a", "e", "w"], [3, 6, 2]);
    let animalArray =
      aew == "a" ? airAnimals : aew == "e" ? earthAnimals : waterAnimals;

    let _res = PRNG.pickone(PRNG.pickone(animalArray).split("/"));
    return _.capitalize(_res);
  },
  _monster(PRNG, o = {}) {
    let sz = Generators._size(PRNG);
    sz = o.sz ? o.sz : "small,medium".includes(sz) ? "large" : sz;

    let [text, extra] = Generators.Beast(PRNG, o);
    extra = [
      "monster",
      sz,
      ...extra.slice(1).filter((e) => !SIZES.includes(e))
    ];

    if (o.ex) {
      extra = extra.concat(
        o.ex == "_ability" ? Generators[o.ex](PRNG) : [Generators[o.ex](PRNG)]
      );
    }

    return [text, extra];
  }
};

Generators.Giant = (PRNG, o = {}) => {
  let e = Generators._element(PRNG);
  let extras = ["giant", e, "huge"];

  return [`${_.capitalize(e)} Giant`, extras];
};
Generators.Dragon = (PRNG, o = {}) => {
  let e = Generators._element(PRNG);
  let sz = Generators._size(PRNG);
  sz = "small,medium".includes(sz) ? "large" : sz;
  let color = _.capitalize(Generators._color(PRNG));
  let form = PRNG.WS("Wyrm,Drake,Wyvern,Linwyrm,Dragon/1,2,2,1,1");

  let extras = ["dragon", sz, e];

  return [`${color} Dragon`, extras];
};
Generators.Kaiju = (PRNG, o = {}) => {
  let [animal, ex] = Generators.Beast(PRNG, { aew: "c" });
  let extras = [
    "monster",
    "gargantuan",
    ...ex.slice(1).filter((e) => !SIZES.includes(e))
  ];

  return [`${animal} Kaiju`, extras];
};
Generators.Oddity = (PRNG, o = {}) => {
  let extras = ["aberration"];

  let sz = Generators._size(PRNG);
  sz != "medium" ? extras.push(sz) : null;

  extras.push(Generators._oddity(PRNG), ...Generators._ability(PRNG));

  return [`Monstrous Oddity`, extras];
};
Generators.Demigod = (PRNG, o = {}) => {
  let e = PRNG.shuffle(["_element", "_magic", "_aspect"])
    .slice(0, PRNG.pickone([1, 2]))
    .map((e) => Generators[e](PRNG))
    .flat();
  let sz = PRNG.WS("medium,large,huge,gargantuan/35,25,15,5");
  e = sz != "medium" ? [sz, ...e] : e;

  return ["Demigod", e];
};
Generators.Elemental = (PRNG, o = {}) => {
  let { base = "" } = o;
  let sz = Generators._size(PRNG);
  let e = Generators._element(PRNG);
  let extras = [];
  let text = "";

  if (base == "plant") {
    extras = ["plant"];
    let form = PRNG.WS("Shrub,Tree,Cactus,Vine,Fungus/1,1,1,1,2");
    text = `Monstrous ${form}`;
  } else {
    extras = ["elemental"];
    let form = PRNG.pickone([
      "humanoid",
      Generators.Beast(PRNG)[0].toLowerCase()
    ]);
    extras.push(base == "slime" ? "ooze" : form, e);
    text = _.capitalize(e) + " Elemental";
  }
  sz != "medium" ? extras.push(sz) : null;

  return [text, extras];
};
Generators.Proxy = (PRNG, o = {}) => {
  let e = PRNG.shuffle(["_element", "_magic", "_aspect"])
    .slice(0, PRNG.pickone([1, 2]))
    .map((e) => Generators[e](PRNG))
    .flat();
  let sz = PRNG.WS("medium,large,huge,gargantuan/35,25,15,5");
  e = sz != "medium" ? [sz, ...e] : e;

  return ["Proxy", e];
};
Generators.Undead = (PRNG, o = {}) => {
  let { cat } = o;
  let extra = ["undead"];
  cat = cat || PRNG.weighted(['minor','major'],[4,1])

  let category = {
    major: "lich,vampire,death knight/1,1,1",
    minor: "skeleton,zombie,wight,wisp,specter,wraith,ghost/2,2,2,2,1,2,1"
  };
  let text = PRNG.WS(category[cat]);

  switch (text) {
    case "lich":
      extra.push(Generators._magic(PRNG), "paralyze");
      break;
    case "vampire":
      extra.push("hypnotize", "drain life");
      break;
    case "wight":
      extra.push("paralyze");
      break;
    case "wraith":
      extra.push("drain life");
      break;
  }

  return [_.capitalize(text), extra];
};
Generators.Outsider = (PRNG, o = {}) => {
  let [animal, ex] = Generators.Beast(PRNG, { aew: "c" });
  let extras = [
    "aberration",
    animal,
    ...ex.slice(1),
    Generators._oddity(PRNG),
    ...Generators._ability(PRNG)
  ];

  return ["Outsider", extras];
};

Generators.Monster = (PRNG, o = {}) => {
  let cat = PRNG.WS("legendary,supernatural,fearsome/1,3,8");
  let _base = {
    legendary: "Oddity+sz:huge,Giant,Dragon,Kaiju,_monster+sz:huge/2,2,2,2,4",
    supernatural:
      "Demigod,Elemental,Proxy,Outsider,Undead+cat:major,Undead+cat:minor/1,2,3,1,2,3",
    fearsome:
      "_monster+ex:_ability,_monster+ex:_oddity,Elemental+base:slime,Elemental+base:plant/5,2,3,2"
  };

  let [base, opts = ""] = PRNG.WS(_base[cat]).split("+");
  base = o.base || base;
  opts = opts == "" ? {} : Object.fromEntries([opts.split(":")]);

  let [text, tags] = Generators[base](PRNG, Object.assign(o, opts));
  return [text, tags];
};

Generators.Beast = (PRNG, o = {}) => {
  let size = Generators._size(PRNG, o);

  const byBiome = {
    Marine: "a,e,w/3,2,6",
    Desert: "a,e,w/3,6,2",
    Plains: "a,e,w/4,5,2",
    Forest: "a,e,w/3,6,2",
    Cold: "a,e,w/5,4,2",
    Wetland: "a,e,w/1,1,1"
  };

  let animal = (aew) => Generators._animal(PRNG, aew);
  let _aew = () =>
    o.biome ? PRNG.WS(byBiome[o.biome]) : PRNG.WS("a,e,w/3,6,2");

  //air earth water - 10% chance chimera
  let aew = PRNG.d10() == 1 ? [_aew(), _aew()] : [_aew()];
  aew = o.aew == "c" ? [_aew(), _aew()] : o.aew ? [o.aew] : aew;

  let what = aew.map((id) => animal(id)).join("/");
  let tags = aew.includes("w") ? [size, "aquatic"] : [size];

  return [what, tags];
};

Generators.Humanoid = (PRNG, o = {}) => {
  let { terrain } = o;
  let base = PRNG.pickone(["Elemental", "Folk"]);

  let _terrain = () =>
    terrain.includes("barren")
      ? "Desert"
      : terrain.includes("forest")
        ? "Forest"
        : ["Taiga", "Tundra", "Glacier"].includes(terrain)
          ? "Cold"
          : ["Savanna", "Grassland"].includes(terrain)
            ? "Plains"
            : terrain;

  let noTerrain =
    "Fire,Water,Mountain,Plains,Forest,Storm,Frost,Time/2,2,2,2,2,1,1,0.5::Skeleton,Ghoul,Wraith,Vampire,Dragon,Feathered,Scaled,Fanged,Hooved,Roda,Lago,Finned,Tentacled,Web,Formic,Opteri,Koleo,Shelled,Chirops,Selachii,Bato,Angui,Skoraps/0.5,0.5,0.5,0.5,0.5,2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1,1";
  let withTerrain = {
    Marine:
      "Water,Storm,Plains,Time/4,2,1,0.5::Feathered,Fanged,Finned,Tentacled,Shelled,Selachii,Bato,Angui/1,1,2,2,2,1,1,1",
    Desert:
      "Fire,Storm,Time,Plains,Mountain/3,1,0.5,2,2::Feathered,Scaled,Fanged,Hooved,Roda,Lago,Web,Formic,Opteri,Koleo,Chirops,Skoraps/1,1,1,1,1,1,1,1,1,1,1,1",
    Plains:
      "Fire,Water,Plains,Forest,Storm,Frost,Time/1,1,3,1,2,1,0.5::Feathered,Scaled,Fanged,Hooved,Roda,Lago,Web,Formic,Opteri,Koleo,Chirops,Skoraps/1,1,1,1,1,1,1,1,1,1,1,1",
    Forest:
      "Water,Mountain,Forest,Storm,Frost,Time/2,1,3,2,1,0.5::Feathered,Scaled,Fanged,Hooved,Roda,Lago,Web,Formic,Opteri,Koleo,Chirops,Skoraps/1,1,1,1,1,1,1,1,1,1,1,1",
    Cold:
      "Mountain,Plains,Forest,Storm,Frost,Time/2,1,1,1,3,0.5::Feathered,Scaled,Fanged,Hooved,Roda,Lago,Chirops,Web,Formic,Opteri,Koleo/2,2,2,2,2,2,2,1,1,1,1",
    Wetland:
      "Water,Forest,Storm,Time/3,2,1,1::Feathered,Scaled,Fanged,Hooved,Roda,Lago,Finned,Tentacled,Web,Formic,Opteri,Koleo,Shelled,Chirops,Bato,Angui,Skoraps/2,2,2,2,2,2,2,2,2,2,2,2,2,1,1,1,1"
  };
  //determine the people
  let str = terrain ? withTerrain[_terrain()] : noTerrain;
  str = str.split("::")[base == "Elemental" ? 0 : 1];
  let _p = PRNG.WS(str);

  let noFolk =
    "Roda,Lago,Formic,Opteri,Koleo,Chirops,Selachii,Bato,Angui,Skoraps";
  _p += noFolk.includes(_p) ? "" : "-folk";

  //size
  let size = PRNG.WS("small,medium,large/15,70,15");

  let aquatic = "Finned-folk,Tentacled-folk,Shelled-folk,Selachii,Bato,Angui";
  //tags
  let tags = ["humanoid", size];
  _p == "Water" || aquatic.includes(_p) ? tags.push("aquatic") : null;

  return [_p, tags];
};

Generators.Local = (PRNG, o = {}) => {
  return o.region ? o.region.people(PRNG) : Generators.Humanoid(PRNG, o);
};

const Creature = (o = {}) => {
  let { seed = prng.AlphaSeed(16), safety = 0 } = o;
  let PRNG = new Chance(seed);

  let roll = PRNG.d12() + safety;
  let base = PRNG.DicePick("Monster,Beast,Humanoid,Local/4,9,11", roll);

  if (o.base) {
    let [a, b] = o.base.split(".");
    base = a;
    o.base = b;
  }

  //generate
  let [text, extra] = Generators[base](PRNG, o);
  let exstr = ExtraString(extra);

  let what = `Creature, ${base}`

  return {
    seed,
    what,
    base,
    extra,
    short: text,
    text: `${text}${exstr.length == 0 ? "" : ` [${exstr}]`}`
  };
};

export { Creature };