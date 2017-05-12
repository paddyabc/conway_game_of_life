"use strict";

define(['socketcluster', 'promise'], function(SC, Promise){

    let _singleton = Symbol();
    class SyncService{

        constructor(_token){
            if(_singleton !== _token){
                throw new Error('Cannot instantiate directly.');
            }
            this.port = window.location.port || 80;
        }

        connect (){
            let self = this;
            let options = {
                port: this.port
            };
            var promise = new Promise(function(resolve){
                 
                self.socket = SC.connect(options);
                self.socket.on('init', function(data){
                    resolve(data);
                });
            });

            return promise;
        }

        subscribe (channelName, callback){
            if(this.socket) {
                this.socket.subscribe(channelName).watch(callback);
            }
        }
        
        newLiveCell (x,y,color){

            let self = this;

            return new Promise(function (resolve, reject){
                 self.socket.emit('newLiveCell',{'x':x, 'y':y, 'color': color}, function(error){

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