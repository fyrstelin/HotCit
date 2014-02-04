/*global define, console, $*/
/*jslint es5: true*/
/*jslint nomen: true*/
/*jshint multistr: true */

define(function (require) {
    "use strict";
    
    /* LOCAL VARIABLES */
    var that, Mustache, view_template, option_template, model, selected, playerids;
    
    /* IMPORTS */
    Mustache = require('mustache');

    var templates = $($.ajax({
        url: "templates.html",
        async: false
    }).responseText);
    
    function getTemplate(id) {
        return templates.find("#" + id).html();
    }
    /* TEMPLATES */
    // TODO: do we want these small templates to be in separate files?
    // I argued 'yes', last time.
    view_template = getTemplate("playerTurn");

    option_template = getTemplate("playerInTurn");

    /* CONSTRUCTOR */
    function PlayerInTurnView(in_model) {
        // console.log("INIT: PlayerInTurnView", in_model);
        that = this;
        
        model = in_model;
        that.elm = $(view_template);
        
        that.elm.addClass('playerinturn_view'); // TODO: add class identification on all views..

        // this is annoying..
        playerids = [];
        playerids.push(model.my.username);
        model.opponents.forEach(function (player) {
            playerids.push(player.username);
        });
        playerids.sort();

        selected = model.playerInTurn;
        // model.addListener(that.notify);
    }

    /* METHOD */
    PlayerInTurnView.prototype.render = function () {
        // console.log("RENDER PlayerInTurnView");

        // clear container
        that.elm.empty();

        // render all options
        that._renderPlayers();

        return that;
    };
    
    /* METHOD */
    PlayerInTurnView.prototype.notify = function () {
        that.render();
        return that;
    };

    /* PRIVATE METHOD */
    PlayerInTurnView.prototype._renderPlayer = function (option) {
        var element = $(Mustache.render(option_template,
                        { 'pid': option,
                          'isPlayerInTurn': model.playerInTurn === option }));

        // add element to the DOM
        that.elm.append(element);

        return that;
    };

    /* PRIVATE METHOD */
    PlayerInTurnView.prototype._renderPlayers = function () {
        playerids.forEach(that._renderPlayer);
        return that;
    };

    return PlayerInTurnView;
});