/*global define, console, setTimeout, window */
/*jslint es5: true*/
/*jslint nomen: true*/

define(function (require) {
	"use strict";
    
    var $ = require('jquery');
    
    /* CLASS */
    return function SimulateController(model, controllers, selectionView) {
        var that, gameEvents, eventpoints, counter;
        
        that = this;
        
        function initialize() {
            counter = 0;
            
            gameEvents = [
                function () { controllers.afk.select('warlord'); },
                function () { controllers.tugend.select('bishop'); },
                function () { controllers.rko.select('magician'); },
                function () { controllers.mis.select('king'); },
                function () { controllers.rko.endTurn(); },
                function () { controllers.mis.takeGold(); },
                function () { controllers.mis.buildDistrict('temple'); },
                function () { controllers.mis.endTurn(); },
                function () { controllers.tugend.endTurn(); },
                function () { controllers.afk.takeGold(); },
                function () { controllers.afk.buildDistrict('temple'); },
            ];
            
            eventpoints = {
                'start': 0,
                'character_select': 4,
                'magician_turn': 4,
                'warlord_turn': 11
            };
                
                
        }
                
        /* METHOD */
        that.skipTo = function (to) {
            
            // translate from id to event point index
            if (typeof to === "string") {
                to = eventpoints[to];
            }
            if (to > gameEvents) {
                throw new Error('to few events!');
            }
            
            // always reset game first
            if (that.counter >= to || to === 0) {
                that._resetGame();
            }

            // QUICKFIX
            // neccessary as server does not send an update
            if (to === 0) {
                window.location.reload();
                return;
            }
                              
            selectionView.disable();
            // delay is neccessary to avoid race conditions 
            function loop(i) {
                if (i < to - 1) {
                    that._next();
                    setTimeout(function () { loop(i + 1); }, 100);
                } else {
                    selectionView.enable();
                    that._next();
                }
            }
            // GAME SHOULD UPDATE WHEN RESET?
            loop(0);
        };
        
        /* DELEGATE */
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
           
        /* DELEGATE */
        that._next = function () {
            gameEvents[counter]();
            counter += 1;
            // console.log('NEXT', counter);
            return counter;
        };
    
        initialize();
    };
});