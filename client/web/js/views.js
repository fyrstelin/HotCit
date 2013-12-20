/*global define, console*/
define(function (require) {
	"use strict";
	var templates,
		$ = require('jquery'),
		Mustache = require('mustache'),
        HandView;
    
    templates = $($.ajax({
        url: "templates.html",
        async: false
    }).responseText);
    
    function getTemplate(id) {
        return templates.find("#" + id).html();
    }

	//We may or may not want a seperate view for every opponent?
	function OpponentsView(model) {
        var that = this;
        that.elm = $('<div>');
		that.render = function () {
			that.elm.html(model.opponents.reduce(function (acc, player) {
				return acc + that.template(player);
			}, ""));
		};
		model.addListener(that.render);
	}
    OpponentsView.prototype.template = Mustache.compile(getTemplate("opponent"));
    
    /**
     * Two proposals for a collection view with controllers.
     *
     * Things considered:
     *   1. Is the same view used for non-controlling views?
     *   2. Should the controller be called if the action is not available?
     *   3. Should the view be responsible for highlighting if action is available?
     **/
    
    /**
     * LiveHandView - using a live listener
     *  Pros:
     *    - clearly separation of view and controller logic
     *    - view builded directly from array
     *
     *  Cons:
     *    - Live listerner can interfere with child views (none in this case)
     *    - Maybe bad performance: model.my.can on every click
     *    - Data in html!!
     **/
    function LiveHandView(model, controller) {
        var that = this;
        that.elm = $("<div>").addClass("HandView");
        
        if (controller) { //See 1
            that.elm.on("click", ".card", function () {
                if (model.my.can("BuildDistrict")) { //See 2
                    controller.buildDistrict($(this).data("card"));
                }
            });
        }
    
        that.render = function () {
            var elms = that.template(model.my.hand);
            that.elm.html(elms);
            if (model.my.can("BuildDistrict")) { //See 3
                that.elm.find(".card").addClass("option");
            }
            //that.elm.html(that.template({hand: model.my.hand, can: model.my.can("BuildDistrict")}));
        };
        
        model.addListener(that.render);
    }
    LiveHandView.prototype.template = Mustache.compile(getTemplate("hand"));
    
    
    /**
     * IterHandView - iterating throug card and building template for each card
     *  Pros:
     *    - Clean output HTML (no data)
     *    - Looping through hand once pr render
     *
     *  Cons:
     *    - View and controller logic messed up
     *    - Multiple controllers added with same code
     *    - Check for controller for each render
     **/
    function IterHandView(model, controller) {
        var that = this;
        that.elm = $("<div>").addClass("HandView");
        
        that.render = function () {
            that.elm.empty();
            model.my.hand.forEach(function (c) {
                var elm = $(that.template(c));
                //var elm = $(that.template({card: c, can: model.my.can("BuildDistrict")}));
                that.elm.append(elm);
                if (model.my.can("BuildDistrict")) { //See 2
                    elm.addClass('option'); //See 3, could be done in template
                    if (controller) { //See 1
                        elm.on("click", function () {
                            controller.buildDistrict(c);
                        });
                    }
                }
            });
        };
        
        model.addListener(that.render);
    }
    IterHandView.prototype.template = Mustache.compile(getTemplate("card"));
    
    HandView = LiveHandView;
    
    function CityView(model) {
        var that = this;
        that.elm = $('<div>').addClass("CityView");
        that.render = function () {
            that.elm.html(that.template(model.my.city));
        };
        
        model.addListener(that.render);
    }
    CityView.prototype.template = Mustache.compile(getTemplate("city"));
    
	function PlayerView(model, controller) {
        var that = this,
            handView = new HandView(model, controller),
            cityView = new CityView(model);
        that.elm = $("<div>").addClass("PlayerView");
        
        
        that.render = function () {
            that.elm.html(that.template);
            that.elm.find(".hand").append(handView.elm);
            that.elm.find(".city").append(cityView.elm);
            handView.render();
            cityView.render();
        };
	}
    PlayerView.prototype.template = getTemplate("player");
    
    
    function BoardView(model, controller) {
        var that = this;
        that.elm = $('<div>').css("text-align", "center");
        
        that.render = function () {
            that.elm.html(Mustache.render(that.template));
            that.elm.on("click", "button.gold", controller.takeGold);
            that.elm.on('click', "button.districts", controller.drawDistricts);
            that.elm.on("click", "button.endTurn", controller.endTurn);
        };
    }
    BoardView.prototype.template = getTemplate("board");

	return {
		Opponents: OpponentsView,
		Player: PlayerView,
        Board: BoardView,
        getTemplate: getTemplate
	};
});