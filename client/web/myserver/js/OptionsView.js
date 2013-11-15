// REQUIRED: NEED UNIQUE idS FOR ACTIONS, BAD idEA FOR TYPE: TAKEACTION TO HAVE A MESSAGE ONLY AND NO id
var dummy = function() {};

function OptionsView(gameid, containerid, modalid, modalbodyid, templateid) {
    this.gameid = gameid;
    this.containerid = containerid; // '#options'
    this.modalid = modalid; 
    this.compileT = Mustache.compile($(templateid).html());
    this.contentElm = $(modalid + modalbodyid); //$('#myModal .modal-body');
    this.selectedPlayer = 'hopper';
    var that = this;

    // TODO: finish actions, cleanup and document
    // let andy handle updates from server and rendering other stuff.
    // TODO: make a render all 
    // TODO: preload images..
    // TODO: integrate with ANDY's views..
    //updateOptions('#options', options);
    
    this.takeActions = {
        'Take 2 gold': gameAPI.do.takeGold,
        'Draw 2 districts and discard one of them': gameAPI.do.draw,
    }

// REQUIRED: HAND IS EMPTY!!
    this.actions = {
        'EndTurn': function(gameid, currentPlayer, option, suceess, error) { 
            gameAPI.do.endTurn(gameid, currentPlayer, suceess, error); 
        },
        'UseAbility': function(gameid, currentPlayer, option, suceess, error) {
            var contentElm = $('#myModal .modal-body');
            contentElm.html(JSON.stringify(option['Choices']))
            contentElm.append($("<br /><br />"));
            // move to/make 'ChoiceView'
            option['Choices'].forEach(function(choice) {
                var choiceElm = $("<img width=100 src='/resources/images/"+choice+"' />");
                contentElm.append(choiceElm); 
                choiceElm.click(function() {
                        contentElm.modal('hide');
                        // TODO: WHY SOURCE?
                        console.log('kill!');
                        gameAPI.do.ability(gameid, currentPlayer, "assassin", choice, dummy, dummy);
                        gameAPI.do.ability(gameid, currentPlayer, "thief", choice, dummy, dummy);
                        gameAPI.get.options(gameid, currentPlayer, function() {that.render()}, error);
                        // should mark card, and first do action when button is clicked
                        // strange side effects occur when killing a player.. - requires restart..
                        // server is not very helpfull - should send log statements...
                        $('#myModal').modal('hide');
                });
            });
            $('#myModal').modal();
        },
        'BuildDistrict': function(gameid, currentPlayer, option, suceess, error) { console.log('not implemented yet');}, 
        'TakeAction': function(gameid, currentPlayer, option, suceess, error) { that.takeActions[option['Message']](gameid, currentPlayer, dummy, dummy)},
        'Select': function(gameid, currentPlayer, option, suceess, error) {
            $('#myModal .modal-body')
                .html(JSON.stringify(option['Choices']))
                $('#myModal').modal();
        },
    };
}


// TODO: invert
OptionsView.prototype.render = function() {
    var elm = $(this.containerid);
    var that = this;
    function done(options) {
        elm.empty();
        _.each(options, function(option) {
            var newElm = $(that.compileT(option))
                .click(function() {
                    console.log(option);
                    that.actions[option['Type']](that.gameid, that.selectedPlayer, option, dummy, dummy);
                    that.render();
                });
            elm.append(newElm);    
        });
    }
    gameAPI.get.options(this.gameid, this.selectedPlayer, done, dummy);
}

OptionsView.prototype.setSelectedPlayer = function(player) {
    this.selectedPlayer = player;
    this.render();
}

// TODO: move to separate view, when updates are handled..
function ChangePlayerView(gameid, buttonid, optionsView) {
    this.gameid = gameid;
    this.buttonid = buttonid;
    this.players = [ "ada", "turing", "hopper", "wiener" ]; // HACK
    this.pid = 0;
    this.optionsView = optionsView;
};

ChangePlayerView.prototype.render = function() {
    var that = this;
    this.elm = $(this.buttonid);
    var selectedPlayer = that.players[that.pid];
    this.optionsView.setSelectedPlayer(selectedPlayer);

    this.elm.click(function() {
        that.pid++;
        that.pid = (that.pid > that.players.length-1) ? 0: that.pid;
        var selectedPlayer = that.players[that.pid];
        that.elm.html("current player is " + selectedPlayer + "++");
        that.optionsView.setSelectedPlayer(selectedPlayer);
    }).html("current player is " + selectedPlayer + "++");  
}
