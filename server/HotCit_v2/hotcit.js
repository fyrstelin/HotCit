/*jslint node: true, sloppy: true*/

function Game() {
    var step;
    
    function getPlayerInTurn() {
    }
    
    
    //Here goes serializable stuff
    this.toJSON = function () {
        return {
            playerInTurn: "foo"
        };
    };
}

module.exports = {
    Game: Game
};