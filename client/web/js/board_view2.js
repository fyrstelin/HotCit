/*global define*/

define(function (require) {
	"use strict";
    
	var templates,
		$ = require('jquery');
    
    templates = $($.ajax({
        url: "templates.html",
        async: false
    }).responseText);
    
    function getTemplate(id) {
        return templates.find("#" + id).html();
    }
    
    return function BoardView(model, controller) {
        var that, template;
        that = this;
        template = getTemplate("board");
        
        function initialize() {
            that.elm = $(template);
            that.enabledGoldSelect = false;
            that.enabledDistrictSelect = false;
            that.enabledEndTurnSelect = false;
            that.takeGoldBtn = that.elm.find('button.gold');
            that.takeDistrictBtn = that.elm.find('button.districts');
            that.endTurnBtn = that.elm.find('button.endturn');
            
            that.options = $.extend({}, model.my.options); // Shallow copy
            that.notify(model);
            model.addListener(that.notify);
        }
        
        function _enableSelectGold(enable) {
            if (that.enabledGoldSelect === enable) {
                return;
            }
            
            if (enable) {
                that.takeGoldBtn
                .on("click.selectNS", controller.takeGold)
                .addClass('option');
            } else {
                that.takeGoldBtn
                .off("click.selectNS")
                .removeClass('option');
            }
            
            that.enabledGoldSelect = enable;
        }
        
        function _enableSelectDistrict(enable) {
            if (that.enabledDistrictSelect === enable) {
                return;
            }

            if (enable) {
                that.takeDistrictBtn
                .on('click.selectNS', controller.drawDistricts)
                .addClass('option');
            } else {
                that.takeDistrictBtn
                .off('click.selectNS')
                .removeClass('option');
            }
                       
            that.enabledDistrictSelect = enable;

        }
        
        function _enableSelectEndTurn (enable) {
            if (that.enabledEndTurnSelect === enable) {
                return;
            }
            
            if (enable) {
                that.endTurnBtn
                .on("click.selectNS", controller.endTurn)
                .addClass('option');
            } else {
                that.endTurnBtn
                .off("click.selectNS")
                .removeClass('option');
            }
            
            that.enabledEndTurnSelect = enable;
        }
        
        that._findFirstOccurrence = function (what) {
            var array, i, option;
            array = model.my.options;
            for (i = 0; i < array.length; i += 1) {
                option = array[i];
                if (option.Type === what) {
                    return option;
                }
            }
        };
            
        // backbone would handle this fine,
        // we need a more fine grained listener system like options changed..
        that.notify = function (update) {
            if (!update.my.options) {
                return; // no changes
            }
            
            if (that._findFirstOccurrence('TakeAction')) {
                _enableSelectGold(true);
                _enableSelectDistrict(true);
            } else {
                _enableSelectGold(false);
                _enableSelectDistrict(false);
            }
            
            if(that._findFirstOccurrence('EndTurn')) {
                _enableSelectEndTurn(true);
            } else {
                _enableSelectEndTurn(false);
            }
        };
        
        that.render = function () {
            // STATIC VIEW
            // do nothing
        };
        
        initialize();
    };
});