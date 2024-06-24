const readHand = require("../lib/readhand");

const player1 = {
   id: '35005f48-40da-489a-a00d-dc77856ae5c3',
   name: 'Aggro Alex',
   description: 'A relentless aggressor at the table, Aggro Alex constantly applies pressure to opponents with frequent raises and aggressive betting, often forcing them to fold.',
   aggressionLevel: 9,
   npc: true,
   position: 0,
   money: 600,
   allIn: false,
   cards: [
     {
       code: '2C',
       image: 'https://deckofcardsapi.com/static/img/2C.png',
       images: [Object],
       value: '2',
       suit: 'CLUBS'
     },
     {
       code: '6C',
       image: 'https://deckofcardsapi.com/static/img/6C.png',
       images: [Object],
       value: '6',
       suit: 'CLUBS'
     },
     {
       code: '3C',
       image: 'https://deckofcardsapi.com/static/img/3C.png',
       images: [Object],
       value: '3',
       suit: 'CLUBS'
     },
     {
       code: '5D',
       image: 'https://deckofcardsapi.com/static/img/5D.png',
       images: [Object],
       value: '5',
       suit: 'DIAMONDS'
     },
     {
       code: '4D',
       image: 'https://deckofcardsapi.com/static/img/4D.png',
       images: [Object],
       value: '4',
       suit: 'DIAMONDS'
     },
     {
       code: '7D',
       image: 'https://deckofcardsapi.com/static/img/7D.png',
       images: [Object],
       value: '7',
       suit: 'DIAMONDS'
     },
     {
       code: 'AD',
       image: 'https://deckofcardsapi.com/static/img/aceDiamonds.png',
       images: [Object],
       value: 'ACE',
       suit: 'DIAMONDS'
     }
   ],
   allInRound: 0,
   currentBet: 0,
   potContribution: 0,
   lastBetRound: 3,
   cardStrength: [ 'Straight', 5, '4', '5', undefined ],
   allInBet: 75
 };

 const player2 = {
   id: '723c779b-76f5-4df6-b4c0-432e1be6fab3',
   name: 'Rogue Ronin',
   description: 'An enigmatic and unpredictable player, Rogue Ronin defies categorization with a unique blend of aggression, deception, and unorthodox strategies, making him a formidable opponent to face.',
   aggressionLevel: 7,
   npc: true,
   position: 0,
   money: 600,
   allIn: false,
   cards: [
     {
       code: '5D',
       image: 'https://deckofcardsapi.com/static/img/5D.png',
       images: [Object],
       value: '5',
       suit: 'DIAMONDS'
     },
     {
       code: '5C',
       image: 'https://deckofcardsapi.com/static/img/5C.png',
       images: [Object],
       value: '5',
       suit: 'CLUBS'
     },
     {
       code: 'JD',
       image: 'https://deckofcardsapi.com/static/img/JD.png',
       images: [Object],
       value: 'JACK',
       suit: 'DIAMONDS'
     },
     {
       code: '7C',
       image: 'https://deckofcardsapi.com/static/img/7C.png',
       images: [Object],
       value: '7',
       suit: 'CLUBS'
     },
     {
       code: 'JS',
       image: 'https://deckofcardsapi.com/static/img/JS.png',
       images: [Object],
       value: 'JACK',
       suit: 'SPADES'
     },
     {
       code: '9H',
       image: 'https://deckofcardsapi.com/static/img/9H.png',
       images: [Object],
       value: '9',
       suit: 'HEARTS'
     },
     {
       code: '5S',
       image: 'https://deckofcardsapi.com/static/img/5S.png',
       images: [Object],
       value: '5',
       suit: 'SPADES'
     }
   ],
   allInRound: 0,
   currentBet: 0,
   potContribution: 0,
   lastBetRound: 3,
   cardStrength: [ 'Full House', 7, '5', 'Jack', undefined ],
   allInBet: 25
 };

describe("Read Hand", () => {
   test('String should include the word Straight', () => {
     expect(readHand(player1)).toContain('Straight');
   });
   test('String should include the word Full Hourse', () => {
      expect(readHand(player2)).toContain('Full House');
    });
   test("Should Error with No Valid Cards Sent", () => {
      const cb = () => {
         readHand({})
      }
      expect(cb).toThrow("Read Hand Issue");
    });

});
