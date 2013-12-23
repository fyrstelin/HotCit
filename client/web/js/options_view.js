/*global define, console, $ */
/*jslint es5: true */
/*jslint nomen: true */
/*jshint multistr: true */

define(function (require) {
	"use strict";
    
    /* STATIC VARIABLES */
    var Mustache, Views, view_template, option_template;
    
    /* IMPORTS */
    Mustache = require('mustache');
    Views = require('views');
    
    /* TEMPLATES */
    view_template = Views.getTemplate("options");
    option_template = Views.getTemplate("option");
      
    return function OptionsView(model, controller, selectionView) {
        var that, noOptionsBtn, optionHandles;
        that = this;
        noOptionsBtn =  $(Mustache.render(option_template, {'Message': 'no options sir!', disabled: true}));
        
        function initialize() {
            // console.log("INIT: OPTIONSVIEW", model);
            that.elm = $(view_template);
            model.addListener(that.notify);
        }
        
        /* METHOD */
        that.render = function () {
            // clear container
            that.elm.empty();
            that._renderOptions();
  
        };
        
        /* METHOD */
        that.notify = function () {        
            that.render();
                       
            // auto select
            if(model.my.options.length === 1 && model.my.options[0].Type === 'Select') {
                that._optionSelect(model.my.options[0]);    
            }
        };

        
        /* EVENT HANDLER */
        that._handleSelect = function (option, choices) {
            selectionView.render(
                choices,
                controller.select,
                'Please select a card'
            );
        };
                
        that._handlePassivAbility = function() {
            // BUG: how is current/active character defined?
            if(model.my.characters.length > 1) throw new Error('multiple characters are not supported!');
            controller.useAbility(model.my.characters[0], undefined);
               
        };
    
        that._handleAbility = function(option) {
            switch(model.my.characters[0]) {
            case 'king': 
                that._handlePassivAbility(option);
                break;
            }
        };
        
        that._handleAction = function() {
            selectionView.render(
                ["takegold", "drawdistricts"],
                function(choice) {
                    switch(choice) {
                    case 'takegold': 
                        controller.takeGold();
                        break;
                            
                    case 'drawdistricts':
                        controller.drawDistricts();
                        break;
                            
                    default: 
                        throw new Error('option was not matched: ' + choice);
                    }       
                },
                'Please select an option'
            );      
        };
        
        /* EVENT HANDLER */
        that._optionSelect = function (option) {
            // console.log("EVENT: CLICK OPTION", option, optionHandles);
            //optionHandles[option.Type](option);
            switch(option.Type) {
                    
            case 'EndTurn': 
                controller.endTurn();
                break;
                    
            case 'TakeAction':
                that._handleAction(option);
                break;
                    
            // but model is not proberly updated 
            case 'BuildDistrict':
                selectionView.render(
                    option.Choices,
                    controller.buildDistrict,
                    'Please select a card'
                );    
                break;   
                    
            case 'Select': 
                selectionView.render(
                    option.Choices,
                    controller.select,
                    'Please select a card'
                );    
                break;
                    
            case 'UseAbility':
                that._handleAbility(option);
                break;
            
            default: 
                throw new Error('option was not matched: ' + option.Type);
            }
        };
    
        that._renderOptions = function () {
            var options;
    
            options = model.my.options;
            
            if (options.length === 0) {
                that.elm.append(noOptionsBtn);
            } else {
                options.forEach(that._renderOption);
            }
        };
        
        that._renderOption = function (option) {
            var element = $(Mustache.render(option_template, option));
    
            // add event listener
            element.click(function () { that._optionSelect(option); });
    
            // add element to the DOM
            that.elm.append(element);
        };
        
        initialize();
    };
});