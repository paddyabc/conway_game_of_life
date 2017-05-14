"use strict";

define(['socketcluster', 'promise'], (SC, Promise) => {

    let _singleton = Symbol();
    class SyncService{

        constructor(_token){
            if(_singleton !== _token){
                throw new Error('Cannot instantiate directly.');
            }
            this.port = window.location.port || 80;
        }

        //Connect to web socket
        connect (){
            let self = this;
            let options = {
                port: this.port
            };
            var promise = new Promise((resolve) => {
                 
                self.socket = SC.connect(options);
                self.socket.on('init', (data) =>{
                    resolve(data);
                });
            });

            return promise;
        }

        //subscibe the channel
        subscribe (channelName, callback){
            if(this.socket) {
                this.socket.subscribe(channelName).watch(callback);
            }
        }
        
        //emit the signal to the sever for the action created by the user
        newLiveCell (updateData){

            let self = this;

            return new Promise((resolve, reject) => {
                 self.socket.emit('newLiveCell',updateData, (error) => {

                    if(error){
                        reject (error);
                        return;
                    } else {
                        resolve();
                    }
                });
            });
        }

        static getInstance(){
            if(!this.instance){
                this.instance = new SyncService(_singleton);
            }
            return this.instance;
        }
    }


    return SyncService;
});