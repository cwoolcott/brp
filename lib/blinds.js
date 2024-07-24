const {replaceMaxNum} = require("../utils");

function takeBlinds (game) {
    for (let i = 0; i < game.bettingRoundPlayers.length; i++) {
      game.bettingRoundPlayers[i].position = i;
      game.bettingRoundPlayers[i].allIn = false;
      game.bettingRoundPlayers[i].allInRound = game.cardRound;
      game.bettingRoundPlayers[i].currentBet = 0;
      game.bettingRoundPlayers[i].potContribution = 0;
    }

    game.pot = 0;
    let smbPos = game.bettingRoundPlayers.length-2;
    let bigPos = game.bettingRoundPlayers.length-1;

    // if (game.bettingRoundPlayers.length === 2) {
    //  // console.log("Two Players Left - Small Blind is now 0")
    //   smbPos = 0;
    // }

    // 0, 1, 2, 3

    //console.log("SMBLIND", game.bettingRoundPlayers);

    if (game.smallBlind >= game.bettingRoundPlayers[smbPos].money) {
      //console.log("--- " , currentList[smbPos].name , " game.smallBlind > currentList[smbPos].money SMALL BLIND:", game.smallBlind, "MONEY:" . currentList[smbPos].money, " Pre Game Pot: ", game.pot)
      game.pot += game.bettingRoundPlayers[smbPos].money;
      game.bettingRoundPlayers[smbPos].currentBet = game.bettingRoundPlayers[smbPos].money;
      game.bettingRoundPlayers[smbPos].potContribution = game.bettingRoundPlayers[smbPos].money;
      game.bettingRoundPlayers[smbPos].allIn = game.pot;
      //console.log("SML ALL IN ROUND", game.cardRound);
      game.bettingRoundPlayers[smbPos].allInRound = game.cardRound;
      game.bettingRoundPlayers[smbPos].allInBet =
      game.bettingRoundPlayers[smbPos].currentBet;
      game.bettingRoundPlayers[smbPos].money = 0;
      game.currentBet = replaceMaxNum(game.currentBet, game.bettingRoundPlayers[smbPos].currentBet);
      //console.log("--- SMALL BLIND:", game.smallBlind, "MONEY:" . currentList[smbPos].money, " POST Game Pot: ", game.pot)
      console.log(
        "Small Blind Posted by " +
          game.bettingRoundPlayers[smbPos].name +
          " for $" +
          game.bettingRoundPlayers[smbPos].currentBet +
          " causing them to go all in."
      );
      game.displayMessage += "Small Blind Posted by " +
          game.bettingRoundPlayers[smbPos].name +
          " for $" +
          game.bettingRoundPlayers[smbPos].currentBet +
          " causing them to go all in. ";
    } else {
      game.bettingRoundPlayers[smbPos].money -= game.smallBlind;
      game.bettingRoundPlayers[smbPos].currentBet = game.smallBlind;
      game.bettingRoundPlayers[smbPos].potContribution = game.smallBlind;
      game.pot += game.smallBlind;

      game.currentBet = replaceMaxNum(game.currentBet, game.smallBlind);
      console.log(
        "Small Blind Posted by " +
          game.bettingRoundPlayers[smbPos].name +
          " for $" +
          game.bettingRoundPlayers[smbPos].currentBet
      );
      game.displayMessage += "Small Blind Posted by " +
          game.bettingRoundPlayers[smbPos].name +
          " for $" +
          game.bettingRoundPlayers[smbPos].currentBet + ". ";
    }

    if (game.bigBlind >= game.bettingRoundPlayers[bigPos].money) {
      //console.log("--- " , currentList[bigPos].name , " game.bigBlind > currentList[bigPos].money BIG BLIND:", game.bigBlind, "MONEY:" . currentList[bigPos].money, " Pre Game Pot: ", game.pot)
      game.pot += game.bettingRoundPlayers[bigPos].money;
      game.currentBet = replaceMaxNum(game.currentBet, game.bettingRoundPlayers[bigPos].money);
      game.bettingRoundPlayers[bigPos].potContribution = game.bettingRoundPlayers[bigPos].money;
      game.bettingRoundPlayers[bigPos].currentBet = game.bettingRoundPlayers[bigPos].money;
      game.bettingRoundPlayers[bigPos].allIn = game.pot;
      console.log("BIG ALL IN ROUND", game.cardRound);
      game.bettingRoundPlayers[bigPos].allInRound = game.cardRound;
      game.bettingRoundPlayers[bigPos].allInBet =
      game.bettingRoundPlayers[bigPos].currentBet;
      game.bettingRoundPlayers[bigPos].money = 0;
      console.log(
        "Big Blind Posted by " +
          game.bettingRoundPlayers[bigPos].name +
          " for $" +
          game.bettingRoundPlayers[bigPos].currentBet +
          " causing them to go all in."
      );
      game.displayMessage += "Big Blind Posted by " +
      game.bettingRoundPlayers[bigPos].name +
      " for $" +
      game.bettingRoundPlayers[bigPos].currentBet +
      " causing them to go all in. ";

    } else {
      game.bettingRoundPlayers[bigPos].money -= game.bigBlind;
      game.currentBet = replaceMaxNum(game.currentBet, game.bigBlind);
      
      game.bettingRoundPlayers[bigPos].potContribution = game.bigBlind;
      game.pot += game.bigBlind;
      game.bettingRoundPlayers[bigPos].currentBet = game.bigBlind;
      console.log(
        "Big Blind Posted by " +
          game.bettingRoundPlayers[bigPos].name +
          " for $" +
          game.bettingRoundPlayers[bigPos].currentBet +
          "."
      );
      game.displayMessage +=   "Big Blind Posted by " +
      game.bettingRoundPlayers[bigPos].name +
      " for $" +
      game.bettingRoundPlayers[bigPos].currentBet +
      ". ";
    }
    
    // for (let i = 0; i < game.bettingRoundPlayers.length; i++) {

    //  console.log("AFTER BLIND", game.bettingRoundPlayers[i].potContribution) 
    // }

    //console.log("BigBlind:", game.bettingRoundPlayers[bigPos].name, " SB:", game.bettingRoundPlayers[bigPos].currentBet);
    return game;
  };

  module.exports = takeBlinds;