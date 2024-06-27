const pokerGame = require("./poker");

async function round(poker){

      // console.info("************************** IN GAME: " + gameCount + "**************************")
      console.log("ROUND " + poker.game.round + " Begins.");
    
      for (let j = 0; j < poker.game.bettingRoundPlayers.length; j++) {
        console.log (poker.game.bettingRoundPlayers[j].name + " has " + poker.game.bettingRoundPlayers[j].money + " In Chips")
      }
      poker = await pokerGame.playRound(poker.game, poker.currentList);
     
      poker.game = pokerGame.gameConfig(poker.game, poker.currentList);
      
      if (poker.currentList.length > 1){
        round(poker)
      }
      return poker
} 

module.exports = round;