const inquirer = require("inquirer");

const {
    NUM_OF_PLAYERS,
    STARTING_MONEY,
    NUM_OF_SHUFFLES,
} = require("./utils/constants");

const analyzeHand = require("./lib/analyzehand");

const handleWinnings = require("./lib/handlewinnings");


const {
    OTHER_RAISES_MULTIPLIER,
    DECISION_RANGE,
} = require("./utils/constants");


const decisionValueFunc = require("./lib/decisionvalue");
const bettingOptions = require("./lib/bettingoptions");
const adjustOtherAllIn = require("./lib/adjustotherallin");
const pokerGame = require("./lib/poker");


const run = async () => {
    const human = await inquirer.prompt({
        name: "name",
        type: "input",
        message: "What is your name?",
    });

    const fullResults = [];
    let gameCount = 0;

    async function newGameLoop(gameCount) {
        gameCount++;
        console.info("************************** NEW GAME: " + gameCount + "**************************")

        let poker = pokerGame.startGame(human.name);

        async function newRoundLoop(poker) {

            // console.info("************************** IN GAME: " + gameCount + "**************************")
            console.log("ROUND " + poker.game.round + " Begins.");

            poker.game.cardRound = 0;
            poker.game = pokerGame.dealCards(poker.game);
            poker.game = pokerGame.takeBlinds(poker.game);

            poker.currentList = pokerGame.updateCurrentPlayerMoney(poker.currentList, poker.game.bettingRoundPlayers)

            async function cardDealLoop(i = 0) {
                //for (let i = 0; i < pokerGame.cardDeal.length; i++) {
                poker.game.currentPosition = 0;
                poker.game.cardRound = i;
                poker.game = pokerGame.addCard(poker.game);

                if (poker.game.bettingRoundPlayers.length > 1) {
                    pokerGame.handUpdateToPlayer(poker.game);
                }


                if (i !== 0) {
                    poker.game = pokerGame.resetBets(poker.game);
                }

                //console.log("cardDealRound: ", i)

                // while (
                //   poker.game.bettingRoundPlayers.length > 1 &&
                //   (poker.game.firstRound === true ||
                //     !pokerGame.isEqualBettingAmount(poker.game))
                // ) {

                async function roundLoop(poker) {


                    let playerTurn = poker.game.bettingRoundPlayers[poker.game.currentPosition];
                    let raiseOption = true;
                    let playerAction;
                    let currentAction = false;
                    let roundOver = false;

                    if (isNaN(playerTurn.money)) {
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
                        playerTurn.lastBetRound = poker.game.cardRound;
                        roundOver = true;
                    }

                    //IF NO current bet and everyone else is all in skip
                    // console.log("Skip? Current bet: ", game.currentBet , " Other Players Not all in: ", game.bettingRoundPlayers.filter(player => !player.allIn && player.name !== playerTurn.name).length)
                    if (
                        poker.game.currentBet === 0 &&
                        poker.game.bettingRoundPlayers.filter(
                            (player) => !player.allIn && player.id !== playerTurn.id
                        ).length === 0
                    ) {
                        // console.log("*Skip* Everyone else allin")
                        playerTurn.lastBetRound = poker.game.cardRound;
                        //Round is Over - Not sure how to skip the rest
                        roundOver = true;

                    } else if (
                        poker.game.bettingRoundPlayers.filter(
                            (player) => !player.allIn && player.id !== playerTurn.id
                        ).length === 0
                    ) {
                        //console.log("* call or fold * There is a current bet out, shouldn't be allowed to raise");
                        raiseOption = false;
                    } else if (poker.game.currentBet >= playerTurn.money) {
                        //console.log("* call or fold * There is a current bet out, shouldn't be allowed to raise");
                        raiseOption = false;
                    }

                    if (!roundOver) {
                        let handValue = analyzeHand(playerTurn.cards)[1]; //pair: 2*3 = 6 middle agggro 5 11

                        let raises = poker.game.bettingRoundRaises;

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
                            if (raiseOption && poker.game.currentBet === 0 || poker.game.currentBet === playerTurn.currentBet) {
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
                                poker.game.currentBet +
                                ". " +
                                (playerTurn.currentBet > 0 ?
                                    "You have " + playerTurn.currentBet + " already in." :
                                    "");



                            const play = await inquirer.prompt({
                                name: "action",
                                type: "list",
                                choices: playOptionsArr,
                                message: betMessage + " Would you like to " + playOptions,
                            });

                            if (!play) {
                                throw new Error("No Response");
                            }

                            playerAction = play.action.toLowerCase() === "check" ? "call" : play.action.toLowerCase();

                            if (playerAction === "raise") {
                                playerRaise = await inquirer.prompt({
                                    name: "raise",
                                    type: "input",
                                    message: "You can raise up to $" +
                                        playerTurn.money +
                                        ", " +
                                        " How much would you like to raise?",
                                    validate: async (input) => {

                                        if (isNaN(input)) {
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
                        decisionValue = decisionValue - (poker.game.bettingRoundRaises * OTHER_RAISES_MULTIPLIER);

                        //get playerAction from intent

                        if (
                            playerAction === "raise" ||
                            (!playerAction && (raiseOption && decisionValue > DECISION_RANGE.RAISE))
                        ) {
                            currentAction = "raise";
                            poker.game = bettingOptions.raise(poker.game);
                        } else if (
                            playerAction === "call" ||
                            (!playerAction && decisionValue > DECISION_RANGE.CALL) ||
                            (!playerAction && poker.game.currentBet == playerTurn.currentBet)
                        ) {
                            currentAction = "call";
                            poker.game = bettingOptions.call(poker.game);

                        } else {
                            //console.log("% Fold % CB:", playerTurn.currentBet, " GB", game.currentBet);
                            currentAction = "fold";
                            poker.game = bettingOptions.fold(poker.game);
                            playerFolded = true;
                        }


                        if (!playerFolded) {
                            playerTurn = poker.game.bettingRoundPlayers[poker.game.currentPosition];
                            poker.game = adjustOtherAllIn(poker.game)
                        }

                        playerTurn.lastBetRound = poker.game.cardRound;

                        //set betting player back to playerTurn
                        if (!playerFolded) {
                            poker.game.bettingRoundPlayers[poker.game.currentPosition] = playerTurn;
                        }


                        poker.game.currentPosition++;
                        console.log("Original Current Position:", poker.game.currentPosition)
                        //get Position 
                        poker = pokerGame.getRealPosition(poker);


                        if (
                            poker.game.bettingRoundPlayers.length > 1 &&
                            (poker.game.firstRound === true ||
                                !pokerGame.isEqualBettingAmount(poker.game))
                        ) {
                            await roundLoop(poker);
                        }
                    }
                }
                await roundLoop(poker);
                //roundLoop End

                //Update Money
                poker.currentList = pokerGame.updateCurrentPlayerMoney(poker.currentList, poker.game.bettingRoundPlayers)

              
                // cardDealLoop()
                i++;
                if (i < 5) {
                    await cardDealLoop(i)
                }

            }
            await cardDealLoop(0)
            // Card Deal Loop Over

            for (let i = 0; i < poker.game.bettingRoundPlayers.length; i++) {
                poker.game.bettingRoundPlayers[i].cardStrength = analyzeHand(
                    poker.game.bettingRoundPlayers[i].cards
                );
            }

            console.log("Declare Winner")
            poker.game = pokerGame.declareWinner(poker.game);
            poker.game = handleWinnings(poker.game);

            let fixMathTotal = 0;
            for (let i = 0; i < poker.currentList.length; i++) {
                fixMathTotal += poker.currentList[i].money;
            }

            //700 600


            if (fixMathTotal != poker.game.gameTotal) {

                let mathDifference = fixMathTotal - poker.game.gameTotal;
                let breakDown = parseInt(mathDifference / poker.game.bettingRoundPlayers.length);
                let remaining = breakDown % poker.game.bettingRoundPlayers.length;
                console.log("Math FIX:", fixMathTotal, poker.game.gameTotal)
                console.log("remaining:", remaining, "MD:", mathDifference, "BD:", breakDown)

                // for (let i = 0; i <  game.bettingRoundPlayers.length; i++){
                //   console.log(game.bettingRoundPlayers[i].name)
                //   console.log(game.bettingRoundPlayers[i].money)
                // }
                if (poker.game.bettingRoundPlayers[0].money > mathDifference) {
                    poker.game.bettingRoundPlayers[0].money -= mathDifference
                } else {
                    poker.game.bettingRoundPlayers[1].money -= mathDifference
                }

                //throw Error("Fix Math")

            }


            poker.game = pokerGame.gameConfig(poker.game, poker.currentList);

              

            //End Round Loop
            if (poker.currentList.length > 1) {
                //Switch Positions
                console.log("&&&&&&New Round COnfig&&&&&")
                poker.game.bettingRoundPlayers = pokerGame.assignPositions([...poker.game.bettingRoundPlayers]);
                console.log("%% After Assign in Round");
                await newRoundLoop(poker)
            }
        }
        await newRoundLoop(poker);

        console.log("Game Winner: ", poker.game.bettingRoundPlayers[0].name, "In ", poker.game.round, "Rounds");
        console.log("--------------------------------------------------")

        const totalPos = STARTING_MONEY * NUM_OF_PLAYERS;
        const i = fullResults.findIndex(result => result.name === poker.game.bettingRoundPlayers[0].name);
        if (i > -1) {
            // We know that at least 1 object that matches has been found at the index i
            fullResults[i].wins++;
            fullResults[i].totalPos += totalPos
            fullResults[i].AvgWin = fullResults[i].totalPos / fullResults[i].wins
        } else {
            fullResults.push({
                "name": poker.game.bettingRoundPlayers[0].name,
                "wins": 1,
                "aggressionLevel": poker.game.bettingRoundPlayers[0].aggressionLevel,
                "totalPos": totalPos,
                "AvgWin": totalPos / this.wins
            })
        }


        poker.game.bettingRoundPlayers.forEach(player => {
            //console.log("BPR: ", player.name, " $", player.money)
            console.log(player)
        });

        //  poker.currentList.forEach(player => {
        //     console.log("CL:  ", player.name, " $", player.money)
        //    // testAmount = player.money;
        //   });

 
        if (gameCount < 2) {
            await newGameLoop(gameCount)
        }


    } //end while
    await newGameLoop(0)
    // console.info("************************** END GAME: " + gameCount + "**************************")
    fullResults.sort((a, b) => b.wins - a.wins);
    console.table(fullResults)
};

//run test
run();