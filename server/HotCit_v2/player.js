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

function Player(username, controller) {
    var that = this;
    that.username = username;
    that.hand = [];
    /*
    that.selectCharacter = function (characters, callback) {
        setTimeout(function () {
            console.log("%s chooses %s", that.username, characters.last.name);
            callback(null, characters.last);
        }, 100);
    };
    
    that.selectDistricts = function (districts, amount, callback) {
        callback(null, districts.slice(0, amount));
    };
    */
    
    that.setCharacter = function (character) {
        that.character = character;
    };
    
    function dummyDone(err) {
        if (err !== null) {
            console.log(err);
        }
    }
    
    that.takeAction = function (options) {
        console.log("%s is given the following options", that.username);
        console.log(options.map(function (o) {
            return o.message || o.type;
        }));
        setTimeout(function () {
            var option;
            if (options.length == 1) {
                option = options[0];
                
                if (option.choices) {
                    if (option.amount) {
                        option.callback(option.choices.slice(0, option.amount), dummyDone);
                    } else {
                        option.callback(option.choices[0], dummyDone);
                    }
                } else {
                    option.callback(dummyDone);
                }
            } else {
                option = options.findOne(function (o) { return o.type == constants.options.TAKE_GOLD; });
                option = option || options.findOne(function (o) { return o.type == constants.options.END_TURN; });
                option.callback(dummyDone);
            }
            console.log("%s is took action %s", that.username, option.type);
            
        }, 100);
    };
}

module.exports = Player;