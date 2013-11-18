var SERVER, 
    DEFAULT_CONTENT_TYPE,
    PADDING,
    log, err,
    gameAPI, lobbyAPI,
    curryAjax, sendAction;

SERVER = 'localhost:8080';
DEFAULT_CONTENT_TYPE = "application/json";
PADDING = "         "; // used for console.log

// TODO: refactor to use: var dfd = new jQuery.Deferred();
// TODO: refactor to use: done(error, success)?
 
log = function(playerid, what) { 
        var id = playerid + PADDING.substring(0, PADDING.length - playerid.length);
        console.log(id + " >> \t\t" + what)
    };
        
err = function(playerid, what) {
        var id = playerid + PADDING.substring(0, PADDING.length - playerid.length);
        console.log(playerid + " >> \t\t" + what + " + failed")
    };
      
var gameAPI = {
    get: {
        options: function(gameid, playerid, success, error) {
            return curryAjax({
                method: 'GET',
                path: 'games/'+gameid+'/options/',
                authorization: playerid,
                success: function() {
                  log(playerid, "gameAPI.get.options");
                  return success.apply(this, arguments);
                },
                error: function() {
                  err(playerid, "gameAPI.get.options");
                  return error.apply(this, arguments);
                }
            });
        },
        hand: function(gameid, playerid, success, error) {
            return curryAjax({
                method: 'GET',
                path: 'games/'+gameid+'/hand/',
                authorization: playerid,
                // data: {Discard: 'fixed'}, // HACK
                success: function() {
                  log(playerid, "gameAPI.get.hand");
                  return success.apply(this, arguments);
                },
                error: function() {
                  err(playerid, "gameAPI.get.hand");
                  return error.apply(this, arguments);
                }
            });
        },
        game: function(gameid, playerid, success, error) { 
            return curryAjax({
                method: 'GET',
                path: 'games/'+gameid,
                authorization: playerid,
                success: function() {
                  log(playerid, "gameAPI.get.game(" + gameid + ")");
                  return success.apply(this, arguments);
                },
                error: function() {
                  err(playerid, "gameAPI.get.game");
                  return error.apply(this, arguments);
                }
            });
        },
    },
    do: {
        select: function(gameid, playerid, selecteeid, success, error) {
            return sendAction(gameid, playerid, {select: selecteeid}, success, error);
        },
        build: function(gameid, playerid, buildeeid, success, error) {
            return sendAction(gameid, playerid, {build: buildeeid}, success, error);
        },
        ability: function(gameid, playerid, source, target, success, error) {
            return sendAction(gameid, playerid, {ability: {source: source, target: target}}, success, error);
        },
        takeGold: function(gameid, playerid, success, error) {
            return sendAction(gameid, playerid, {action: "takegold"}, success, error);
        },
        draw: function(gameid, playerid, success, error) {
            return sendAction(gameid, playerid, {action: "drawdistricts"}, success, error);
        },
        endTurn: function(gameid, playerid, success, error) {
            return sendAction(gameid, playerid, {action: 'endturn'}, success, error);
        },
    }
}

 
var lobbyAPI = {
    joinGame: function(gameid, playerid, success, error) {
        return curryAjax({
            method: 'PUT',
            path: 'lobby/'+gameid+'/users/',
            authorization: playerid,
            success: function() {
              log(playerid, "lobbyAPI.joinGame");
              return success.apply(this, arguments);
            },
            error: function() {
              err(playerid, "lobbyAPI.joinGame");
              return error.apply(this, arguments);
            }
        });
    },
    leaveGame: function(gameid, playerid, success, error) {
        return curryAjax({
            method: 'DELETE',
            path: 'lobby/'+gameid+'/users/',
            authorization: playerid,
            success: function() {
              log(playerid, "lobbyAPI.leaveGame");
              return success.apply(this, arguments);
            },
            error: function() {
              err(playerid, "lobbyAPI.leaveGame");
              return error.apply(this, arguments);
            }
        });
    },
    flagReady: function(gameid, playerid, success, error) {
        return curryAjax({
            method: 'PUT',
            path: 'lobby/'+gameid+'/ready/',
            authorization: playerid,
            success: function() {
              log(playerid, "lobbyAPI.flagReady");
              return success.apply(this, arguments);
            },
            error: function() {
              err(playerid, "lobbyAPI.flagReady");
              return error.apply(this, arguments);
            }
        });
    },
    cancelReady: function(gameid, playerid, success, error) {
        return curryAjax({
            method: 'DELETE',
            path: 'lobby/'+gameid+'/ready/',
            authorization: playerid,
            success: function() {
              log(playerid, "lobbyAPI.cancelReady");
              return success.apply(this, arguments);
            },
            error: function() {
              err(playerid, "lobbyAPI.cancelReady");
              return error.apply(this, arguments);
            }
        });
    },
        
    /**
        example:
        create_game('mygame', 'alice', 2, 8, 
                    function(body, status, textStatus, headers, method, path, data, SERVER),
                    function(body, status, textStatus, headers, method, path, data, SERVER))
    */
    create_game: function(gameid, playerid, minplayers, maxplayers, success, error) {
        return curryAjax({
            method: 'POST',
            path: 'lobby/'+gameid,
            authorization: playerid,
            data: JSON.stringify({MinPlayers: minplayers, MaxPlayers: maxplayers}), // HACK , Discard: 'fixed'}
            success: function() {
              log(playerid, "lobbyAPI.create_game");
              return success.apply(this, arguments);
            },
            error: function() {
              err(playerid, "lobbyAPI.create_game");
              return error.apply(this, arguments);
            }
        });
    },
}


