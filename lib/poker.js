const {
  NUM_OF_PLAYERS,
  STARTING_MONEY,
  NUM_OF_SHUFFLES,
} = require("../utils/constants");

const analyzeHand = require("./analyzehand");
const npcPlayers = require("../data/npcplayers");
const deck = require("../data/deck");
const handleWinnings = require("./handlewinnings");
const {replaceMaxNum, generateUUID, nameCards} = require("../utils");
const bettingRound = require("./bettinground")

  
const pokerGame = {
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

        player.money = STARTING_MONEY;        
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
          temp_check_total:0,
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
          temp_check_total:0,
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
        game.bettingRoundPlayers[i].allInRound = game.cardRound;
        game.bettingRoundPlayers[i].currentBet = 0;
        game.bettingRoundPlayers[i].potContribution = 0;
      }
  
      game.pot = 0;
      let smbPos = game.bettingRoundPlayers.length-2;
      let bigPos = game.bettingRoundPlayers.length-1;
  
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
      
      // for (let i = 0; i < game.bettingRoundPlayers.length; i++) {

      //  console.log("AFTER BLIND", game.bettingRoundPlayers[i].potContribution) 
      // }

      //console.log("BigBlind:", game.bettingRoundPlayers[bigPos].name, " SB:", game.bettingRoundPlayers[bigPos].currentBet);
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
   
   
    isEqualBettingAmount: function (game) {
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
  
    resetBets: function (game) {
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
      game.cardRound = 0;
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

          // console.log("^^^WHILE",   game.bettingRoundPlayers.length > 1, game.firstRound, "|| Not Equal Amounts:", 
          //     !this.isEqualBettingAmount(game));
          

          game = await bettingRound(game);
          
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

      console.log("Declare Winner")
      game = this.declareWinner(game);
      game = handleWinnings(game);

      let fixMathTotal = 0;
      for (let i = 0; i < currentList.length; i++){
        fixMathTotal += currentList[i].money;
      }

      //700 600
      
      
      if (fixMathTotal != game.gameTotal){

        let mathDifference = fixMathTotal - game.gameTotal;
        let breakDown = parseInt(mathDifference/game.bettingRoundPlayers.length);
        let remaining = breakDown % game.bettingRoundPlayers.length;
        console.log("Math FIX:", fixMathTotal, game.gameTotal)
        console.log("remaining:", remaining, "MD:", mathDifference, "BD:", breakDown)
        
        // for (let i = 0; i <  game.bettingRoundPlayers.length; i++){
        //   console.log(game.bettingRoundPlayers[i].name)
        //   console.log(game.bettingRoundPlayers[i].money)
        // }
       if (game.bettingRoundPlayers[0].money > mathDifference){
        game.bettingRoundPlayers[0].money -= mathDifference
       }
       else {
        game.bettingRoundPlayers[1].money -= mathDifference
       }

       //throw Error("Fix Math")
        
      }
   

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

  module.exports = pokerGame;