/*global define, console, setTimeout, window */
/*jslint es5: true*/
/*jslint nomen: true*/

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
            'start': 0,
            'character_select': 4
        };
        
        
        // not part of official api
        that._resetGame = function () {
            counter = 0;
            //console.log('RESET GAME', counter);
            return $.ajax({
                type: "delete",
                async: false,
                url: "http://localhost:8080/games"
            });
        };
           
        
        that.next = function () {
            gameEvents[counter]();
            counter += 1;
            // console.log('NEXT', counter);
            return counter;
        };
        
        that.skipTo = function (to) {
            
            // translate from id to event point index
            if (typeof to === "string") {
                to = eventpoints[to];
            }
            if (to > gameEvents) {
                throw new Error('to few events!');
            }
            
            // always reset game first
            if (that.counter > to || to === 0) {
                that._resetGame();
            }

            // QUICKFIX
            // neccessary as server does not send an update
            if (to === 0) {
                window.location.reload();
                return;
            }
                              
            // delay is neccessary to avoid race conditions 
            function loop(i) {
                if (i < to) {
                    that.next();
                    setTimeout(function () { loop(i + 1); }, 10);
                }
            }
            // GAME SHOULD UPDATE WHEN RESET?
            loop(0);
        };
    };
});