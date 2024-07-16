const inquirer = require("inquirer");

const {
    NUM_OF_PLAYERS,
    STARTING_MONEY,
    NUM_OF_SHUFFLES,
} = require("./utils/constants");

const analyzeHand = require("./lib/analyzehand");
const npcPlayers = require("./data/npcplayers");
const deck = require("./data/deck");
const handleWinnings = require("./lib/handlewinnings");
const {
    replaceMaxNum,
    generateUUID,
    nameCards
} = require("./utils");

const {
    OTHER_RAISES_MULTIPLIER,
    DECISION_RANGE,
} = require("./utils/constants");


const decisionValueFunc = require("./lib/decisionvalue");
const bettingOptions = require("./lib/bettingoptions");
const adjustOtherAllIn = require("./lib/adjustotherallin");

function getRealPosition(poker) {
    // console.log("Round Positions", poker.game.currentPosition, poker.game.bettingRoundPlayers.length)
    if (
        poker.game.currentPosition >= poker.game.bettingRoundPlayers.length
    ) {
        //console.log("Go Around");
        poker.game.currentPosition = 0;
        poker.game.firstRound = false;
    }
    return poker;

}

const pokerGame = {
    npcPlayers: npcPlayers,
    cardDeal: ["Pre-Flop", "Flop", "Turn", "River"],
    shuffleArray: function(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    },
    randomPlayer: function() {
        return this.npcPlayers[Math.floor(Math.random() * this.npcPlayers.length)];
    },
    fillPlayers: function(number, human) {
        const currentList = [];
        while (currentList.length < number) {
            const thisPlayer = this.randomPlayer();
            if (!(currentList.some((player) => player.id === thisPlayer.id))) {
                currentList.push(thisPlayer);
            }
        }
        if (human) {
            currentList.push({
                id: generateUUID(),
                name: human,
                description: "Human",
                aggressionLevel: 0,
                npc: false,
                raiseOption: true,
                decisionValue: 0
            });
        }
        return currentList;
    },
    listPlayerNames: function(currentList) {
        let playerString = "";
        currentList.forEach((item, index) => {
            if (index === currentList.length - 2) {
                playerString += item.name + ", and ";
            } else if (index === currentList.length - 1) {
                playerString += item.name;
            } else {
                playerString += item.name + ", ";
            }
        });
        return playerString;
    },
    startingMoney: function(currentList) {
        currentList.forEach((player) => {

            player.money = STARTING_MONEY;
            player.allIn = false;
        });
        return currentList;
    },
    updateCurrentPlayerMoney(currentList, bettingRoundPlayers) {
        for (let i = 0; i < bettingRoundPlayers.length; i++) {
            const updatePlayer = currentList.find((clp) => {
                clp.id === bettingRoundPlayers[i].id;
            });

            if (updatePlayer) {
                currentList[updatePlayer.id].money = bettingRoundPlayers[i].money;
            }

            //  console.log("update brp:",i, ":", bettingRoundPlayers[i].name, bettingRoundPlayers[i].money);
        }

        // for (let i = 0; i < currentList.length; i++){
        //   console.log("update cl:",i, ":", currentList[i].name, currentList[i].money);
        // }

        return currentList
    },
    gameConfig: function(game, currentList, startNew = false) {
        if (startNew) {
            game = {
                round: 1,
                bettingRoundRaises: 0,
                bettingRoundPlayers: [...currentList],
                currentPosition: 0,
                temp_check_total: 0,
                gameTotal: currentList.length * STARTING_MONEY,
                bigBlind: 50,
                smallBlind: 25,
                pot: 0,
                currentBet: 0,
                firstRound: true,
            };
        } else {
            //setting up for next round, if a player is out of money, they should be removed from game

            for (let i = 0; i < currentList.length; i++) {
                if (currentList[i].money < 1) {
                    console.log(currentList[i].name + " is out. ");
                    //TEST
                    // if (!currentList[i].npc){
                    //   throw new Error("Player Out")
                    // }
                    currentList.splice(i, 1);
                    i--;
                }
            }

            game = {
                round: game.round + 1,
                bettingRoundRaises: 0,
                temp_check_total: 0,
                bettingRoundPlayers: this.assignPositions([...currentList]),
                gameTotal: game.gameTotal,
                currentPosition: 0,
                bigBlind: 50,
                smallBlind: 25,
                pot: 0,
                currentBet: 0,
                firstRound: true,
            };


        }
        return game;
    },
    startGame: function(human = false) {
        let currentList = this.fillPlayers(NUM_OF_PLAYERS, human);
        currentList = this.assignPositions(currentList, false);
        currentList = this.startingMoney(currentList);

        let game = this.gameConfig("", currentList, true);

        return {
            game,
            currentList
        };
    },
    assignPositions: function(currentList, next = true) {
        if (next) {
            currentList.unshift(currentList.pop());
        } else {
            currentList = this.shuffleArray(currentList);
        }

        currentList.forEach((player, index) => {
            player.position = index;
        });
        // console.log("ASSIGN POSITIONS:");
        // for (let i = 0; i < currentList.length; i++) {
        //   console.log(i, " - ", currentList[i].name, " $", currentList[i].money);
        // }

        return currentList;
    },
    takeBlinds: function(game) {
        for (let i = 0; i < game.bettingRoundPlayers.length; i++) {
            game.bettingRoundPlayers[i].position = i;
            game.bettingRoundPlayers[i].allIn = false;
            game.bettingRoundPlayers[i].allInRound = game.cardRound;
            game.bettingRoundPlayers[i].currentBet = 0;
            game.bettingRoundPlayers[i].potContribution = 0;
        }

        game.pot = 0;
        let smbPos = game.bettingRoundPlayers.length - 2;
        let bigPos = game.bettingRoundPlayers.length - 1;

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
        }

        return game;
    },
    shuffleDeck: function(cards) {
        for (let i = 0; i < NUM_OF_SHUFFLES; i++) {
            cards = cards.sort(() => Math.random() - 0.5);
        }

        return cards;

    },
    dealCards: function(game) {
        let newDeck = [];
        //new Deck
        let gameDeck = this.shuffleDeck(deck);
        for (let i = 0; i < 5; i++) {
            newDeck.push(gameDeck[i]);
        }

        game.cards = newDeck;

        let j = 5;
        for (let i = 0; i < game.bettingRoundPlayers.length; i++) {
            game.bettingRoundPlayers[i].cards = [];
            j = j + 2;
            let playerDeck = [];
            for (let k = j; k < j + 2; k++) {
                playerDeck.push(gameDeck[k]);
            }

            game.bettingRoundPlayers[i].cards = playerDeck;
            // console.log("NEW CARDS:",  game.bettingRoundPlayers[i].cards )

        }

        return game;
    },
    addCard: function(game) {
        // cardDeal: [0 "Pre-Flop", 1 "Flop", 2 "Turn", 3 "River"],

        // console.log(" game.cards",  game.cards);

        if (game.cardRound === 1) {
            for (let i = 0; i < game.bettingRoundPlayers.length; i++) {
                let cards = [
                    ...game.bettingRoundPlayers[i].cards,
                    game.cards[0],
                    game.cards[1],
                    game.cards[2],
                ];
                game.bettingRoundPlayers[i].cards = cards;
            }
        } else if (game.cardRound === 2) {
            for (let i = 0; i < game.bettingRoundPlayers.length; i++) {
                let cards = [...game.bettingRoundPlayers[i].cards, game.cards[3]];
                game.bettingRoundPlayers[i].cards = cards;
            }
        } else if (game.cardRound === 3) {
            for (let i = 0; i < game.bettingRoundPlayers.length; i++) {
                let cards = [...game.bettingRoundPlayers[i].cards, game.cards[4]];
                game.bettingRoundPlayers[i].cards = cards;
                //game.bettingRoundPlayers[i].cardValue =  rankPokerHand(cards);
            }
        }

        return game;
    },


    isEqualBettingAmount: function(game) {
        let highestBettingAmount = 0;

        for (let i = 0; i < game.bettingRoundPlayers.length; i++) {
            highestBettingAmount = Math.max(
                highestBettingAmount,
                game.bettingRoundPlayers[i].currentBet
            );
        }

        // console.log("highestBettingAmount", highestBettingAmount);

        for (let i = 0; i < game.bettingRoundPlayers.length; i++) {
            // console.log(game.bettingRoundPlayers[i].name)
            // console.log("game.bettingRoundPlayers[i].currentBet !== highestBettingAmount", game.bettingRoundPlayers[i].currentBet !== highestBettingAmount)
            // console.log("!game.bettingRoundPlayers[i].allIn", !game.bettingRoundPlayers[i].allIn)
            if (
                game.bettingRoundPlayers[i].currentBet !== highestBettingAmount &&
                !game.bettingRoundPlayers[i].allIn
            ) {
                //  console.log("$return false");
                return false;
            }
        }
        // console.log("$return true");
        return true;
    },

    resetBets: function(game) {
        game.firstRound = true;
        game.currentBet = 0;
        game.bettingRoundRaises = 0;
        game.temp_check_total = 0;

        game.bettingRoundPlayers.forEach((player) => {
            player.currentBet = 0;
            player.potContribution = 0;
            player.lastBetRound = 0;
        });
        return game;
    },
    mapValue: function(value) {
        const full = {
            ACE: 14,
            KING: 13,
            QUEEN: 12,
            JACK: 11,
            0: 10,
            9: 9,
            8: 8,
            7: 7,
            6: 6,
            5: 5,
            4: 4,
            3: 3,
            2: 2,
        };
        const partial = {
            A: 14,
            K: 13,
            Q: 12,
            J: 11,
            0: 10,
            9: 9,
            8: 8,
            7: 7,
            6: 6,
            5: 5,
            4: 4,
            3: 3,
            2: 2,
        };

        if (full[value]) {
            return full[value];
        } else if (partial[value]) {
            return partial[value];
        } else {
            //console.warn("No Mapping for:" + value)
            return value;
        }
    },
    declareWinner: function(game) {
        game.bettingRoundPlayers.sort((a, b) => {
            // Descening Rank of Hand Strength
            if (b.cardStrength[1] !== a.cardStrength[1]) {
                return b.cardStrength[1] - a.cardStrength[1];
            }
            // Descending Order of Following Cards, (todo maybe issue with 2-pair)
            if (
                this.mapValue(b.cardStrength[2]) !== this.mapValue(a.cardStrength[2])
            ) {
                return (
                    this.mapValue(b.cardStrength[2]) - this.mapValue(a.cardStrength[2])
                );
            }
            // Descending Order of Following Cards
            if (
                this.mapValue(b.cardStrength[3]) !== this.mapValue(a.cardStrength[3])
            ) {
                return (
                    this.mapValue(b.cardStrength[3]) - this.mapValue(a.cardStrength[3])
                );
            }
            // Descending Order of Following Cards
            if (
                this.mapValue(b.cardStrength[4]) !== this.mapValue(a.cardStrength[4])
            ) {
                return (
                    this.mapValue(b.cardStrength[4]) - this.mapValue(a.cardStrength[4])
                );
            }
        });
        //console.log("---");
        // for (let i = 0; i < game.bettingRoundPlayers.length; i++) {
        //   console.log("Name", game.bettingRoundPlayers[i].name);
        //   console.log("CS", game.bettingRoundPlayers[i].cardStrength);
        // }

        //todo handle all in

        return game;
    },
    handUpdateToPlayer: function(game) {
        const player = game.bettingRoundPlayers.find((player) => {
            return player.npc === false;
        });

        console.log("It is the " + this.cardDeal[game.cardRound] + " round.");
        //if still in
        if (player && !player.allIn) {
            console.log(
                "You are holding " +
                nameCards(player.cards[0].value, player.cards[0].suit) +
                " and " +
                nameCards(player.cards[1].value, player.cards[1].suit)
            );
        }
        if (game.cardRound === 1) {
            console.log(
                "The Flop comes up as " +
                nameCards(game.cards[0].value, game.cards[0].suit) +
                ", " +
                nameCards(game.cards[1].value, game.cards[1].suit) +
                ", and " +
                nameCards(game.cards[2].value, game.cards[2].suit)
            );
        } else if (game.cardRound === 2) {
            console.log(
                "The Turn comes up as " +
                nameCards(game.cards[3].value, game.cards[3].suit) +
                ". " +
                "The Table now shows a " +
                nameCards(game.cards[0].value, game.cards[0].suit) +
                ", " +
                nameCards(game.cards[1].value, game.cards[1].suit) +
                ", " +
                nameCards(game.cards[2].value, game.cards[2].suit) +
                ", and " +
                nameCards(game.cards[3].value, game.cards[3].suit)
            );
        } else if (game.cardRound === 3) {
            console.log(
                "The River comes up as " +
                nameCards(game.cards[4].value, game.cards[4].suit) +
                ". " +
                "The Table now shows a " +
                nameCards(game.cards[0].value, game.cards[0].suit) +
                ", " +
                nameCards(game.cards[1].value, game.cards[1].suit) +
                ", " +
                nameCards(game.cards[2].value, game.cards[2].suit) +
                ", " +
                nameCards(game.cards[3].value, game.cards[3].suit) +
                ", and " +
                nameCards(game.cards[4].value, game.cards[4].suit)
            );
        }
    },
    playRound: async function(game, currentList) {

        return {
            game,
            currentList
        }
    },
};



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
                        //get Position 
                        poker = getRealPosition(poker);


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