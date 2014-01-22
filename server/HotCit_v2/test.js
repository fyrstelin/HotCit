/*jslint node: true*/

var hotCit = require('./hotCit');
var stubs = require('./stubs');
var async = require('async');

var game = new hotCit.Game(stubs.Setup);

async.forever(game.gameLoop, function (err) {
    "use strict";
    console.log("Done! (error: %s)", err);
});