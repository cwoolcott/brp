const {
  NUM_OF_PLAYERS,
  STARTING_MONEY,
  AGGRO_MULTIPLIER,
  OTHER_RAISES_MULTIPLIER,
  NUM_OF_SHUFFLES
} = require("./constants");

const analyzeHand = require("./analyzehand");
const npcPlayers = require("./npcplayers");
const deck = require("./deck");
const handleWinnings = require("./handlewinnings");
const {generateUUID, nameCards} = require("./utils");
const inquirer = require("inquirer");

  
module.exports = {
    npcPlayers: npcPlayers,
    cardDeal: ["Pre-Flop", "Flop", "Turn", "River"],
    shuffleArray: function (array) {
      for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
      return array;
    },
    randomPlayer: function () {
      return this.npcPlayers[Math.floor(Math.random() * this.npcPlayers.length)];
    },
    fillPlayers: function (number, human) {
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
        });
      }
      return currentList;
    },
    listPlayerNames: function (currentList) {
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
    startingMoney: function (currentList) {
      currentList.forEach((player) => {
        //TEST
        if (!player.npc){
          player.money = STARTING_MONEY * 10;
        }
        else{
          player.money = STARTING_MONEY;
        }
        
        player.allIn = false;
      });
      return currentList;
    },
    updateCurrentPlayerMoney(currentList, bettingRoundPlayers){
      for (let i = 0; i < bettingRoundPlayers.length; i++){
        const updatePlayer = currentList.find((clp)=>{
          clp.id===bettingRoundPlayers[i].id;
        });

        if (updatePlayer){
          currentList[updatePlayer.id].money = bettingRoundPlayers[i].money;
        }

      //  console.log("update brp:",i, ":", bettingRoundPlayers[i].name, bettingRoundPlayers[i].money);
      }

      // for (let i = 0; i < currentList.length; i++){
      //   console.log("update cl:",i, ":", currentList[i].name, currentList[i].money);
      // }
      
      return currentList
    },
    gameConfig: function (game, currentList, startNew = false) {
      if (startNew) {
        game = {
          round: 1,
          bettingRoundRaises: 0,
          bettingRoundPlayers: [...currentList],
          currentPosition: 0,
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
            currentList.splice(i, 1);
            i--;
          }
        }
  
        game = {
          round: game.round + 1,
          bettingRoundRaises: 0,
          bettingRoundPlayers: this.assignPositions([...currentList]),
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
    startGame: function (human = false) {
      let currentList = this.fillPlayers(NUM_OF_PLAYERS, human);
      currentList = this.assignPositions(currentList, false);
      currentList = this.startingMoney(currentList);
  
      let game = this.gameConfig("", currentList, true);
  
      return { game, currentList };
    },
    assignPositions: function (currentList, next = true) {
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
    takeBlinds: function (game) {
      for (let i = 0; i < game.bettingRoundPlayers.length; i++) {
        game.bettingRoundPlayers[i].position = i;
        game.bettingRoundPlayers[i].allIn = false;
        game.bettingRoundPlayers[i].currentBet = 0;
      }
  
      game.pot = 0;
      let smbPos = 1;
  
      if (game.bettingRoundPlayers.length === 2) {
        console.log("Two Players Left - Small Blind is now 0")
        smbPos = 0;
      }

      //console.log("SMBLIND", game.bettingRoundPlayers);
  
      if (game.smallBlind > game.bettingRoundPlayers[smbPos].money) {
        //console.log("--- " , currentList[smbPos].name , " game.smallBlind > currentList[smbPos].money SMALL BLIND:", game.smallBlind, "MONEY:" . currentList[smbPos].money, " Pre Game Pot: ", game.pot)
        game.pot += game.bettingRoundPlayers[smbPos].money;
        game.bettingRoundPlayers[smbPos].currentBet =game.bettingRoundPlayers[smbPos].money;
        game.bettingRoundPlayers[smbPos].allIn = game.pot;
        game.bettingRoundPlayers[smbPos].allInRound = game.cardRound;
        game.bettingRoundPlayers[smbPos].allInBet =
        game.bettingRoundPlayers[smbPos].currentBet;
        game.bettingRoundPlayers[smbPos].money = 0;
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
        game.pot += game.smallBlind;
        console.log(
          "Small Blind Posted by " +
            game.bettingRoundPlayers[smbPos].name +
            " for $" +
            game.bettingRoundPlayers[smbPos].currentBet
        );
      }
  
      if (game.bigBlind > game.bettingRoundPlayers[smbPos + 1].money) {
        //console.log("--- " , currentList[smbPos + 1].name , " game.bigBlind > currentList[smbPos + 1].money BIG BLIND:", game.bigBlind, "MONEY:" . currentList[smbPos + 1].money, " Pre Game Pot: ", game.pot)
        game.pot += game.bettingRoundPlayers[smbPos + 1].money;
        game.currentBet = game.bettingRoundPlayers[smbPos + 1].money;
        game.bettingRoundPlayers[smbPos + 1].currentBet = game.bettingRoundPlayers[smbPos + 1].money;
        game.bettingRoundPlayers[smbPos + 1].allIn = game.pot;
        game.bettingRoundPlayers[smbPos + 1].allInRound = game.cardRound;
        game.bettingRoundPlayers[smbPos + 1].allInBet =
        game.bettingRoundPlayers[smbPos + 1].currentBet;
        game.bettingRoundPlayers[smbPos + 1].money = 0;
        console.log(
          "Big Blind Posted by " +
            game.bettingRoundPlayers[smbPos + 1].name +
            " for $" +
            game.bettingRoundPlayers[smbPos + 1].currentBet +
            " causing them to go all in."
        );
      } else {
        game.bettingRoundPlayers[smbPos + 1].money -= game.bigBlind;
        game.currentBet = game.bigBlind;
        game.pot += game.bigBlind;
        game.bettingRoundPlayers[smbPos + 1].currentBet = game.bigBlind;
        console.log(
          "Big Blind Posted by " +
            game.bettingRoundPlayers[smbPos + 1].name +
            " for $" +
            game.bettingRoundPlayers[smbPos + 1].currentBet +
            "."
        );
      }
      //console.log("BigBlind:", game.bettingRoundPlayers[smbPos + 1].name, " SB:", game.bettingRoundPlayers[smbPos + 1].currentBet);
      return game;
    },
    shuffleDeck: function(cards){
      for (let i = 0; i<NUM_OF_SHUFFLES; i++){
        cards = cards.sort( () => Math.random() - 0.5);
      }
      
      return cards;
  
    },
    dealCards: function (game) {
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
    addCard: function (game) {
      // cardDeal: [0 "Pre-Flop", 1 "Flop", 2 "Turn", 3 "River"],
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
    decisionValue: function (cards, handValue, aggressionLevel, raises) {
      const multiplier = AGGRO_MULTIPLIER;
      aggressionLevel = Math.floor(Math.random() * aggressionLevel) + 1;
      // console.log("cards:", cards)
      // process.exit()
      let topCards = ["ACE", "KING", "QUEEN", "JACK"];
      let handValueTimesTen = handValue * 10;
  
      if (topCards.includes(cards[0].value)) {
        //console.log("Up Aggression - Top Card");
        handValueTimesTen += 3;
      }
  
      if (topCards.includes(cards[1].value)) {
       // console.log("Up Aggression - Top Card");
        handValueTimesTen += 3;
      }
  
      if (cards.length === 2) {
        if (cards[0].suit === cards[1].suit) {
        //  console.log("Up Aggression - Same Suit");
          handValueTimesTen += 2;
        }
      }
      // Flush Agression
      else if (cards.length === 5 || cards.length === 6) {
        if (cards[0].suit === cards[1].suit) {
          //console.log("Up Aggression Flush");
          handValueTimesTen += 2;
          for (let i = 2; i < cards.length; i++) {
            if (cards[0].suit === cards[i].suit) {
              handValueTimesTen += 1;
            }
          }
        }
      }
      // console.log(
      //   "--decisionValue HV:",
      //   handValueTimesTen,
      //   " Agg:",
      //   aggressionLevel,
      //   multiplier,
      //   " Raises:",
      //   raises,
      //   " Cards:",
      //   cards[0].code,
      //   cards[1].code
      // );
      return handValueTimesTen + aggressionLevel * multiplier - raises;
    },
   
    bettingRound: async function (game) {
      //console.log("-------");
      //console.log("BETTING ROUND:", game.round , "  game.currentPosition:", game.currentPosition, " of ", game.bettingRoundPlayers.length - 1);
  
      //console.log("current bet pre-player:", game.currentBet);
  
      let playerTurn = game.bettingRoundPlayers[game.currentPosition];
      let raiseOption = true;
  
      console.log(playerTurn.name, " Last Bet Round", playerTurn.lastBetRound, " He is ", playerTurn.allIn ? "All In" : "Not All In");
      console.log("Other Players: ",  game.bettingRoundPlayers.filter(player => !player.allIn && player.name !== playerTurn.name).length>0 ? "are not ALL all-In" : "are All all-in")
  
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
  
      let decisionValue = this.decisionValue(
        playerTurn.cards,
        handValue,
        playerTurn.aggressionLevel,
        raises
      );
      let playerFolded = false;
      let playerAction = false;
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
            }
            if (input > playerTurn.money || input < 1) {
                return false;
            }
      
            return true;
          }
          });
        }
      }
      decisionValue = decisionValue - (game.bettingRoundRaises * OTHER_RAISES_MULTIPLIER);
  
      if (
        playerAction === "raise" ||
        (!playerAction && (raiseOption && decisionValue > 20))
      ) {
        //20
        //console.log("% Raise %", decisionValue, "---");
        game.bettingRoundRaises++;
        let doubleRaise = Math.max(game.bigBlind * 2, game.currentBet * 2);
        if (playerRaise) {
          doubleRaise = playerRaise.raise;
        }
  
        if (doubleRaise >= playerTurn.money) {
          console.log(playerTurn.name, " raises all-in " + "for $" + doubleRaise);
          playerTurn.currentBet += playerTurn.money;
          game.pot += playerTurn.money;
          playerTurn.allInBet = playerTurn.money;
          playerTurn.money = 0;
  
          game.currentBet =
            playerTurn.currentBet < game.currentBet
              ? game.currentBet
              : playerTurn.currentBet;
              //300 - 200 + 100 TODO CHECK
          playerTurn.allIn = (game.pot - game.currentBet + playerTurn.currentBet); //includes his bet
          playerTurn.allInRound = game.cardRound;
  
          //console.log("players allin pot $" + playerTurn.allIn, "Player CurrentBet:", playerTurn.allInBet, " with money: ", playerTurn.money, " existing post pot: ", game.pot);
        } else {
          console.log(playerTurn.name, " raises " + "$" + doubleRaise);
          let betDifference = doubleRaise - playerTurn.currentBet;
          playerTurn.currentBet += betDifference;
          playerTurn.money -= betDifference;
          game.pot += betDifference;
          game.currentBet = doubleRaise;
        }
      } else if (
        playerAction === "call" ||
        (!playerAction && decisionValue > 10)
      ) {
        if (playerTurn.currentBet < game.currentBet) {
          // console.log("% Calls % ", game.currentBet);
  
          if (playerTurn.money <= game.currentBet) {
            //console.log(playerTurn.name, " calls all-in ", "call: ", game.currentBet, " money: ", playerTurn.money, " pre pot: ", game.pot);
            console.log(
              playerTurn.name,
              " calls all-in " +
                "for $" +
                game.currentBet +
                " with " +
                playerTurn.money
            );
            game.pot += playerTurn.money;
            playerTurn.currentBet += playerTurn.money;
            playerTurn.allInBet = playerTurn.money;
            playerTurn.money = 0;
            //playerTurn.allIn = game.pot;
            playerTurn.allIn = (game.pot - game.currentBet + playerTurn.currentBet);
            playerTurn.allInRound = game.cardRound;
            game.currentBet =
              playerTurn.currentBet < game.currentBet
                ? game.currentBet
                : playerTurn.currentBet;
            //console.log("allin pot $" + playerTurn.allIn, " money: ", playerTurn.money, " post pot: ", game.pot);
          } else {
            let betDifference = game.currentBet - playerTurn.currentBet;
            console.log(playerTurn.name, " calls " + "$" + betDifference);
            game.pot += betDifference;
            playerTurn.currentBet += betDifference;
            playerTurn.money -= betDifference;
            game.currentBet = playerTurn.currentBet;
          }
        } else {
          console.log(playerTurn.name + " Player checks.");
        }
      } else {
        //console.log("% Fold % CB:", playerTurn.currentBet, " GB", game.currentBet);
        console.log(playerTurn.name, " folds");
        game.bettingRoundPlayers.splice(game.currentPosition, 1);
        //issue with folding player skipping next person
        game.currentPosition--;
        playerFolded = true;
      }
  
      playerTurn.lastBetRound = game.cardRound;
  
      //   console.log("current bet post-player:", game.currentBet);
      //   console.log("-------");
  
      //CHeck that allIn Players bets are matched ???
      //console.log("Other Players - Adjust All In CardRound: ", this.cardDeal[game.cardRound], " ", game.cardRound)
      if (!playerFolded && playerTurn.currentBet > 0) {
        for (let j = 0; j < game.bettingRoundPlayers.length; j++) {
          if (!game.bettingRoundPlayers[j].allIn) continue;
          if (game.currentPosition !== j) {
              //Apply Current Bet to others
              

            const addToOthersAllInBet = playerTurn.allInBet < game.bettingRoundPlayers[j].currentBet
              ? playerTurn.allInBet
              : game.bettingRoundPlayers[j].currentBet;
         

            // console.log(game.bettingRoundPlayers[j].name, " added ", addToOthersAllInBet, " to ", game.bettingRoundPlayers[j].allIn);
            //  console.log(game.bettingRoundPlayers[j].allIn, " AllInRound:", game.bettingRoundPlayers[j].allInRound )
            // console.log("LBR:", game.bettingRoundPlayers[j].lastBetRound)
            if (
              game.bettingRoundPlayers[j].allIn &&
              game.bettingRoundPlayers[j].allInRound === game.cardRound
            ) {
              //console.log("Side Pot added to " + game.bettingRoundPlayers[j].name + "'s pot");
              game.bettingRoundPlayers[j].allIn =
                game.bettingRoundPlayers[j].allIn + addToOthersAllInBet;
            }
          }
        }
      }
  
      //set betting player back to playerTurn
      if (!playerFolded) {
        game.bettingRoundPlayers[game.currentPosition] = playerTurn;
      }
  
    //  console.log("-After this Round-")
    //     console.log("Game Pot: ", game.pot)
    //   for (let j = 0; j < game.bettingRoundPlayers.length; j++) {
    //     console.log("LBR:", game.bettingRoundPlayers[j].lastBetRound, " ", game.bettingRoundPlayers[j].name, ": CB $", game.bettingRoundPlayers[j].currentBet, " AllIn:", game.bettingRoundPlayers[j].allIn)
    //   }
  
      return game;
    },
    isEqualBettingAmount: function (game) {
      let highestBettingAmount = 0;
  
      for (let i = 0; i < game.bettingRoundPlayers.length; i++) {
        highestBettingAmount = Math.max(
          highestBettingAmount,
          game.bettingRoundPlayers[i].currentBet
        );
      }
  
      //console.log("highestBettingAmount", highestBettingAmount);
  
      for (let i = 0; i < game.bettingRoundPlayers.length; i++) {
        if (
          game.bettingRoundPlayers[i].currentBet !== highestBettingAmount &&
          !game.bettingRoundPlayers[i].allIn
        ) {
          return false;
        }
      }
  
      return true;
    },
  
    resetBets: function (game) {
      game.firstRound = true;
      game.currentBet = 0;
      game.bettingRoundRaises = 0;
      game.bettingRoundPlayers.forEach((player) => {
        player.currentBet = 0;
        player.lastBetRound = 0;
      });
      return game;
    },
    mapValue: function (value) {
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
    declareWinner: function (game) {
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
    handUpdateToPlayer: function (game) {
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
    playRound: async function (game, currentList) {
      
      game = this.dealCards(game);
      game = this.takeBlinds(game);
     
      currentList = this.updateCurrentPlayerMoney(currentList, game.bettingRoundPlayers)
  
      for (let i = 0; i < this.cardDeal.length; i++) {
        game.currentPosition = 0;
        game.cardRound = i;
        game = this.addCard(game);
  
        if (game.bettingRoundPlayers.length>1){
          this.handUpdateToPlayer(game);
        }
        
  
        if (i !== 0) {
         game = this.resetBets(game);
        }
  
        //console.log("cardDealRound: ", i)
  
        while (
          game.bettingRoundPlayers.length > 1 &&
          (game.firstRound === true ||
            !this.isEqualBettingAmount(game))
        ) {
          

          game = await this.bettingRound(game);
          
          game.currentPosition++;

  
          // console.log("Round Positions", poker.game.currentPosition, poker.game.bettingRoundPlayers.length)
          if (
            game.currentPosition >= game.bettingRoundPlayers.length
          ) {
            //console.log("Go Around");
            game.currentPosition = 0;
            game.firstRound = false;
          }
        }
        currentList = this.updateCurrentPlayerMoney(currentList, game.bettingRoundPlayers)
  
        // console.log("---- NEXT WHILE --- ");
        // console.log(game.firstRound ? "First Round" : "Not First Round")
        // console.log("while:", "Not Equal:", !this.isEqualBettingAmount(game), " NFR:", !game.firstRound);
        // console.log("Players Not All In: ", game.bettingRoundPlayers.filter(player => !player.allIn).length)
        // console.log("---- --------- --- ");
        
      }
      // Round Over
  
      for (let i = 0; i < game.bettingRoundPlayers.length; i++) {
        game.bettingRoundPlayers[i].cardStrength = analyzeHand(
          game.bettingRoundPlayers[i].cards
        );
      }

      game = this.declareWinner(game);
      game = handleWinnings(game);

      // console.log("%results:%")
      // for (let i = 0; i <  game.bettingRoundPlayers.length; i++){
      //   console.log("BRP:", i, game.bettingRoundPlayers[i]?.name, game.bettingRoundPlayers[i]?.money)

      // }
      // for (let i = 0; i < currentList.length; i++){
      //   console.log("CL:", i, currentList[i]?.name,  currentList[i]?.money)

      // }
      return {game, currentList}
    },
  };