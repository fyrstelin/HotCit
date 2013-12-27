/*global define, console*/
define(function (require) {
	"use strict";
    
	var $ = require('jquery'),
		Mustache = require('mustache'),
        CardView = require('./cardview'),
        utils = require('utils'),
        getTemplate = utils.getTemplate,
        OpponentView;
     
    // COLLECTION VIEW
    // PRIVATE CLASS
    OpponentView = (function () {
        var template = getTemplate("opponent");
        
        return function (player, model, state, controller) {
            var that, collection;
            that = this;
            
            /* CONSTRUCTOR */
            function initialize() {
                collection = [];
                
                that.elm = $(Mustache.render(template, player));
                that.cityElm = that.elm.find('.city');
                
                state.onSelectDistrictEnable(that._toggleSelect);
            }
            
            /* METHOD */
            that.render = function () {
                that.cityElm.empty();
                collection.length = 0;

                player.city.forEach(function (card) {
                    var view = new CardView(player.username, card, model, state, controller);
                    collection.push(view);
                    that.cityElm.append(view.elm);
                });
            };

            /* METHOD */
            that.notify = function () {
                that.render();
            };

            /* EVENT HANDLER */
            that._toggleSelect = function (event, data) {
                collection.forEach(function (view) {
                    view.enableSelect(data.filter, data.callback);
                });
            };
            
            initialize();
        };
    }());
    
    // COMPOSITE VIEW
    // CLASS
    return (function OpponentsView() {
        var template = "<div>";
        
        return function (model, state, controller) {
            var that, views;
            
            that = this;
            
            /* CONSTRUCTOR */
            function initialize() {
                that.elm = $(template);
                views = [];
            
                model.opponents.forEach(function (opponent) {
                    var view = new OpponentView(opponent, model, state, controller);
                    that.elm.append(view.elm);
                    views.push(view);
                });
            }
            
            /* METHOD */
            that.render = function () {
                views.forEach(function (view) {
                    view.render();
                });
            };
            
            /* METHOD */
            that.notify = function (update) {
                views.forEach(function (view) {
                    view.notify(update);
                });
            };
            
            initialize();
        };
    }());
});