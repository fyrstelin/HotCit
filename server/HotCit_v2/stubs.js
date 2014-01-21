/*jslint node: true, sloppy: true, eqeq: true*/
var Resources = require('./resources');

//The setup with afk, rko, mis and tugend
var TestSetup = {
    users: ["afk", "tugend", "rko", "mis"],
    characters: Resources.characters,
    districts: Resources.districts,
    startingGold: 4,
    discardCharacter: function (characters, faceup) {
        if (faceup) {
            return characters[0];
        } else {
            var res = characters.filter(function (c) { return c.number == 7; });
            return res[0];
        }
    }
};

module.exports = {
    Setup: TestSetup
};