function sendAction(gameid, playerid, action, success, error) {
    var action = JSON.stringify(action);
    return curryAjax({
        method: 'PUT',
        path: 'games/'+gameid,
        authorization: playerid,
        data: action,
        success: function() {
          log(playerid, "gameApi..sendAction: " + action);
          return success.apply(this, arguments);
        },
        error: function() {
          err(playerid, "gameApi.sendAction: " + action);
          return error.apply(this, arguments);
        }
    });
}

  
/**
    takes named parameters: 
    method, path, data, success<body, textStatus, xhrObj>, error<jqXHR, textStatus>, authorization
    
    example: 
    method: 'POST',
    path: "lobby/" + gameid,
    authorization: 'alice',
    data: "{\"MinPlayers\": " + minPlayers + ", \"MaxPlayers\": " + maxPlayers + "}",
    success: function() {
      console.log("Created new game " + gameid + ".");
      console.log(arguments);
      return success.apply(this, arguments);
    },
    error: function() {
      console.log("ERROR: could not create new game " + gameid + ".");
      return error.apply(this, arguments);
    }
    

*/ 
var curryAjax = function(_arg) {
    var authorization, data, error, headers, method, path, success, url;
    
    // parameters (this way, function fails with an error, if arguments are missing)
    method = _arg.method, path = _arg.path, data = _arg.data, success = _arg.success, error = _arg.error, authorization = _arg.authorization;
    
    // set headers
    headers = {};
    // content type
    headers["Content-Type"] = DEFAULT_CONTENT_TYPE;
    // authorization, if any
    if (authorization != null) {
      headers["Authorization"] = authorization;
    }
    // data if any, null otherwise
    data = data ? data : null;
    
    // determine url
    url = "http://" + SERVER + "/" + path + "/";
    
    // do ajax call
    return $.ajax({
      async: false,
      url: url,
      type: method,
      headers: headers,
      data: data,
      success: function(body, textStatus, xhrObj) {
        var status;
        status = xhrObj.status;
        textStatus = xhrObj.statusText;
        return success(body, status, textStatus, headers, method, path, data, SERVER);
      },
      error: function(jqXHR, textStatus) {
        var body, status;var dfd = new jQuery.Deferred();
        status = jqXHR.status;
        body = jqXHR.responseText;
        textStatus = jqXHR.statusText;
        // console.log('path', path);
        return error(body, status, textStatus, headers, method, path, data, SERVER);
      }
    });
};
