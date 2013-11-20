require.config({
    //By default load any module IDs from js/*
    baseUrl: 'js',
});
   
define(function(require) {
    var OptionsView = require("OptionsView"),
        Simulate    = require("Simulate"),
        ServerDao   = require("ServerDao"),
        GameModel   = require("GameModel"),
        ChangePlayerView = require("ChangePlayerView"),
        lobbyAPI    = ServerDao.lobbyAPI,
        gameAPI     = ServerDao.gameAPI;
    
    // $ is actually global... =(
    // why on earth must I prefix with js for the libraries??
    
    function print() { console.log(arguments) }
    function printBody() { console.log("body: ", arguments[0]) }
    function printOptions(body, playerid) { console.log("options: " + playerid + ":", arguments[0]); }
    
    function dummy() {  }
    // HACK fixme up...
    var error = function(gameid, playerid) {
        return function() {
            gameAPI.get.options(gameid, playerid, printOptions, error);
            console.error(arguments);
        }
    };
    var success = dummy;
    var playernames = [ "ada", "turing", "hopper", "wiener" ]; 
        
    var gameid = Simulate.lobby(playernames, success, error);
    Simulate.characterselect(gameid, success, error);    
    
    // FIRST TURN
    // why send source, seems unneccessary, maybe nice for debuging?
    // getHand(gameid, players[2], print, error(gameid, players[2]));
    // gameAPI.getOptions(gameid, players[2], printOptions, error(gameid, players[2]));

    // should be allowed! (and required action to do first)
    // gameAPI.do.ability(gameid, players[2], "assassin", "merchant", success, error(gameid, players[2]));
    // console.log("do actions");
    // gameAPI.do.takeGold(gameid, players[2], success, error(gameid, players[2]));
    // gameAPI.get.options(gameid, players[0], printOptions, error(gameid, players[0]));
    // gameAPI.get.options(gameid, players[1], printOptions, error(gameid, players[1]));
    // gameAPI.get.options(gameid, players[2], printOptions, error(gameid, players[2]));
    // gameAPI.get.options(gameid, players[3], printOptions, error(gameid, players[3]));
    
    // nobody has any cards in their hands!
    //gameAPI.get.hand(gameid, players[2], print, error(gameid, players[2]));

    //gameAPI.doBuild(gameid, players[2], "castle", success, error(gameid, players[2]));
    //gameAPI.do.endTurn(gameid, players[2], success, error(gameid, players[2]));
    //gameAPI.get.options(gameid, players[2], printOptions, error(gameid, players[2]));
    //gameAPI.get.hand(gameid, players[2], print, error(gameid, players[2]));
    
    
    // SETUP VIEW
    var model = new GameModel(gameid, 'ada')
        .update();
    var changePlayerView = new ChangePlayerView(model, "#changeplayerBtn")
       .render();
    var optionsView = new OptionsView(model, '#options', '#myModal', '.modal-body', '#options_view') 
        .render();
});