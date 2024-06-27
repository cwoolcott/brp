const inquirer = require("inquirer");
const {
    OTHER_RAISES_MULTIPLIER,
    DECISION_RANGE,
  } = require("../utils/constants");


const analyzeHand = require("./analyzehand");
const decisionValueFunc = require("./decisionvalue");
const bettingOptions = require("./bettingoptions");
const adjustOtherAllIn = require("./adjustotherallin");

const bettingRound = async function (game) {
  //   console.log("-------");

   
  //   console.log("BETTING ROUND:", game.round , "  game.currentPosition:", game.currentPosition, " of ", game.bettingRoundPlayers.length - 1);

  //  console.log("current bet pre-player:", game.currentBet);

    let playerTurn = game.bettingRoundPlayers[game.currentPosition];
    let raiseOption = true;
    let playerAction;
    let currentAction = false;
  
    if (isNaN(playerTurn.money) ){
      throw new Error("isNaN")
    }

    //next, already all in
    if (playerTurn.allIn) {
      //Should we check match here?
     // console.log("*Skip* " + playerTurn.name + " already allin")
      if (playerTurn.npc === false) {
        console.log("You are already all in.")
      } else {
        console.log(playerTurn.name + " is already all in.")
      }
      playerTurn.lastBetRound = game.cardRound;
      return game;
    }

    //IF NO current bet and everyone else is all in skip
    //console.log("Skip? Current bet: ", game.currentBet , " Other Players Not all in: ", game.bettingRoundPlayers.filter(player => !player.allIn && player.name !== playerTurn.name).length)
    if (
      game.currentBet === 0 &&
      game.bettingRoundPlayers.filter(
        (player) => !player.allIn && player.id !== playerTurn.id
      ).length === 0
    ) {
     // console.log("*Skip* Everyone else allin")
      playerTurn.lastBetRound = game.cardRound;
      return game;
    } else if (
      game.bettingRoundPlayers.filter(
        (player) => !player.allIn && player.id !== playerTurn.id
      ).length === 0
    ) {
      //console.log("* call or fold * There is a current bet out, shouldn't be allowed to raise");
      raiseOption = false;
    } else if (game.currentBet >= playerTurn.money) {
      //console.log("* call or fold * There is a current bet out, shouldn't be allowed to raise");
      raiseOption = false;
    }

    //console.log("NPC Raise Options", raiseOption)

    //console.log("Turn: ", playerTurn.name, "currentBet: ", playerTurn.currentBet);
    //let handValue = Math.floor(Math.random() * 101) / 6;
    // console.log("%% Cards", playerTurn.cards)
    let handValue = analyzeHand(playerTurn.cards)[1]; //pair: 2*3 = 6 middle agggro 5 11
    //console.log("** name:", playerTurn.name, " Strengh:", handValue)

    let raises = game.bettingRoundRaises;

    let decisionValue = decisionValueFunc(
      playerTurn.cards,
      handValue,
      playerTurn.aggressionLevel,
      raises
    );
    let playerFolded = false;
    let playerRaise = false;
    if (playerTurn.npc === false) {
      let playOptions;
      let playOptionsArr = [];
      if (raiseOption && game.currentBet === 0 || game.currentBet === playerTurn.currentBet ) {
        playOptions = " Raise, Check or Fold";
        playOptionsArr = ["Raise", "Check", "Fold"];
      } else if (raiseOption) {
        playOptions = " Raise, Call or Fold";
        playOptionsArr = ["Raise", "Call", "Fold"];
      } else {
        playOptions = " Call or Fold?";
        playOptionsArr = ["Call", "Fold"];
      }


      const betMessage =
        "Current Bet is $" +
        game.currentBet +
        ". " +
        (playerTurn.currentBet > 0
          ? "You have " + playerTurn.currentBet + " already in."
          : "");


      //Can we trigger Intent?

      const play = await inquirer.prompt({
        name: "action",
        type: "list",
        choices: playOptionsArr,
        message: betMessage + " Would you like to " + playOptions,
      });

      playerAction = play.action.toLowerCase() === "check" ? "call" : play.action.toLowerCase();

      if (playerAction === "raise") {
        playerRaise = await inquirer.prompt({
          name: "raise",
          type: "input",
          message:
            "You can raise up to $" +
            playerTurn.money +
            ", " +
            " How much would you like to raise?",
        validate: async (input) => {

          if (isNaN(input)){
            return false;
          };
          if (input > playerTurn.money || input < 1) {
              return false;
          };
    
          return true;
        }
        });
      }
    }
    decisionValue = decisionValue - (game.bettingRoundRaises * OTHER_RAISES_MULTIPLIER);

    //get playerAction from intent

    if (
      playerAction === "raise" ||
      (!playerAction && (raiseOption && decisionValue > DECISION_RANGE.RAISE))
    ) {
      currentAction = "raise";
      game = bettingOptions.raise(game);
    } else if (
      playerAction === "call" ||
      (!playerAction && decisionValue > DECISION_RANGE.CALL)
      ||  (!playerAction && game.currentBet == playerTurn.currentBet)
    ) {
      currentAction = "call";
      game = bettingOptions.call(game);
     
    } else {
      //console.log("% Fold % CB:", playerTurn.currentBet, " GB", game.currentBet);
      currentAction = "fold";
      game = bettingOptions.fold(game);
      playerFolded = true;
    }
  

    if (!playerFolded) {
      playerTurn = game.bettingRoundPlayers[game.currentPosition];
      game = adjustOtherAllIn(game)
    }

    playerTurn.lastBetRound = game.cardRound;

    //set betting player back to playerTurn
    if (!playerFolded) {
      game.bettingRoundPlayers[game.currentPosition] = playerTurn;
    }

    // console.log("-After this Round-")
    // console.log("Game Pot: ", game.pot)
    for (let j = 0; j < game.bettingRoundPlayers.length; j++) {
     
      
    //   console.log("LBR:", game.bettingRoundPlayers[j].lastBetRound, " ", game.bettingRoundPlayers[j].name, 
    //   ": CB $", game.bettingRoundPlayers[j].currentBet, " AllIn:", game.bettingRoundPlayers[j].allIn,
    //   " potContribution:", game.bettingRoundPlayers[j].potContribution, "money:", game.bettingRoundPlayers[j].money
    // )
    }
    
    return game;
  };

  module.exports = bettingRound;