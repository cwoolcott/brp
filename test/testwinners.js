//const pokerGame = require("./poker")
const handleWinnings = require("../handlewinnings");

let poker = {};
poker.game = {
   pot: 500
};
poker.game.bettingRoundPlayers = [
   {
      id: 123,
      name: "x",
      cardStrength: [ 'Flush', 6, '7', '3' ],
      money: 0,
      allIn: 100
   },

   {
      id: 789,
      name: "z",
      cardStrength: [ 'High Card', 1, '7', '3' ],
      money: 0,
      allIn: 5000
   }
]
handleWinnings(poker.game);;

for (let i = 0; i<poker.game.bettingRoundPlayers.length; i++){
   console.log(poker.game.bettingRoundPlayers[i].name, poker.game.bettingRoundPlayers[i].money)
}