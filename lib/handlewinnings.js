const readHand = require("../lib/readhand");

function sortByKey(array, key) {
  return array.sort(function(a, b) {
      var x = a[key]; var y = b[key];
      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
  });
}


const handleWinnings = function (game) {
  let messageString = "";
   //removal of player with no hands /
   console.log("----Pre Handle Winnings ----");
   for (let i = 0; i < game.bettingRoundPlayers.length; i++) {
    console.log(game.bettingRoundPlayers[i].name)
    console.log(game.bettingRoundPlayers[i].money)
  }

  let pre_brp = JSON.parse(JSON.stringify(game.bettingRoundPlayers));

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
      console.log("#HW 1");
      // console.log("#1 Count players with same hand and all in amounts");
      //Count players with same hand and all in amounts
      let allInPlayers = [];
      let notAllInPlayers = [];
      let allInRemaining = 0;
      let highestAllIn = 0;
      let sameHand = 0;
      
  
      game.bettingRoundPlayers.forEach(player => {

        if (JSON.stringify(player.cardStrength) === JSON.stringify(game.bettingRoundPlayers[0]?.cardStrength)){
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

      // console.log("sameHand:", sameHand)
      // console.log(":", allInPlayers.length, )

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
        messageString += "All Split Pot with ", readHand(game.bettingRoundPlayers[0])
      }
      //some other player(s) have same best hand
      else{
        let totalPercent = 0;
        let remainingPot = game.pot;
        for (let i = 0; i<sameHand; i++){
          let potPercent;
        
          if (parseInt(game.bettingRoundPlayers[i].potContribution) !== 0){
            //console.log(" game.bettingRoundPlayers[i].potContribution)",  game.bettingRoundPlayers[i].potContribution);
            const percentage = game.pot/game.bettingRoundPlayers[i].potContribution;
           // console.log("game.pot/game.bettingRoundPlayers[i].potContribution", game.pot, "/", game.bettingRoundPlayers[i].potContribution)
           // console.log("percentage", percentage)
             potPercent = (percentage * game.bettingRoundPlayers.length/100);
           // console.log("potPercent", potPercent)
            
          }
          else{
            potPercent = 0;
          }
          totalPercent += potPercent
          
          let amountEarned = parseInt(potPercent * game.pot);
          // console.log("amountEarned", amountEarned)
          game.bettingRoundPlayers[i].money += amountEarned
          roundWinnings += amountEarned
          remainingPot -= amountEarned;
        }
        //should be next player if not all hands match
        game.bettingRoundPlayers[sameHand].money += remainingPot;
        roundWinnings += remainingPot
        
        messageString += "Split Pot", readHand(game.bettingRoundPlayers[0]);
      }
      
    
      
      //first player wins - is not all in or is all in but pot total
    } else if (
      !game.bettingRoundPlayers[0].allIn ||
      game.bettingRoundPlayers[0].allIn === game.pot
    ) {
      console.log("#HW 2");
      // console.log("#2 Best Hand No Side");
  
      if (game.bettingRoundPlayers.length === 1 && game.bettingRoundPlayers[0].npc === true) {
        if (Math.random() < 0.8) {
          messageString +=
            game.bettingRoundPlayers[0].name +
              " wins this round and mucks hand. Takes $" +  parseInt(game.pot);
        } else {
          messageString += 
            game.bettingRoundPlayers[0].name +
              " wins the round with " + readHand(game.bettingRoundPlayers[0]) + " Takes $" +  parseInt(game.pot);
        }
      } else {
        messageString += 
          game.bettingRoundPlayers[0].name +
            " wins this round. " + readHand(game.bettingRoundPlayers[0]) + " Takes $" +  parseInt(game.pot);
      }
  
      game.bettingRoundPlayers[0].money += parseInt(game.pot);
      roundWinnings +=  parseInt(game.pot);
      
      //first player is all in but more in the pot
    } else {
      console.log("#HW 3");
      // console.log("#3 Game Pot:", game.pot)
      const correctedAllIn =  game.bettingRoundPlayers[0].allIn;
     // const correctedAllIn =  game.bettingRoundPlayers[0].allIn > game.pot ? game.pot : game.bettingRoundPlayers[0].allIn;
      
      

      game.bettingRoundPlayers[0].money += correctedAllIn;
      roundWinnings +=  correctedAllIn;

      let whatsLeft = parseInt(game.pot - correctedAllIn);
    
     // console.log("whats left", whatsLeft);
     messageString += game.bettingRoundPlayers[0].name + "  wins sidepot " + readHand(game.bettingRoundPlayers[0]) + " and gets " + correctedAllIn + " ";
     

     
     if (whatsLeft>0){


  
      if (!game.bettingRoundPlayers[1]){
        game.bettingRoundPlayers[0].money += whatsLeft
      }
      else{
        game.bettingRoundPlayers[1].money += whatsLeft  
        messageString += game.bettingRoundPlayers[1].name  + " " + " wins main pot " + readHand(game.bettingRoundPlayers[1]) + " and gets " + parseInt(game.pot - correctedAllIn);
      }
      roundWinnings +=  whatsLeft;
      
      // console.log("game:", game)
      // console.log("message:", messageString)
      // throw Error("Really anything left?")
     }

    
  }
  console.log("message:", messageString)
  if (messageString.length < 1){
   throw Error("No Message");
 }

    
    //removal of player with no hands /
    for (let i = 0; i < game.bettingRoundPlayers.length; i++) {
      //currentList[i] = game.bettingRoundPlayers[i];
      if (game.bettingRoundPlayers[i].money < 1) {
        game.bettingRoundPlayers.splice(i, 1);
        i--; // Adjust index after removal
      }
    }

    console.log("----Post Handle Winnings ----");
    for (let i = 0; i < game.bettingRoundPlayers.length; i++) {
     console.log(game.bettingRoundPlayers[i].name)
     console.log(game.bettingRoundPlayers[i].money)
   }
   
   let post_brp = JSON.parse(JSON.stringify(game.bettingRoundPlayers));
  //  console.log(pre_brp, post_brp)

   if (JSON.stringify(pre_brp) === JSON.stringify(post_brp)){
    throw Error("No change after handle winnings")
   }
    return game;
  }

module.exports = handleWinnings;