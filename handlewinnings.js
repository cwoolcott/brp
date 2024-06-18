const {nameCards, areValuesInArraySame} = require("./utils");

const singleCardValueMap = function (value) {
  const valueMap = {
    A: "Ace",
    K: "King",
    Q: "Queen",
    J: "Jack",
    0: "10",
  };

  return valueMap[value] ? valueMap[value] : value;
}

function sortByKey(array, key) {
  return array.sort(function(a, b) {
      var x = a[key]; var y = b[key];
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}

const readHand = function ({cards, cardStrength}) {

  // console.log("rh", cards, cardStrength)

  cardStrength[2] = singleCardValueMap(cardStrength[2]);
  cardStrength[3] = singleCardValueMap(cardStrength[3]);
  cardStrength[4] = singleCardValueMap(cardStrength[4]);

  let showCards = `Reveals ${nameCards(cards[0].value, cards[0].suit)} and ${nameCards(cards[1].value, cards[1].suit)}` ;
 
  let result = "";
  if (cardStrength[0] === "High Card") {
    result = (
      "a High Card of " +
      cardStrength[2] +
      " and a " +
      cardStrength[3] +
      ", " +
      cardStrength[4] +
      " Kicker."
    );
  }
  if (cardStrength[0] === "Pair") {
    result =  (
      "a Pair of " +
      cardStrength[2] +
      "'s and a " +
      cardStrength[3] +
      ", " +
      cardStrength[4] +
      " Kicker."
    );
  } else if (cardStrength[0] === "Two Pair") {
    result = (
      "Two Pairs of " +
      cardStrength[2] +
      "'s and " +
      cardStrength[3] +
      "'s, with a " +
      cardStrength[4] +
      " Kicker."
    );
  } else if (cardStrength[0] === "Three of a Kind") {
    result = (
      "a Three of a Kind with " +
      cardStrength[2] +
      "'s and a " +
      cardStrength[3] +
      ", " +
      cardStrength[4] +
      " Kicker."
    );
    
  } 
  else if (cardStrength[0] === "Straight") {
    result = (
      "a Straight "
    );
}
else if (cardStrength[0] === "Flush") {
  result = (
    "a Flush "
  );
}
else if (cardStrength[0] === "Full House") {
    result = (
      "a Full House with " +
      cardStrength[2] +
      "'s full of " +
      cardStrength[3] +
      "'s"
    );
  }
  else if (cardStrength[0] === "Four of a Kind") {
    result = (
      "a Four of a Kind with " +
      cardStrength[2] +
      "'s"
    );
  }
  else if (cardStrength[0] === "Straight Flush") {
    result = (
      "a Straight Flush "
    );
}

  else{
    result = cardStrength[0];
  }
 
  return `${showCards} making ${result}`;
};

const handleWinnings = function (game) {
    const allInPlayers = game.bettingRoundPlayers.filter(player => player.allIn);
    const allInAmounts = allInPlayers.map(player => player.allIn);
    const minAllIn = Math.min(...allInAmounts);

    //Math Adjust shouldn't be more than game pot
    let roundWinnings = 0;
    
  
    // Check for players with the same BEST HAND
    if (
      game.bettingRoundPlayers.some(player => {
        return player.id !== game.bettingRoundPlayers[0].id &&
          JSON.stringify(player.cardStrength) === JSON.stringify(game.bettingRoundPlayers[0].cardStrength);
      })
    ) {
      console.log("#1 Count players with same hand and all in amounts");
      //Count players with same hand and all in amounts
      let allInPlayers = [];
      let notAllInPlayers = [];
      let allInRemaining = 0;
      let highestAllIn = 0;
      let sameHand = 0;
      
  
      game.bettingRoundPlayers.forEach(player => {

        if (JSON.stringify(player.cardStrength) === JSON.stringify(game.bettingRoundPlayers[0].cardStrength)){
          sameHand++;
        }

        if (player.allIn){
          allInPlayers.push(player);
          highestAllIn = player.allIn > highestAllIn ? player.allIn : highestAllIn;
          allInRemaining++;
        } 
        else{
          notAllInPlayers.push(player);
        }
      });

      console.log("sameHand:", sameHand)
      console.log(":", allInPlayers.length, )

      // all same hands, everyone gets contribution back
      if (sameHand === game.bettingRoundPlayers.length ){
        game.bettingRoundPlayers.forEach((player, i, array) => {
          player.money += parseInt(player.potContribution);
          roundWinnings += parseInt(player.potContribution);
        });
        //Remaining Money in Pot Distribute
        if (game.pot>roundWinnings){
          let remainingWinnings = game.pot - roundWinnings;
          let remainingWinningPart = parseInt(remainingWinnings/game.bettingRoundPlayers.length)
          let reminder = remainingWinnings % game.bettingRoundPlayers.length;

          game.bettingRoundPlayers.forEach((player, i, array) => {
            player.money += parseInt(remainingWinningPart);
            roundWinnings += parseInt(remainingWinningPart);
            if (i === array.length - 1){ 
              player.money += parseInt(reminder);
            roundWinnings += parseInt(reminder);
          }
          });
        }
      }
      //some other player(s) have same best hand
      else{
        let totalPercent = 0;
        let remainingPot = game.pot;
        for (let i = 0; i<sameHand; i++){
          let potPercent;
        
          if (parseInt(game.bettingRoundPlayers[i].potContribution) !== 0){
            console.log(" game.bettingRoundPlayers[i].potContribution)",  game.bettingRoundPlayers[i].potContribution);
            const percentage = game.pot/game.bettingRoundPlayers[i].potContribution;
            console.log("game.pot/game.bettingRoundPlayers[i].potContribution", game.pot, "/", game.bettingRoundPlayers[i].potContribution)
            console.log("percentage", percentage)
             potPercent = (percentage * game.bettingRoundPlayers.length/100);
            console.log("potPercent", potPercent)
            
          }
          else{
            potPercent = 0;
          }
          totalPercent += potPercent
          
          let amountEarned = parseInt(potPercent * game.pot);
          console.log("amountEarned", amountEarned)
          game.bettingRoundPlayers[i].money += amountEarned
          roundWinnings += amountEarned
          remainingPot -= amountEarned;
        }
        //should be next player if not all hands match
        game.bettingRoundPlayers[sameHand].money += remainingPot;
        roundWinnings += remainingPot
        

      }
      
      console.log(readHand(game.bettingRoundPlayers[0]));
      
      //first player wins - is not all in or is all in but pot total
    } else if (
      !game.bettingRoundPlayers[0].allIn ||
      game.bettingRoundPlayers[0].allIn === game.pot
    ) {
      console.log("#2 Best Hand No Side");
  
      if (game.bettingRoundPlayers.length === 1 && game.bettingRoundPlayers[0].npc === true) {
        if (Math.random() < 0.6) {
          console.log(
            game.bettingRoundPlayers[0].name +
              " wins this round and mucks hand."
          );
        } else {
          console.log(
            game.bettingRoundPlayers[0].name +
              " wins the round and " + readHand(game.bettingRoundPlayers[0])
          );
        }
      } else {
        console.log(
          game.bettingRoundPlayers[0].name +
            " wins this round. " + readHand(game.bettingRoundPlayers[0])
        );
      }
  
      game.bettingRoundPlayers[0].money += parseInt(game.pot);
      roundWinnings +=  parseInt(game.pot);
      
      //first player is all in but more in the pot
    } else {

      console.log("#3 Game Pot:", game.pot)
      //const correctedAllIn =  game.bettingRoundPlayers[0].allIn;
      const correctedAllIn =  game.bettingRoundPlayers[0].allIn > game.pot ? game.pot : game.bettingRoundPlayers[0].allIn;
      console.log("Corrected AllIn", game.bettingRoundPlayers[0].name + " gets " + correctedAllIn);
      game.bettingRoundPlayers[0].money += correctedAllIn;
      roundWinnings +=  correctedAllIn;

      let whatsLeft = parseInt(game.pot - correctedAllIn);
    
      console.log("whats left", whatsLeft);
      game.bettingRoundPlayers[1].money += whatsLeft
      roundWinnings +=  whatsLeft;

    }

    //Fix Math
    let totalPaidOut = 0;
    if (roundWinnings !== game.pot){
      console.log("ISSUE AT roundWinnings !== game.pot")
      console.log("roundWinnings" ,"!==", "game.pot");
      console.log(roundWinnings ,"!==", game.pot);

    }
    console.log("FInal:");
    console.log(game.bettingRoundPlayers)
    
    //removal of player with no hands /
    for (let i = 0; i < game.bettingRoundPlayers.length; i++) {
      //currentList[i] = game.bettingRoundPlayers[i];
      if (game.bettingRoundPlayers[i].money < 1) {
        game.bettingRoundPlayers.splice(i, 1);
        i--; // Adjust index after removal
      }
    }
  
    return game;
  }

module.exports = handleWinnings;