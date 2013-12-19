/*global define, console*/
define(function (require) {
	"use strict";
	var templates,
		$ = require('jquery'),
		Mustache = require('mustache');
    
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
		function render() {
			that.elm.html(model.opponents.reduce(function (acc, player) {
				return acc + that.template(player);
			}, ""));
		}
		render();
		model.addListener(render);
	}
    OpponentsView.prototype.template = Mustache.compile(getTemplate("player"));
    
    
    //build without templates - I think it could work.
	function PlayerView(model, controller) {
        var that = this,
            cityView;
        
        that.elm = $('<div>');
        
        /* //add a live listener?
        that.elm.on("click", ".hand .card", function () {
            if (model.my.can("BuildDistrict")) {
                controller.buildDistrict($(this).data("card"));
            }
        });
        */
        
		function render() {
            that.elm.html(that.template({
                username: model.my.username,
                characters: model.my.characters,
                gold: model.my.gold,
                points: model.my.points,
                city: model.my.city,
                hand: model.my.hand
            }));
            
            if (model.my.can("BuildDistrict")) { //adding listener every time?
                that.elm.find(".hand .card").on("click", function () {
                    controller.buildDistrict($(this).data("card"));
                });
            }
		}
		render();
		model.addListener(render);
	}
    PlayerView.prototype.template = OpponentsView.prototype.template;
    
    
    function BoardView(model, controller) {
        var that = this;
        that.elm = $('<div>').css("text-align", "center");
        that.elm.html(Mustache.render(that.template));
        that.elm.on("click", "button.gold", controller.takeGold);
        that.elm.on('click', "button.districts", controller.drawDistricts);
        that.elm.on("click", "button.endTurn", controller.endTurn);
    }
    BoardView.prototype.template = getTemplate("board");

	return {
		Opponents: OpponentsView,
		Player: PlayerView,
        Board: BoardView,
        getTemplate: getTemplate
	};
});