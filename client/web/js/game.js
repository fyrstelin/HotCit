/*global require, define, console, window*/
require.config({
	baseUrl: "js",
	paths : {
		jquery :  "libs/jquery-2.0.3",
		jqueryui: "libs/jquery-ui",
		mustache: "libs/mustache"
	}
});

define(function (require) {
	"use strict";
	var $ = require('jquery'),
		Server = require('server'),
		Model = require('model'),
		Views = require('views');
	$(function () {
		var provider = new Server.Game("test"),
			model = new Model(provider, "afk");
			
		/****************************************/
		/**  VIEWS                             **/
		/****************************************/
		new Views.Opponents(model, $('#players'));
		new Views.Player(model, $('#player'));
	});
});