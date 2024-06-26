const analyzeHand = require("../lib/analyzehand");

let handValue = analyzeHand([
    
    {
        "code": "AS",
        "image": "https://deckofcardsapi.com/static/img/KD.png",
        "images": {
        "svg": "https://deckofcardsapi.com/static/img/KD.svg",
        "png": "https://deckofcardsapi.com/static/img/KD.png"
        },
        "value": "ACE",
        "suit": "SPADES"
    },
    {
        "code": "AH",
        "image": "https://deckofcardsapi.com/static/img/KD.png",
        "images": {
        "svg": "https://deckofcardsapi.com/static/img/KD.svg",
        "png": "https://deckofcardsapi.com/static/img/KD.png"
        },
        "value": "ACE",
        "suit": "HEART"
     },
     {
        "code": "AC",
        "image": "https://deckofcardsapi.com/static/img/KD.png",
        "images": {
        "svg": "https://deckofcardsapi.com/static/img/KD.svg",
        "png": "https://deckofcardsapi.com/static/img/KD.png"
        },
        "value": "QUEEN",
        "suit": "CLUBS"
     },
     {
        "code": "AD",
        "image": "https://deckofcardsapi.com/static/img/KD.png",
        "images": {
        "svg": "https://deckofcardsapi.com/static/img/KD.svg",
        "png": "https://deckofcardsapi.com/static/img/KD.png"
        },
        "value": "ACE",
        "suit": "DIAMONDS"
     },
     {
        "code": "0S",
        "image": "https://deckofcardsapi.com/static/img/KD.png",
        "images": {
        "svg": "https://deckofcardsapi.com/static/img/KD.svg",
        "png": "https://deckofcardsapi.com/static/img/KD.png"
        },
        "value": "ACE",
        "suit": "SPADES"
     },
     {
        "code": "2H",
        "image": "https://deckofcardsapi.com/static/img/KD.png",
        "images": {
        "svg": "https://deckofcardsapi.com/static/img/KD.svg",
        "png": "https://deckofcardsapi.com/static/img/KD.png"
        },
        "value": "2",
        "suit": "HEART"
     },
     {
        "code": "7D",
        "image": "https://deckofcardsapi.com/static/img/KD.png",
        "images": {
        "svg": "https://deckofcardsapi.com/static/img/KD.svg",
        "png": "https://deckofcardsapi.com/static/img/KD.png"
        },
        "value": "7",
        "suit": "DIAMOND"
     }


]);

describe("Hand Value", () => {
   test('should results in a Four of a Kind of 8s and an A Kicker', () => {
     expect(handValue).toEqual(["Four of a Kind", 8, "A"]);
   });

});
