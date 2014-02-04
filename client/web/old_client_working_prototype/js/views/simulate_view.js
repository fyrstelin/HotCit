/*global define */
/*jshint multistr: true */
/*jslint es5: true*/
/*jslint nomen: true*/

define(function (require) {
	"use strict";
    
    var $, utils, getTemplate, template;
    
    $ = require('jquery');
    utils = require('utils');
    getTemplate = utils.getTemplate;
    
    template = getTemplate('simulate');
    
    // CLASS
    return function SimulateView(simulator_controller) {
        var that = this;
        
        /* CONSTRUCTOR */
        function initialize() {
            that.elm = $(template);
            // TODO: generify this, will be annoying when more is added
            that.resetBtn = that.elm.find('.reset_btn');
            that.skipCharacterSelectBtn = that.elm.find('.skip_character_select_btn');
            that.warlordTurnBtn = that.elm.find('.warlord_turn_btn');
            that.magicianTurnBtn = that.elm.find('.magician_turn_btn');
            
            that.resetBtn.click(function () {
                simulator_controller.skipTo('start');
            });
            
            that.skipCharacterSelectBtn.click(function () {
                simulator_controller.skipTo('character_select');
            });
        
            that.warlordTurnBtn.click(function () {
                simulator_controller.skipTo('warlord_turn');
            });
            
            that.magicianTurnBtn.click(function () {
                simulator_controller.skipTo('magician_turn');
            });
        }
        
        /* METHOD */
        that.render = function () {
            // static view
            // do nothing
        };
        
        initialize();
    };
});