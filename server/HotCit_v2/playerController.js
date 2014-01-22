/*jslint node: true, sloppy: true, vars: true, eqeq: true*/
require('array-sugar');
var constants = require('./constants.js');

function PlayerController() {
    var that = this;
    
    var options = [];
    
    function getCallback(err, type) {
        var o = options.findOne(function (o) { return o.type == type; });
        if (o) {
            return o.callback;
        } else {
            err("You do not have the option to select character");
            return function () {
                
            };
        }
    }
    
    that.selectCharacter = function (character, err) {
        getCallback(err, constants.options.SELECT_CHARACTER)(err, character);
    };
    
    that.takeGold = function (err) {
        getCallback(err, constants.options.TAKE_GOLD)(err);
    };
    
    that.drawDistricts = function (err) {
        getCallback(err, constants.options.DRAW_DISTRICTS)(err);
    };
}

module.exports = PlayerController;