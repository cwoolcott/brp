const {replaceMaxNum} = require("../utils");
const bettingOptions = {
    
    raise:function(game){
        let playerTurn = game.bettingRoundPlayers[game.currentPosition];
        currentAction = "raise";
        game.bettingRoundRaises++;
        let doubleRaise = Math.max(game.bigBlind * 2, game.currentBet * 2);
  
        doubleRaise = playerTurn.money;
     
        if (doubleRaise >= playerTurn.money) {
          console.log(playerTurn.name, " raises all-in " + "for $" + playerTurn.money);
          playerTurn.currentBet += playerTurn.money;
          game.pot += playerTurn.money;
          playerTurn.potContribution += playerTurn.money;
          playerTurn.allInBet = playerTurn.money;
          playerTurn.money = 0;
  
          game.currentBet = replaceMaxNum(game.currentBet, playerTurn.currentBet);

          playerTurn.allIn = game.pot;
     
          playerTurn.allInRound = game.cardRound;

        } else {
          console.log(playerTurn.name, " raises " + "$" + doubleRaise);
          let betDifference = doubleRaise - playerTurn.currentBet;
          playerTurn.potContribution += betDifference;
          playerTurn.currentBet += betDifference;
          playerTurn.money -= betDifference;
          game.pot += betDifference;
          game.currentBet = doubleRaise;
          game.currentBet = replaceMaxNum(game.currentBet, doubleRaise);
        }
        return game;
    },
    call:function(game){
        let playerTurn = game.bettingRoundPlayers[game.currentPosition];
        currentAction = "call";
        if (playerTurn.currentBet <= game.currentBet) {
            console.log(playerTurn.name, "% Calls % ", game.currentBet);
            console.log("Only has ", playerTurn.currentBet);
    
            if (playerTurn.money <= game.currentBet) {
              console.log("Money is less or greater than current ", playerTurn.money, "<", game.currentBet)
              console.log(playerTurn.name, " calls all-in ", "call: ", game.currentBet, " money: ", playerTurn.money, " pre pot: ", game.pot);
              
        
              
    
              game.pot += playerTurn.money;
              playerTurn.potContribution += playerTurn.money;
              playerTurn.currentBet += playerTurn.money;
              playerTurn.allInBet = playerTurn.money;
              playerTurn.money = 0;
              playerTurn.allIn = game.pot;

              playerTurn.allInRound = game.cardRound;
    
              game.currentBet = replaceMaxNum(game.currentBet, playerTurn.currentBet);

              console.log(
                playerTurn.name,
                " is all-in " +
                  "for $" +
                  playerTurn.allIn +
                  " with " +
                  playerTurn.money
              );
    
            } else {
              console.log("Money is  ", playerTurn.money, ">", game.currentBet)
              let betDifference = game.currentBet - playerTurn.currentBet;
              console.log(playerTurn.name, " calls " + "$" + betDifference);
              game.pot += betDifference;
              playerTurn.currentBet += betDifference;
              playerTurn.money -= betDifference;
              playerTurn.potContribution += betDifference;
              // game.currentBet = playerTurn.currentBet;
              game.currentBet = replaceMaxNum(game.currentBet, playerTurn.currentBet);
            }
          } else {
            currentAction = "check";
            game.temp_check_total++;
            console.log("game.currentBet $", game.currentBet)
            console.log(playerTurn.name + " checks.");
            if (game.temp_check_total> 30){
              for (let j = 0; j < game.bettingRoundPlayers.length; j++) {
          
              console.log(game.bettingRoundPlayers[j])
           
              }
              throw new Error("Check Issue")
            }
          }
          return game;
    },
    fold:function(game){
        let playerTurn = game.bettingRoundPlayers[game.currentPosition];
        //console.log("% Fold % CB:", playerTurn.currentBet, " GB", game.currentBet);
        currentAction = "fold";
        console.log(playerTurn.name, " folds");
        game.bettingRoundPlayers.splice(game.currentPosition, 1);
        //issue with folding player skipping next person
        game.currentPosition--;
        playerFolded = true;
        return game;
    }
}

module.exports = bettingOptions;