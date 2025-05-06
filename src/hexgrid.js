import { SVG } from "https://cdnjs.cloudflare.com/ajax/libs/svg.js/3.2.4/svg.esm.min.js";
import { Chance, _ } from "./helper.js";
/*
  Honeycomb - https://abbekeultjes.nl/honeycomb/
*/
import "https://cdn.jsdelivr.net/npm/honeycomb-grid";

let { defineHex, Grid, rectangle } = Honeycomb;
const Neighboors = [
  [1, -1],
  [1, 0],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [0, -1]
];
const Directions = {
  NE: [1, -1],
  E: [1, 0],
  SE: [0, 1],
  SW: [-1, 1],
  W: [-1, 0],
  NW: [0, -1]
};
const ForwardWalkOptions = {
  NE: ["NW", "NE", "E"],
  E: ["NE", "E", "SE"],
  SE: ["E", "SE", "SW"],
  SW: ["W", "SW", "SE"],
  W: ["NW", "W", "SW"],
  NW: ["W", "NW", "NE"]
};

//Create a hex class:
const Hex = Honeycomb.defineHex({
  dimensions: 30,
  origin: "topLeft"
});

//Basic grid for use
const MakeGrid = (width, height, dimensions = 30) => {
  let _hex = Honeycomb.defineHex({
  dimensions,
  origin: "topLeft"
});
  return new Grid(_hex, rectangle({ width, height }));
}
let _base = MakeGrid(10, 10);
const BaseHex = {
  ids: _base.toArray().map(({ q, r }) => [q, r].join(",")),
  hex: _base
};

//create a random grid based upon picking random Neighboors
const RandomGrid = (seed = chance.integer(), n) => {
  const RNG = new Chance(seed);
  n = n || 10 + SumDice("2d20", RNG);

  const ids = ["0.0"];

  while (ids.length < n) {
    //pick Neighboor
    const _N = RNG.pickone(Neighboors);
    //pick hex - split to xy and then add Neighboor
    const qr = RNG.pickone(ids)
      .split(".")
      .map((v, j) => Number(v) + _N[j])
      .join(".");
    //check if exists
    if (!ids.includes(qr)) {
      //if not push to ids and set to last
      ids.push(qr);
    }
  }

  return new Grid(
    Hex,
    ids.map((id) => id.split(".").map(Number))
  );
};

//create a random grid based a walk, trying to pick the last chosen id
const RandomWalk = (seed = chance.integer(), n) => {
  const RNG = new Chance(seed);
  n = n || 10 + SumDice("2d20", RNG);

  const ids = ["0.0"];
  let last = "0.0",
    i = 0;

  while (ids.length < n) {
    let use = i < 3 ? last : RNG.pickone(ids);
    //pick Neighboor
    const _N = RNG.pickone(Neighboors);
    //pick hex - split to xy and then add Neighboor
    const qr = use
      .split(".")
      .map((v, j) => Number(v) + _N[j])
      .join(".");
    //check if exists
    if (!ids.includes(qr)) {
      //if not push to ids and set to last
      ids.push(qr);
      i = 0;
      last = qr;
    }
    i++;
  }

  let _ids = ids.map((id) => id.split(".").map(Number));

  return new Grid(Hex, _ids);
};

//create a random grid based a forward walk, trying to pick the last chosen id
const ForwardWalk = (seed = chance.integer(), n) => {
  const RNG = new Chance(seed);
  n = n || 10 + SumDice("2d20", RNG);

  const ids = ["0.0"];
  let last = "0.0",
    lastD = RNG.pickone(Object.keys(Directions)),
    i = 0;

  while (ids.length < n) {
    let use = i < 3 ? last : RNG.pickone(ids);
    let ld = lastD;
    //pick Neighboor
    let nd = RNG.pickone(ForwardWalkOptions[ld]);
    const _N = Directions(nd);
    //pick hex - split to xy and then add Neighboor
    const qr = use
      .split(".")
      .map((v, j) => Number(v) + _N[j])
      .join(".");
    //check if exists
    if (!ids.includes(qr)) {
      //if not push to ids and set to last
      ids.push(qr);
      i = 0;
    }
    i++;
  }

  return new Grid(
    Hex,
    ids.map((id) => id.split(".").map(Number))
  );
};

//create a chain of ids for a terrain
const Chain = (RNG, hex, n) => {
  const ids = [],
    _hex = hex.slice();

  const claim = (id) => {
    ids.push(id);
    _hex.splice(_hex.indexOf(id), 1);
  };

  //claim first hex
  claim(RNG.pickone(hex));
  while (ids.length < n) {
    //pick Neighboor
    const _N = RNG.pickone(Neighboors);
    //pick hex - split to xy and then add Neighboor
    const id = RNG.pickone(ids)
      .split(",")
      .map((v, j) => Number(v) + _N[j])
      .join(",");
    //check if exists
    if (!ids.includes(id) && _hex.includes(id)) {
      //if not push to ids and set to last
      claim(id);
    }
  }

  return [ids, _hex];
};

const HexFromIds = (ids) =>
  new Grid(
    Hex,
    ids.map((id) => id.split(".").map(Number))
  );

export { MakeGrid, BaseHex, RandomGrid, Chain, RandomWalk, HexFromIds };

export const HexDisplay = (R, svg) => {
  svg = svg || SVG().addTo("body").size("100%", "100%");
  let g = svg.group().attr("id", "hex");

  //empty hex
  g.find(".hex").forEach((h) => h.remove());
  g.find(".dText").forEach((h) => h.remove());

  //assume hex display
  R.hexGrid.forEach((hex, i) => {
    // create a polygon from a hex's corner points
    const polygon = g
      .polygon(hex.corners.map(({ x, y }) => `${x},${y}`))
      .addClass("hex")
      .data({
        i
      })
      .click(function() {
        console.log(hex);
      });

    //simple id
    g.text("#" + (i + 1))
      .move(hex.x, hex.y)
      .addClass("dText");
  });

  const box = g.bbox();
  svg.attr("viewBox", [box.x, box.y, box.width, box.height].join(" "));
};