const analyzeHand = require("../analyzehand");

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
        "code": "KS",
        "image": "https://deckofcardsapi.com/static/img/KD.png",
        "images": {
        "svg": "https://deckofcardsapi.com/static/img/KD.svg",
        "png": "https://deckofcardsapi.com/static/img/KD.png"
        },
        "value": "KING",
        "suit": "SPADES"
     },
     {
        "code": "QS",
        "image": "https://deckofcardsapi.com/static/img/KD.png",
        "images": {
        "svg": "https://deckofcardsapi.com/static/img/KD.svg",
        "png": "https://deckofcardsapi.com/static/img/KD.png"
        },
        "value": "QUEEN",
        "suit": "SPADES"
     },
     {
        "code": "JS",
        "image": "https://deckofcardsapi.com/static/img/KD.png",
        "images": {
        "svg": "https://deckofcardsapi.com/static/img/KD.svg",
        "png": "https://deckofcardsapi.com/static/img/KD.png"
        },
        "value": "JACK",
        "suit": "SPADES"
     },
     {
        "code": "0S",
        "image": "https://deckofcardsapi.com/static/img/KD.png",
        "images": {
        "svg": "https://deckofcardsapi.com/static/img/KD.svg",
        "png": "https://deckofcardsapi.com/static/img/KD.png"
        },
        "value": "10",
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

console.log(handValue);