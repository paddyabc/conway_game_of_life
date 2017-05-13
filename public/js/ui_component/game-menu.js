"use strict";

define(['vue','../game_object/game-board','lodash'], (Vue, GameBoard, _) => {

	return Vue.component('game-menu', {
        props: {
        	"menudata": {
        		type:Object
        	}
        },
        components: ['game-menu-item'],
        template: `
        <div class="menu">
	        <div class="menu-desc">Select Pattern:</div>
	        <div class="pattern" v-for="(data,index) in menudata" v-bind:class="{active: data.isActive}" v-on:click="itemClick(index)" v-on:activate="data.click">
	        	{{data.itemName}}
	        </div>
        </div>
        `,
        methods: {
            itemClick: function(index) {
                
                if(!this.menudata[index].isActive) {
	                _.each(this.menudata, (item) => {
	                	item.isActive = false;
	                })
	                this.menudata[index].isActive = true;
	                this.$emit("activate");
	            }
            }
        }
    });

});