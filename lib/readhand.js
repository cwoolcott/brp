const {nameCards} = require("../utils");

const singleCardValueMap = function (value) {
  const valueMap = {
    A: "Ace",
    K: "King",
    Q: "Queen",
    J: "Jack",
    0: "10",
  };

  return valueMap[value] ? valueMap[value] : value;
}


const readHand = function ({cards, cardStrength}) {


    if (!cards){
      throw Error("Read Hand Issue")
    }
  
    cardStrength[2] = singleCardValueMap(cardStrength[2]);
    cardStrength[3] = singleCardValueMap(cardStrength[3]);
    cardStrength[4] = singleCardValueMap(cardStrength[4]);
  
    let showCards = `Reveals ${nameCards(cards[0].value, cards[0].suit)} and ${nameCards(cards[1].value, cards[1].suit)}` ;
   
    let result = "";
    if (cardStrength[0] === "High Card") {
      result = (
        "a High Card of " +
        cardStrength[2] +
        " and a " +
        cardStrength[3] +
        ", " +
        cardStrength[4] +
        " Kicker."
      );
    }
    if (cardStrength[0] === "Pair") {
      result =  (
        "a Pair of " +
        cardStrength[2] +
        "'s and a " +
        cardStrength[3] +
        ", " +
        cardStrength[4] +
        " Kicker."
      );
    } else if (cardStrength[0] === "Two Pair") {
      result = (
        "Two Pairs of " +
        cardStrength[2] +
        "'s and " +
        cardStrength[3] +
        "'s, with a " +
        cardStrength[4] +
        " Kicker."
      );
    } else if (cardStrength[0] === "Three of a Kind") {
      result = (
        "a Three of a Kind with " +
        cardStrength[2] +
        "'s and a " +
        cardStrength[3] +
        ", " +
        cardStrength[4] +
        " Kicker."
      );
      
    } 
    else if (cardStrength[0] === "Straight") {
      result = (
        "a Straight "
      );
  }
  else if (cardStrength[0] === "Flush") {
    result = (
      "a Flush "
    );
  }
  else if (cardStrength[0] === "Full House") {
      result = (
        "a Full House with " +
        cardStrength[2] +
        "'s full of " +
        cardStrength[3] +
        "'s"
      );
    }
    else if (cardStrength[0] === "Four of a Kind") {
      result = (
        "a Four of a Kind with " +
        cardStrength[2] +
        "'s"
      );
    }
    else if (cardStrength[0] === "Straight Flush") {
      result = (
        "a Straight Flush "
      );
  }
  
    else{
      result = cardStrength[0];
    }
   
    return `${showCards} making ${result}`;
  };

  module.exports = readHand;

