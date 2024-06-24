const inquirer = require("inquirer");
const {
    OTHER_RAISES_MULTIPLIER,
    DECISION_RANGE,
  } = require("../utils/constants");

const {replaceMaxNum} = require("../utils");
const analyzeHand = require("./analyzehand");
const decisionValueFunc = require("./decisionvalue");
const bettingRound = async function (game) {
    //console.log("-------");
    //console.log("BETTING ROUND:", game.round , "  game.currentPosition:", game.currentPosition, " of ", game.bettingRoundPlayers.length - 1);

   // console.log("current bet pre-player:", game.currentBet);

    let playerTurn = game.bettingRoundPlayers[game.currentPosition];
    let raiseOption = true;
    let playerAction;
    let currentAction = false;

    // console.log("------ ROUND START -------")
    // console.log(playerTurn.name, " Last Bet Round", playerTurn.lastBetRound, " He is ", playerTurn.allIn ? "All In" : "Not All In");
    // console.log("Other Players: ",  game.bettingRoundPlayers.filter(player => !player.allIn && player.name !== playerTurn.name).length>0 ? "are not ALL all-In" : "are All all-in")

    if (isNaN(playerTurn.money) ){
      throw new Error("isNaN")
    }
    // console.log("-Pre  Round-")
    //   console.log("Game Pot: ", game.pot)
    // for (let j = 0; j < game.bettingRoundPlayers.length; j++) {
    //   console.log("LBR:", game.bettingRoundPlayers[j].lastBetRound, " ", game.bettingRoundPlayers[j].name, ": CB $", game.bettingRoundPlayers[j].currentBet, " AllIn:", game.bettingRoundPlayers[j].allIn)
    // }

    //next, already all in
    if (playerTurn.allIn) {
      //Should we check match here?
      playerTurn.lastBetRound = game.cardRound;
      //console.log("*Skip* " + playerTurn.name + " already allin")
      if (playerTurn.npc === false) {
        //console.log("You are already all in.")
      } else {
        //console.log(playerTurn.name + " is already all in.")
      }
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
      playerTurn.lastBetRound = game.cardRound;
      //console.log("*Skip* Everyone else allin")
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

    if (
      playerAction === "raise" ||
      (!playerAction && (raiseOption && decisionValue > DECISION_RANGE.RAISE))
    ) {
      currentAction = "raise";
      //20
      //console.log("% Raise %", decisionValue, "---");
      game.bettingRoundRaises++;
      let doubleRaise = Math.max(game.bigBlind * 2, game.currentBet * 2);

      //DECISION_RANGE.RAISE
   
      if (doubleRaise >= playerTurn.money) {
        console.log(playerTurn.name, " raises all-in " + "for $" + playerTurn.money);
        playerTurn.currentBet += playerTurn.money;
        game.pot += playerTurn.money;
        playerTurn.potContribution += playerTurn.money;
        playerTurn.allInBet = playerTurn.money;
        playerTurn.money = 0;

        game.currentBet = replaceMaxNum(game.currentBet, playerTurn.currentBet);

        // game.currentBet =
        //   playerTurn.currentBet < game.currentBet
        //     ? game.currentBet
        //     : playerTurn.currentBet;
            //300 - 200 + 100 TODO CHECK
        //playerTurn.allIn = (game.pot - game.currentBet + playerTurn.currentBet); //includes his bet
        //playerTurn.allIn = (game.pot + (game.currentBet - howMuchCanBeCalled));
        playerTurn.allIn = game.pot;
   
        playerTurn.allInRound = game.cardRound;

        //console.log("players allin pot $" + playerTurn.allIn, "Player CurrentBet:", playerTurn.allInBet, " with money: ", playerTurn.money, " existing post pot: ", game.pot);
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
    } else if (
      playerAction === "call" ||
      (!playerAction && decisionValue > DECISION_RANGE.CALL)
      ||  (!playerAction && game.currentBet == playerTurn.currentBet)
    ) {
      currentAction = "call";
      if (playerTurn.currentBet < game.currentBet) {
        // console.log("% Calls % ", game.currentBet);

        if (playerTurn.money <= game.currentBet) {
          //console.log(playerTurn.name, " calls all-in ", "call: ", game.currentBet, " money: ", playerTurn.money, " pre pot: ", game.pot);
          
          // Find out how much player should be all in for
          let allInTemp = game.pot;
          for (let j = 0; j < game.bettingRoundPlayers.length; j++) {
            //This Player, and Players that haven't bet don't count
            if (playerTurn === game.bettingRoundPlayers[j] || playerTurn.money>=game.bettingRoundPlayers[j].currentBet || game.bettingRoundPlayers[j].lastBetRound !== playerTurn.lastBetRound) continue;
            // other player put in 100 but current has 4 = 96
          //  console.log("cb - money", game.bettingRoundPlayers[j].currentBet ,"-", playerTurn.money)
           
            let betDifference = game.bettingRoundPlayers[j].currentBet - playerTurn.money;
           // console.log("allintemp - bd", allInTemp,"=-", betDifference)
            allInTemp -= betDifference;
          }
          
          console.log(
            playerTurn.name,
            " is all-in " +
              "for $" +
              allInTemp +
              " with " +
              playerTurn.money
          );

          game.pot += playerTurn.money;
          playerTurn.potContribution += playerTurn.money;
          playerTurn.currentBet += playerTurn.money;
          playerTurn.allInBet = playerTurn.money;
          playerTurn.money = 0;
     
          //playerTurn.allIn = (game.pot + (game.currentBet - howMuchCanBeCalled));
          //if last player called 100 and you only have 4, you don't get all of it, just what you have to contribute
          playerTurn.allIn = allInTemp;
          // if (playerTurn.allIn<0 || playerTurn.allIn>NUM_OF_PLAYERS * 200){
          //   console.log(":", game.pot, "+" ,game.currentBet, "-", allInTemp)
          //   console.log("playerTurn.allIn ", playerTurn.allIn )
          //   throw new Error("All in Wrong")
          // }
          
          playerTurn.allInRound = game.cardRound;

          game.currentBet = replaceMaxNum(game.currentBet, playerTurn.currentBet);

          // game.currentBet =
          //   playerTurn.currentBet < game.currentBet
          //     ? game.currentBet
          //     : playerTurn.currentBet;

          //console.log(playerTurn.name, " allin pot $" + playerTurn.allIn, " money: ", playerTurn.money, " post pot: ", game.pot);
        
          //console.log("allin pot $" + playerTurn.allIn, " money: ", playerTurn.money, " post pot: ", game.pot);
        } else {
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
    } else {
      //console.log("% Fold % CB:", playerTurn.currentBet, " GB", game.currentBet);
      currentAction = "fold";
      console.log(playerTurn.name, " folds");
      game.bettingRoundPlayers.splice(game.currentPosition, 1);
      //issue with folding player skipping next person
      game.currentPosition--;
      playerFolded = true;
    }

 
    playerTurn.lastBetRound = game.cardRound;

    //   console.log("current bet post-player:", game.currentBet);
    //   console.log("-------");
    //console.log("playerTurn.lastBetRound:", playerTurn.lastBetRound)
    //CHeck that allIn Players bets are matched ???
    // console.log("Other Players - Adjust All In CardRound: ", this.cardDeal[game.cardRound], " ", game.cardRound)
    // console.log("currentAction:", currentAction)
    if ((currentAction ==="call" || currentAction ==="raise") && !playerFolded && playerTurn.currentBet > 0) {
      for (let j = 0; j < game.bettingRoundPlayers.length; j++) {
        if (!game.bettingRoundPlayers[j].allIn) continue;
        if (game.currentPosition !== j) {
            //Apply Current Bet to others
           // console.log("game.bettingRoundPlayers[j].lastBetRound:", game.bettingRoundPlayers[j].lastBetRound)
            let fixOtherContribution = game.bettingRoundPlayers[j].currentBet;
            if (game.bettingRoundPlayers[j].position === 0 && game.cardDeal === 0){
              //small blind in already
              fixOtherContribution -= game.smallBlind;
            }
            else if (game.bettingRoundPlayers[j].position === 1 && game.cardDeal === 0){
               //big blind in already
               fixOtherContribution -= game.bigBlind;
            }
            //game.bettingRoundPlayers[j].currentBet

          const addToOthersAllInBet = playerTurn.allInBet < game.bettingRoundPlayers[j].currentBet
            ? playerTurn.allInBet
            : fixOtherContribution;
       

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
            console.log("Side Pot added to " + game.bettingRoundPlayers[j].name + "'s pot");
            game.bettingRoundPlayers[j].allIn =
              game.bettingRoundPlayers[j].allIn + addToOthersAllInBet;
            //  console.log("Now All In for " + game.bettingRoundPlayers[j].allIn);
          }
        
        }
      }
    }

    //set betting player back to playerTurn
    if (!playerFolded) {
      game.bettingRoundPlayers[game.currentPosition] = playerTurn;
    }




    // console.log("-After this Round-")
    // console.log("Game Pot: ", game.pot)
    for (let j = 0; j < game.bettingRoundPlayers.length; j++) {
      // if (game.bettingRoundPlayers[j].allIn>NUM_OF_PLAYERS * 200){
      //   console.log(":", game.pot, "+" ,game.currentBet)
      //   console.log("playerTurn.allIn ", game.bettingRoundPlayers[j].allIn )
      //   throw new Error("All in Wrong")
      // }
      
    //   console.log("LBR:", game.bettingRoundPlayers[j].lastBetRound, " ", game.bettingRoundPlayers[j].name, 
    //   ": CB $", game.bettingRoundPlayers[j].currentBet, " AllIn:", game.bettingRoundPlayers[j].allIn,
    //   " potContribution:", game.bettingRoundPlayers[j].potContribution, "money:", game.bettingRoundPlayers[j].money
    // )
    }

    return game;
  };

  module.exports = bettingRound;