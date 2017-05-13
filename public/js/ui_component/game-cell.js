"use strict";

define(['vue', 'js/game_object/game-board'], (Vue, GameBoard) =>{

    return Vue.component('game-cell', {
        props: ['x','y','width','height', "rowIndex","cellIndex"],
        template: '<rect class="square" :x="x" :y="y" :width="width" :height="height" v-on:click="cellClick"></rect>',
        methods: {
            cellClick: function() {
                
                GameBoard.getInstance().paintPattern(this.rowIndex, this.cellIndex);
            }
        }
    });
    
});