/*global define, console */
/*jslint nomen: true*/

define(function (require) {
	"use strict";
    
	var $ = require('jquery'),
        HandView,
        CityView,
        ClientPlayerView,
        CardView = require('./cardview'),
        utils = require('utils'),
        containsOptionOfType = utils.containsOptionOfType;
    
    /* STATIC METHOD */
    function shouldEnable(options, flag) {
        return !flag &&
                options &&
                containsOptionOfType(options, 'BuildDistrict');
    }

    /* STATIC METHOD */
    function shouldDisable(options, flag) {
        return flag &&
                (!options ||
                 !containsOptionOfType(options, 'BuildDistrict'));
    }
    
    /* STATIC METHOD */
    /* DUMMY METHOD FOR LATER EXTENSION */
    function filter(card) {
        // return true if player can afford to build district
        // rename method
        if (!!!card || !!card) {
            return true;
        } else {
            return false;
        }
    }
    
    /* PRIVATE CLASS */
    /* COLLECTION VIEW */
    HandView = (function () {
        
        return function (container, owner, model, state, controller) {
            var that, collection, buildDistrictFlag;
            that = this;
            
            /* CONSTRUCTOR */
            function initialize() {
                that.elm = container;
                collection = [];
                buildDistrictFlag = false;
            }
            
            /* ADAPTOR WRAPPER */
            that._callback = function (pid, cardtype) {
                controller.buildDistrict(cardtype);
            };
            
            /* METHOD */
            that.notify = function () {
                // consider conditional render depending on update content
                that.render();
            };
                        
            /* METHOD */
            that.render = function () {
                that.elm.empty();
                collection.length = 0;
                                
                model.my.hand.forEach(function (card) {
                    var view = new CardView(owner, card, model, state, controller);
                    collection.push(view);
                    that.elm.append(view.elm);
                });
                
                that._toggleOption(model.my.options);
            };
            
            /* STATE CHANGE HANDLER */
            that._toggleOption = function (options) {
                collection.forEach(function (view) {
                    if (shouldEnable(options, buildDistrictFlag)) {
                        view.enableSelect(filter, that._callback);
                    } else if (shouldDisable(options, buildDistrictFlag)) {
                        view.disableSelect();
                    }
                });
            };
            
            initialize();
        };
    }());
    
    /* PRIVATE CLASS */
    /* COLLECTION VIEW */
    CityView = (function () {
        return function CityView(container, owner, model, state, controller) {
            var that, collection;
            
            that = this;
            
            /* CONSTRUCTOR */
            function initialize() {
                collection = [];
                that.elm = container;
                state.onSelectDistrictEnable(that._toggleSelect);
            }
            
            /* METHOD */
            that.notify = function () {
                // consider conditional render depending on update content
                that.render();
            };
            
            /* METHOD */
            that.render = function () {
                that.elm.empty();
                collection.length = 0;
                model.my.city.forEach(function (card) {
                    var view = new CardView(owner, card, model, state, controller);
                    collection.push(view);
                    that.elm.append(view.elm);
                });
            };
            
            /* EVENT HANDLER */
            that._toggleSelect = function (event, data) {
                /*
                    Note, in this case, a city card is never selectable 
                    except after explicit action on the client side,
                    therefore it is not neccessary to maintain a state 
                    outside of the client-state object <state>
                */
                collection.forEach(function (view) {
                    view.enableSelect(data.filter, data.callback);
                });
            };
            
            initialize();
        };
    }());
    
    /* CLASS */
    /* COMPOSITE VIEW */
	ClientPlayerView = (function () {
        
        return function (container, model, state, controller) {
            var that = this;
            
            function initialize() {
                that.elm = container;
                that.handElm = that.elm.find('.hand');
                that.cityElm = that.elm.find('.city');
               
                that.handView = new HandView(that.handElm, model.my.username, model, state, controller);
                that.cityView = new CityView(that.cityElm, model.my.username, model, state, controller);
            }
            
            that.render = function () {
                that.handView.render();
                that.cityView.render();
            };
            
            that.notify = function (update) {
                that.handView.notify(update);
                that.cityView.notify(update);
            };
            
            initialize();
        };
    }());

	return ClientPlayerView;
});