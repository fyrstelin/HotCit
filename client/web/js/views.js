/*global define, console*/
define(function (require) {
	"use strict";
	var template,
		$ = require('jquery'),
		Mustache = require('mustache');

	template = Mustache.compile($.ajax({
		url: "templates/player.html",
		async: false
	}).responseText); //ODO refactor this to a function somewhere

	//We may or may not want a seperate view for every opponent?
	function OpponentsView(model, elm) {
		function render() {
			elm.html(model.opponents.reduce(function (acc, player) {
				return template(player) + acc;
			}, ""));
		}
		render();
		model.listen(render);
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
		Player: PlayerView
	};
});