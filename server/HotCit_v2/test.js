/*jslint node: true*/

var hotCit = require('./hotCit');
var stubs = require('./stubs');

var game = new hotCit.Game(stubs.Setup);

game.gameLoop(function (err) {
    "use strict";
    console.log("Done! (error: %s)", err);
});