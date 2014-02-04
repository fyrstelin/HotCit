/*global define, console, $ */
/*jslint es5: true */
/*jslint nomen: true */
/*jshint multistr: true */

define(function (require) {
	"use strict";
    
    /* STATIC VARIABLES */
    var Mustache, template, icon_template,
        character_template, 
        utils = require('utils'),
        getTemplate = utils.getTemplate;
        
    /* IMPORTS */
    Mustache = require('mustache');
    utils = require('utils');
    
    /* TEMPLATES */ // TODO: move to sass
    // YES, YES, I SHOULD MOVE THIS TO TEMPLATES, BUT NEED TO REFACTOR FIRST!
    template = getTemplate('character'); // TODO: extend bootstrap directly in sass
    character_template = getTemplate('character_card');
    icon_template = getTemplate('character_view_ability_btn');
      
    return function CharacterView(model, controller) {
        var that = this;
        
        /* CONSTRUCTOR */
        function initialize() {
            // when I have choosen a character, it is not available in the model!
            that.elm = $(template);
            that.goldCountElm = that.elm.find('.goldcount');
            that.pointCountElm = that.elm.find('.pointcount');
            that.characterElm = that.elm.find('.character');
            that.abilityBtns = that.elm.find('.abilityBtns');
        }
        
        /* METHOD */
        that.notify = function () {
            // consider conditional render
            that.render();
        };

        /* METHOD */
        that.render = function () {
            var characterCard, hasCharacter;
            
            // read state from model
            characterCard = model.my.characters[0] || 'facedown1';
            hasCharacter = !!model.my.characters[0];
              
            that._renderCharacter(characterCard);
            that._renderGoldCount(model.my.gold);
            that._renderPointCount(model.my.points);
            that._renderAbilityButtons(characterCard, model.my.options);
        };
        
        /* DELEGATE METHOD */
        that._renderCharacter = function (cardType) {
            // render character card
            var body = Mustache.render(character_template, cardType);
            that.characterElm.html(body);
        };

        /* DELEGATE METHOD */
        that._renderGoldCount = function(gold) {
            that.goldCountElm.html(gold);      
        };
        
        that._renderPointCount = function(points) {
            that.pointCountElm.html(points);      
        };
        
        /* DELEGATE METHOD */
        that._renderAbilityButtons  = function (character) {
            // currently allow two abilities, maybe it should be only one?
            that.abilityBtns.empty();
            
            model.my.options.forEach(function (option) {
                if (option.Type === 'UseAbility') {
                    var iconElm = $(Mustache.render(icon_template, {
                        iconType: 'cog',
                        buttonType: 'success',
                        description: option.Message
                    }));
                   
                    that.abilityBtns.append(iconElm);
                    iconElm.tooltip();
                    iconElm.click(function () {
                        controller.useAbility(character, option, model, false);
                    });     
                }
            });
        };
        
        initialize();
    };
});