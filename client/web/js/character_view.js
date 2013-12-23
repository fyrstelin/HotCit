/*global define, console, $ */
/*jslint es5: true */
/*jslint nomen: true */
/*jshint multistr: true */

define(function (require) {
	"use strict";
    
    /* STATIC VARIABLES */
    var Mustache, template, icon_template, character_template;
    
    /* IMPORTS */
    Mustache = require('mustache');
    
    /* TEMPLATES */
    template = '\
        <div class="well" style="position:absolute;"></div>';
    
    character_template = '<img width=250 class="img-thumbnail" src="/resources/images/mdpi/{{card}}.png" />';
    
    icon_template = '\
        <button type="button" class="btn btn-{{buttonType}} btn-lg" style="position:absolute; right:10px; top:10px"\
            data-toggle="tooltip" data-placement="left" title="" data-original-title="Use Ability">\
            <span class="glyphicon glyphicon-{{iconType}}"></span>\
        </button>\
    ';
      
    return function CharacterView(model, controller, selectionView) {
        var that;
        that = this;
        
        function initialize() {
            // when I have choosen a character, it is not available in the model!
            that.elm = $(template);
            console.log('init', that.elm[0], template);
            model.addListener(that.notify);
        }
        
        that.notify = function() {
            that.render();   
        };       

        
        // conditional update? only when...?
        that.render = function() {    
            that.elm.empty();
            
            var characterCard, hasCharacter, hasAbilityAvailable;
            characterCard = model.my.characters[0] || 'facedown1';
            hasCharacter = !!model.my.characters[0];
            hasAbilityAvailable = model.my.options.some(function(option) { return option.Type === 'UseAbility';});
      
            console.log('RENDER', hasCharacter, model.my.characters, hasAbilityAvailable);
            
            that.characterElm = Mustache.render(character_template, {
                card: characterCard
            });   // problem, should be supplied by model
            that.elm.append(that.characterElm);
            
            if(hasAbilityAvailable) {
                that.iconElm = $(Mustache.render(icon_template, {
                    iconType: 'cog',
                    buttonType: 'warning'
                }));
                that.elm.append(that.iconElm);
                that.iconElm.tooltip();
                that.iconElm.click(function() {
                    controller.useAbility(characterCard); // TODO: handle other types of characters...  -> outfactor to selectionView controller
                });
            }
        };
        
        initialize();
    };
});