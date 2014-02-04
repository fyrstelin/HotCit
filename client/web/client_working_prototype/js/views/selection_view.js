/*global define, console, $*/
/*jslint es5: true*/
/*jslint nomen: true*/
/*jshint multistr: true */

define(function (require) {
    "use strict";
    
    /* STATIC LOCAL VARIABLES */
    var Mustache,
        utils,
        getTemplate,
        view_template,
        header_template,
        card_choice_template;
    
   /* IMPORTS */
    Mustache = require('mustache');
    utils = require('utils');
    getTemplate = utils.getTemplate;
   
    /* TEMPLATES */
    view_template = getTemplate("selection");
    header_template = getTemplate("selectionHeader");
    card_choice_template = getTemplate("selectionCard");
    
    /* CLASS */
    return function SelectionView() {
        var that,
            bodyElm,
            headerElm,
            selectedElement,
            selected_value,
            selectedElements,
            numberOfSelected,
            closeBtn,
            cancelBtn,
            selectBtn;

        that = this;
        
        /* CONSTRUCTOR */
        function initialize() {
            that.disabled = false;
            
            // INJECT SOMEWHARE, PLACEMENT NOT RELEVANT, SMALL HACK
            $('body').append($(Mustache.render(view_template)));
            
            // ID IS NECCESSARY TO ACCESS BOOTSTRAP CONTROLLER
            that.elm = $('#myModal');
            that.controller = that.elm.modal.bind(that.elm);
                        
            headerElm = that.elm.find('.modal-header');
            bodyElm = that.elm.find('.modal-body');
                    
            closeBtn = that.elm.find('.close');
            cancelBtn = that.elm.find('.cancel');
            selectBtn = that.elm.find('.select');
        }
        
        /* METHOD */
        that.promt = function (choices, callback, title, multiselect) {
            if (that.disabled) { return; }
            
            multiselect = multiselect || false;
            
            // console.log("RENDER SELECTVIEW", choices);
            that._renderHeader(title)
                ._renderBody(choices, multiselect)
                ._renderButtons(callback);
            
            // activate modal
            that.controller({ // easiest hack to remove backdrop, bootstrap error..
                keyboard: true,
                backdrop: true,
            });
    
            return that;
        };

        /* METHOD */
        that.promtDialog = function (promt) {
            if (that.disabled) { return; }
    
            var choices, title, wrappedCallback, callback, multiselect;
            
            multiselect = promt.multiselect;
            choices = promt.choices;
            title = promt.title;
            callback = promt.callback;
            
            wrappedCallback = function (choice) {
                callback = callback(choice);
                if (callback) { that.promtDialog(callback); }
            };
                
            this.promt(choices, wrappedCallback, title, multiselect);
        };
        
        /* EVENT HANDLER */
        that._selectMultiple = function (value, element) {
            var hash = element.data('hash');
            
            // re-click cancels select
            if (selectedElements[hash]) {
                selectedElements[hash].elm.removeClass('option');
                     
                if(numberOfSelected === 0) {
                    selectBtn.attr('disabled');
                }
                    
                numberOfSelected -= 1;
                delete selectedElements[hash];
            } else {
                selectedElements[hash] = {
                    elm: element,
                    val: value
                };
                
                element.addClass('option');
                
                numberOfSelected += 1;
                if(numberOfSelected === 1) { selectBtn.removeAttr('disabled'); }
            }
        };
        
        /* EVENT HANDLER */
        that._select = function (value, element) {
            // re-click cancels select
            if (element === selectedElement) {
                that.selectedValue = undefined;
                selectBtn.attr('disabled');
                selectedElement.removeClass('option');
            } else {
                selected_value = value;
                if (selectedElement) {
                    selectedElement.removeClass('option');
                }
                selectedElement = element;
                selectedElement.addClass('option');
                selectBtn.removeAttr('disabled');
            }
        };
                
        /* STATE CHANGE */
        that.disable = function () {
            that.disabled = true;
            that.controller('hide');
        };
        
        /* STATE CHANGE */
        that.enable = function () {
            this.   disabled = false;
        };
        
         /* DELEGATE */
        that._renderHeader = function (title) {
            headerElm.empty();
            headerElm.append(
                $(Mustache.render(header_template, {'title': title}))
            );
    
            return that;
        };
        
         /* DELEGATE */
        that._renderBody = function (choices, multiselect) {
            bodyElm.empty();
            
            var selectHandle = that._select;
            if(multiselect) {
                selectedElements = {};
                numberOfSelected = 0;
                selectHandle = that._selectMultiple;
            }
                
            var hash = 0;
            choices.forEach(function (choice) {
                                       
                hash += 1;
                var element = $(
                    Mustache.render(
                        card_choice_template,
                        {'card': choice }
                    )
                );
                element.data('hash', hash);
    
                element.click(function () {
                    selectHandle(choice, element);
                });
    
                bodyElm.append(element);
            });

            return that;
        };
            
        /* DELEGATE */
        that._renderButtons = function (callback) {
            selectBtn.off().click(function () {
                // This event is fired when the modal has finished 
                // being hidden from the user (will wait for CSS transitions to complete).
                that.elm.one('hidden.bs.modal', function () {
                    callback(selected_value);
                });
            });
    
            // select disabled, when none is selected
            selectBtn.attr('disabled', 'disabled');
    
            return that;
        };
        
        initialize();
    };
});