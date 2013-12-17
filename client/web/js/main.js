/*global require, define, console, window*/
require.config({
	baseUrl: "js",
	paths : {
		jquery :  "libs/jquery-2.0.3",
		jqueryui: "libs/jquery-ui",
		mustache: "libs/mustache"
	}
});

var controllers, model, server;

define(function (require) {
	"use strict";
	var $ = require('jquery'),
		Server = require('server'),
		Model = require('model'),
		Views = require('views'),
		OptionsView = require('options_view'),
		SelectionView = require('selection_view'),
		Controller = require('controller'),
		PlayerInTurnView = require('playerinturn_view');

	$(function () {
		server = new Server.Game("test");
		model = new Model(server, "afk");
		controllers = { 
			//For test purpose
			afk: new Controller(server, "afk"),
			tugend: new Controller(server, "tugend"),
			mis: new Controller(server, "mis"),
			rko: new Controller(server, "rko")
		};

		/****************************************/
		/**  VIEWS                             **/
		/****************************************/
		Views.Opponents(model, $('#players'));
		Views.Player(model, $('#player'));
		Views.Hand(model, $('#hand'));
		Views.CurrentPlayer(model, $('#current_player'));

		var views = [];

		// inject selectionView
		var selectionView = new SelectionView();
		$('body').append(selectionView.elm);
		// should only be rendered in specific cases

		// inject optionsview
		var optionsView = new OptionsView(model, controllers, selectionView);
		$('#optionsView').append(optionsView.elm); // or replacewith
		views.push(optionsView);

		// hack view
		var playerInTurnView = new PlayerInTurnView(model);
		$('#playerinturnView').append(playerInTurnView.elm);
		views.push(playerInTurnView);

		views.forEach( function(view) { view.render(); });
	});
});