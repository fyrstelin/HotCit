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
    
    function HandView(model, controller) {
        var that = this;
        
        that.elm = $("<div>").addClass("hand");
        
        function render() {
            that.elm.empty();
            model.my.hand.forEach(function (c) {
                var elm;
                elm = $("<img>")
                    .addClass("card")
                    .attr("src", "/resources/images/mdpi/" + c + ".png");
                that.elm.append(elm);
                
                if (model.my.can("BuildDistrict")) {
                    elm.on("click", function () {
                        controller.buildDistrict(c);
                    });
                    elm.addClass("option");
                }
            });
        }
        model.addListener(render);
        render();
    }
    
    //build without templates - I think it could work.
	function PlayerView(model, controller) {
        var that = this,
            handView,
            cityView;
        handView = new HandView(model, controller);
        cityView = $("<div>").addClass("city");
        that.elm =
            $('<div>').addClass("player")
            .append($("<h1>").html(model.my.username))
            .append($("<h3>Hand</h3>"))
            .append(handView.elm)
            .append("<h3>City</h3>")
            .append(cityView);
		function render() {
            cityView.empty();
            model.my.city.forEach(function (c) {
                cityView.append($("<img>")
                    .attr("src", "/resources/images/mdpi/" + c + ".png")
                    .addClass("card"));
            });
		}
		render();
		model.addListener(render);
	}
    
    
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