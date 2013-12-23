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
        selected_value, selectedElement,
        closeBtn, cancelBtn, selectBtn;
    
   /* IMPORTS */
    Mustache = require('mustache');
    Views = require('views');

    /* TEMPLATES */
    view_template = Views.getTemplate("selection");
    header_template = Views.getTemplate("selectionHeader");
    card_choice_template = Views.getTemplate("selectionCard");
    
    /* CONSTRUCTOR */
    function SelectionView(model) {
        // console.log("INIT: SELECTVIEW");
        that = this;
        
        // small hack, must get element with correct context
        $('body').append($(Mustache.render(view_template)));
        that.elm = $('#myModal');
        that.controller = that.elm.modal.bind(that.elm);
        headerElm = that.elm.find('.modal-header');
        bodyElm = that.elm.find('.modal-body');
        
        selected_value = "_NONE";
        closeBtn = that.elm.find('.close');
        cancelBtn = that.elm.find('.cancel');
        selectBtn = that.elm.find('.select');
        
        model.addListener(that.notify);
    }

    /* PUBLIC METHOD */
    SelectionView.prototype.render = function (choices, callback, title) {
        // console.log("RENDER SELECTVIEW", choices);
        that._renderHeader(title)
            ._renderBody(choices)
            ._renderButtons(callback);
        
        // activate modal
        that.controller({ // easiest hack to remove backdrop, bootstrap error..
            keyboard: true,
            backdrop: true,
        });

        return that;
    };

    /* EVENT HANDLER */
    /* METHOD */
    // TODO: use .active instead of option
    SelectionView.prototype.select = function (value, element) {
        // console.log("selected", value);
        selected_value = value;
        if (selectedElement) {
            selectedElement.removeClass('option');
        }
        selectedElement = element;
        selectedElement.addClass('option');
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
                that.select(choice, element);
            });

            bodyElm.append(element);
        });

        return that;
    };
    
    SelectionView.prototype.notify = function() {
        // because of automatic render of single shot options,
        // hide option if model updates
        that.controller('hide');
    };

    /* METHOD */
    SelectionView.prototype._renderButtons = function (callback) {
        // event listeners
        closeBtn.off().click(function () {
            //callback('_CANCEL');
        });

        cancelBtn.off().click(function () {
            //callback('_CANCEL');
        });

        selectBtn.off().click(function () {
            // This event is fired when the modal has finished being hidden from the user (will wait for CSS transitions to complete).
            that.elm.one('hidden.bs.modal', function () {
                callback(selected_value);
            });
        });

        selectBtn.attr('disabled', 'disabled');

        return that;
    };

    return SelectionView;
});