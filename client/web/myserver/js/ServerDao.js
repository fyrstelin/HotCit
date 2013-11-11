var SERVER = 'localhost:8080',
    DEFAULT_CONTENT_TYPE = "application/json",
    log = function(msg) {console.log(msg); };


// TODO
function getAllCharacters() {};
function getCharacter() {};
function getAllDistricts() {};
function getDistrict() {};
function getImage() {};
function getGame() {};
function getOptions() {}
function getHand() {};
function getGame() {};
function createGame() {}
function getLobby() {};
function getGame() {};
function joinGame()) {}
function leaveGame() {};
function sendReady() {};
function sendAction () {};

    
/**
    example:
    create_game('mygame', 'alice', 2, 8, 
                function(body, status, textStatus, headers, method, path, data, SERVER),
                function(body, status, textStatus, headers, method, path, data, SERVER))
*/
function create_game(gameid, playerid, minplayers, maxplayers, success, error) {
    return curryAjax({
        method: 'POST',
        path: 'lobby/'+gameid,
        authorization: 'johndoe',
        data: "{\"MinPlayers\": " + minplayers + ", \"MaxPlayers\": " + maxplayers + "}",
        success: function() {
          log("Created new game " + playerid + ".");
          // console.log(arguments);
          return success.apply(this, arguments);
        },
        error: function() {
          log("ERROR: could not create new game " + playerid + ".");
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
        var body, status;
        status = jqXHR.status;
        body = jqXHR.responseText;
        textStatus = jqXHR.statusText;
        // console.log('path', path);
        return error(body, status, textStatus, headers, method, path, data, SERVER);
      }
    });
  };
