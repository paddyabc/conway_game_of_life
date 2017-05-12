"use strict";

var _ = require('lodash');
var SocketService = require('./service/socket-service');

let _singleton = Symbol();
let _reproduceCheck = Symbol();
let _liveCheck = Symbol();
let colorTemplate = _.template('rgb(${red},${green},${blue})');

const boardWidth = 50;
const boardHeight = 25;
const cellWidth = 20;
const cellHeight = 20;

class GameBoard {
    
    constructor(_token){

        if(_singleton !== _token){
            throw new Error('Cannot instantiate directly.');
        }

        this.updatePromise = Promise.resolve();

        this.data = new Array();
        this.selectedPoint = {};

        let xpos = 1; //starting xpos and ypos at 1 so the stroke will show when we make the grid below
        let ypos = 1;
        
        // iterate for rows	
        for (let row = 0; row < boardHeight; row++) {
            this.data.push( new Array() );
            
            // iterate for cells/columns inside rows
            for (let column = 0; column < boardWidth; column++) {
                this.data[row].push({
                    x: xpos,
                    y: ypos,
                    width: cellWidth,
                    height: cellHeight,
                    isDead: true,
                    cellStyle: {"stroke": "#222", "fill": "#fff"}
                })
                // increment the x position. I.e. move it over by 50 (width variable)
                xpos += cellWidth;
            }
            // reset the x position after a row is complete
            xpos = 1;
            // increment the y position for the next row. Move it down 50 (height variable)
            ypos += cellHeight;	
        }
    }

    pickColor(){
        let red = Math.round((Math.random() *255));
        let green = Math.round((Math.random() *255));
        let blue = Math.round((Math.random() *255));

        if(red >= 240 && green >= 240  && blue >= 240){

            return this.pickColor();
        }

        return {"red":red, "green": green, "blue": blue};
    }

    getBoardWidth(){
        return boardWidth;
    }

    getBoardHeight(){
        return boardHeight;
    }

    getGameData(){
        return this.data;
    }

    nextState(){

        let self = this;

        this.updatePromise = this.updatePromise.then(function(){

            var newWorld = _.cloneDeep(self.data);
            var newSelectedPoint = {};
            let neighbourTest = {}; 

            //Check all live cell and find the potential neighbours for reproduce test
            _.each(self.selectedPoint, function(color, key){

                let position = key.split("_");
                let x = parseInt(position[0]);
                let y = parseInt(position[1]);

                if (self[_liveCheck](x,y)){
                    newSelectedPoint[x + '_' + y] = color;
                } else {
                    newWorld[x][y].isDead = true;
                    newWorld[x][y].cellStyle.fill = "#fff";
                }

                var neighbours = self.getAllNeighbours(x,y);
                _.each(neighbours, function(pos){
                    neighbourTest[pos.x + '_' + pos.y] = pos;
                });
            });

            //reproduce test
            _.each(neighbourTest, function(pos){

                var check = self[_reproduceCheck](pos.x, pos.y);
                if(check){
                    newWorld[pos.x][pos.y].isDead = false;
                    let red = _.meanBy(check, function(color){return color.red});
                    let green = _.meanBy(check, function(color){return color.green});
                    let blue = _.meanBy(check, function(color){return color.blue});
                    newWorld[pos.x][pos.y].cellStyle.fill = colorTemplate({'red': red, 'green': green, 'blue': blue});
                    newSelectedPoint[pos.x + '_' + pos.y] = {"red":red, "green": green, "blue": blue};
                }
            });

            self.data = newWorld;
            self.selectedPoint = newSelectedPoint;

        });

        return this.updatePromise;

    }

    [_liveCheck](x,y){
        let neighbours = this.getAllNeighbours(x,y);
        let liveCount = 0;
        let self = this;

        _.each(neighbours, function(pos){
            let testCell = self.data[pos.x][pos.y];
            if(!testCell.isDead){
                liveCount++;
            }
        });

        if(liveCount == 2 || liveCount == 3){
            return true;
        } else {
            return false;
        }
    }

    [_reproduceCheck](x,y) {

        let neighbours = this.getAllNeighbours(x,y);
        let liveCellColors = new Array();
        let self = this;

        _.each(neighbours, function(pos){
            let testCell = self.data[pos.x][pos.y];
            if(!testCell.isDead){
                liveCellColors.push(self.selectedPoint[pos.x + '_' + pos.y]);
            }
        });

        if(liveCellColors.length == 3){
            return liveCellColors;
        } else {
            return false;
        }
        
    }

    getAllNeighbours (x,y){

        var neighbours = new Array();

        if(x - 1 >= 0){
            neighbours.push({"x": x-1, "y": y});

            if(y - 1 >= 0){
                neighbours.push({"x": x -1, "y": y-1});
            }

            if(y + 1 >= 0){
                neighbours.push({"x": x -1, "y": y+1});
            }
        }

        if(x + 1 < boardHeight){
            neighbours.push({"x": x+1, "y": y});

            if(y - 1 >= 0){
                neighbours.push({"x": x + 1, "y": y-1});
            }

            if(y + 1 >= 0){
                neighbours.push({"x": x + 1, "y": y+1});
            }
        }

        if(y - 1 >= 0){
            neighbours.push({"x": x, "y": y-1});
        }

        if(y+ 1 < boardWidth){
            neighbours.push({"x": x, "y": y+1});
        }

        return neighbours;
    }

    updateCell(x,y,color){

        let self = this;

        this.updatePromise = this.updatePromise.then(function(){

            if(!_.isNumber(x) || x < 0 || x >= boardHeight)
                return new Error("invalid position x");

            if(!_.isNumber(y) || y < 0 || y >= boardWidth)
                return new Error("invalid position y");

            if(!_.isObject(color) && !_.isNumber(color.red) && !_.isNumber(color.green)&& !_.isNumber(color.blue)){
                return new Error("invalid color object");
            }

            if(!self.data[x][y].isDead) {
                return new Error("Cell cannot be selected as it is a live cell");
            }
            
            self.data[x][y].isDead = false;
            self.data[x][y].cellStyle.fill = colorTemplate({'red':color.red, 'green':color.green, 'blue':color.blue});
            self.selectedPoint[x+'_'+y] = color;

            //SocketService.getInstance().publishMessage("updateWorld", self.data);

            return;
        });

        return this.updatePromise;
    }

    static getInstance() {
        if(!this.instance){
            this.instance = new GameBoard(_singleton);
        }

        return this.instance;
    }
}

module.exports = GameBoard;