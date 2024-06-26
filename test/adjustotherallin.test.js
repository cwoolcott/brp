
const adjustOtherAllIn = require("../lib/adjustotherallin");


  let game = {
    round: 13,
    bettingRoundRaises: 0,
    temp_check_total: 0,
    bettingRoundPlayers: [
      {
        id: '723c779b-76f5-4df6-b4c0-432e1be6fab3',
        name: 'Rogue Ronin',
        description: 'An enigmatic and unpredictable player, Rogue Ronin defies categorization with a unique blend of aggression, deception, and unorthodox strategies, making him a formidable opponent to face.',
        aggressionLevel: 7,
        npc: true,
        position: 0,
        money: 0,
        allIn: 25,
        cards: [Array],
        allInRound: 0,
        currentBet: 25,
        potContribution: 25,
        lastBetRound: 0,
        cardStrength: [Array],
        allInBet: 25
      },
      {
        id: '4ab40948-0bf0-488c-b7cd-a1a6ab3e6bae',
        name: 'Fancy Frank',
        description: 'Known for his flashy and flamboyant style, Fancy Frank incorporates elaborate bluffs, sophisticated moves, and fancy chip tricks into his gameplay.',
        aggressionLevel: 9,
        npc: true,
        position: 1,
        money: 325,
        allIn: false,
        cards: [Array],
        allInRound: 0,
        currentBet: 50,
        potContribution: 50,
        lastBetRound: 0,
        cardStrength: [Array]
      }
    ],
    gameTotal: 400,
    currentPosition: 1,
    bigBlind: 50,
    smallBlind: 25,
    pot: 75,
    currentBet: 50,
    firstRound: true,
    cardRound: 0,
    cards: [
      {
        code: 'QD',
        image: 'https://deckofcardsapi.com/static/img/QD.png',
        images: [Object],
        value: 'QUEEN',
        suit: 'DIAMONDS'
      },
      {
        code: '8H',
        image: 'https://deckofcardsapi.com/static/img/8H.png',
        images: [Object],
        value: '8',
        suit: 'HEARTS'
      },
      {
        code: '2D',
        image: 'https://deckofcardsapi.com/static/img/2D.png',
        images: [Object],
        value: '2',
        suit: 'DIAMONDS'
      },
      {
        code: 'AD',
        image: 'https://deckofcardsapi.com/static/img/aceDiamonds.png',
        images: [Object],
        value: 'ACE',
        suit: 'DIAMONDS'
      },
      {
        code: '0S',
        image: 'https://deckofcardsapi.com/static/img/0S.png',
        images: [Object],
        value: '10',
        suit: 'SPADES'
      }
    ]
  };

describe("All In Adjustment", () => {
    
  test('All in Original should be 25"', () => {
      expect(game.bettingRoundPlayers[0].allIn).toEqual(25);
  })

  test('All in after adjustment should be 50"', () => {
    game = adjustOtherAllIn(game);
    expect(game.bettingRoundPlayers[0].allIn).toEqual(50);
  })

  
});






