define(function (require) {
    "use strict";
    var Mustache = require('mustache');
    /**
        TODO:
        A: cleanup options view
        B: add to existing setup
        C: outfactor general behavior to subclss
    */
    var view_template = "\
        <ul class='nav nav-pills' class='options'></ul>\
    ";

    var option_template = "\
        <li>\
            <a href='' onclick='return false;'>{{pid}}</button>\
        </li>\
    ";

    // TODO: use static methods some more..
    function PlayerInTurnView(model) {
        console.log("INIT: PlayerInTurnView", model)
        this.model = model;
        this.elm = $(view_template);
        var that = this;

        // this is annoying..
        this.players = [];
        this.players.push(this.model.my.username);
        this.model.opponents.forEach(function(player) {
            that.players.push(player.username);
        });

        this.selected = this.model.playerInTurn;
        this.model.addListener(this.notify.bind(this));
    };

    PlayerInTurnView.prototype.optionSelect = function(choice) {
        var that = this;
        this.selected = choice;
        console.log(this.model);
        this.model.overridePlayerInTurn(choice);
        return this;
    }

    PlayerInTurnView.prototype._renderOption = function(option) {
        var that = this;
        var element = $(Mustache.render(option_template, { 'pid': option }));

        if( this.selected === option)
            element.addClass('active');

        // add event listener
        element.click(function() { that.optionSelect(option) });

        // add element to the DOM
        this.elm.append(element);  

        return this;   
    }

    PlayerInTurnView.prototype._renderOptions = function() {
        var that = this;
        this.players.forEach(that._renderOption.bind(this));
        return this;
    }

    // TODO: invert
    PlayerInTurnView.prototype.render = function() {
        console.log("RENDER PlayerInTurnView");

        // clear container
        this.elm.empty();

        // render all options
        this._renderOptions();    

        return this;
    };
    
    PlayerInTurnView.prototype.notify = function() {
        this.render();
        return this;
    }

    return PlayerInTurnView;
});

/**
    TODO:
    [A]: cleanup and document
    [B]: prettify how elements and containers should work,
         i.e. views should not inject themselves
    [E]: introduce a test suite documenting the working functionality
*/