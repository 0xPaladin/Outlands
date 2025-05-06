import "https://cdnjs.cloudflare.com/ajax/libs/chance/1.1.12/chance.min.js"

Chance.prototype.Range = function(min, max) {
  return this.natural({ min, max })
}

//weighted string
Chance.prototype.WS = function(str) {
  let [data, p] = str.split("/")
  return this.weighted(data.split(","), p.split(",").map(Number))
}

//Basic dice, provides sum
Chance.prototype.Dice = function(str) {
  let [_dice, b = 0] = str.split(str.includes("-") ? "-" : "+")
  return (
    this.rpg(_dice, { sum: true }) +
    (str.includes("-") ? -Number(b) : Number(b))
  )
}

//Pick a value based upon a dice roll
Chance.prototype.DicePick = function(str, roll) {
  let [data, p] = str.split("/").map((d, i) => i == 0 ? d.split(',') : d.split(',').map(Number));
  let _max = p.length;
  let i = p.reduce((r, v, j) => (r != _max ? r : roll <= v ? j : _max), _max)
  return data[i]
}

Chance.prototype.AlphaSeed = function(length = 16) {
  return this.string({ length, alpha: true, casing: "upper" })
}

const _ = {
  //build array from umber from
  fromN: (n, f) => {
    return Array.from(
      {
        length: n,
      },
      (v, i) => f(i),
    )
  },

  // capitalizes first character of a string
  capitalize: (str) => {
    return str.substr(0, 1).toUpperCase() + str.substr(1)
  },
}

const modChance = Chance;

export { _, modChance as Chance }