function analyzeHand(cards) {
    // cards.sort((a, b) => {
    //     const valueMap = {
    //         'ACE': 14, 'KING': 13, 'QUEEN': 12, 'JACK': 11, '10': 10, 
    //         '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
    //     };
    //     return valueMap[a.code[0]] - valueMap[b.code[0]];
    // });
   
  
    function sortedCards (cards){
      return cards.slice().sort((a, b) => {
      const valueMap = {
        'ACE': 14, 'KING': 13, 'QUEEN': 12, 'JACK': 11, '10': 10, 
        '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
      };
      const aValue = valueMap[a.value] || parseInt(a.value);
      const bValue = valueMap[b.value] || parseInt(b.value);
      return bValue - aValue;
      });
    }
    function sortedCodes (cards){
      return cards.slice().sort((a, b) => {
      const valueMap = {
        'A': 14, 'K': 13, 'Q': 12, 'J': 11, '0': 10, 
        '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
      };
  
      const aValue = valueMap[a] || parseInt(a);
      const bValue = valueMap[b] || parseInt(b);
      return bValue - aValue;
      });
    }
  
    function areConsecutive(cards) {
        // Create a map to convert card values to numbers
        const valueMap = {
          "2": 2,
          "3": 3,
          "4": 4,
          "5": 5,
          "6": 6,
          "7": 7,
          "8": 8,
          "9": 9,
          "10": 10,
          "JACK": 11,
          "QUEEN": 12,
          "KING": 13,
          "ACE": 14
        };
      
        let values = cards.map(card => {
            let val = card.value;
            return valueMap[val];
          });
        
          // Sort the values
          values.sort((a, b) => a - b);
          //console.log("values", values)
        
          // Function to check if an array of 5 values is consecutive
          function isConsecutiveSubset(arr) {
            for (let i = 1; i < arr.length; i++) {
              if (arr[i] !== arr[i - 1] + 1) {
                return false;
              }
            }
            return true;
          }
        
          // Check all subsets of 5 cards
          for (let i = 0; i <= values.length - 5; i++) {
            if (isConsecutiveSubset(values.slice(i, i + 5))) {
                //console.log("subset:", values.slice(i, i + 5))
              return true;
            }
          }
          //console.log("returning false");
          return false;
        }
  
        function sameSuit(cards) {
            // Create an object to count the number of cards in each suit
            let suitCount = {};
          
            // Count the cards in each suit
            cards.forEach(card => {
              let suit = card.suit;
              if (!suitCount[suit]) {
                suitCount[suit] = 0;
              }
              suitCount[suit]++;
            });
          
            // Check if any suit has 5 or more cards
            for (let suit in suitCount) {
              if (suitCount[suit] >= 5) {
                return true;
              }
            }
          
            return false;
          }
  
    const handSize = cards.length;
    //console.log("handSize", handSize)
    const result = [];
  
    if (handSize >= 2) {
        if (sameSuit(cards)) {
            //console.log("Are the same:")
            if (handSize >= 5) {
            if (areConsecutive(cards)) {
                //console.log("hs", handSize)
                
                    result.push("Straight Flush");
                    result.push(9); // Value for Straight Flush
                    result.push(cards[4].code[0]); // Highest card value
                    result.push(cards[3].code[0]); // Second highest card value
                
             
            } else {
                //console.log("flush?")
                result.push("Flush");
                result.push(6); // Value for Flush
                result.push(cards[handSize - 1].code[0]); // Highest card value
                result.push(cards[handSize - 2].code[0]); // Second highest card value
            }
        }
        }
        if (areConsecutive(cards) && result.length === 0) {
            if (handSize >= 5) {
                result.push("Straight");
                result.push(5); // Value for Straight
                result.push(cards[4].code[0]); // Highest card value
                result.push(cards[3].code[0]); // Second highest card value
            }
        }
    }
    if (handSize >= 2 && result.length === 0) {
        const values = cards.map(card => card.code[0]);
        const valueCounts = {};
        values.forEach(value => {
            valueCounts[value] = (valueCounts[value] || 0) + 1;
        });
        const counts = Object.values(valueCounts);
        if (counts.includes(4)) {
            result.push("Four of a Kind");
            result.push(8); // Value for Four of a Kind
            result.push(cards.find(card => valueCounts[card.code[0]] === 4).code[0]); // Value of the four cards
            result.push(cards.find(card => valueCounts[card.code[0]] === 1).code[0]); // Next highest card value
        } else if (counts.includes(3) && counts.includes(2)) {
            result.push("Full House");
            result.push(7); // Value for Full House
            const threeValue = cards.find(card => valueCounts[card.code[0]] === 3).code[0];
            const twoValue = cards.find(card => valueCounts[card.code[0]] === 2).code[0];
            result.push(threeValue); // Value of the three cards
            result.push(twoValue); // Value of the two cards
        } else if (counts.includes(3)) {
            result.push("Three of a Kind");
            result.push(4); // Value for Three of a Kind
            const threeValue = cards.find(card => valueCounts[card.code[0]] === 3).code[0];
            result.push(threeValue); // Value of the three cards
            const remainingCards = cards.filter(card => card.code[0] !== threeValue);
            result.push(sortedCards(remainingCards)[0] ? sortedCards(remainingCards)[0].value : 5)
            result.push(sortedCards(remainingCards)[1] ? sortedCards(remainingCards)[1].value : 5)
        } else if (counts.filter(count => count === 2).length >= 2) {
            result.push("Two Pair");
            result.push(3); // Value for Two Pair
            const pairs = [];
            cards.forEach(card => {
                if (valueCounts[card.code[0]] === 2 && !pairs.includes(card.code[0])) {
                    pairs.push(card.code[0]);
                }
            });
  
            pairs.sort((a, b) => b - a); // Sort pairs in descending order
            result.push(sortedCodes(pairs)[0]); // Value of the higher pair
            result.push(sortedCodes(pairs)[1]); // Value of the lower pair
            const remainingCards = cards.filter(card => card.code[0] !== pairs[0] && card.code[0] !== pairs[1]);
            result.push(sortedCards(remainingCards)[0].value)
        } else if (counts.filter(count => count === 2).length === 1) {
            result.push("Pair");
            result.push(2); // Value for Pair
            const pairValue = cards.find(card => valueCounts[card.code[0]] === 2).code[0];
            result.push(pairValue); // Value of the pair
            const remainingCards = cards.filter(card => card.code[0] !== pairValue);
            result.push(sortedCards(remainingCards)[0] ? sortedCards(remainingCards)[0].value : 5)
            result.push(sortedCards(remainingCards)[1] ? sortedCards(remainingCards)[1].value : 5)
            result.push(sortedCards(remainingCards)[2] ? sortedCards(remainingCards)[2].value : 5)
        }
    }
  
    if (result.length === 0) {
        result.push("High Card");
        result.push(1); // Value for High Card
        result.push(sortedCards(cards)[0].value)
        result.push(sortedCards(cards)[1].value)
        result.push(sortedCards(cards)[2] ? sortedCards(cards)[2].value : 5)
        // result.push(cards[cards.length - 1].code[0]); // Highest card value
        // result.push(cards[cards.length - 2].code[0]); // Second highest card value
    }
  
    return result;
  }
  
  module.exports = analyzeHand;