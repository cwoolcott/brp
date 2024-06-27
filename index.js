const inquirer = require("inquirer");

const { NUM_OF_PLAYERS, STARTING_MONEY } = require("./utils/constants");
const pokerGame = require("./lib/poker");
const round = require("./lib/round");

  
const run = async () => {
  const human = await inquirer.prompt({
    name: "name",
    type: "input",
    message: "What is your name?",
  });

  const fullResults = [];
  let testAmount = 600;
  let gameCount = 0;
  //while (testAmount === 600 && gameCount < 2000){
    gameCount++;
    console.info("************************** NEW GAME: " + gameCount + "**************************")

  let poker = pokerGame.startGame(human.name);
  
  round(poker);

  console.log("Game Winner: ", poker.game.bettingRoundPlayers[0].name, "In ", poker.game.round, "Rounds");
  console.log("--------------------------------------------------")

  const totalPos = STARTING_MONEY * NUM_OF_PLAYERS;
  const i = fullResults.findIndex(result => result.name === poker.game.bettingRoundPlayers[0].name);
  if (i > -1) {
    // We know that at least 1 object that matches has been found at the index i
    fullResults[i].wins++;
    fullResults[i].totalPos += totalPos
    fullResults[i].AvgWin = fullResults[i].totalPos/fullResults[i].wins
  }
  else{
    fullResults.push(
      {"name":poker.game.bettingRoundPlayers[0].name, 
      "wins":1, 
      "aggressionLevel":poker.game.bettingRoundPlayers[0].aggressionLevel,
      "totalPos": totalPos,
      "AvgWin" : totalPos / this.wins
    })
  }

 
  poker.game.bettingRoundPlayers.forEach(player => {
      console.log("BPR: ", player.name, " $", player.money)
      //console.log(player)
    });

  //  poker.currentList.forEach(player => {
  //     console.log("CL:  ", player.name, " $", player.money)
  //    // testAmount = player.money;
  //   });
    

 // } //end while
 // console.info("************************** END GAME: " + gameCount + "**************************")
 fullResults.sort((a, b) => b.wins - a.wins);
 console.table(fullResults)
};

//run test
run();