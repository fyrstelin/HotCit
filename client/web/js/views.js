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
        var that = this,
            goldElm,
            districtElm,
            endTurnElm;
        that.elm = $('<div>').css("text-align", "center");
        goldElm = $("<button>gold</button>");
        districtElm = $('<button>district</button>');
        endTurnElm = $("<button>End Turn</button>'");
        that.elm.append(goldElm)
            .append(districtElm)
            .append(endTurnElm);
        goldElm.on("click", controller.takeGold);
        districtElm.on('click', controller.drawDistricts);
        endTurnElm.on("click", controller.endTurn);
        
        function render() {
            if (model.my.can("TakeAction")) {
                goldElm.attr("disabled", null);
                districtElm.attr("disabled", null);
            } else {
                goldElm.attr("disabled", "disabled");
                districtElm.attr("disabled", "disabled");
            }
            
            if (model.my.can("EndTurn")) {
                endTurnElm.attr("disabled", null);
            } else {
                endTurnElm.attr("disabled", "disabled");
            }
        }
        render();
        model.addListener(render);
    }

	return {
		Opponents: OpponentsView,
		Player: PlayerView,
        Board: BoardView,
        getTemplate: getTemplate
	};
});