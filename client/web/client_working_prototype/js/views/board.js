/*global define*/
/*jslint nomen: true*/

define(function (require) {
	"use strict";

    var $ = require('jquery'),
        utils = require('utils'),
        getTemplate = utils.getTemplate,
        containsOptionOfType = utils.containsOptionOfType;
    
    /* STATIC METHOD */
    function _disableButton(btnElm) {
        btnElm
            .off("click")
            .removeClass('option');
    }
    
    /* STATIC METHOD */
    function _enableButton(btnElm, clickhandler) {
        btnElm
            .on("click", clickhandler)
            .addClass('option');
    }
    
    /* CLASS */
    return function BoardView(state, model, controller) {
        var that, template, takeActionFlag, endTurnFlag;
        
        that = this;
        template = getTemplate("board");
        
        /* CONSTRUCTOR */
        function initialize() {
            that.elm = $(template);

            takeActionFlag = false;
            endTurnFlag = false;
            
            that.takeGoldBtn = that.elm.find('button.gold');
            that.takeDistrictBtn = that.elm.find('button.districts');
            that.endTurnBtn = that.elm.find('button.endturn');
            
            that.render(model);
        }
        
        /* METHOD */
        that.notify = function (update) {
            // ONLY UPDATE EVENT HANDLERS IF NECCESSARY
            if (update.my.options || takeActionFlag || endTurnFlag) {
                that.render(update);
            }
        };
        
        /* METHOD */
        that.render = function () {
            var options = model.my.options;
            that._toggleAction(options);
            that._toggleEndTurn(options);
        };
        
            
        /* STATE CHANGE HANDLER */
        that._toggleAction = function (options) {
            var enable = containsOptionOfType(options, 'TakeAction');
            
            if (!takeActionFlag && enable) {
                _enableButton(that.takeGoldBtn, controller.takeGold);
                _enableButton(that.takeDistrictBtn, controller.drawDistricts);
                takeActionFlag = true;
            } else if (takeActionFlag && !enable) {
                _disableButton(that.takeGoldBtn);
                _disableButton(that.takeDistrictBtn);
                takeActionFlag = false;
            }
        };
        
        /* STATE CHANGE HANDLER */
        that._toggleEndTurn = function (options) {
            var enable = containsOptionOfType(options, 'EndTurn');
            
            if (!endTurnFlag && enable) {
                _enableButton(that.endTurnBtn, controller.endTurn);
                endTurnFlag = true;
            } else if (endTurnFlag && !enable) {
                _disableButton(that.endTurnBtn);
                endTurnFlag = false;
            }
        };
        
        initialize();
    };
});