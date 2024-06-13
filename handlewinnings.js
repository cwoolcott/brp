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

const handleRemaining = function(game, whatsLeft, roundWinnings, startWith = 1){
  whatsLeft = whatsLeft < 0 ? 0 : whatsLeft; //current underbet

  if (whatsLeft > 0){
    for (let i = startWith; i<game.bettingRoundPlayers.length; i++){
      console.log("game.bettingRoundPlayers[i].potContribution", " >= ", "game.bettingRoundPlayers[i - 1].potContribution")
      console.log(game.bettingRoundPlayers[i].potContribution, " >= ", game.bettingRoundPlayers[i - 1].potContribution)
      if (game.bettingRoundPlayers[i].potContribution >= game.bettingRoundPlayers[i - 1].potContribution && whatsLeft>0){
        //let whatsOwed = game.bettingRoundPlayers[i].potContribution - game.bettingRoundPlayers[i - 1].potContribution;
        //correct whats left if last player
        let whatsOwed = whatsLeft;
        let isLastPlayer = i === game.bettingRoundPlayers.length-1;
        // if (isLastPlayer) {
        //   console.log("last player")
        //   whatsLeft = game.bettingRoundPlayers[i].potContribution
        // }
        console.log(game.bettingRoundPlayers[i].name, " is owed ", whatsLeft, " from remaining players")
        //200
        //lets find out who owns them money, including themselves
       if (isLastPlayer){
        game.bettingRoundPlayers[i].money += whatsOwed;
            roundWinnings +=  whatsOwed;
            whatsLeft -= whatsOwed;
       }
       else{
        for (let j = i; j<game.bettingRoundPlayers.length; j++){
          if (whatsLeft > 0){
            console.log("whatsLeft", whatsLeft)
            if (game.bettingRoundPlayers[j].potContribution < whatsLeft){
              whatsOwed = game.bettingRoundPlayers[j].potContribution 
              console.log("whatsOwed UpdatedL", whatsOwed)
            }
            // else if(isLastPlayer){
            //   whatsOwed = game.bettingRoundPlayers[game.bettingRoundPlayers.length-1].potContribution 
            // }

            console.log(game.bettingRoundPlayers[j].name, " gives ",game.bettingRoundPlayers[i].name, " $", whatsOwed)
            game.bettingRoundPlayers[i].money += whatsOwed;
            roundWinnings +=  whatsOwed;
            whatsLeft -= whatsOwed;
          }
          else{
            console.log("Nothing Left", whatsLeft)
          }
          
        }
       }
        
        
      }
    }
  
  }
  return {game, roundWinnings};
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
          player.money += player.potContribution;
          roundWinnings += player.potContribution;
        });
        //Remaining Money in Pot Distribute
        if (game.pot>roundWinnings){
          let remainingWinnings = game.pot - roundWinnings;
          let remainingWinningPart = parseInt(remainingWinnings/game.bettingRoundPlayers.length)
          let reminder = remainingWinnings % game.bettingRoundPlayers.length;

          game.bettingRoundPlayers.forEach((player, i, array) => {
            player.money += remainingWinningPart;
            roundWinnings += remainingWinningPart;
            if (i === array.length - 1){ 
              player.money += reminder;
            roundWinnings += reminder;
          }
          });
        }
      }
      //some other player(s) have same best hand
      else{
        let totalPercent = 0;
        let remainingPot = game.pot;
        for (let i = 0; i<sameHand; i++){
          const percentage = game.pot/game.bettingRoundPlayers[i].potContribution;
          
          const potPercent = (percentage * game.bettingRoundPlayers.length/100);
          console.log("potPercent", potPercent)
          totalPercent += potPercent
          let amountEarned = potPercent * game.pot;
          console.log("amountEarned", amountEarned)
          game.bettingRoundPlayers[i].money += amountEarned
          roundWinnings += amountEarned
          remainingPot -= amountEarned;
        }
        //should be next player if not all hands match
        game.bettingRoundPlayers[sameHand].money += remainingPot;
        roundWinnings += remainingPot
        

      }
      
      // if (allInPlayers.length>1){
        
      //   let allInTotal = game.pot >= highestAllIn ? highestAllIn : game.pot;

      //   allInPlayers = sortByKey(allInPlayers, "allIn");
  
      //   for (let player of allInPlayers)  {
      //     if (allInRemaining === 1) {
      //       console.log("playersPart_l", allInTotal)
            
      //       player.money += allInTotal;
      //       roundWinnings += allInTotal;
      //       break;
      //     }
  
      //     if ( player.allIn != highestAllIn){
      //       console.log("player.allIn / allInRemaining", player.allIn, allInRemaining)
      //       let playersPart = parseInt(player.allIn / allInRemaining);
      //       console.log("playersPart", playersPart)
      //       player.money += playersPart;
      //       roundWinnings += playersPart;
      //       allInTotal -= playersPart;
      //       console.log("allInTotal", allInTotal)
      //       allInRemaining--;
      //     }
      //     else{
      //       let playersPart = parseInt(allInTotal / allInRemaining);
      //       console.log("playersPart", playersPart)
      //       player.money += playersPart;
      //       roundWinnings += playersPart;
      //       allInTotal -= playersPart;
      //       console.log("allInTotal", allInTotal)
      //       allInRemaining--;
      //     }
  
      //   };
      //   //try
      //   if (game.bettingRoundPlayers.length>allInPlayers.length){
      //     console.log("still some that aren't all in ")
      //     console.log("game.bettingRoundPlayers", game.bettingRoundPlayers)
      //    //, roundWinnings, (game.bettingRoundPlayers.length-allInPlayers.length)-1))
      //   }
       
      // }
      // else{
  
      //   //no allin players but same hand
      //   const sameHandIndex = [];
      //   game.bettingRoundPlayers.forEach((player, i) => {
      //     if (JSON.stringify(player.cardStrength) === JSON.stringify(game.bettingRoundPlayers[0].cardStrength)){
      //       sameHandIndex.push(i)
      //     }
      //   });

      //   let whatsLeft = game.pot;

      //   const dividePot = parseInt(game.pot/sameHandIndex.length);

      //   let divideString = "Pot Divided Between ";
      //   game.bettingRoundPlayers.forEach((player, i) => {
      //     if (sameHandIndex.includes(i)){
      //       //game.pot -= dividePot;
      //       roundWinnings += dividePot;
      //       whatsLeft -= dividePot
      //       player.money += dividePot;
      //       divideString += player.name + ", ";

      //     }
      //   });
      //   console.log(divideString)

      //   //handleOdd
      //   if (whatsLeft>0){
      //     game.bettingRoundPlayers[0].money += whatsLeft;
      //     roundWinnings  += whatsLeft;
      //   }

      // }

     
      
      // if (notAllInPlayers.length > 0 ){
      //   let whatsLeft = game.pot - highestAllIn;
      //   notAllInPlayers[0].money += whatsLeft;
      //   roundWinnings += whatsLeft;
      //   console.log("Handle Remaining", whatsLeft)
      // }

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
  
      game.bettingRoundPlayers[0].money += game.pot;
      roundWinnings +=  game.pot;
      
      //first player is all in but more in the pot
    } else {

      console.log("#3 Game Pot:", game.pot)
      //const correctedAllIn =  game.bettingRoundPlayers[0].allIn;
      const correctedAllIn =  game.bettingRoundPlayers[0].allIn > game.pot ? game.pot : game.bettingRoundPlayers[0].allIn;
      console.log("Corrected AllIn", game.bettingRoundPlayers[0].name + " gets " + correctedAllIn);
      game.bettingRoundPlayers[0].money += correctedAllIn;
      roundWinnings +=  correctedAllIn;

      let whatsLeft = game.pot - correctedAllIn;
    
      console.log("whats left", whatsLeft);
      ({game, roundWinnings} = handleRemaining(game, whatsLeft, roundWinnings))

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