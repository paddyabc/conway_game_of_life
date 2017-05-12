"use strict";

define(['lodash', '../service/sync-service'], function(_, SyncService){

    let _singleton = Symbol();
    let colorTemplate = _.template('rgb(${red},${green},${blue})');

    class GameBoard {

        constructor(gamedata, color, _token){

            if(_singleton !== _token){
                throw new Error('Cannot instantiate directly.');
            }

            this.gamedata = gamedata
            this.color = color
        }

        resetData() {
            _.each(this.gamedata, function(row){
                _.each(row, function(cell){
                    cell.isDead = true,
                    cell.cellStyle.fill = "#fff";
                })
            });
        }

        updateWorld(data){
            let self = this;
            for (let row = 0; row < self.gamedata.length; row++) {
                for (let column = 0; column < self.gamedata[row].length; column++) {
                    self.gamedata[row][column].x = data[row][column].x;
                    self.gamedata[row][column].y = data[row][column].y;
                    self.gamedata[row][column].isDead =  data[row][column].isDead;
                    self.gamedata[row][column].cellStyle = data[row][column].cellStyle;
                }
            }
        }

        paintPattern(){
            
        }

        paintSelfPoint(x,y){
            
            let self = this;
            this.gamedata[x][y].isDead = false;
            this.gamedata[x][y].cellStyle.fill = colorTemplate({'red':this.color.red, 'green':this.color.green, 'blue':this.color.blue});

            SyncService.getInstance().newLiveCell(x,y, this.color).catch(function(err){
                console.error(err);
                self.gamedata[x][y].isDead = true;
                self.gamedata[x][y].cellStyle.fill ="#fff";
                alert('Cannot select the cell, please choose the other');
            });
        }

        paintPoint(){

        }

        getBoardData(){
            return this.gamedata;
        }

        static getInstance(gamedata, color){
            if(!this.instance && _.isArray(gamedata) && color && _.isNumber(color.red) && _.isNumber(color.green) && _.isNumber(color.blue)){
                this.instance = new GameBoard(gamedata,color, _singleton);
            }

            return this.instance;
        }
    }

    return GameBoard;
});