const inquirer = require("inquirer");
const pokerGame = require("./poker")

const run = async () => {
  const human = await inquirer.prompt({
    name: "name",
    type: "input",
    message: "What is your name?",
  });

  let poker = pokerGame.startGame(human.name);
 
  //console.log(poker.game.bettingRoundPlayers)
  //{ currentList: currentList, game: game }

  //Still Players in Game
  while (poker.currentList.length > 1) {
    if (poker.game.round>20){
      throw new Error("too many rounds")
    }
   // console.log("BRP: ", poker.game.bettingRoundPlayers.length, " CL: ", poker.currentList.length)

    console.log("ROUND " + poker.game.round + " Begins.");

    poker = await pokerGame.playRound(poker.game, poker.currentList);
   
    //console.log(" poker.currentList",  currentList)
    poker.game = pokerGame.gameConfig(poker.game, poker.currentList);
   
   
  } 


  console.log("Game Winner: ", poker.game.bettingRoundPlayers[0].name, "In ", poker.game.round, "Rounds");

  poker.game.bettingRoundPlayers.forEach(player => {
      console.log("BPR: ", player.name, " $", player.money)
    });

   poker.currentList.forEach(player => {
      console.log("CL:  ", player.name, " $", player.money)
    });
};


  run();


