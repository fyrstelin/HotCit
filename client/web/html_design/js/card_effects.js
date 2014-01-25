var degree_inc = 7;
                
    /*
        Have used manual adjusting by offsets,
        problem is: cards are rotated by (center, bottom),
        but we need to align by (left, bottom) to which
        we need the prober angle by (left, bottom)
        
        problem now: difficult to read formulae, 
        and left, right side padding is not consistent.
    
    */

function enableZoom(elements) {
    // zoom feature -> outfactor
    elements.dblclick(function() {
        //                    cards.click(function(event) {
        //                        event.stopPropagation();
        
        var origin = $(this);
        var elm = origin.clone();
        $('body').append(elm);
        elm
        .css('border', 'none')
        .css('-webkit-transform', 'rotate(0)')
        .css('position', 'absolute')
        .css('z-index', '999')
        .css('width', '150px') 
        
        // center fixed
        //                            .css('top', '50%')
        //                            .css('left', '50%')
        //                            .css('margin-left', -elm.width()/2 + 'px')
        //                            .css('margin-top', -elm.height()/2 + 'px')
        .css('top', origin.offset().top + 'px')
        .css('left', origin.offset().left + 'px')
        console.log('origin.offset().left', origin.offset().left)
        $('body').one('click', function() {
            elm.remove();  
        });
    });   
}


function spread(classname) {                
    var toRadians = Math.PI/180.0;
    var toDegrees = 180/Math.PI
    
    var hand = $(classname + ' .hand');
    var cards = hand.find('.card');
    enableZoom(cards);
    
    var num = cards.length;
    
    var degree_offset = (degree_inc*(num-1)) / 2.0                    
    var width = cards.outerWidth(); // carefull
    var height = cards.outerHeight();
    
    // magic and trigometry: computes the dist from left outer cornor to right outer cornor
    // set parent element to tight fit
    var max_degree = Math.asin((width/2.0)/(1.5*height))*toDegrees+degree_offset
    
    var horisontal_margin = width*0.2;
    var max_degree_outer = Math.asin((width/2.0)/(2.5*height))*toDegrees+degree_offset
    hand.css('width', 2*Math.sin(max_degree_outer*toRadians)*2.5*height + horisontal_margin + 'px');  
    
    // hand is implictly rotated by 90 degrees, correction with padding
    hand.css('padding-left', (hand.width()-width)/2 + 'px');
    
    // rounding error somewhere? -> top, bottom padding
    var vertical_margin = height*0.05;
    
    // magic and trigometry: computes the diff from lowest cornor to top middle card
    var tmp = Math.sin((90-max_degree)*toRadians)*(1.5*height); /* 1.5 instead of 2.5 since only measure from bottom */
    hand.css('height', ((2.5*height - tmp))+vertical_margin + 'px');
    
    //hand.css('left', -(num/2.0*0.40*65) + 'px');
    
    cards.each(function(index) {
        var elm = $(this);
        elm.css('z-index', index);   
        var turn = -degree_offset + index * degree_inc;
        elm.css('-webkit-transform-origin', "50% 250%"); // 10% 250
        elm.css('-webkit-transform', "rotate(" + turn + "deg)");
        elm.css('top', vertical_margin+'px');
    });                    
}