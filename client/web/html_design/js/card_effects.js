/*global $*/
/*jslint nomen: true */

var effects = {};

(function () {
    "use strict";
   
    function enableZoom(elements) {
        /*  Enables zoom on double click, 
            and cancel zoom on regular click */
        
        // QUICK FIX: HARDCODED VALUES
        var app_height = 769,
            app_width = 1366,
            // zoom image dimensions
            height = 384,
            width = 248;
        
        
        elements.dblclick(function () {
            
            var origin = $(this),
                elm = origin.clone(),
                offset_top = origin.offset().top,
                offset_left = origin.offset().left;
            
            // HANDLE POSITION OVERFLOW
            if ((offset_top + height) > app_height) {
                offset_top = app_height - height;
            }
            
            if ((offset_left + width) > app_width) {
                offset_left = app_width - width;
            }
            
            $('body').append(elm);
            elm
                .css('border', 'none')
                .css('-webkit-transform', 'rotate(0)')
                .css('position', 'absolute')
                .css('z-index', '999')
                .css('width', width + 'px')
                .css('height', height + 'px') // quickfix, hardcoded..
                .css('top', offset_top + 'px')
                .css('left', offset_left + 'px');
            
            $('body').one('click', function () { elm.remove();  });
        });
    }

    
    function spread(hand) {
        /*  expects a wrapper element which contain card elements 
            with class <card>.
           
            induces a spread of cards, resizes wrapper to fit, 
            rounding error (maybe?) yields a bit to much space, 
            centers to compensate */
        
        var degree_inc,
            degree_offset,
            degree_max,
            
            toRadians,
            toDegrees,
            
            cards,
            width,
            height,
            num,
            
            horisontal_margin,
            vertical_margin,
            
            tmp;
            
        degree_inc = 7;
        toRadians = Math.PI / 180.0;
        toDegrees = 180 / Math.PI;
        
        cards = hand.find('.card');
        width = cards.width();
        height = cards.height();
        num = cards.length;
        
        degree_offset = (degree_inc * (num - 1)) / 2.0;
        
        horisontal_margin = width * 0.2;
        vertical_margin = height * 0.05;
    
        
        // SET HEIGHT, AND WIDTH OF WRAPPER ELEMENT
        // magic and trigometry: computes the dist from 
        // left outer corner to right outer corner (max_degree_outer)
        degree_max = Math.asin((width / 2.0) / (1.5 * height)) * toDegrees + degree_offset;
        tmp = Math.asin((width / 2.0) / (2.5 * height)) * toDegrees + degree_offset;
        hand.css('width', 2 * Math.sin(tmp * toRadians) * 2.5 * height + horisontal_margin + 'px');
        // magic and trigometry: computes the diff from lowest cornor to top middle card
        tmp = Math.sin((90 - degree_max) * toRadians) * (1.5 * height); /* 1.5 instead of 2.5 since only measure from bottom */
        hand.css('height', ((2.5 * height - tmp)) + vertical_margin + 'px');
        
        
        // CORRECT FOR POSTION WHEN ROTATED
        // hand is implictly rotated by 90 degrees, correction with padding
        hand.css('padding-left', (hand.width() - width) / 2 + 'px');
        
        
        // ROTATE
        cards.each(function (index) {
            var elm = $(this),
                turn = -degree_offset + index * degree_inc;
            
            cards.css('position', 'absolute');
            elm.css('z-index', index);
            elm.css('-webkit-transform-origin', "50% 250%"); // 10% 250
            elm.css('-webkit-transform', "rotate(" + turn + "deg)");
            elm.css('top', vertical_margin + 'px');
        });
    }

    
    function overlap(hand, _overlap) {
        /*  expects hand to be an element containing card elements with class 'card'
            
            induces a overlap of cards, resizes wrapper to fit exact  */
        var cards = hand.find('.card'),
            width = cards.width(),
            height = cards.height(),
            num = cards.length;
        
        hand.css('position', 'relative'); // not neccessary!
        hand.css('height', height + 'px');
        hand.css('width', width + (num -  1) * (_overlap * width) + 'px');
        cards.css('position', 'absolute');
        cards.each(function (index) {
            $(this).css('left', index * _overlap * width + 'px');
        });
    }
    
    effects.enableZoom = enableZoom;
    effects.spread = spread;
    effects.overlap = overlap;
}());