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
    'js/game_object/game-board',
    'js/service/sync-service'
], function(Vue, _, GameCell, GameBoard, SyncService){

    SyncService.getInstance().connect().then(function(gameData){
      var board = GameBoard.getInstance(gameData.data, gameData.color);

      var gameBoard = new Vue({
        el: '#gameBoard',
        components: ['game-cell'],
        data: {
          board: GameBoard.getInstance().getBoardData()
        }
      });

      SyncService.getInstance().subscribe("updateWorld", function(data){
        GameBoard.getInstance().updateWorld(data);
      });

      SyncService.getInstance().subscribe("updatePoints", function(data){
        _.each(data, function(cell){
          GameBoard.getInstance().paintPoint(cell.x,cell.y,cell.color);
        });
      })
    });

});