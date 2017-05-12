"use strict";

define(['vue', 'js/game_object/game-board'], function(Vue, GameBoard){

    return Vue.component('game-cell', {
        props: ['x','y','width','height', "rowIndex","cellIndex"],
        template: '<rect class="square" :x="x" :y="y" :width="width" :height="height" v-on:click="cellClick"></rect>',
        methods: {
            cellClick: function() {
                // gameBoard.board[this.rowIndex][this.cellIndex].cellStyle.fill= "#695";
                GameBoard.getInstance().paintSelfPoint(this.rowIndex, this.cellIndex);
            }
        }
    });
    
});