const {nameCards} = require("./utils");

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
  
    
  
    // Check for players with the same hand
    if (
      game.bettingRoundPlayers.some(player => {
        return player.id !== game.bettingRoundPlayers[0].id &&
          JSON.stringify(player.cardStrength) === JSON.stringify(game.bettingRoundPlayers[0].cardStrength);
      })
    ) {
      //Count players with same hand and all in amounts
      let allInPlayers = [];
      let notAllInPlayers = [];
      let allInRemaining = 0;
      let highestAllIn = 0;

      game.bettingRoundPlayers.forEach(player => {
        if (JSON.stringify(game.bettingRoundPlayers[0].cardStrength)===JSON.stringify(player.cardStrength)){
          allInPlayers.push(player);
          highestAllIn = player.allIn > highestAllIn ? player.allIn : highestAllIn;
          allInRemaining++;
        } 
        else{
          notAllInPlayers.push(player);
        }
      });

      let allInTotal = game.pot >= highestAllIn ? highestAllIn : game.pot;

      allInPlayers = sortByKey(allInPlayers, "allIn");

      //console.log("allInPlayers", allInPlayers)


      for (let player of allInPlayers)  {
        if (allInRemaining === 1) {
          console.log("playersPart_l", allInTotal)
          player.money += allInTotal;
          break;
        }

        if ( player.allIn != highestAllIn){
          console.log("player.allIn / allInRemaining", player.allIn, allInRemaining)
          let playersPart = parseInt(player.allIn / allInRemaining);
          console.log("playersPart", playersPart)
          player.money += playersPart;
          allInTotal -= playersPart;
          console.log("allInTotal", allInTotal)
          allInRemaining--;
        }
        else{
          let playersPart = parseInt(allInTotal / allInRemaining);
          console.log("playersPart", playersPart)
          player.money += playersPart;
          allInTotal -= playersPart;
          console.log("allInTotal", allInTotal)
          allInRemaining--;
        }

      };

      if (notAllInPlayers.length > 0 && game.pot > highestAllIn ){
        let whatsLeft = game.pot - highestAllIn;
        notAllInPlayers[0].money += whatsLeft;
        console.log("Handle Remaining", whatsLeft)
      }


      
      //console.log("allInPlayers", allInPlayers)

      //Whos owed what?
      // x allin owed 100 / but 3 in 33
      // y allin owed 100 / but 3 in 33
      // z allin owed 100 / but 3 in 33

      // x allin owed 60 / but 3 in 20
      // y allin owed 100 / but 3 in 40
      // z allin owed 100 / but 3 in 40
      
      console.log(game.bettingRoundPlayers[0].name + " shares the pot with others.  " + readHand(game.bettingRoundPlayers[0]));


    } else if (
      !game.bettingRoundPlayers[0].allIn ||
      game.bettingRoundPlayers[0].allIn === game.pot
    ) {
      //console.log("Best Hand No Side");
  
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
  
      game.bettingRoundPlayers[0].money += game.pot;
    } else {

      game.bettingRoundPlayers[0].money += game.bettingRoundPlayers[0].allIn;
      let whatsLeft = game.pot - game.bettingRoundPlayers[0].allIn;
      game.bettingRoundPlayers[1].money += whatsLeft;

  
      console.log("Side Pot Winner:", game.bettingRoundPlayers[0].name, " of ", game.bettingRoundPlayers[0].allIn);
      console.log("Remaining Main Pot Winner:", game.bettingRoundPlayers[1].name, " of ", whatsLeft);
    }

    
    //removal of player with no hands
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