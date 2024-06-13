//const pokerGame = require("./poker")
const handleWinnings = require("../handlewinnings");

let poker = {};
poker.game = {
   pot: 400
};
poker.game.bettingRoundPlayers = [
   {
      id: 123,
      name: "x",
      cardStrength: [ 'Straight', 5, '7', '3' ],
     //cardStrength: [ 'Flush', 6, '7', '3' ],
     //cardStrength: [ 'High Card', 1, 'ACE', 'JACK', '9' ],
      money: 0,
      cards:[{
         value:"4"
      },
      {
         value:"2"
      }],
      allIn: 400,
      potContribution: 50
   },

   {
      id: 789,
      name: "y",
      cardStrength: [ 'Straight', 5, '7', '3' ],
     // cardStrength: [ 'High Card', 1, 'ACE', 'JACK', '9' ],
      money: 0,
      cards:[{
         value:"4"
      },
      {
         value:"2"
      }],
      allIn: 400,
      potContribution:50
   },
   {
      id: 888,
      name: "z",
      //cardStrength: [ 'Straight', 5, '7', '3' ],
      cardStrength: [ 'High Card', 1, 'ACE', 'JACK', '9' ],
      money: 500,
      cards:[{
         value:"4"
      },
      {
         value:"2"
      }],
      allIn: false,
      potContribution:300
   }
]
poker.game = handleWinnings(poker.game);;

for (let i = 0; i<poker.game.bettingRoundPlayers.length; i++){
   console.log(poker.game.bettingRoundPlayers[i].name, poker.game.bettingRoundPlayers[i].money)
}