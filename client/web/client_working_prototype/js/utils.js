/*global define, window, $, document*/

define(function () {
	"use strict";

    var getTemplate = (function () {
        var templates = $($.ajax({
            url: "templates.html",
            async: false
        }).responseText);
        
        return function (id) {
            return templates.find("#" + id).html();
        };
    }());
    
    function getPid() {
        // set user by #<user> in url, or default
        window.onhashchange = function () { document.location.reload(); };
        return window.location.hash.substring(1) || 'afk';
    }
    
    function containsOptionOfType(options, what) {
        return options.some(function (option) {
            return option.Type === what;
        });
    }
    
    return {
        getTemplate: getTemplate,
        getPid: getPid,
        containsOptionOfType: containsOptionOfType
    };
});