/*global define, console, window, setTimeout */

define(function (require) {
	"use strict";
    
    var $ = require('jquery');
    
    return function simulate_controller(model, controllers) {
        var that, gameEvents, eventpoints, counter;
        that = this;
        counter = 0;
        
        gameEvents = [
            function afkSelectWarlord() { controllers.afk.select('warlord'); },
            function tugendSelectBishop() { controllers.tugend.select('bishop'); },
            function rkoSelectMerchang() { controllers.rko.select('merchant'); },
            function misSelectKing() { controllers.mis.select('king'); }
        ];
        
        eventpoints = {
            'START': 0,
            'PHASE2': 4
        };
        
        // not part of official api
        that._resetGame = function() {
            return $.ajax({
                type: "delete",
                async: false,
                url: "http://localhost:8080/games",
            });
        };
           
        
        that.next = function() {
            gameEvents[counter]();
            console.log(counter, gameEvents[counter]);
            counter += 1;
            return counter;
        };
        
        that.skipTo = function (to) {
            var i;
            
            if (typeof to === "string") {
                to = eventpoints[to];
            }
            
            if (to > gameEvents) {
                throw new Error('to few events!');
            }
                  
            for (i = 0; i < to; i += 1) {
                that.next();
            }
            // GAME SHOULD UPDATE WHEN RESET?
        };
    };
});