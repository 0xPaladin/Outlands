import { Chance, _ } from "./helper.js";
const prng = new Chance();

export const Camp = (game) => {
  let { hex } = game;

  game._camp = true;
  //gain stamina
  let _stamina = game.stamina[0];
  game.stamina[0] = _stamina + 3 > game.stamina[1] ? game.stamina[1] : _stamina + 3;

  //takes 8 hrs 
  game.addTime(8);

  //encounter 
  game.plane.encounter(hex.data, false);
}

/*  
  Settlement Actions
*/

export const SettlementAction = async (game, id) => {
  let act = {
    Rest() {
      game._items.coin -= 5;
      game.stamina[0] = game.stamina[1];
    },
    Resupply() {
      game._items.coin -= 5;
      game._items.supply[0]++;
    },
    RelicForFame() {
      game._items.relics[0] -= 1;
      game.fame++;
    },
    async SellTrinkets() {
      //trinket price 
      let price = prng.weighted([5, 10, 15, 20, 25, 30], [20, 16, 4, 8, 4, 2])

      //popup to sell trinkets
      const { value: nT } = await App.alert({
        title: `Sell Trinkets?`,
        text: `Merchants are willing to buy you trinkets for ${price} coin each.`,
        showCancelButton: true,
        confirmButtonColor: "#04AA6D",
        confirmButtonText: "Sell",
        input: "range",
        inputLabel: "Trinkets",
        inputValue: 1,
        inputAttributes: {
          min: 0,
          max: game._items.trinkets[0],
          step: "1"
        }
      })
      if (nT) {
        game._items.trinkets[0] -= nT;
        game._items.coin += nT * price;
      }
    }
  }[id];
  await act();

  //takes 8 hours
  game.addTime(8);

  //save
  game.save();
}

