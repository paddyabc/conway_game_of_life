"use strict";

define(['lodash', '../service/sync-service'], (_, SyncService) => {

    let _singleton = Symbol();
    let colorTemplate = _.template('rgb(${red},${green},${blue})');

    //Define the available pattern
    const _pattern = {
        NONE: Symbol("NONE"),
        BLOCK: Symbol("BLOCK"),
        BOAT: Symbol("BOAT"),
        TOAD: Symbol("TOAD"),
        BLINKER: Symbol("BLINKER")
    };

    //Define the Map for each pattern
    const _patternBuilder = {};
    _patternBuilder[_pattern.NONE] = (x, y) => {
        return [ {"x":x, "y":y} ];
    }; 
    _patternBuilder[_pattern.BLOCK] = (x, y) => {
        return [ 
            {"x":x, "y":y},
            {"x":x, "y":y + 1},
            {"x":x + 1, "y":y},
            {"x":x + 1, "y":y + 1},
        ];
    }; 
    _patternBuilder[_pattern.BOAT] = (x, y) => {
        return [ 
            {"x":x, "y":y},
            {"x":x, "y":y + 1}, 
            {"x":x + 1, "y":y},
            {"x":x + 1, "y":y +2},
            {"x":x + 2, "y":y + 1},
        ];
    }; 
    _patternBuilder[_pattern.TOAD] = (x, y) => {
        return [ 
            {"x":x,"y":y+1},
            {"x":x,"y":y+2},
            {"x":x,"y":y+3},
            {"x":x+1,"y":y},
            {"x":x+1,"y":y+1},
            {"x":x+1,"y":y+2}
        ];
    }; 
    _patternBuilder[_pattern.BLINKER] = (x, y) => {
        return [ 
            {"x":x,"y":y},
            {"x":x,"y":y + 1}, 
            {"x":x,"y":y + 2} 
        ];
    }; 

    class GameBoard {

        constructor( _token){

            if(_singleton !== _token){
                throw new Error('Cannot instantiate directly.');
            }

            this.gamedata = new Array();
            this.selectedPattern = _pattern.NONE;

        }

        //Set the user selected pattern 
        setSelectPattern(pattern) {
            this.selectedPattern = pattern;
        }

        //init the game
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

        //reset the game data
        resetData() {
            _.each(this.gamedata, (row) => {
                _.each(row, (cell) => {
                    cell.isDead = true,
                    cell.cellStyle.fill = "#fff";
                });
            });
        }

        //update the game world to sync with the server
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

        //Paint the pattern
        paintPattern(x,y){
            
            let self = this;
            let patternArray = _patternBuilder[this.selectedPattern](x,y);
            let patternValidCheck = true;

            //Check whether it is valid to display the patter 
            _.each(patternArray, (position) => {
                let xpos = position.x;
                let ypos = position.y;
                if(xpos < 0 || xpos >= self.gamedata.length){
                    patternValidCheck = false;
                    return;
                }
                if(ypos < 0 || ypos >= self.gamedata[0].length){
                    patternValidCheck = false;
                    return;
                }
                if(!self.gamedata[xpos][ypos].isDead)
                    patternValidCheck = false;
            });

            if(patternValidCheck){

                let syncData = new Array();

                //update the current view of the user
                _.each(patternArray, (position) => {

                    let xpos = position.x;
                    let ypos = position.y;
                    let color = position.color;

                    self.gamedata[xpos][ypos].isDead = false;
                    self.gamedata[xpos][ypos].cellStyle.fill = colorTemplate({'red':self.color.red, 'green':self.color.green, 'blue':self.color.blue});

                    syncData.push({"x":xpos,"y":ypos,color:self.color});
                });

                //Send to the server to update the game world
                SyncService.getInstance().newLiveCell(syncData).catch((err)=>{
                    console.error(err);
                    //If the server reject the change, rollback the change in the current view and alert the user
                    _.each(patternArray, (position) => {
                        let xpos = position.x;
                        let ypos = position.y;
                        self.gamedata[x][y].isDead = true;
                        self.gamedata[x][y].cellStyle.fill ="#fff";
                    });
                    alert('Cannot select the cells, please choose the others');
                });

            } else {
                alert('The cell cannot be chosen!');
            }
        }

        //paint a point to a specified color
        paintPoint(x,y,color){
            this.gamedata[x][y].isDead = false;
            this.gamedata[x][y].cellStyle.fill = colorTemplate({'red':color.red, 'green':color.green, 'blue':color.blue});
        }

        //return the gameboard data
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