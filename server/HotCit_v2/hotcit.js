/*jslint node: true, sloppy: true, vars: true, plusplus: true, eqeq: true*/
var async = require('async');
var constants = require('./constants');
var resources = require('./resources');
require('array-sugar');


function Player(username, controller) {
    var that = this;
    that.username = username;
    controller.username = username;
    that.hand = [];
    that.city = [];
    
    that.setCharacter = function (character) {
        that.character = character;
    };
    
    that.takeAction = controller.takeAction;
}


/**
 * setup:
 *  - users
 *      a list of users in this game. The ordering
 *      of the users defines the order which the
 *      users takes turn.
 * - characters
 *      a list of characters to use in this game
 *
 * - startingGold
 *      the amount of gold each player starts with
 *
 * - discardStrategy
 *      - discardCharacter(characters, faceup)
 *          return a character that should be discarded (faceup).
 *
 */
function Game(setup) {
    //That pattern
    var that = this;
    
    //Initial public fields
    that.faceUpCharacters = [];
    that.players = {};
    that.playerInTurn = undefined;
    
    //initials private fields
    var offset = 0;
    var numberOfPlayers;
    var playerOrder = [];
    
    //public fields from setup
    that.users = setup.users.copy();
    numberOfPlayers = that.users.length;
    
    //private fields from setup
    var characters = setup.characters.copy();
    var districts = setup.districts.copy();
    
    var discardCharacter = setup.discardCharacter;
    
    
    function createPlayer(username) {
        var p = new Player(username, new setup.Controller());
        p.gold = setup.startingGold;
        
        return p;
    }
    
    that.users.forEach(function (username) {
        that.players[username] = createPlayer(username);
    });
    
    
    
    function getTopDistrict() {
        var res = districts.first;
        if (res) {
            districts.shift();
            return res;
        } else {
            districts = setup.districts.copy();
            return getTopDistrict();
        }
    }
    
    
    //This isn't actually async, but uses a callback for consistency
    function removeCharacters(next) {
        console.log("Removing characters");
        
        //discard one character facedown
        var discardedCharacter = discardCharacter(characters, false);
        characters.splice(characters.indexOf(discardedCharacter), 1);
        
        var i;
        for (i = 0; i < 6 - numberOfPlayers; i++) { //discard one or two characters faceup
            discardedCharacter = discardCharacter(characters, true);
            that.faceUpCharacters.push(discardedCharacter.name);
            characters.remove(discardedCharacter);
            
        }
        
        next(null);
    }
    
    function chooseCharacters(next) {
        console.log("Choosing characters");
        
        //a async for loop over every player
        var i = 0;
        
        function everyPlayerHasSelectedACharacter() {
            return i === numberOfPlayers;
        }
        
        function letCurrentPlayerSelectCharacter(selectedCharacter) {
            var user = that.users[(i + offset) % numberOfPlayers];
            var player = that.players[user];
            
            function selectCharacter(name, err) {
                var character = characters.findOne(function (c) { return c.name == name; });
                if (character) {
                    characters.remove(character);
                    player.setCharacter(character);
                    playerOrder[character.number - 1] = player; //minus 1 to zero index array
                    i++;
                } else {
                    err(constants.messages.CANNOT_SELECT(character));
                }
                selectedCharacter(null);
            }
            
            player.takeAction([{
                type: constants.options.SELECT_CHARACTER,
                callback: selectCharacter,
                choices: characters.map(function (c) { return c.name; })
            }]);
        }
    
        async.until(everyPlayerHasSelectedACharacter, letCurrentPlayerSelectCharacter, next);
    }
    
    function playerTurns(nextStep) {
        console.log("Player turns");
        var i = 0,
            max = playerOrder.length;
        function everyPlayerHasTakenTheirTurns() {
            return i === max;
        }
        
        function letAPlayerTakeTurn(nextPlayer) {
            var player = playerOrder[i];
            i++;
            if (!player) { //skip characters that are not in use
                nextPlayer(null);
                return;
            }
            console.log("\t%s in turn", player.username);
            
            var ended = false;
            var actionTaken = false;
            var districtBuilt = false;
            var choices = [];
            
            function playerEndedHisTurn() {
                return ended;
            }
            
            function reactToOptions(newOptions) {
                function endTurn(err) {
                    if (ended) {
                        err(constants.messages.TURN_ALREADY_ENDED);
                        return;
                    }
                    ended = true;
                    newOptions(null);
                    player.takeAction(null);
                }
                
                function takeGold(err) {
                    if (actionTaken) {
                        err(constants.messages.ACTION_ALREADY_TAKEN);
                        return;
                    }
                    player.gold += 2;
                    actionTaken = true;
                    newOptions(null);
                }
                
                function drawDistricts(err) {
                    if (actionTaken) {
                        err(constants.messages.ACTION_ALREADY_TAKEN);
                        return;
                    }
                    var options = [],
                        c = 0;
                    for (c; c < 2; c++) {
                        options.push(getTopDistrict());
                    }
                    var amount = 1; //TODO architect
                    var selected = false;
                    
                    function selectedADistrict() {
                        return selected;
                    }
                    
                    function letPlayerSelectADistrict(done) {
                        player.takeAction([{
                            type: constants.options.SELECT_DISTRICTS,
                            message: constants.messages.SELET_DISTRICTS,
                            amount: amount,
                            choices: options.map(function (d) { return d.title; }),
                            callback: function (choosen, err) {
                                if (!Array.isArray(choosen)) {
                                    choosen = [choosen];
                                }
                                if (choosen.length === amount && choosen.every(function (d) {
                                        return options.some(function (o) { return o.title == d; });
                                    })) {
                                    console.log("### %s ###", choosen);
                                    selected = true;
                                    actionTaken = true;
                                    choosen.forEach(function (title) {
                                        player.hand.push(resources.findDistrictsByTitle(title));
                                    });
                                    done(null);
                                } else {
                                    err(constants.messages.BAD_CHOICE);
                                }
                            }
                        }]);
                    }
                    
                    async.until(selectedADistrict, letPlayerSelectADistrict, newOptions);
                }
                
                function buildDistrict(title, err) {
                    var district = player.hand.findOne(function (d) { return d.title == title; });
                    if (!district) {
                        err(constants.messages.DO_NOT_HAVE_DISTRICT_IN_HAND(title));
                        return;
                    }
                    if (player.gold < district.cost) {
                        err(constants.messages.NOT_ENOUGH_GOLD(title));
                        return;
                    }
                    player.hand.remove(district);
                    player.city.push(district);
                    districtBuilt = true;
                    newOptions();
                }
                
                var options = []; //TODO include character ability
                
                //you can always end your turn
                options.push({
                    type: constants.options.END_TURN,
                    message: constants.messages.END_YOUR_TURN,
                    callback: endTurn
                });
                
                if (!actionTaken) {
                    options.push({
                        type: constants.options.TAKE_GOLD,
                        message: "Take 2 gold", //TODO merchant
                        callback: takeGold
                    });
                    options.push({
                        type: constants.options.DRAW_DISTRICTS,
                        message: "Draw 2 districts and discard one of them", //TODO architect
                        callback: drawDistricts
                    });
                } else if (!districtBuilt) {
                    var choices = player.hand.filter(function (d) {
                            return d.price <= player.gold;
                        }).map(function (d) {
                            return d.title;
                        });
                    options.push({
                        type: constants.options.BUILD_DISTRICT,
                        message: "Build a district",
                        choices: choices,
                        callback: buildDistrict
                    });
                }
                
                player.takeAction(options);
            }
            
            async.until(playerEndedHisTurn, reactToOptions, nextPlayer);
        }
        
        async.until(everyPlayerHasTakenTheirTurns, letAPlayerTakeTurn, nextStep);
    }
    
    function endOfRound(next) {
        that.users.forEach(function (user) {
            var p = that.players[user];
            console.log("%s has %d gold and %d districts on his hand", p.username, p.gold, p.hand.length);
        });
        
        characters = setup.characters.copy();
        that.faceUpCharacters.clear();
        
        next(null);
    }
    
    
    that.gameLoop = function (next) {
        async.series([
            removeCharacters,
            chooseCharacters,
            playerTurns,
            endOfRound
        ], next);
    };
}

module.exports = {
    Game: Game
};