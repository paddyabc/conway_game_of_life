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

        //Prevent to generate the white color
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

    // This is used to calculate the the next state of the game
    nextState(){

        let self = this;

        this.updatePromise = this.updatePromise.then( () => {

            var newWorld = _.cloneDeep(self.data);
            var newSelectedPoint = {};
            let neighbourTest = {}; 

            //Check all live cell and find the potential neighbours for reproduce test
            _.each(self.selectedPoint, (color, key) => {

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
                _.each(neighbours, (pos) => {
                    neighbourTest[pos.x + '_' + pos.y] = pos;
                });
            });

            //reproduce test
            _.each(neighbourTest, (pos) => {

                var check = self[_reproduceCheck](pos.x, pos.y);
                if(check){
                    newWorld[pos.x][pos.y].isDead = false;
                    let red = Math.floor(_.meanBy(check, (color) => {return color.red}));
                    let green = Math.floor(_.meanBy(check, (color) => {return color.green}));
                    let blue = Math.floor(_.meanBy(check, (color) => {return color.blue}));
                    newWorld[pos.x][pos.y].cellStyle.fill = colorTemplate({'red': red, 'green': green, 'blue': blue});
                    newSelectedPoint[pos.x + '_' + pos.y] = {"red":red, "green": green, "blue": blue};
                }
            });

            self.data = newWorld;
            self.selectedPoint = newSelectedPoint;

        });

        return this.updatePromise;

    }

    //Check whether the cell can survive in the next state
    [_liveCheck](x,y){
        let neighbours = this.getAllNeighbours(x,y);
        let liveCount = 0;
        let self = this;

        _.each(neighbours, (pos) => {
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

    //check whether the cell is reproduced in the next state
    [_reproduceCheck](x,y) {

        let neighbours = this.getAllNeighbours(x,y);
        let liveCellColors = new Array();
        let self = this;

        _.each(neighbours, (pos) => {
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

    //Get all the neighbours for a given point
    getAllNeighbours (x,y){

        var neighbours = new Array();

        if(x - 1 >= 0){
            neighbours.push({"x": x-1, "y": y});

            if(y - 1 >= 0){
                neighbours.push({"x": x -1, "y": y-1});
            }

            if(y + 1 < boardWidth){
                neighbours.push({"x": x -1, "y": y+1});
            }
        }

        if(x + 1 < boardHeight){
            neighbours.push({"x": x+1, "y": y});

            if(y - 1 >= 0){
                neighbours.push({"x": x + 1, "y": y-1});
            }

            if(y + 1 < boardWidth){
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

    //update cells data
    updateCells(data){

        let self = this;

        this.updatePromise = this.updatePromise.then( () =>{

            let pointChecker = true;

            _.each (data, (position) => {
                let x = position.x;
                let y = position.y;
                let color = position.color;

                if(!_.isNumber(x) || x < 0 || x >= boardHeight) {
                    pointChecker = false;
                    return;
                }

                if(!_.isNumber(y) || y < 0 || y >= boardWidth){
                    pointChecker = false;
                    return;
                }

                if(!_.isObject(color) && !_.isNumber(color.red) && !_.isNumber(color.green)&& !_.isNumber(color.blue)){
                    pointChecker = false;
                    return;
                }

                if(!self.data[x][y].isDead) {
                    pointChecker = false;
                    return;
                }
            });

            if (pointChecker){
                _.each(data, (position) => {
                    let x = position.x;
                    let y = position.y;
                    let color = position.color;

                    self.data[x][y].isDead = false;
                    self.data[x][y].cellStyle.fill = colorTemplate({'red':color.red, 'green':color.green, 'blue':color.blue});
                    self.selectedPoint[x+'_'+y] = color;

                });
            } else {
                return new Error("Invalid Selected Cells")
            }
  
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