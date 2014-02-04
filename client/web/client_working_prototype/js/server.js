/*global define, console*/
/*jslint unparam: true*/

define(["jquery"], function ($) {
	"use strict";
	/**
	 * Parameters
	 *	- gameid: the id of the game on the serverside
	 **/
	function Game(gameid) {
		var baseUrl = "/games/" + gameid;

		function getGame() {
			var res = $.ajax({
					async: false,
					url: baseUrl,
					dataType: "json"
				}),
				etag = res.getResponseHeader("etag");
			return {
				game: res.responseJSON,
				etag: etag
			};
		}

		function getHand(pid) {
			return $.ajax({
				async: false,
				url: baseUrl + "/hand",
				dataType: "json",
				headers: {
					Authorization: pid
				}
			}).responseJSON;
		}

		function getOptions(pid) {
			return $.ajax({
				async: false,
				url: baseUrl + "/options",
				dataType: "json",
				headers: {
					Authorization: pid
				}
			}).responseJSON;

		}

		function listen(done, etag) {
			$.ajax({
				url: baseUrl,
				headers: {
					"if-range": etag
				},
				dataType: "json"
			}).done(function (game, status, res) {
				done(game);
				etag = res.getResponseHeader("etag");
			}).always(function () {
				listen(done, etag); //ODO remove?
			});
		}

		function control(action, pid) {
			$.ajax({
				type: "put",
				url: baseUrl,
				headers: {
					Authorization: pid,
					"Content-Type": "application/json"
				},
				dataType: "json",
				data: JSON.stringify(action)
			}).fail(function () {
				console.log("ERROR: " + JSON.stringify(action));
			});
		}

		this.getGame = getGame;
		this.getHand = getHand;
		this.getOptions = getOptions;
		this.listen = listen;
		this.control = control;
	}

	return {
		Game: Game
	};
});