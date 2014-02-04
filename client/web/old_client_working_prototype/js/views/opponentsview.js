/*global define, console*/
define(function (require) {
	"use strict";
    
	var $ = require('jquery'),
		Mustache = require('mustache'),
        CardView = require('./cardview'),
        utils = require('utils'),
        getTemplate = utils.getTemplate,
        OpponentView;
    
    // TODO: refactor, Mads
    var opponent_template = getTemplate('opponent');
    //var city_template = getTemplate('city'); //"{{#city}}<img class='card' src='/resources/images/mdpi/{{.}}.png' />{{/city}}";
    var hand_template = getTemplate('hand'); // "{{#hand}}<img class='card' src='/resources/images/mdpi/{{.}}.png' data-card='{{.}}' />{{/hand}}";
    var stats_template = getTemplate('stats'); 
    var characters_template = getTemplate('opponent_characters');
    console.log(stats_template);
    // COLLECTION VIEW
    // PRIVATE CLASS
    OpponentView = (function () {
        var template = opponent_template;
        
        return function (player, model, state, controller) {
            var that, collection;
            that = this;
            
            /* CONSTRUCTOR */
            function initialize() {
                collection = [];
                
                that.elm = $(Mustache.render(template, player));
                that.cityElm = that.elm.find('.city');
                that.handElm = that.elm.find('.hand');
                that.statsElm = that.elm.find('.stats');
                that.charsElm = that.elm.find('.characters');
                
                state.onSelectDistrictEnable(that._toggleSelect);
            }
            
            /* METHOD */
            that.render = function () {
                that.cityElm.empty();
                collection.length = 0;
                
                that.handElm.html($(Mustache.render(hand_template, player.hand)));
                that.charsElm.html($(Mustache.render(characters_template, player)));
                that.statsElm.html($(Mustache.render(stats_template, player)));    

                // annoying, not using the same approach here, can this be fixed?
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