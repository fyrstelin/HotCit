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
    var opponent_template = Mustache.compile(getTemplate('opponent'));
    var character_template = Mustache.compile("<img src='img/{{.}}.png' class='img-circle' />");

    // COLLECTION VIEW
    // PRIVATE CLASS
    OpponentView = (function () {    
        return function (player, model, state, controller) {
            var that, collection;
            that = this;
                    
            /* CONSTRUCTOR */
            function initialize() {            
                collection = [];
                
                that.elm = $(opponent_template({
                    username: player.username,
                    character: (player.characters.length === 0)? undefined : player.characters[0], // QUICK FIX, no design decision yet...
                    handno: player.hand.length,                       
                }));
                
                that.tokenElm = that.elm.find('.token');
                that.handElm = that.elm.find('.hand card-overlay');
                that.districtsElm = that.elm.find('.districts');
                
                state.onSelectDistrictEnable(that._toggleSelect);
            }
            
            /* METHOD */
            that.render = function () {
                collection.length = 0;
                
                // decide how to handle multiple characters..
                if(player.characters.length) {
                    that.tokenElm.html(character_template(player.characters[0]));
                } else {
                    // that.tokenElm.empty();   
                    that.tokenElm.html(character_template('assassin_icon')); // TODO: MOCKUP
                }
                
                that.handElm.html(player.hand.length); // TODO: give number instead of this silliness. =)
                
                player.city.push('tavern'); // MOCKUP
                player.city.push('tavern'); 
                player.city.push('tavern'); 
                player.city.push('tavern'); 
                player.city.push('tavern'); 
                
                player.city.forEach(function (card) {
                    var view = new CardView(player.username, card, model, state, controller);
                    collection.push(view);
                    that.districtsElm.append(view.elm);
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
        return function (container, model, state, controller) {
            var that, views;

            that = this;
            
            /* CONSTRUCTOR */
            function initialize() {
                that.elm = container;
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