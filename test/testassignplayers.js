const pokerGame = require("../poker")

function findDuplicates(arr) {
    const seen = new Map();
    const duplicates = [];

    for (let obj of arr) {
        // Create a unique key for each object based on the properties that define duplicates
        const key = `${obj.id}-${obj.name}`;

        if (seen.has(key)) {
            // If the key has been seen before, it's a duplicate
            duplicates.push(obj);
        } else {
            // Otherwise, add the key to the seen map
            seen.set(key, obj);
        }
    }

    return duplicates;
}

for (i = 0; i < 20; i++){
    let currentList = pokerGame.fillPlayers(4);
    console.log(findDuplicates(currentList));
}
