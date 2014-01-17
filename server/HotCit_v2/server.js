/*jslint node: true, sloppy: true, eqeq: true, vars: true*/

var express = require('express');
var WebSocketServer = require('ws').Server;
var http = require('http');
var fs = require('fs');

var app = express();
var server = http.createServer(app);
var wss = new WebSocketServer({
    server: server,
    verifyClient: function (client) {
        var auth = client.req.headers.authorizaion;
        return true;
    }
});

/*********************************
 * Logging
 *********************************/

app.use(function (req, res, next) {
    console.log("%s %s", req.method, req.url);
    next();
});




//TODO: this should be moved to a namespace. Maybe it is already a part of express
function json(req, res, next) {
    if (req.accepts("json")) { //TODO: maybe to strict for us
        res.set('content-type', "application/json");
        next();
    } else {
        res.status(406);
        res.end();
    }
}





/**********************************
 * Resources
 **********************************/

app.get("/resources/:type", json, function (req, res) {
    var type = req.params.type;
    fs.createReadStream("resources/" + type + ".json")
        .on("error", function () {
            res.status(404);
            res.end();
        })
        .pipe(res);
});

app.get("/resources/:type/:who", json, function (req, res) {
    
    var who = req.params.who,
        type = req.params.type,
        path;
    
    if (type == 'images') {
        var dpi = req.params.dpi || "mdpi";
        path = "resources/images/" + dpi + "/" + who + ".png";
        res.set("content-type", "image/png");
        fs.createReadStream(path)
            .on("error", function (event) {
                console.log(event.path);
                res.status(404);
                res.end();
                console.log(path + " not found");
            })
            .pipe(res);
    } else {
        path = "resources/" + type + ".json";
        fs.readFile(path, function (err, data) {
            if (err) {
                res.status(400);
                res.end();
            } else {
                data = JSON.parse(data);
                data = data.filter(function (card) { return card.name == who || card.title == who; });
                if (data.length == 1) {
                    res.end(JSON.stringify(data[0]));
                } else if (data.length == 0) {
                    res.status(404);
                    res.end(who + " not found");
                } else {
                    res.status(500);
                    res.end("Multiple " + who + " found.");
                }
            }
        });
    }
});





/**
 * Websocket
 ********************************/

wss.on('connection', function (ws) {
    console.log("new websocket");
    var v, vs;
    vs = ws.upgradeReq.headers;
    ws.on("message", function (msg) {
        console.log(msg);
        ws.send(msg);
    });
    
    ws.on("close", function () {
        console.log("disconnect");
    });
});

server.listen(8080);

