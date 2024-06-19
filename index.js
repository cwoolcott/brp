const inquirer = require("inquirer");
const pokerGame = require("./poker")



const run = async () => {
  const human = await inquirer.prompt({
    name: "name",
    type: "input",
    message: "What is your name?",
  });

  const fullResults = [];
  let testAmount = 600;
  let gameCount = 0;
  while (testAmount === 600 && gameCount < 10000){
    gameCount++;
    console.info("************************** NEW GAME: " + gameCount + "**************************")

  let poker = pokerGame.startGame(human.name);
 
  while (poker.currentList.length > 1) {

    // console.info("************************** IN GAME: " + gameCount + "**************************")
    // console.log("ROUND " + poker.game.round + " Begins.");

    poker = await pokerGame.playRound(poker.game, poker.currentList);
   
    poker.game = pokerGame.gameConfig(poker.game, poker.currentList);
  } 

  console.log("Game Winner: ", poker.game.bettingRoundPlayers[0].name, "In ", poker.game.round, "Rounds");
  console.log("--------------------------------------------------")

  const i = fullResults.findIndex(result => result.name === poker.game.bettingRoundPlayers[0].name);
  if (i > -1) {
    // We know that at least 1 object that matches has been found at the index i
    fullResults[i].wins++;
  }
  else{
    fullResults.push({"name":poker.game.bettingRoundPlayers[0].name, "wins":0, "aggressionLevel":poker.game.bettingRoundPlayers[0].aggressionLevel})
  }

 
  // poker.game.bettingRoundPlayers.forEach(player => {
  //     console.log("BPR: ", player.name, " $", player.money)
  //   });

  //  poker.currentList.forEach(player => {
  //     console.log("CL:  ", player.name, " $", player.money)
  //    // testAmount = player.money;
  //   });
    

  } //end while
 // console.info("************************** END GAME: " + gameCount + "**************************")
 fullResults.sort((a, b) => b.wins - a.wins);
 console.table(fullResults)
};

run();