function getOptionsOfPlayerInTurn(model) {
    console.log(model);
    if( model.my.username === model.playerInTurn)
        return model.my.options;
    else return [];
}

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
        <ul class='nav nav-pills nav-stacked' class='options'></ul>\
    ";

    var option_template = "\
        <li>\
            <button type='button' class='btn btn-primary'>\
                {{Message}}\
            </button>\
        </li>\
    ";

    function OptionsView(model, controllers, selectionView) {
        console.log("INIT: OPTIONSVIEW", model)

        // this.gameid = model.gameid;
        this.model = model;
        this.controllers = controllers;
        this.me_controller = controllers[this.model.my.username];
        this.model.addListener(this.notify.bind(this));
        this.elm = $(view_template);
        this.selectionView = selectionView;
    };

    OptionsView.prototype.select = function(choice) {
        if( choice !== "_CANCEL") {
            console.log("SELECTED: ", choice);
            this.me_controller.select(choice);
        }

        return this;
    }

    OptionsView.prototype.optionSelect = function(option) {
        // console.log("EVENT: CLICK OPTION", option);
        var that = this;

        this.selectionView.render(
            option.Choices, this.select.bind(this), 'Please select a card');
       
        return this;
    }; 

    OptionsView.prototype._renderOption = function(option) {
        var that = this;
        var element = $(Mustache.render(option_template, option));

        // add event listener
        element.click(function() { that.optionSelect(option) });

        // add element to the DOM
        this.elm.append(element);  

        return this;   
    }

    OptionsView.prototype._renderOptions = function() {
        var options = getOptionsOfPlayerInTurn(this.model);
        var that = this;

        if( options.length === 0) {
            var element = $(Mustache.render(
                option_template, {'Message': 'no options sir!'}));
            element.find('.btn').attr('disabled', 'disabled');
            this.elm.append(element);
        } else {
            options.forEach(this._renderOption.bind(this));
        }

        return this;
    }

    // TODO: invert
    OptionsView.prototype.render = function() {
        console.log("RENDER OPTIONSVIEW");

        var that = this;

        // clear container
        this.elm.empty();

        // render all options
        this._renderOptions();    

        return this;
    };
    
    OptionsView.prototype.notify = function() {
        this.render();
        return this;
    }

    return OptionsView;
});

/**
    TODO:
    [A]: cleanup
    [B]: prettify how elements and containers should work,
         i.e. views should not inject themselves
    [C]: show playerinturn
    [D]: state pattern for changing players?
    [E]: introduce a test suite documenting the working functionality
*/