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
        pid, opponentView, playerView, boardView, controller, simulateView,
        $ = require('jquery'),
		Server = require('server'),
		Model = require('model'),
		Views = require('views'),
		OptionsView = require('options_view'),
		SelectionView = require('selection_view'),
		Controller = require('controller'),
        SimulateView = require('simulate_view'),
        SimulateController = require('simulate_controller'),
		PlayerInTurnView = require('playerinturn_view');
    
    server = new Server.Game("test");
    
    // set user by #<user> in url, or default
    window.onhashchange = function () { document.location.reload(); };
    pid = window.location.hash.substring(1) || 'afk';
    document.title = pid;
    
    model = new Model(server, pid);
    controller = new Controller(server, pid);
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
    views = [];
    
    opponentView = new Views.Opponents(model);
    $('#opponents').html(opponentView.elm);
    views.push(opponentView);
    
    playerView = new Views.Player(model, controller);
    $('#player').html(playerView.elm);
    views.push(playerView);
    
    boardView = new Views.Board(model, controller);
    $('#board').html(boardView.elm);
    views.push(boardView);
    

    
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

    // inject simulateView
    simulateView = new SimulateView(new SimulateController(model, controllers));  
    $('#simulateView').append(simulateView.elm);
    views.push(simulateView);
    
    views.forEach(function (view) { view.render(); });
    
    /****************************************/
    /**  ACTIVE CONTROLLERS                **/
    /****************************************/
    
    function activateController() {
        $(".controller").each(function () {
            var elm = $(this),
                option = elm.data("option");
            if (model.my.can(option)) {
                elm.addClass("option");
            } else {
                elm.removeClass("option");
            }
        });
    }
    
    model.addListener(activateController);
    activateController();
});