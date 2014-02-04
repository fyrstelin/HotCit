/*global define */
/*jshint multistr: true */
/*jslint es5: true*/
/*jslint nomen: true*/

define(function (require) {
	"use strict";
    var $;
    
    $ = require('jquery');
    
    /* CLASS */
    return function ClientState() {
        var that = this;
        
        /* CONSTRUCTOR */
        function initialize() {
            // hack: allow for direct call to on..
            that.state = $('body');  
        }
        
        /* EVENT HANDLE */
        that.onSelectDistrictEnable = function(callback) {
            that.state.on('enable_select.district_card', callback);
        };
        
        that.enableDistrictSelect = function(data) {
            that.state.trigger('enable_select.district_card', data);        
        };
                
        initialize();
    };
});