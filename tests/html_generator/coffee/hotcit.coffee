
###
TODO: 
Modulasize: 
- move curry methods to another file: GameRequester
- move make_lobby_view to: GameViewMaker: couple with backbone.view/model
- use require to include all in single js file
###

###
CHECK: CREATE GAME
CHECK: JOIN GAME
DECLARE READY GAME
DECLARE UNREADY GAME
CHECK: LEAVE GAME
CHECK: GET GAME
CHECK: GET GAMES
###

DEBUG = true
DEFAULT_USER = 'Alice'
UPDATE_INTERVAL = 1000
SERVER = 'localhost:53998'
GAMEID = '#gameid'
USERID = '#userid'
LOBBY_VIEW = '#lobby_view'
TO_SERVER_VIEW = '#to_server_view'
FROM_SERVER_VIEW = '#from_server_view'
TEMPLATES = '#templates'
GAME_TEMPLATE = '#game_template'
NUMGAMES = '#numGames'
CONTROLLER = '#controller'
GENERATE_RANDOM_GID = '#generate_random_gameid'
PAUSE_BTN = '#pauseBtn'
CREATE_BTN = '#createBtn'
JOIN_BTN = '#joinBtn'
LEAVE_BTN = '#leaveBtn'
READY_BTN = '#readyBtn'
UNREADY_BTN = '#unreadyBtn'
RECORD_VIEW = '#record_view'

setGameId = (id) -> $("#{GAMEID}").val(id)
getGameId = () -> $("#{GAMEID}").val()
getUserId = () -> $("#{USERID}").val()
setUserId = (id) -> $("#{USERID}").val(id)

getGenRandomFlag = () -> 	$("#{CONTROLLER} #{GENERATE_RANDOM_GID}" ).is(':checked')

templates = {
	getGameTemplate: () -> $("#{TEMPLATES} #{GAME_TEMPLATE}").html()
}
lobby_view = {
	setGames: (html) -> $("#{LOBBY_VIEW}").html(html)
	setNumGames: (num) -> $("#{NUMGAMES}").html('(' + num + ')')
}

from_server_view = {
	setBody: (body) -> $("#{FROM_SERVER_VIEW} #body").html(body)
	setStatus: (status, textStatus) -> $("#{FROM_SERVER_VIEW} #status").html("#{status}  #{textStatus}")
}

to_server_view = {
	setRequest: (request) -> $("#{TO_SERVER_VIEW} #request").html(request)
	setHeaders: (headers) -> $("#{TO_SERVER_VIEW} #headers").html(headers)
	setData: (data) -> 	$("#{TO_SERVER_VIEW} #data").html(data)
}
record_view = {
	append: (line) -> 
		el = $("#{RECORD_VIEW} textarea")
		text = el.text()
		text += el.val()
		el.val(text + '\n' + line)
	record: (description=' ', method=' ', path=' ', username, params=' ', statuscode=' ', textStatus=' ', data=' ') ->
		line = "[#{description}, #{method}, /#{path}, #{username}, #{params}, #{statuscode}, #{textStatus}, #{data}]"
		record_view.append(line)
	init: () ->
		record_view.append("#{SERVER}\n")
		record_view.append("[description, method, url, username, params, statuscode, reason, data]")
}

setupSetGameIdOnClick = () ->
	$(".game h5").live('click', () -> setGameId($(this).attr('gid')))


make_lobby_view = (games_object) ->
	# make game html objects
	game_template = templates.getGameTemplate()
	
	games = ""
	for own gameid, game of games_object
		content = for own key, value of game
					"#{key}: #{value}"

		games += game_template
				.replace(/GAMEID/g, gameid)
				.replace(/CONTENT/g, content.join('<br />'))

	# make games list html object with game objects
	lobby_view.setGames(games)
	lobby_view.setNumGames(Object.keys(games_object).length)

generate_gameid = (gameid) -> 
	id = Math.floor(Math.random()*100000)
	"mygame#{id}"


handleResponse = (data, status, textStatus, headers, method, path, params, server) ->
	request = "#{method}  #{server}/#{path}/"
	#data = JSON.stringify(data, undefined, 2)

	tdata = if $.isPlainObject(data) then "@#{JSON.stringify(data)}@"  else data
	tparams = if $.isPlainObject(params) then "@#{JSON.stringify(params)}@"  else params
	record_view.record(' ', method, path, headers['Authorization'], tparams, status, textStatus, tdata)

	fheaders = ''
	for own key, value of headers
		fheaders += "#{key} : #{value}<br />"

	fdata = ''
	if $.isPlainObject(data)
		for own key, value of data
			fdata += "#{key} : #{value}<br />" 
	else fdata = data

	from_server_view.setBody(fdata)
	from_server_view.setStatus(status, textStatus)

	to_server_view.setRequest(request)
	to_server_view.setHeaders(fheaders)
	to_server_view.setData(params)	


update_lobby = () -> 	
	doGetLobbyGames(
		(body, status, textStatus, headers, method, path, data, server) -> make_lobby_view(body)
		(body, status, textStatus, headers, method, path, data, server) -> lobby_view.setGames(textStatus))


