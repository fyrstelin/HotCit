// hack: THIS GOES GLOBAL!!
var logflag = true;
function log(msg) { if(logflag) console.log(msg); }

// simple_gameplay_v2.test
var simulate = {
    lobby: function(playernames, success, error) {
        // LOPPY 
        log("\nsimulate.lobby");
        var gameid = 'game'+Math.floor(Math.random()*9999);
        lobbyAPI.create_game(gameid, playernames[0], 3, 5, success, error);
        lobbyAPI.joinGame(gameid, playernames[1], success, error);
        lobbyAPI.joinGame(gameid, playernames[2], success, error);
        lobbyAPI.leaveGame(gameid, playernames[1], success, error);
        lobbyAPI.flagReady(gameid, playernames[0], success, error);
        lobbyAPI.joinGame(gameid, playernames[3], success, error);
        lobbyAPI.flagReady(gameid, playernames[3], success, error);
        lobbyAPI.cancelReady(gameid, playernames[0], success, error);
        lobbyAPI.flagReady(gameid, playernames[2], success, error);
        lobbyAPI.flagReady(gameid, playernames[0], success, error);
        return gameid;
    },
    characterselect: function(gameid, success, error) {
       // SELECT CHARACTERS
       log("\nsimulate.characterselect");
       
        function autoSelect() {
            // next player?
            var playernameinturn = 'whoops';
            gameAPI.get.game(gameid, "", function() {
                playernameinturn = arguments[0]['PlayerInTurn'];
            }, error);
            
         
            // parse each players options
            gameAPI.get.options(gameid, playernameinturn, function(body) {
                var choice = body[0]['Choices'][0];
                gameAPI.do.select(gameid, playernameinturn, choice, success, error(gameid, playernameinturn));
            }, error(gameid, playernameinturn));
        }
        
        autoSelect(0);
        autoSelect(2);
        autoSelect(3);
        autoSelect(0);
        autoSelect(2);
        autoSelect(3);
    }
}