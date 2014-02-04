/*global define*/

define(function (require) {
    "use strict";
    
    var Mustache, Views, $;
        
        
    Mustache = require('mustache');
    $ = require('jquery');
    
    function ScoreView(model) {
        var that = this;
        that.elm = $('<div class="ScoreView">');
        that.render = function () {
            var players = model.opponents.slice();
            players.push(model.my);
            players.sort(function (p1, p2) {
                return p1.score - p2.score;
            });
            players.forEach(function (p) {
                p.inTurn = p.username == model.playerInTurn;
                p.king = p.username == model.king;
            });
            that.elm.html(that.template(players));
        };
        
        // model.addListener(that.render);
    }
    
    ScoreView.prototype.template = Mustache.compile(Views.getTemplate("score"));
    
    return ScoreView;
});