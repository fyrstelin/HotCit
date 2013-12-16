define(function (require) {
	"use strict";
    var Mustache = require('mustache'),
        SelectView = require('selection_view');

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

    function OptionsView(model, controllers, containerid) {
        console.log("INIT: OPTIONSVIEW", model)

        // this.gameid = model.gameid;
        this.model = model;
        this.controllers = controllers;
        this.me_controller = controllers[this.model.my.username];
        this.model.addListener(this.notify.bind(this));
        this.containerid = containerid; // '#options'
        this.elm = $(this.containerid);

        this.selectview = new SelectView();
    };

    OptionsView.prototype.optionSelect = function(option) {
        // console.log("EVENT: CLICK OPTION", option);
        var that = this;
        this.selectview.render(option.Choices, function(choice) {
            if( choice !== "_CANCEL") {
                console.log("SELECTED: ", choice);
                that.me_controller.select(choice);
            }
        });
        return this;
    }; 

    // TODO: invert
    OptionsView.prototype.render = function() {
        console.log("RENDER OPTIONSVIEW");

        var that = this;

        // clear container
        var container = $(view_template);

        // render all options
        var options = this.model.my.options;
        options.forEach(function(option) {
            var element = $(Mustache.render(option_template, option));

            // add event listener
            element.click(function() { that.optionSelect(option) }.bind(that));

            // add element to the DOM
            container.append(element);     
        });

        if( options.length === 0) 
            container.append('no options sir!')

        this.elm.html(container);
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