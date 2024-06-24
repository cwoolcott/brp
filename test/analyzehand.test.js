const analyzeHand = require("../lib/analyzehand");
const decisionValue = require("../lib/decisionvalue");
const {
    DECISION_RANGE
  } = require("../utils/constants");



let player = [];


describe("Analyze Hand Test", () => {
    
        player.push( 
            {
                name:"player 1",
                aggressionLevel: 5,
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
                aggressionLevel: 5,
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
                aggressionLevel: 5,
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
            
            let raise = decisionResult>DECISION_RANGE.RAISE;
            let call = decisionResult>DECISION_RANGE.CALL;

            test('Should Raise"', () => {
                expect(decisionResult>DECISION_RANGE.RAISE).toEqual(raise);
            })
            test('Should Not Raise"', () => {
                expect(decisionResult<DECISION_RANGE.RAISE).toEqual(!raise);
            })
            
            test('Should Call"', () => {
                expect(decisionResult>DECISION_RANGE.CALL).toEqual(call);
            })
            test('Should Not Call"', () => {
                expect(decisionResult<DECISION_RANGE.CALL).toEqual(!call);
            })

        }
    });






