"use strict";

let _singleton = Symbol();

var GameBoard = require('../game-board');
var SocketService = require('./socket-service')

class TimerService {

    constructor(_token){
        if(_singleton !== _token){
            throw new Error('Cannot instantiate directly.');
        }
    }

    start (){
        if(!this.isStart){
            this.isStart = true;
            this.timer = setInterval( () => {

                GameBoard.getInstance().nextState().then( () =>{
                    SocketService.getInstance().publishMessage("updateWorld", GameBoard.getInstance().getGameData());
                });

            }, 1000);
        }
    }

    stop (){
        this.isStart = false;
        if(this.timer){
            clearInterval(this.timer);
        }
    }

    static getInstance(){
        if(!this.instance){
            this.instance = new TimerService(_singleton);
        }

        return this.instance;
    }
}

module.exports = TimerService;