/*global require, console*/
require.config({
	baseUrl: "scripts",
	paths : {
		jquery : "libs/jquery-2.0.3"
	}
});

require(["jquery"], function ($) {
	"use strict";

	/****************************/
	/** Globals                 */
	/****************************/
	var username, game,


	/****************************/
	/** Elements                */
	/****************************/
		elm = {
			games: $('#games'),
			game: {
				name: $('#game'),
				players: $('#players'),
				join: $('#join'),
				ready: $('#ready')
			},
			inp: {
				gamename: $('#gamename'),
				minPlayers: $('#min_players'),
				maxPlayers: $('#max_players'),
				password: $('#password'),
				username: $('#username')
			},
			tabs: {
				buttons: $('.tabs button'),
				startTab: $('#user_tab')
			}
		};


	/****************************/
	/** Tabs                    */
	/** Existing library?       */
	/****************************/
	function showTab(tab) {
		tab = $("#" + tab);
		if (tab.size() === 1) {
			$("section").hide();
			tab.show();
		} else {
			console.log("no such tab");
		}
	}
	elm.tabs.buttons.on("click", function () {
		showTab($(this).attr("data-tab"));
	});
	elm.tabs.startTab.show();


	/****************************/
	/** User                    */
	/****************************/
	elm.inp.username.on('change', function () {
		username = $(this).val();
	});


	/****************************/
	/** Game                    */
	/****************************/

	function showGame(id) {
		var ulElm = elm.game.players.empty();
		game = id;
		elm.game.name.html(id);
		$.ajax("/lobby/" + encodeURIComponent(id) + "/users", {
			dataType: "json",
			success: function (data) {
				var player;
				for (player in data) {
					if (data.hasOwnProperty(player)) {
						if (player === username) {
							elm.game.join.disable();
						}
						ulElm.append($("<li>").html(player + (data[player] ? " (ready)" : " (not ready)")));
					}
				}
				showTab("game_tab");
			}
		});
	}

	elm.game.join.on('click', function () {
		$.ajax("/lobby/" + encodeURIComponent(game) + "/users", {
			type: "PUT",
			dataType: "json",
			headers : {
				authorization: username
			},
			success : function () {
				showGame(game);
			}
		});
	});

	/****************************/
	/** Games                   */
	/****************************/
	function createGameEntry(id, game) {
		var tr = $('<tr>'),
			idElm = $('<a>').html(id).on('click', function () {
				showGame(id, game);
			});
		tr.append($('<td>').html(idElm));
		tr.append($('<td>').html(game.MinPlayers));
		tr.append($('<td>').html(game.MaxPlayers));
		tr.append($('<td>').html(game.PlayerCount));
		tr.append($('<td>').html(game.PasswordProtected ? "x" : ""));
		return tr;
	}

	function updateLobby() {
		$.ajax("/lobby", {
			dataType: "json",
			success: function (games) {
				var id;
				elm.games.empty();
				for (id in games) {
					if (games.hasOwnProperty(id)) {
						elm.games.append(createGameEntry(id, games[id]));
					}
				}
			}
		});
	}
	updateLobby();


	/****************************/
	/** Create game             */
	/****************************/
	$('#create_game').on('click', function () {
		var setup = {
			MinPlayers: elm.inp.minPlayers.val(),
			MaxPlayers: elm.inp.maxPlayers.val(),
			Password: elm.inp.password.val()
		},
			url = "/lobby/" + encodeURIComponent(elm.inp.gamename.val());
		$.ajax(url, {
			data: setup,
			dataType: "json",
			type: "POST",
			headers: {
				authorization: username
			},
			success: function () {
				var e;
				updateLobby();
				for (e in elm.inp) {
					if (elm.inp.hasOwnProperty(e)) {
						elm.inp[e].val("");
					}
				}
			}
		});
	});
});