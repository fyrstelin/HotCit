define(["ServerDao"], function (ServerDao) {
	"use strict";
    
    var gameAPI = ServerDao.gameAPI;

    var logflag = false;
    function log(msg) { if(logflag) console.log(msg); }
    var dummy = function() {};

    // consider a controller, and a model instance?

    var GameModel = function(gameid, playerid){
        this.listeners = [];
        
        this.playerid = playerid;
        this.gameid = gameid;
        this.numPlayers = -1;
        this.Players = null;
        this.model = null;
        
        this.update();
        // TODO: hack...
        for(var idx = 0; idx < this.Players.length; idx++) {
            if(this.Players[idx].Username === this.playerid) {
                this.selectedPlayerId = idx;
                break;
            }
        }
        
        /*
        this.FaceUpCharacters;
        this.King;
        this.PlayerInTurn;
        this.Players;
        this.Round;
        this.Step;
        this.Turn;
        */
    };

    GameModel.prototype.register = function(listener) {
        log('REGISTER');
        this.listeners.push(listener)
        return this;
    };

    // TODO: much easier with playerids instead of names..
    GameModel.prototype.changed = function(model, options) {
        log('CHANGED');  
        this.model = model;
        this.Players = this.model.Players;
        this.numPlayers = this.Players.length;
        this.options = options;
        var that = this;
        
        this.listeners.forEach(function(list) {
            list.notify(that);
        });
        return this;        
    }
    GameModel.prototype.update = function() {
        log('UPDATE');
        var that = this;
        function error() { }
        function success(model) { 
            gameAPI.get.options(that.gameid, that.playerid, function(options) {
                that.changed(model, options)
            }, error);
        }
        gameAPI.get.game(this.gameid, this.playerid, success, error);
        return this;
    }
    GameModel.prototype.nextPlayer = function() {
        log('NEXT PLAYER');
        
        this.selectedPlayerId++;
        this.selectedPlayerId = (this.selectedPlayerId < this.numPlayers)? this.selectedPlayerId : 0 ;
        this.playerid = this.Players[this.selectedPlayerId].Username;
        this.update();
        console.log("next player", this.playerid);
        return this;
    }

    GameModel.prototype.handleSelectOption = function(option) {
        console.log('handleselectoption', option);
        actions[option['Type']](this, option, dummy, dummy);
        this.update();
        return this;
    }

    var takeActions = {
        'Take 2 gold': gameAPI.do.takeGold,
        'Draw 2 districts and discard one of them': gameAPI.do.draw,
    }

    // REQUIRED: HAND IS EMPTY!!
    var actions = {
        'EndTurn': function(model, option, suceess, error) { 
            gameAPI.do.endTurn(model.gameid, model.playerid, suceess, error); 
        },
        'UseAbility': function(model, option, suceess, error) {
            // TODO: move to separate view, possible adding a notifyOnSelect...?
            var contentElm = $('#myModal .modal-body');
            contentElm.html(JSON.stringify(option['Choices']))
            contentElm.append($("<br /><br />"));
            // move to/make 'ChoiceView'
            option['Choices'].forEach(function(choice) {
                var choiceElm = $("<img width=100 src='/resources/images/"+choice+"' />");
                contentElm.append(choiceElm); 
                choiceElm.click(function() {
                    contentElm.modal('hide');
                    // TODO: WHY SOURCE?
                    console.log('kill!');
                    gameAPI.do.ability(model.gameid, model.playerid, "assassin", choice, dummy, dummy);
                    gameAPI.do.ability(model.gameid, model.playerid, "thief", choice, dummy, dummy);
                    // should mark card, and first do action when button is clicked
                    // strange side effects occur when killing a player.. - requires restart..
                    // server is not very helpfull - should send log statements...
                    $('#myModal').modal('hide');
                    model.update();
                });
                
            });
            $('#myModal').modal();
        },
        'BuildDistrict': function(model, option, suceess, error) { 
            console.log('not implemented yet');
        }, 
        'TakeAction': function(model, option, suceess, error) { 
            takeActions[option['Message']](model.gameid, model.playerid, dummy, dummy);
        }, 
        'Select': function(model, option, suceess, error) {
            $('#myModal .modal-body').html(JSON.stringify(option['Choices']));
            $('#myModal').modal();
        },
    };
    
    return GameModel;
});
