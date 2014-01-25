/*jslint node: true, sloppy: true, eqeq: true*/
var Resources = require('./resources');
var constants = require('./constants');
require('array-sugar');

var hack = "dlkgjdkgjsdlgkj";

function TestController() {
    var that = this;
    
    that.takeAction = function (options) {
        if (options === null) {
            return;
        }
        options = options.copy();
        function dummyDone(option) {
            return function (err) {
                if (err !== null) {
                    if (err !== hack) {
                        console.error("\t\t\t######## %s ##########", err);
                    }
                    options.remove(option);
                    that.takeAction(options);
                }
            };
        }
        
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
                        option.callback(option.choices.slice(0, option.amount), dummyDone(option));
                    } else {
                        option.callback(option.choices[0], dummyDone(option));
                    }
                } else {
                    option.callback(dummyDone(option));
                }
            } else {
                if (Math.random() < 0.5) {
                    option = options.findOne(function (o) { return o.type == constants.options.TAKE_GOLD; });
                } else {
                    option = options.findOne(function (o) { return o.type == constants.options.DRAW_DISTRICTS; });
                }
                
                option = option || options.findOne(function (o) { return o.type == constants.options.BUILD_DISTRICT; });
                option = option || options.findOne(function (o) { return o.type == constants.options.END_TURN; });
                
                if (option.choices) {
                    if (option.choices.length === 0) {
                        dummyDone(option)(hack);
                    } else {
                        option.callback(option.choices[0], dummyDone(option));
                    }
                } else {
                    option.callback(dummyDone(option));
                }
            }
            console.log("%s took action %s", that.username, option.type);
            
        }, 100);
    };
    
}

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
    },
    Controller: TestController
};

module.exports = {
    Setup: TestSetup
};