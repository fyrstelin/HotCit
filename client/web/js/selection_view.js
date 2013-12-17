/*global define, console, $*/
/*jslint es5: true*/
/*jslint nomen: true*/
/*jshint multistr: true */

define(function (require) {
    "use strict";
    
    /* LOCAL VARIABLES */
    var that, Mustache,
        view_template,
        header_template,
        card_choice_template,
        bodyElm, headerElm,
        selected_value,
        closeBtn, cancelBtn, selectBtn;
    
   /* IMPORTS */
    Mustache = require('mustache');

    /* TEMPLATES */
    view_template = "\
    <div class='modal fade' id='myModal' tabindex='-1' role='dialog' aria-labelledby='myModalLabel' aria-hidden='true'>\
      <div class='modal-dialog'>\
        <div class='modal-content'>\
          <div class='modal-header'></div>\
          <div class='modal-body'></div>\
          <div class='modal-footer'>\
            <button type='button' class='cancel btn btn-default' data-dismiss='modal'>Cancel</button>\
            <button type='button' class='select btn btn-primary' data-dismiss='modal'>Select</button>\
          </div>\
        </div><!-- /.modal-content -->\
      </div><!-- /.modal-dialog -->\
    </div><!-- /.modal -->\
    ";

    header_template = "\
        <button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button>\
        <h4 class='modal-title' id='myModalLabel'>{{title}}</h4>\
    ";
    
    card_choice_template = "<img width=100 src='/resources/images/{{card}}' />";
    
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