"use strict";

var HttpService = require('./service/http-service');
var SocketService = require('./service/socket-service');
var TimerService = require('./service/timer-service');

module.exports.run = function(worker) {
    var httpServer = worker.httpServer;
    var scServer = worker.scServer;

    //static web
    var httpService = new HttpService(httpServer);

    //socket cluster
    var socketService = SocketService.getInstance(scServer);
    socketService.init(scServer);

    //Start Timer
    var timerService = TimerService.getInstance();
    timerService.start();
}