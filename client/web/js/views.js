/*global define, console*/
define(function (require) {
	"use strict";
	var template, handTemplate,
		$ = require('jquery'),
		Mustache = require('mustache');


	function load(url) {
		return $.ajax({
			url: url,
			async: false
		}).responseText;
	}
	template = Mustache.compile(load("templates/player.html"));

	handTemplate = Mustache.compile(load("templates/hand.html"));

	//We may or may not want a seperate view for every opponent?
	function OpponentsView(model, elm) {
		function render() {
			elm.html(model.opponents.reduce(function (acc, player) {
				return acc + template(player);
			}, ""));
		}
		render();
		model.listen(render);
	}

	//better way? No model and the caller is responsible for registering the render function...
	function HandView(hand, elm) {
		this.render = function () {
			elm.html(handTemplate(hand));
		};
		this.render();
	}

	function PlayerView(model, elm) {
		function render() {
			elm.html(template(model.my));
		}
		render();
		model.listen(render);
	}

	return {
		Opponents: OpponentsView,
		Player: PlayerView,
		Hand: HandView
	};
});