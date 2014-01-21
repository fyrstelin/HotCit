/*jslint node: true, sloppy: true, eqeq: true, vars: true*/

var express = require('express');
var WebSocketServer = require('ws').Server;
var http = require('http');
var fs = require('fs');

var resources = require('./resources');

var port = 8080;

var app = express();
var server = http.createServer(app);
var wss = new WebSocketServer({
    server: server,
    verifyClient: function (client) {
        var auth = client.req.headers.authorizaion;
        return true;
    }
});

/***************************************
 * Logging and other middleware
 ***************************************/

app.use(function (req, res, next) {
    console.log("%s %s", req.method, req.url);
    next();
});

app.use(express.compress()); //not sure if this is working
app.use(express.urlencoded());
app.use(express.json());




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
function loadResource(req, res, next) {
    res.resource = resources[req.params.type];
    if (res.resource) {
        next();
    } else {
        res.status(400);
        res.end();
    }
}


app.get("/resources/:type", json, loadResource, function (req, res) {
    var data = res.resource.map(function (c) { return c.name || c.title; });
    res.end(JSON.stringify(data));
});

app.get("/resources/images/:img", function (req, res) {
    var dpi = req.params.dpi || "mdpi";
    var img = req.params.img;
    var path = "resources/images/" + dpi + "/" + img + ".png";
    res.set("content-type", "image/png");
    fs.createReadStream(path)
        .on("error", function (event) {
            console.log(event.path);
            res.status(404);
            res.end();
            console.log(path + " not found");
        })
        .pipe(res);
});

//This will not be called on GET /resources/images/foo, since the image handle will take over
app.get("/resources/:type/:who", json, loadResource, function (req, res) {
    var who = req.params.who;
    var data = res.resource.filter(function (c) { return c.name == who || c.title == who; });
    if (data.length == 1) {
        res.end(JSON.stringify(data[0]));
    } else if (data.length == 0) {
        res.status(404);
        res.end();
    } else {
        res.status(500);
        res.end("Multiple cards for " + who);
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

server.listen(port);
console.log("HotCit server started at port " + port);

