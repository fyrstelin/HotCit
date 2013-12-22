/*global define, console, $*/
/*jslint es5: true*/
/*jslint nomen: true*/
/*jshint multistr: true */

define(function (require) {
    "use strict";
    
    /* LOCAL VARIABLES */
    // // STATIC!!!!!!
    var that, Mustache, Views,
        view_template,
        header_template,
        card_choice_template,
        bodyElm, headerElm,
        selected_value,
        closeBtn, cancelBtn, selectBtn;
    
   /* IMPORTS */
    Mustache = require('mustache');
    Views = require('views');

    /* TEMPLATES */
    view_template = Views.getTemplate("selection");
    header_template = Views.getTemplate("selectionHeader");
    card_choice_template = Views.getTemplate("selectionCard");
    
    /* CONSTRUCTOR */
    function SelectionView() {
        console.log("INIT: SELECTVIEW");
        that = this; 
        
        that.elm = $(Mustache.render(view_template));
        headerElm = that.elm.find('.modal-header');
        bodyElm = that.elm.find('.modal-body');

        selected_value = "_NONE";
        closeBtn = that.elm.find('.close');
        cancelBtn = that.elm.find('.cancel');
        selectBtn = that.elm.find('.select');
    }

    /* PUBLIC METHOD */
    SelectionView.prototype.render = function (choices, callback, title) {
        console.log("RENDER SELECTVIEW", choices);
        that._renderHeader(title)
            ._renderBody(choices)
            ._renderButtons(callback);
        
        // activate modal
        $('#myModal').modal({ // easiest hack to remove backdrop, bootstrap error..
            keyboard: true,
            backdrop: true,
        });

        return that;
    };

    /* EVENT HANDLER */
    /* METHOD */
    SelectionView.prototype.select = function (value) {
        console.log("selected", value);
        selected_value = value;
        selectBtn.removeAttr('disabled');
    };
    
    /* METHOD */
    SelectionView.prototype._renderHeader = function (title) {
        headerElm.empty();
        headerElm.append(
            $(Mustache.render(header_template, {'title': title}))
        );

        return that;
    };

    /* METHOD */
    SelectionView.prototype._renderBody = function (choices) {
        bodyElm.empty();

        choices.forEach(function (choice) {
            var element = $(
                Mustache.render(
                    card_choice_template,
                    {'card': choice}
                )
            );

            element.click(function () {
                that.select(choice);
            });

            bodyElm.append(element);
        });

        return that;
    };

    /* METHOD */
    SelectionView.prototype._renderButtons = function (callback) {
        // event listeners
        closeBtn.off().click(function () {
            callback('_CANCEL');
        });

        cancelBtn.off().click(function () {
            callback('_CANCEL');
        });

        selectBtn.off().click(function () {
            callback(selected_value);
        });

        selectBtn.attr('disabled', 'disabled');

        return that;
    };

    return SelectionView;
});