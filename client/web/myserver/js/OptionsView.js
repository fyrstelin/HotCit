define(function() {
	"use strict";
        
    var logflag = false;
    function log(msg) { if(logflag) console.log(msg); }
    var dummy = function() {};

    // REQUIRED: NEED UNIQUE idS FOR ACTIONS, BAD idEA FOR TYPE: TAKEACTION TO HAVE A MESSAGE ONLY AND NO id

    function OptionsView(model, containerid, modalid, modalbodyid, templateid) {
        this.gameid = model.gameid;
        this.model = model;
        
        this.containerid = containerid; // '#options'
        this.modalid = modalid; 
        
        this.compileT = Mustache.compile($(templateid).html());
        
        this.contentElm = $(modalid + modalbodyid); //$('#myModal .modal-body');
           
        this.elm = $(this.containerid);

        this.model.register(this);

        var that = this;

        // TODO: finish actions, cleanup and document
        // let andy handle updates from server and rendering other stuff.
        // TODO: make a render all 
        // TODO: preload images..
        // TODO: integrate with ANDY's views..
        //updateOptions('#options', options);
    };

    // TODO: invert
    OptionsView.prototype.render = function() {
        log("RENDER");

        var that = this;
        this.elm.empty();
        console.log("render",this.model);
        this.model.options.forEach(function(option) {
            var newElm = $(that.compileT(option))
                .click(function() {
                    console.log("options", option);
                    that.model.handleSelectOption(option);
            });
            that.elm.append(newElm);    
        });
        return this;
    };
    
    OptionsView.prototype.notify = function(model) {
        log("notify");

        this.model = model;
        this.render();
        return this;
    };
    
    return OptionsView;
});