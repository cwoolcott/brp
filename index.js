const inquirer = require("inquirer");
const pokerGame = require("./poker")

const run = async () => {
  const human = await inquirer.prompt({
    name: "name",
    type: "input",
    message: "What is your name?",
  });

  let testAmount = 600;
  let gameCount = 0;
  while (testAmount === 600){
    gameCount++;
    console.info("************************** NEW GAME: " + gameCount + "**************************")

  let poker = pokerGame.startGame(human.name);
 
  while (poker.currentList.length > 1) {
    if (poker.game.round>50){
      throw new Error("too many rounds.")
    }

    console.log("ROUND " + poker.game.round + " Begins.");

    poker = await pokerGame.playRound(poker.game, poker.currentList);
   
    poker.game = pokerGame.gameConfig(poker.game, poker.currentList);
  } 

  console.log("Game Winner: ", poker.game.bettingRoundPlayers[0].name, "In ", poker.game.round, "Rounds");
  console.log("--------------------------------------------------")

  poker.game.bettingRoundPlayers.forEach(player => {
      console.log("BPR: ", player.name, " $", player.money)
    });

   poker.currentList.forEach(player => {
      console.log("CL:  ", player.name, " $", player.money)
      testAmount = player.money;
    });
    

  } //end while
  console.info("************************** END GAME: " + gameCount + "**************************")
};

run();