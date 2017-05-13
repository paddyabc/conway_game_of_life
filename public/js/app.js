"use strict";

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

require([
    'vue',
    'lodash',
    'js/ui_component/game-cell',
    'js/ui_component/game-menu',
    'js/game_object/game-board',
    'js/service/sync-service'
], function(Vue, _, GameCell, GameMenu, GameBoard, SyncService){

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
        "itemName": "TAOD", 
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

    SyncService.getInstance().connect().then(function(gameData){

      GameBoard.getInstance().init(gameData.data, gameData.color);

      SyncService.getInstance().subscribe("updateWorld", function(data){
        GameBoard.getInstance().updateWorld(data);
      });

      SyncService.getInstance().subscribe("updatePoints", function(data){
        _.each(data, function(cell){
          GameBoard.getInstance().paintPoint(cell.x,cell.y,cell.color);
        });
      });

    });

});