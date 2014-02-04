/*global define*/

define(function (require) {
    "use strict";
    
    var Mustache = require('mustache'),
        $ = require('jquery'),
        utils = require('utils'),
        getTemplate = utils.getTemplate;
    
    /* TEMPLATES */
    var template = getTemplate("scoreboard");
    var collection_template = Mustache.compile(getTemplate("scoreboard_collection"));
    
    function extractPlayerData(player, pid, king, playerInTurn) {
        return {
            isInTurn: player.username === playerInTurn,
            gold: player.gold,
            points: player.points,
            username: player.username,
            isKing: player.username === king,
            isMe: player.username === pid // not used, disabled
        };
    }
    
    function ScoreboardView(model, state, playercontroller) {
        /*
            Display a scoreboard with points, gold, who is king, 
            and who has the turn.
        */
        
        var that = this;
        function initialize() {
            that.elm = $(template);
            that.logoBtn = that.elm.find('.logo');
            that.collection = that.elm.find('.collection');
        }
        
        that.notify = function() {
            if(model.my.can('endturn')) {
                that.logoBtn
                .on('click.endturn', playercontroller.endTurn)
                .addClass('active');
            }
            else 
                that.logoBtn
                .off('click.endturn')
                .removeClass('active');
            
            var players = [];
            players.push(extractPlayerData(model.my, model.my.username, model.king, model.playerInTurn));
            model.opponents.forEach(function(player) {
                players.push(extractPlayerData(player, model.my.username, model.king, model.playerInTurn)); 
            });
            that.collection.html(collection_template(players));
            
        };
        
        that.render = that.notify;
        
        initialize();
    }
    
    return ScoreboardView;
});
    