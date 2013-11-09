/*global require, console*/
require.config({
	baseUrl: "js",
	paths : {
		jquery : "libs/jquery-2.0.3",
		mustache: "libs/mustache"
	}
});

require(["jquery", "model", "mustache"], function ($, model, Mustache) {
	"use strict";
	var elm = {
		player: $('#player'),
		players: $('#players')
	}, templates = {
		each: function (es, t) { //maybe part of mustache?
			var res = "";
			$.each(es, function (i, e) {
				res += t(e);
			});
			return res;
		},
		player: Mustache.compile($('#playerTemplate').html())
	};

	model.getMe(function (player) {
		elm.player.html(templates.player(player));
	});


	model.getOtherPlayers(function (players) {
		elm.players.html(templates.each(players, templates.player));
	});
});