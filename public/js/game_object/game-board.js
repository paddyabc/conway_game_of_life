"use strict";

define(['lodash', '../service/sync-service'], (_, SyncService) => {

    let _singleton = Symbol();
    let colorTemplate = _.template('rgb(${red},${green},${blue})');

    const _pattern = {
        NONE: Symbol("NONE"),
        BLOCK: Symbol("BLOCK"),
        BOAT: Symbol("BOAT"),
        TUB: Symbol("TUB"),
        BLINKER: Symbol("BLINKER")
    };

    class GameBoard {

        constructor( _token){

            if(_singleton !== _token){
                throw new Error('Cannot instantiate directly.');
            }

            this.gamedata = new Array();
            this.selectedPattern = _pattern.NONE;

        }

        setPattern(pattern) {
            this.selectedPattern = pattern;
        }

        init (gamedata, color){
            let self = this;
            
            if(!this.isInit && _.isArray(gamedata) && color && _.isNumber(color.red) && _.isNumber(color.green) && _.isNumber(color.blue)){
                
                this.isInit = true;
                _.each(gamedata, (row) => {
                    self.gamedata.push(row);
                })
                this.color = color;
            }
        }

        resetData() {
            _.each(this.gamedata, (row) => {
                _.each(row, (cell) => {
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

        paintPattern(x,y){
            
            let self = this;

            if(this.gamedata[x][y].isDead) {
                this.gamedata[x][y].isDead = false;
                this.gamedata[x][y].cellStyle.fill = colorTemplate({'red':this.color.red, 'green':this.color.green, 'blue':this.color.blue});

                SyncService.getInstance().newLiveCell(x,y, this.color).catch((err)=>{
                    console.error(err);
                    self.gamedata[x][y].isDead = true;
                    self.gamedata[x][y].cellStyle.fill ="#fff";
                    alert('Cannot select the cell, please choose the other');
                });
            } else {
                alert('The cell cannot be chosen!');
            }
        }

        paintPoint(x,y,color){
            this.gamedata[x][y].isDead = false;
            this.gamedata[x][y].cellStyle.fill = colorTemplate({'red':color.red, 'green':color.green, 'blue':color.blue});
        }

        getBoardData(){
            return this.gamedata;
        }

        static getInstance(gamedata, color){
            if(!this.instance){
                this.instance = new GameBoard(_singleton);
            }

            return this.instance;
        }
    }

    GameBoard.PATTERN = _pattern;

    return GameBoard;
});