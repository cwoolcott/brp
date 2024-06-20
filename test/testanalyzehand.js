const analyzeHand = require("../analyzehand");
const {decisionValue} = require("../poker");
const {
    DECISION_RANGE
  } = require("../constants");

let player = [];
player.push( 
    {
        name:"player 1",
        aggressionLevel: 1,
        cards:[
        {
            "code": "JS",
            "image": "https://deckofcardsapi.com/static/img/JS.png",
            "images": {
            "svg": "https://deckofcardsapi.com/static/img/JS.svg",
            "png": "https://deckofcardsapi.com/static/img/JS.png"
            },
            "value": "JACK",
            "suit": "SPADES"
        },
        {
            "code": "JH",
            "image": "https://deckofcardsapi.com/static/img/JH.png",
            "images": {
            "svg": "https://deckofcardsapi.com/static/img/JH.svg",
            "png": "https://deckofcardsapi.com/static/img/JH.png"
            },
        "value": "JACK",
        "suit": "HEARTS"
        }
    ]
});

player.push( 
    {
        name:"player 2",
        aggressionLevel: 1,
        cards:[
        {
            "code": "5S",
            "image": "https://deckofcardsapi.com/static/img/JS.png",
            "images": {
            "svg": "https://deckofcardsapi.com/static/img/JS.svg",
            "png": "https://deckofcardsapi.com/static/img/JS.png"
            },
            "value": "5",
            "suit": "SPADES"
        },
        {
            "code": "JH",
            "image": "https://deckofcardsapi.com/static/img/JH.png",
            "images": {
            "svg": "https://deckofcardsapi.com/static/img/JH.svg",
            "png": "https://deckofcardsapi.com/static/img/JH.png"
            },
            "value": "JACK",
            "suit": "HEARTS"
        }
    ]
});

player.push( 
    {
        name:"player 3",
        aggressionLevel: 9,
        cards:[
        {
            "code": "5S",
            "image": "https://deckofcardsapi.com/static/img/JS.png",
            "images": {
            "svg": "https://deckofcardsapi.com/static/img/JS.svg",
            "png": "https://deckofcardsapi.com/static/img/JS.png"
            },
            "value": "5",
            "suit": "SPADES"
        },
        {
            "code": "7H",
            "image": "https://deckofcardsapi.com/static/img/JH.png",
            "images": {
            "svg": "https://deckofcardsapi.com/static/img/JH.svg",
            "png": "https://deckofcardsapi.com/static/img/JH.png"
            },
            "value": "7",
            "suit": "HEARTS"
        }
    ]
});

for (let i = 0; i < player.length; i++){
    let handValue = analyzeHand(player[i].cards)[1];

    let decisionResult = decisionValue(
        player[i].cards,
        handValue,
        player[i].aggressionLevel,
        0
      );
    
    console.log("name:", player[i].name)
    console.log("decisionResult", decisionResult)
    if (decisionResult>DECISION_RANGE.RAISE){
        console.log("Raise");
    }
    else if (decisionResult>DECISION_RANGE.CALL){
        console.log("Call");
    }
    else{
        console.log("Check/Fold");
    }
}


