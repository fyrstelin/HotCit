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
		Controller = require('controller');

	$(function () {
		server = new Server.Game("test");
		model = new Model(server, "afk");
		controllers = { 
			//For test purpose
			afk: new Controller(server, "afk"),
			tugend: new Controller(server, "tugend"),
			mis: new Controller(server, "mis"),
			rko: new Controller(server, "rko")
		}

		/****************************************/
		/**  VIEWS                             **/
		/****************************************/
		Views.Opponents(model, $('#players'));
		Views.Player(model, $('#player'));
		var h = new Views.Hand(model.my.hand, $('#hand'));
		model.addListener(h.render);

		var views = [];
		views.push(new OptionsView(model, controllers, '#optionsView'));
		views.forEach( function(view) { view.render(); });

		//$('.btn').click();
	});
});