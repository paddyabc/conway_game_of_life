"use strict";

//RequireJS configuration
require.config({
  baseUrl: "",
  paths: {
    'vue': './js/bower_components/vue/dist/vue.min',
    'lodash': './js/bower_components/lodash/dist/lodash.min',
    'socketcluster': '/js/bower_components/socketcluster-client/socketcluster.min',
    'promise': '/js/bower_components/bluebird/js/browser/bluebird.min'
  },
  shim: {
    vue: {
      exports: 'Vue'
    },
    lodash: {
      exports: '_'
    },
    socketcluster: {
      exports: 'sc'
    },
    promise: {
      exports: 'promise'
    }
  }

});

//RequireJS main function
require([
    'vue',
    'lodash',
    'js/ui_component/game-cell',
    'js/ui_component/game-menu',
    'js/game_object/game-board',
    'js/service/sync-service'
], function(Vue, _, GameCell, GameMenu, GameBoard, SyncService){

    //Menu Item
    var menu = [

      {
        "itemName": "None", 
        "click": function(){
          GameBoard.getInstance().setSelectPattern(GameBoard.PATTERN.NONE);
        }, 
        "isActive": true
      },
      {
        "itemName": "Block", 
        "click": function(){
          GameBoard.getInstance().setSelectPattern(GameBoard.PATTERN.BLOCK);
        }, 
        "isActive": false
      },
      {
        "itemName": "Boat", 
        "click": function(){
          GameBoard.getInstance().setSelectPattern(GameBoard.PATTERN.BOAT);
        }, 
        "isActive": false
      },
      {
        "itemName": "Toad", 
        "click": function(){
          GameBoard.getInstance().setSelectPattern(GameBoard.PATTERN.TOAD);
        }, 
        "isActive": false
      },
      {
        "itemName": "Blinker", 
        "click": function(){
          GameBoard.getInstance().setSelectPattern(GameBoard.PATTERN.BLINKER);
        }, 
        "isActive": false
      }

    ];

    //VueJS binding
    var gameBoard = new Vue({
      el: '#gameBoard',
      components: ['game-cell','game-menu'],
      data: function() {
        return {
          board: GameBoard.getInstance().getBoardData(),
          menudata: menu
        };
      }
    });

    //Create the web socket for synchronize the game world
    SyncService.getInstance().connect().then(function(gameData){

      GameBoard.getInstance().init(gameData.data, gameData.color);
      //Subscribe the channel to update the gameworld
      SyncService.getInstance().subscribe("updateWorld", function(data){
        GameBoard.getInstance().updateWorld(data);
      });
      //Subscribe the channel to update the others user action
      SyncService.getInstance().subscribe("updatePoints", function(data){
        _.each(data, function(cell){
          GameBoard.getInstance().paintPoint(cell.x,cell.y,cell.color);
        });
      });

    });

});