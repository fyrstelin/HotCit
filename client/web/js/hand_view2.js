/*global define, console*/
define(function (require) {
	"use strict";
	var templates,
		$ = require('jquery'),
		Mustache = require('mustache'),
        HandView2;
    
    templates = $($.ajax({
        url: "templates.html",
        async: false
    }).responseText);
    
    function getTemplate(id) {
        return templates.find("#" + id).html();
    }

    return (function () {
        /* static */
        var template, cardtemplate;
        template = "<div class='HandView'></div>";
        cardtemplate = getTemplate("card");
        
        return function (model, controller) {
            var that = this;
            
            /* PRIVATE */
            function foreachCardElm(visit) { /* visit: (cardtype, cardElm) -> None */
                var cardtype, cardElms, i;
                
                for (cardtype in that.cardElmMap) {
                    if (that.cardElmMap.hasOwnProperty(cardtype)) {
                        cardElms = that.cardElmMap[cardtype];
                        for (i = 0; i < cardElms.length; i += 1) {
                            visit(cardtype, cardElms[i]);
                        }
                    }
                }
            }
            
            /* STATE CHANGE METHODS */
             /* PRIVATE */
            function _filter(cardtype, cardElm) {
                return true; // handle varying costs..   
            }
            
            /* STATE CHANGE */
            /* PRIVATE */
            function _disable_selectcallback(cardtype, cardElm) {
                cardElm
                    .removeClass('option')
                    .off('click.select');
            }
            
            /* STATE CHANGE */
            /* PRIVATE */
            function _enable_selectcallback(cardtype, cardElm) {
                _disable_selectcallback(cardtype, cardElm); // little ineficient..
                cardElm
                    .addClass('option')
                    .on('click.select', function() {
                        controller.buildDistrict(cardtype);
                    });
            }
           
            /* STATE CHANGE */
            /* PRIVATE */
            that._toggleBuildDistrictOption = function(enable) {            
                var visitor = (enable)? _enable_selectcallback : _disable_selectcallback;
                foreachCardElm(visitor);
            };
            
            /* PRIVATE */
            that._syncCards = function () {
                var cardtype, cardTypeCountMap, diff, cardElm;
                
                // count
                cardTypeCountMap = {};
                model.my.hand.forEach(function (card) {
                    cardTypeCountMap[card] = cardTypeCountMap[card] || 0;
                    cardTypeCountMap[card] += 1;
                });
                
                // synch existing types
                for (cardtype in cardTypeCountMap) {
                    if (cardTypeCountMap.hasOwnProperty(cardtype)) {
                        diff = cardTypeCountMap[cardtype] - (that.cardElmMap[cardtype] || 0);
                        
                        /*if (diff === 0) { // exact number of elements
                            // do nothing 
                        }*/
                        if (diff < 0) { // too many elements
                            while (diff--) { that.cardElmMap[cardtype].pop().remove(); }
                        } else if (diff > 0) { //(diff > 0) // to few elements
                            while (diff--) {
                                cardElm = $(Mustache.render(cardtemplate, cardtype));
                                that.elm.append(cardElm);
                                
                                that.cardElmMap[cardtype] = that.cardElmMap[cardtype] || [];
                                that.cardElmMap[cardtype].push(cardElm);
                            }
                        }     
                    }
                }
                
                // remove nonexistent types
                for (cardtype in that.cardElmMap) {
                    if (that.cardElmMap.hasOwnProperty(cardtype)) {
                        if (cardTypeCountMap[cardtype] === undefined) {
                            that.cardElmMap[cardtype].pop().remove();
                        }
                    }
                }
            };
            
                        /* PUBLIC */
            function initialize() {
                that.elm = $(template);
                that.cardElmMap = {};
                that._syncCards();
            }
            
            /* PUBLIC */
            that.render = function () {
                that.elm.empty();                
                foreachCardElm(function(cardtype, cardElm) {
                    that.elm.append(cardElm);    
                });
                that._toggleBuildDistrictOption(model.my.can("BuildDistrict"));

            };
                  
            /* PUBLIC */
            that.notify = function () {
                that._syncCards();
                that._toggleBuildDistrictOption(model.my.can("BuildDistrict"));
            };
                        
            initialize();
        };
    }());
    
});