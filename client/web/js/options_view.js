/*global define, console, $ */
/*jslint es5: true */
/*jslint nomen: true */
/*jshint multistr: true */

define(function (require) {
	"use strict";
    
    /* LOCAL VARIABLES */
    var that, Mustache, view_template, 
        option_template, model, controllers, selectionView;
    
    /* IMPORTS */
    Mustache = require('mustache');
    /**
        TODO:
        outfactor general behavior to subclss
    */
    
    /* TEMPLATES */
    // TODO: do we want these small templates to be in separate files?
    // I argued 'yes', last time.
    view_template = "\
        <ul class='nav nav-pills nav-stacked' class='options'></ul>\
    ";

    option_template = "\
        <li>\
            <button type='button' class='btn btn-primary'>\
                {{Message}}\
            </button>\
        </li>\
    ";
      
     /* CONSTRUCTOR */
    function OptionsView(in_model, in_controllers, in_selectionView) {
        console.log("INIT: OPTIONSVIEW", model);

        that = this;
        
        model = in_model;
        controllers = in_controllers;
        model.addListener(this.notify);
        selectionView = in_selectionView;
                
        this.elm = $(view_template);
    }
    
    /* METHOD */
    OptionsView.prototype.render = function (model) {
        console.log("RENDER OPTIONSVIEW", model);
        
        // clear container
        that.elm.empty();

        // render all options
        that._renderOptions();

        return that;
    };
    
    /* METHOD */
    OptionsView.prototype.notify = function () {
        that.render();
        return that;
    };

    /* EVENT HANDLER */
    /* PRIVATE METHOD */
    OptionsView.prototype.select = function (choice) {
        // todo: outfactor events to a 'enum' like structure?
        if (choice !== "_CANCEL") {
            console.log("SELECTED: ", choice);
            controllers[model.playerInTurn].select(choice);
        }

        return that;
    };

    /* EVENT HANDLER */
    /* PRIVATE METHOD */
    OptionsView.prototype.optionSelect = function (option) {
        // console.log("EVENT: CLICK OPTION", option);
        selectionView.render(option.Choices,
             that.select, 'Please select a card');
       
        return that;
    };

    /* PRIVATE METHOD */
    OptionsView.prototype._renderOption = function (option) {
        var element = $(Mustache.render(option_template, option));

        // add event listener
        element.click(function () { that.optionSelect(option); });

        // add element to the DOM
        that.elm.append(element);

        return this;
    };

    /* PRIVATE METHOD */
    OptionsView.prototype._renderOptions = function () {
        var options, element;

        options = (model.my.username === model.playerInTurn) ?
                   model.my.options : [];
        
        if (options.length === 0) {
            element = $(Mustache.render(option_template, {'Message': 'no options sir!'}));
            element.find('.btn').attr('disabled', 'disabled');
            that.elm.append(element);
        } else {
            options.forEach(that._renderOption);
        }

        return this;
    };

    return OptionsView;
});