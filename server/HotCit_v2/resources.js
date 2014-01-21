/*jslint node: true, sloppy: true, eqeq: true*/
var fs = require('fs');
require('array-sugar');

var characters, districts;

try {
    characters = fs.readFileSync("resources/characters.json");
    characters = JSON.parse(characters);
} catch (err) {
    console.log("FAILED LOADING CHARACTERS");
    process.exit();
}

try {
    districts = fs.readFileSync("resources/districts.json");
    districts = JSON.parse(districts);
} catch (err) {
    console.log("FAILED LOADING districts");
    process.exit();
}

module.exports = {
    characters: characters,
    findCharacterByName: function (name) {
        return characters.findOne(function (c) { return c.name == name; });
    },
    
    districts: districts,
    findDistrictsByTitle: function (title) {
        return districts.findOne(function (d) { return d.title == title; });
    }
};
