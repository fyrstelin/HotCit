define(function(require) {
   "use strict";
   var Mustache = require('mustache'); 

   var view_template = "\
    <div class='modal fade' id='myModal' tabindex='-1' role='dialog' aria-labelledby='myModalLabel' aria-hidden='true'>\
      <div class='modal-dialog'>\
        <div class='modal-content'>\
          <div class='modal-header'>\
            <button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button>\
            <h4 class='modal-title' id='myModalLabel'>Please select a card</h4>\
          </div>\
          <div class='modal-body'>\
            Did you know assassin is spelled with a lot of s's?\
          </div>\
          <div class='modal-footer'>\
            <button type='button' class='cancel btn btn-default' data-dismiss='modal'>Cancel</button>\
            <button type='button' class='select btn btn-primary' data-dismiss='modal'>Select</button>\
          </div>\
        </div><!-- /.modal-content -->\
      </div><!-- /.modal-dialog -->\
    </div><!-- /.modal -->\
    ";

    var card_choice_template = "<img width=100 src='/resources/images/{{card}}' />";

    function SelectView() {
        console.log("INIT: SELECTVIEW");
        this.elm = $(view_template);
        $('body').append(this.elm);

        this.current_choice = "_NONE";
        this.closeBtn = this.elm.find('.close');
        this.cancelBtn = this.elm.find('.cancel');
        this.selectBtn = this.elm.find('.select');
    }

    SelectView.prototype.render = function(choices, callback) {
        console.log("RENDER SELECTIVEW", choices);
        
        var that = this;
        var container = this.elm.find('.modal-body');
        container.empty();

        // render all choices
        choices.forEach(function(choice) {
            var element = $(Mustache.render(card_choice_template, {'card':choice}));

            element.click(function() {
                that.select(choice);
            })
            container.append(element);
        });

        // event listeners
        this.closeBtn.click(function() {
            callback('_CANCEL');
        });

        this.cancelBtn.click(function() {
            callback('_CANCEL');
        });

        this.selectBtn.click(function() {
            callback(that.selected_value);
        })

        this.selectBtn.attr('disabled', 'disabled');

        $('#myModal').modal({ // easiest hack to remove backdrop, bootstrap error..
            keyboard: true,
            backdrop: true,
        });

        return this;
    }

    SelectView.prototype.select = function(value) {
        console.log("selected", value);
        this.selected_value = value;
        this.selectBtn.removeAttr('disabled');
    }

    return SelectView;
});