var logflag = false;
function log(msg) { if(logflag) console.log(msg); }

function ChangePlayerView(model, buttonid) {
    this.gameid = model.gameid;
    
    this.model = model;
    this.selectedPlayer = this.model.playerid;
    this.model.register(this);
    
    this.buttonid = buttonid;
    this.elm = $(this.buttonid); // careful if we want to destroy views...
    var that = this;
    this.elm.click(function() { that.model.nextPlayer() });
};
ChangePlayerView.prototype.render = function() {
    log("RENDER");
    this.elm
    this.elm.html("current player is " + this.selectedPlayer + "++");  
}
ChangePlayerView.prototype.notify = function(model) {
    log("NOTIFY");
    this.model = model;
    this.selectedPlayer = this.model.playerid;
    this.render();
}