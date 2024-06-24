const readHand = require("../lib/readhand");

const player = {
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

describe("Read Hand", () => {
   test('String should include the word Straight', () => {
     expect(readHand(player)).toContain('Straight');
   });
   test("Should Error with No Valid Cards Sent", () => {
      const cb = () => {
         readHand({})
      }
      expect(cb).toThrow("Read Hand Issue");
    });

});
