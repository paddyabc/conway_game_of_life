"use strict";

var express = require('express');
var serveStatic = require('serve-static');
var path = require('path');

class HttpService{

    constructor(httpServer){
        var app = express();
        app.use(serveStatic(path.resolve(__dirname,'../public')));
        httpServer.on('request',app);
    }
}

module.exports = HttpService;