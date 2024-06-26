const adjustOtherAllIn = function(game){

    let playerTurn = game.bettingRoundPlayers[game.currentPosition];
    let smbPos = game.bettingRoundPlayers.length-2;
    let bigPos = game.bettingRoundPlayers.length-1;

   // console.log("Other Players - Adjust All In CardRound: ", game.cardRound)
   
    if (playerTurn.currentBet > 0) {
    for (let j = 0; j < game.bettingRoundPlayers.length; j++) {
        if (!game.bettingRoundPlayers[j].allIn) continue;
       

        if (game.currentPosition !== j) {
            //Apply Current Bet to others
        // console.log("game.bettingRoundPlayers[j].lastBetRound:", game.bettingRoundPlayers[j].lastBetRound)
            let fixOtherContribution = game.bettingRoundPlayers[j].currentBet;
            if (game.bettingRoundPlayers[j].position === smbPos && game.cardDeal === 0){
            //small blind in already
            fixOtherContribution -= game.smallBlind;
            }
            else if (game.bettingRoundPlayers[j].position === bigPos && game.cardDeal === 0){
            //big blind in already
            fixOtherContribution -= game.bigBlind;
            }
            //game.bettingRoundPlayers[j].currentBet

        const addToOthersAllInBet = playerTurn.allInBet < game.bettingRoundPlayers[j].currentBet
            ? playerTurn.allInBet
            : fixOtherContribution;
    

        // console.log(playerTurn.allInBet, "<", game.bettingRoundPlayers[j].currentBet, "playerTurn.allInBet:", playerTurn.allInBet, "fixOtherContribution:", fixOtherContribution)
        // console.log(game.bettingRoundPlayers[j].name, " add ", addToOthersAllInBet, " to ", game.bettingRoundPlayers[j].allIn, "?");
        // console.log("game.bettingRoundPlayers[j].allIn", game.bettingRoundPlayers[j].allIn);
        // console.log("game.bettingRoundPlayers[j].allInRound", game.bettingRoundPlayers[j].allInRound);
        // console.log("game.cardRound", game.cardRound);
        // console.log("Not Same Pot Contribution", !areValuesInArraySame(game.bettingRoundPlayers,"potContribution"))
        if (
            game.bettingRoundPlayers[j].allIn &&
            game.bettingRoundPlayers[j].allInRound === game.cardRound
            //&& !areValuesInArraySame(game.bettingRoundPlayers,"potContribution")
        ) {
            // console.log("Side Pot added to " + game.bettingRoundPlayers[j].name + "'s pot");
            game.bettingRoundPlayers[j].allIn =
            game.bettingRoundPlayers[j].allIn + addToOthersAllInBet;
            // console.log("Now All In for " + game.bettingRoundPlayers[j].allIn);
        }
        
        }
    }
    }
    return game;
}

module.exports = adjustOtherAllIn