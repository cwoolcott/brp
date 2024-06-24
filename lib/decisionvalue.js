const {
    AGGRO_MULTIPLIER,
    DECISION_RANGE,
    BLUFF_RND_AGGRO_LEVEL,
    BLUFF_ODDS
  } = require("../utils/constants");
  
const decisionValue = function (cards, handValue, aggressionLevel, raises) {
  
    _aggressionLevel = Math.floor(Math.random() * aggressionLevel) + 1;
    // console.log("aggressionLevel", aggressionLevel)
    let aggTotal = _aggressionLevel * AGGRO_MULTIPLIER;
    // console.log("aggTotal", aggTotal)
   
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
    // console.log("handValueTimesTen:", handValueTimesTen)
    // console.log("DC: ",  handValueTimesTen + (aggTotal * 5) - raises)
    let dvSubFinal = handValueTimesTen + (aggTotal * 5) - raises;
    
    if (_aggressionLevel>4 && dvSubFinal > DECISION_RANGE.CALL){
      
     if ((Math.floor(Math.random() * 2) + 1) ===1){
      dvSubFinal += dvSubFinal + Math.floor(Math.random() * 10) + 1;
     }
     else{
      dvSubFinal -= dvSubFinal + Math.floor(Math.random() * 10) + 1;
     }
     
     //Bluff Height Aggression levels are more likely to Bluff ; still 1/5 chance
     let willBluff = (aggressionLevel>=Math.floor(Math.random() * BLUFF_RND_AGGRO_LEVEL) + 1) && (1==Math.floor(Math.random() * BLUFF_ODDS) + 1);
     dvSubFinal = (willBluff) ? dvSubFinal + 20 : dvSubFinal;
    }
    return dvSubFinal;
  };

  module.exports = decisionValue;