/*global require, define, console, window, document */
require.config({
	baseUrl: "js",
	paths : {
		jquery :  "libs/jquery-2.0.3",
		jqueryui: "libs/jquery-ui",
		mustache: "libs/mustache"
	}
});

/* GLOBALS */
var controllers, model;

define(function (require) {
	"use strict";
    
	var server, views, selectionView, optionsView, playerInTurnView,
        $ = require('jquery'),
		Server = require('server'),
		Model = require('model'),
		Views = require('views'),
		OptionsView = require('options_view'),
		SelectionView = require('selection_view'),
		Controller = require('controller'),
		PlayerInTurnView = require('playerinturn_view');
    
    server = new Server.Game("test");
    
    // hack?
    window.onhashchange = function() { document.location.reload(); };
    var pid = window.location.hash.substring(1) || 'afk';
    
    model = new Model(server, pid);
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

    views = [];
    
    // inject selectionView
    selectionView = new SelectionView();
    $('body').append(selectionView.elm);
    // should only be rendered in specific cases via other views

    // inject optionsview
    optionsView = new OptionsView(model, controllers, selectionView);
    $('#optionsView').append(optionsView.elm); // or replacewith
    views.push(optionsView);

    // inject playerInTurnView 
    playerInTurnView = new PlayerInTurnView(model);
    $('#playerinturnView').append(playerInTurnView.elm);
    views.push(playerInTurnView);

    views.forEach(function (view) { view.render(); });
});