/*global define */
/*jshint multistr: true */
/*jslint es5: true*/
/*jslint nomen: true*/

define(function (require) {
	"use strict";
    
    var $, template;
    
    $ = require('jquery');
    
    template = "\
        <div>\
            <button type='button' class='simulateBtn btn btn-success' style='width:250px'>\
                Simulate character selection\
            </button>\
            <br /><br />\
            <button type='button' class='resetBtn btn btn-danger' style='width:250px'>\
                Reset Game\
            </button>\
        </div>\
    ";
    
    return function SimulateView(simulator_controller) {
        var that = this;
        
        function initialize() {
            that.elm = $(template);
            that.resetBtn = that.elm.find('.resetBtn');
            that.simulateBtn = that.elm.find('.simulateBtn');
            
            that.resetBtn.click(function () {
                simulator_controller.skipTo('start');
            });
            
            that.simulateBtn.click(function () {
                simulator_controller.skipTo('character_select');
            });
        }
        
        that.render = function () {
            // static view
            // do nothing
        };
        
        initialize();
    };
});