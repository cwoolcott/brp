//const pokerGame = require("./poker")
const handleWinnings = require("../handlewinnings");

let poker = {};
poker.game = {
   pot: 1600
};
poker.game.bettingRoundPlayers = [
   {
      id: 123,
      name: "x",
      cardStrength: [ 'Flush', 6, '7', '3' ],
      money: 0,
      allIn: 350,
      potContribution: 100
   },

   {
      id: 789,
      name: "y",
      cardStrength: [ 'Straight', 5, '7', '3' ],
      money: 0,
      allIn: 2600,
      potContribution:1350
   },
   {
      id: 810,
      name: "z",
      cardStrength: [ 'High Card', 1, '7', '3' ],
      money: 0,
      allIn: 2400,
      potContribution:1150
   }
]
handleWinnings(poker.game);;

for (let i = 0; i<poker.game.bettingRoundPlayers.length; i++){
   console.log(poker.game.bettingRoundPlayers[i].name, poker.game.bettingRoundPlayers[i].money)
}