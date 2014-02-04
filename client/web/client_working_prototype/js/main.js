/*global require, define, window, document */
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
    
    var server, pid, playercontroller,
        state, simulateController, selectionView,
        $ = require('jquery'),
        Server = require('server'),
        Model = require('model'),
        State = require('state'),
        Controller = require('controller'),
        SimulateController = require('simulate_controller'),
        utils = require('utils'),
        SelectionView = require('./views/selection_view'),
        effects = require('card_effects'),
        AppView = require('appview');
    
    $(function() { 
        // hack to wait until images is loaded and thus have hight, widths set
        $('<img src="img/castle.png" />').load(function() {
            effects.spread($('#board_player .hand'));
            effects.enableZoom($('.card:not([src*="facedown"])'));
        });
        
        
        // DEFINE PLAYER ID
        pid = utils.getPid();
        document.title = pid;
        
        // SETUP SERVER AND PROXY SERVER
        server = new Server.Game("test");
        model = new Model(server, pid);
        
        // SETUP EVENT PIPELINE
        state = new State(model);
        selectionView = new SelectionView(model, playercontroller);
        // automatic close if new events pop up
        // needed for simulate view...
        // should only be rendered in specific cases via other views
        
        // SETUP CONTROLLERS
        controllers = {
            //For test purpose
            afk: new Controller(server, model, "afk", state, selectionView),
            tugend: new Controller(server, model, "tugend", state, selectionView),
            mis: new Controller(server, model, "mis", state, selectionView),
            rko: new Controller(server, model, "rko", state, selectionView)
        };
        playercontroller = controllers[pid];
        simulateController = new SimulateController(model, controllers, selectionView);
        
        // $('#board_player .hand').html('');
        
        var appView = new AppView(model, state, playercontroller, simulateController, selectionView);
        $('#app').replaceWith(appView.elm); // TODO: DONT USE REPLACE!
        model.addListener(appView);
    });
});