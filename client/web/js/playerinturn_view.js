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

    /* TEMPLATES */
    // TODO: do we want these small templates to be in separate files?
    // I argued 'yes', last time.
    view_template = "\
        <ul class='nav nav-pills' class='options'></ul>\
    ";

    option_template = "\
        <li {{#isPlayerInTurn}}class='active'{{/isPlayerInTurn}}>\
            <a class='btn'>{{pid}}</a>\
        </li>\
    ";

    /* CONSTRUCTOR */
    function PlayerInTurnView(in_model) {
        console.log("INIT: PlayerInTurnView", in_model);
        that = this;
        
        model = in_model;
        that.elm = $(view_template);

        // this is annoying..
        playerids = [];
        playerids.push(model.my.username);
        model.opponents.forEach(function (player) {
            playerids.push(player.username);
        });

        selected = model.playerInTurn;
        model.addListener(that.notify);
    }

    /* METHOD */
    PlayerInTurnView.prototype.render = function () {
        console.log("RENDER PlayerInTurnView");

        // clear container
        that.elm.empty();

        // render all options
        that._renderOptions();

        return that;
    };
    
    /* METHOD */
    PlayerInTurnView.prototype.notify = function () {
        that.render();
        return that;
    };
    
    /* EVENT HANDLER */
    /* PRIVATE METHOD */
    PlayerInTurnView.prototype.optionSelect = function (choice) {
        selected = choice;
        
        // HACK: this should be delegated to a controller, but 
        //       it is not really something we want in production code
        model.overridePlayerInTurn(choice);
        return that;
    };

    /* PRIVATE METHOD */
    PlayerInTurnView.prototype._renderOption = function (option) {
        var element = $(Mustache.render(option_template,
                        { 'pid': option,
                          'isPlayerInTurn': model.playerInTurn === option }));

        /*
        if (selected === option) {
            element.addClass('active');
        }
        */

        // add event listener
        element.click(function () { that.optionSelect(option); });

        // add element to the DOM
        that.elm.append(element);

        return that;
    };

    /* PRIVATE METHOD */
    PlayerInTurnView.prototype._renderOptions = function _renderOptions() {
        playerids.forEach(that._renderOption);
        return that;
    };

    return PlayerInTurnView;
});