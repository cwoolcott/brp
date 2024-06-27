function mapValue (value) {
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
}
function declareWinner (game) {
    game.bettingRoundPlayers.sort((a, b) => {
      // Descening Rank of Hand Strength
      if (b.cardStrength[1] !== a.cardStrength[1]) {
        return b.cardStrength[1] - a.cardStrength[1];
      }
      // Descending Order of Following Cards, (todo maybe issue with 2-pair)
      if (
        mapValue(b.cardStrength[2]) !== mapValue(a.cardStrength[2])
      ) {
        return (
          mapValue(b.cardStrength[2]) - mapValue(a.cardStrength[2])
        );
      }
      // Descending Order of Following Cards
      if (
        mapValue(b.cardStrength[3]) !== mapValue(a.cardStrength[3])
      ) {
        return (
          mapValue(b.cardStrength[3]) - mapValue(a.cardStrength[3])
        );
      }
      // Descending Order of Following Cards
      if (
        mapValue(b.cardStrength[4]) !== mapValue(a.cardStrength[4])
      ) {
        return (
          mapValue(b.cardStrength[4]) - mapValue(a.cardStrength[4])
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
  }

module.exports = declareWinner;