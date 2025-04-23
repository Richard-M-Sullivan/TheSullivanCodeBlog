// sudoku-board.js
//
// Author: Richard M. Sullivan
//
// Description:
// This file contains the Sudokuboard class, and has helper functions for managing the board.

export class BadNumFinder {
    constructor() {
        // bad numbers found
        this.badNums = new Set();
        // recording location of found numbers
        this.numCords = {};
    }

    addNum(num, row, col) {
        // if no number do not add coordinate
        if (num === "") {
            return;
        }

        // if first time seeing number create dictionary and list, then add item
        if (this.numCords[num] === undefined) {
            this.numCords[num] = [];
            this.numCords[num].push({"num":num, "row":row, "col":col});
        // if not first time seeing number add to dictionary and notate in badnumber set
        } else {
            this.numCords[num].push({"num":num, "row":row, "col":col});
            this.badNums.add(num);
        }
    }

    getBadNums() {
        let badData = [];
        // iterate through all the bad numbers
        for (let badNum of this.badNums.values()) {
            // store the coordinates related to the bad number in bad data
            badData = badData.concat(this.numCords[badNum]);
        }

        // then return bad data
        return badData;
    }
}

export class SudokuBoard {
    constructor() {
        this.rows = 9;
        this.cols = 9;

        this.board = [];

        // pupulate the original and solution boards with empty data
        for (let i=0; i<9; i++) {
            let row = [];
            for (let j=0; j<9; j++) {
                row.push("");
            }
            this.board.push(row);
        }
    }

    setBoard(board) {
        this.board = board;
    }

    // filter out bad board values
    cleanBoard() {
        for (let row=0; row < this.rows; row++) {
            for (let col=0; col < this.cols; col++) {
                if ( /[1-9]/.test(this.board[row][col]) === false ){
                    this.board[row][col] = "";
                }
            }
        }
    }

    // reset all values to be blank
    clearBoard() {
        for (let row=0; row < this.rows; row++) {
            for (let col=0; col < this.cols; col++) {
                this.board[row][col] = "";
            }
        }
    }

    // check if a row is valid
    checkRow(row_num) {
        let numTracker = new BadNumFinder();
        // iterate over all cols in the row
        for (let col=0; col < this.cols; col++) {
            let val = this.board[row_num][col];
            // add the entry to the bad num finder
            numTracker.addNum(val, row_num, col);
        }

        return numTracker.getBadNums();
    }

    // check if a column is valid
    checkCol(col_num) {
        let numTracker = new BadNumFinder();
        // iterate over all cols in the row
        for (let row=0; row < this.rows; row++) {
            let val = this.board[row][col_num];
            numTracker.addNum(val, row, col_num);
        }

        return numTracker.getBadNums();
    }

    // check if a block is valid
    checkBlock(blockNum) {
        let numTracker = new BadNumFinder();

        // starting location of block
        let startRow = Math.floor(blockNum / 3) * 3;
        let startCol = (blockNum % 3) * 3;

        // iterate through block values
        for (let row=startRow; row < startRow+3; row++) {
            for (let col=startCol; col < startCol+3; col++) {
                // get the value from the cell
                let val = this.board[row][col];

                numTracker.addNum(val, row, col);
            }
        }

        return numTracker.getBadNums();
    }

    isValid() {
        let badNums = [];
        for (let i=0; i < this.rows; i++) {
            badNums =  this.checkRow(i);
            if ( badNums.length !== 0 ) {
                return false;
            }
            badNums =  this.checkCol(i);
            if ( badNums.length !== 0 ) {
                return false;
            }
            badNums =  this.checkBlock(i);
            if ( badNums.length !== 0 ) {
                return false;
            }
        }

        return true;
    }

    isFull() {
        for (let row=0; row < this.rows; row++) {
            for (let col=0; col < this.cols; col++) {
                if (this.board[row][col] === "") {
                    return false;
                }
            }
        }
        return true;
    }
}

