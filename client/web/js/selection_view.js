define(function(require) {
   "use strict";
   var Mustache = require('mustache'); 

   var view_template = "\
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

    var header_template = "\
        <button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button>\
        <h4 class='modal-title' id='myModalLabel'>{{title}}</h4>\
    ";

    var card_choice_template = "<img width=100 src='/resources/images/{{card}}' />";

    function SelectionView() {
        console.log("INIT: SELECTVIEW");
        var title = "Please select a card";
        this.elm = $(Mustache.render(view_template));
        this.headerElm = this.elm.find('.modal-header');
        this.bodyElm = this.elm.find('.modal-body');

        this.current_choice = "_NONE";
        this.closeBtn = this.elm.find('.close');
        this.cancelBtn = this.elm.find('.cancel');
        this.selectBtn = this.elm.find('.select');
    }

    SelectionView.prototype._renderHeader = function(title) {
        this.headerElm.empty();
        this.headerElm.append(
            $(Mustache.render(header_template, {'title': title})));  

        return this; 
    }

    SelectionView.prototype._renderBody = function(choices) {
        var that = this;

        this.bodyElm.empty();

        choices.forEach(function(choice) {
            var element = 
                $(Mustache.render(
                    card_choice_template, {'card':choice}));

            element.click(function() {
                that.select(choice);
            })

            that.bodyElm.append(element);
        });

        return this;
    }

    SelectionView.prototype._renderButtons = function(callback) {
        var that = this;

        // event listeners
        this.closeBtn.off().click(function() {
            callback('_CANCEL');
        });

        this.cancelBtn.off().click(function() {
            callback('_CANCEL');
        });

        this.selectBtn.off().click(function() {
            callback(that.selected_value);
        })

        this.selectBtn.attr('disabled', 'disabled');

        return this;
    }

    SelectionView.prototype.render = function(choices, callback, title) {
        console.log("RENDER SELECTVIEW", choices);
        
        var that = this;

        this._renderHeader(title)
            ._renderBody(choices)
            ._renderButtons(callback);
        
        // activate modal
        $('#myModal').modal({ // easiest hack to remove backdrop, bootstrap error..
            keyboard: true,
            backdrop: true,
        });

        return this;
    }

    SelectionView.prototype.select = function(value) {
        console.log("selected", value);
        this.selected_value = value;
        this.selectBtn.removeAttr('disabled');
    }

    return SelectionView;
});