setupPauseBtn = () ->	
	id = setInterval(update_lobby, UPDATE_INTERVAL);

	$("#{PAUSE_BTN}").click ->
		if id
			clearInterval(id)
			id = false
			$(this).html('update off')
		else 
			id = setInterval(update_lobby, UPDATE_INTERVAL);
			$(this).html('update on')

setupCreateBtn = () ->
	$("#{CREATE_BTN}").click -> 
		gid = getGameId()
		uid = getUserId()
		doCreateGame(gid, uid, handleResponse, handleResponse)
		if getGenRandomFlag()
			setGameId(generate_gameid())

setupJoinBtn = () ->
	$("#{JOIN_BTN}").click -> 
		gid = getGameId()
		uid = getUserId()
		doJoinGame(gid, uid, handleResponse, handleResponse)

setupLeaveBtn = () ->
	$("#{LEAVE_BTN}").click -> 
		gid = getGameId()
		uid = getUserId()
		doLeaveGame(gid, uid, handleResponse, handleResponse)

setupReadyBtn = () ->
	$("#{READY_BTN}").click -> 
		gid = getGameId()
		uid = getUserId()
		doDeclareReady(gid, uid, handleResponse, handleResponse)

setupUnreadyBtn = () ->
	$("#{UNREADY_BTN}").click -> 
		gid = getGameId()
		uid = getUserId()
		doRegretReady(gid, uid, handleResponse, handleResponse)		


@setup_controller = () ->
	setUserId("#{DEFAULT_USER}")
	setGameId(generate_gameid())
	update_lobby()

	setupPauseBtn()
	setupCreateBtn()
	setupJoinBtn()
	setupLeaveBtn()
	setupReadyBtn()
	setupUnreadyBtn()
	setupSetGameIdOnClick()
	record_view.init()

curryAjax = ({method, path, data, success, error, authorization}) ->
	headers = {}
	headers["Content-Type"] = "application/json"
	headers["Authorization"] = authorization if authorization?

	url = "http://#{SERVER}/#{path}/" 
	$.ajax
		async: false
		url: url
		type: method
		headers: headers
		#data: data

		#beforeSend: (xhrObj) ->
		#	xhrObj.setRequestHeader 
		#	xhrObj.setRequestHeader "Authorization", authorization if authorization?

		success: (body, textStatus, xhrObj) ->
			status = xhrObj.status 
			textStatus = xhrObj.statusText
			success body, status, textStatus, headers, method, path, data, SERVER
			#console.log "Statuscode returned was #{status}", result

		error: (jqXHR, textStatus) ->
			status = jqXHR.status
			body = jqXHR.responseText
			textStatus = jqXHR.statusText
			console.log 'path', path
			error body, status, textStatus, headers, method, path, data, SERVER
			#console.log "Statuscode returned was #{status}", textStatus


@doDeclareReady = (gameid, authorization, success, error) ->
	curryAjax(
		method: 'PUT'
		path: "lobby/#{gameid}/ready"  
		authorization: authorization

		success: () ->
			console.log "Declared ready to play game #{gameid}." 
			success.apply this, arguments

		error: () ->
			console.log "Could not declare ready to play #{gameid}"
			error.apply this, arguments
	)


@doRegretReady = (gameid, authorization, success, error) ->
	curryAjax(
		method: 'DELETE'
		path: "lobby/#{gameid}/ready"  
		authorization: authorization

		success: () ->
			console.log "Regretted joing game #{gameid}." 
			success.apply this, arguments

		error: () ->
			console.log "Could not regret joining #{gameid}" 
			error.apply this, arguments
	)

@doLeaveGame = (gameid, authorization, success, error) ->
	curryAjax(
		method: 'DELETE'
		path: "lobby/#{gameid}/users"  
		authorization: authorization

		success: () -> 
			console.log "Left game #{gameid}."
			success.apply this, arguments

		error: () ->
			console.log "Could not leave #{gameid}"
			error.apply this, arguments
	)

@doJoinGame = (gameid, authorization, success, error) ->
	curryAjax(
		method: 'PUT'
		path: "lobby/#{gameid}/users"  
		authorization: authorization

		success: () ->
			console.log "Joined game #{gameid}."
			success.apply this, arguments

		error: () ->
			console.log "Could not join #{gameid}",
			error.apply this, arguments
	)
	

@doGetLobbyGame = (id, success, error) ->
	curryAjax(
		method: 'GET'
		path: "lobby/#{id}"  

		success: () ->
			console.log "Get lobby game #{id}."
			success.apply this, arguments

		error: () ->
			console.log "ERROR: could not get lobby game #{id}."
			error.apply this, arguments

	)


@doGetLobbyGames = (success, error) ->
	curryAjax(
		method: 'GET'
		path: 'lobby'

		success: () ->
			#console.log "Get list of all lobby games."
			success.apply this, arguments

		error: () ->
			#console.log "ERROR: could not get list of all lobby games"
			error.apply this, arguments
	)


@doCreateGame = (gameid, owner, success, error) ->
	curryAjax(
		method: 'POST'
		path: "lobby/#{gameid}"  
		authorization: owner  

		success: () ->
			console.log "Created new game #{gameid}."
			console.log arguments
			success.apply this, arguments

		error: () ->
			console.log "ERROR: could not create new game #{gameid}."
			error.apply this, arguments

	)

