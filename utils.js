const utils = {
    generateUUID: function() {
    let dt = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (dt + Math.random()*16)%16 | 0;
      dt = Math.floor(dt/16);
      return (c === 'x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
  },
  areValuesInArraySame(array, key) {
    if (array.length === 0) return true; // If the array is empty, consider rounds to be the same

    // Take the round value of the first element as reference
    const referenceRound = array[0][key];

    // Check if all elements have the same round value as the reference
    for (let i = 1; i < array.length; i++) {
      if (array[i][key] !== referenceRound) {
        return false; // Found a different round value
      }
    }

    return true; // All round values are the same
  },
  nameCards: (value, suit) => {
    let prefix;
    if (value === "ACE" || value == "8") {
      prefix = "an";
    } else {
      prefix = "a";
    }
    const displayCards = prefix + " " + value + " of " + suit;
    return displayCards;
  },
};

module.exports = utils;