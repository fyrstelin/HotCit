var SERVER = 'localhost:8080',
    DEFAULT_CONTENT_TYPE = "application/json",
    log = function(msg) {console.log(msg); };
    err = function(msg) {console.error(msg); };

function sendAction(gameid, playerid, action, success, error) {
        // action['Discard'] = 'fixed'; // HACK (AFFECTS AN UNCHANGABLE GLOBAL SERVER STATE??!?)
        var action = JSON.stringify(action);
        return curryAjax({
        method: 'PUT',
        path: 'games/'+gameid,
        authorization: playerid,
        data: action,
        success: function() {
          log("Player " + playerid + ": action: " + action);
          return success.apply(this, arguments);
        },
        error: function() {
          err("Player " + playerid + ": action failed: " + action);
          return error.apply(this, arguments);
        }
    });
}

// TODO
var gameAPI = {
    get: {
        options: function(gameid, playerid, success, error) {
            return curryAjax({
                method: 'GET',
                path: 'games/'+gameid+'/options/',
                authorization: playerid,
                success: function() {
                  log("Player " + playerid + " recieved options for game " + gameid);
                  return success.apply(this, arguments);
                },
                error: function() {
                  err("Player " + playerid + " could not recieve options for game " + gameid);
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
                  log("Player " + playerid + " recieved hand for game " + gameid);
                  return success.apply(this, arguments);
                },
                error: function() {
                  err("Player " + playerid + " could not recieve hand for game " + gameid);
                  return error.apply(this, arguments);
                }
            });
        },
        allCharacters: function() { throw new "not implemented"},
        getCharacter: function() { throw new "not implemented"},
        allDistricts: function() { throw new "not implemented"},
        district: function() { throw new "not implemented"},
        image: function() { throw new "not implemented"},
        game: function() { throw new "not implemented"},
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
              log("Player " + playerid + " joined game " + gameid);
              return success.apply(this, arguments);
            },
            error: function() {
              err("Player " + playerid + " could not join game " + gameid);
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
              log("Player " + playerid + " left game " + gameid);
              return success.apply(this, arguments);
            },
            error: function() {
              err("Player " + playerid + " could not leave game " + gameid);
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
              log("Player " + playerid + " flag ready on game " + gameid);
              return success.apply(this, arguments);
            },
            error: function() {
              err("Player " + playerid + " could not flag ready on game " + gameid);
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
              log("Player " + playerid + " cancelled ready flag on game " + gameid);
              return success.apply(this, arguments);
            },
            error: function() {
              err("Player " + playerid + " could not cancel ready flag on game " + gameid);
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
              log("Player " + playerid + " created game " + gameid);
              return success.apply(this, arguments);
            },
            error: function() {
              err("Player " + playerid + " could not create new game");
              return error.apply(this, arguments);
            }
        });
    },
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
        var body, status;
        status = jqXHR.status;
        body = jqXHR.responseText;
        textStatus = jqXHR.statusText;
        // console.log('path', path);
        return error(body, status, textStatus, headers, method, path, data, SERVER);
      }
    });
  };
