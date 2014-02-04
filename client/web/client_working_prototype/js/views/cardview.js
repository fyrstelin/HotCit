/*global define*/
/*jslint nomen: true*/

define(function (require) {
	"use strict";

	var $ = require('jquery'),
		Mustache = require('mustache'),
        utils = require('utils'),
        getTemplate = utils.getTemplate;
    
    /* CLASS */
    return (function CardView() {
        var template = getTemplate('card');
        
        return function (owner, card) {
            var that = this;
            
            /* CONSTRUCTOR */
            function initialize() {
                that.elm = $(Mustache.render(template, card));
            }
            
            /* STATE CHANGE HANDLER */
            that.enableSelect = function (filter, callback) {
                if (filter(card)) {
                    that.elm.addClass('option');
                    that.elm.click(function () {
                        callback(owner, card);
                    });
                }
            };
            
            /* STATE CHANGE HANDLER */
            that.disableSelect = function () {
                that.elm.removeClass('option');
                that.elm.off(); // if more, use namespace   
            };
            
            that.notify = function () {
                // do nothing, static view    
            };
            
            that.render = function () {
                // do nothing, static view    
            };
            
            initialize();
        };
    }());
});