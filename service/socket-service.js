"use strict";

let _singleton = Symbol();
var GameBoard = require('../game-board');

class SocketService {

    constructor(_token){

        if(_singleton !== _token){
            throw new Error('Cannot instantiate directly.');
        }
    }

    init (scServer){
        this.scServer = scServer;
        var gameBoard = GameBoard.getInstance();
        let self = this;

        //prevent the malicious client use the preserved publish channel
        scServer.addMiddleware(scServer.MIDDLEWARE_PUBLISH_IN, (req, next) => {
            
            if (req.channel.indexOf('external/') == 0) {
                next();
            } else {
                var err = new Error('Clients are not allowed to publish to the ' + req.channel + ' channel.');
                err.name = 'ForbiddenPublishError';
                next(err);
            }
        });

        scServer.on('connection', (socket) => {
           
            let connectMessage = {"data": gameBoard.getGameData(), "color": gameBoard.pickColor()};
            socket.emit('init',connectMessage);
            
            socket.on('newLiveCell', (data, response) => {

                gameBoard.updateCells(data).then((error) =>{

                    if(error){
                        let message = {"code": -1, "message": error.message, data: data};
                        response(-1, message);
                    }else {
                        response(null, {"code":0, "message": "success"});
                    }

                    self.publishMessage("updatePoints", data);
                });
                
            });
        });
    }

    publishMessage(channelName, data){
        this.scServer.exchange.publish(channelName, data);
    }

    static getInstance() {
        if(!this.instance){
            this.instance = new SocketService(_singleton);
        }

        return this.instance;
    }

}


module.exports = SocketService;