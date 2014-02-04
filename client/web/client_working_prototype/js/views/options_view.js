/*global define, console, $ */
/*jslint es5: true */
/*jslint nomen: true */
/*jshint multistr: true */

define(function (require) {
	"use strict";
    
    /* STATIC VARIABLES */
    var Mustache = require('mustache'),
        utils = require('utils'),
        getTemplate = utils.getTemplate,
        view_template,
        option_template;
        
    /* TEMPLATES */
    view_template = getTemplate("options");
    option_template = getTemplate("option");
      
    // CLASS
    return function OptionsView(model, controller) {
        var that, noOptionsBtn;
        
        that = this;
        noOptionsBtn =  $(Mustache.render(option_template,
                            {'Message': 'no options sir!', disabled: true}));
        
        /* CONSTRUCTOR */
        function initialize() {
            that.elm = $(view_template);
        }
        
        /* METHOD */
        that.render = function () {
            // clear container
            that.elm.empty();
            that._renderOptions();
            that._autoSelect();
        };
        
        /* METHOD */
        that.notify = function () {
            that.render();
        };

        /* EVENT HANDLER */
        that._autoSelect = function () {
            // AUTO SELECT: SHOULD BE MOVED TO A CONTROLLER!
            if (model.my.options.length === 1 &&
                    model.my.options[0].Type === 'Select') {
                that._optionSelect(model.my.options[0]);
            }
        };
        
        /* EVENT HANDLER */
        that._handleSelect = function (option, choices) {
            controller.promt(
                choices,
                controller.select,
                'Please select a card'
            );
        };
        
        /* DELEGATE */
        /* EVENT HANDLER */
        that._actionHandle = function (choice) {
            switch (choice) {
            case 'takegold':
                controller.takeGold();
                break;
                    
            case 'drawdistricts':
                controller.drawDistricts();
                break;
                    
            default:
                throw new Error('option was not matched: ' + choice);
            }
        };
        
        /* EVENT HANDLER */
        that._handleAction = function () {
            controller.promt(
                ["takegold", "drawdistricts"],
                that._actionHandle,
                'Please select an option'
            );
        };
        
        /* EVENT HANDLER */
        that._optionSelect = function (option) {
            //optionHandles[option.Type](option);
            switch (option.Type) {
                    
            case 'EndTurn':
                controller.endTurn();
                break;
                    
            case 'TakeAction':
                that._handleAction(option);
                break;
                    
            // but model is not proberly updated 
            case 'BuildDistrict':
                controller.promt(
                    option.Choices,
                    controller.buildDistrict,
                    'Please select a card'
                );
                break;
                    
            case 'Select':
                controller.promt(
                    option.Choices,
                    controller.select,
                    'Please select a card'
                );
                break;
                    
            case 'UseAbility':
                controller.useAbility(model.my.characters[0], option, model, true);
                break;
            
            default:
                throw new Error('option was not matched: ' + option.Type);
            }
        };
    
        /* DELEGATE */
        that._renderOptions = function () {
            var options;
    
            options = model.my.options;
            
            if (options.length === 0) {
                that.elm.append(noOptionsBtn);
            } else {
                options.forEach(that._renderOption);
            }
        };
        
        /* DELEGATE */
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