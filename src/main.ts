import AStarSolver from "./algorithims/astar/astar.js";

import {FillType, AlgStatus} from "./tools.js";


let squareSize = 20;

// Amount of columns/rows on the grid
let cols: number, rows: number;

// The starting and ending node for the algorithim
let startPos: p5.Vector, endPos: p5.Vector;

/** The current best path of positions towards solution */
let currentPath: p5.Vector[];
let displayPath: p5.Vector[];

// Width and Height of the canvas
let WIDTH: number, HEIGHT: number;

/** Array grid containing all of the squares information. grid[x][y] */ 
let grid: string[][];

let aStar: AStarSolver;

/** Boolean of whether the path finding algorithm is running or not */
let running = false;

/** The interval looper thing for stepping through the path finding algorithm, called from 'setInterval' */
let algInterval: number;

/** Delay of ms between algorithm steps */
let algIntervalDelay: number = 50;

/** The interval looper thing for stepping through the found path */
let pathInterval: number;

/** Delay of ms between path display steps */
let pathIntervalDelay: number = 10;

/** Show algorithm debug values or not */
const DEBUG_VALUES = false;


const sketch = (p: p5) => {
    p.setup = () => {
        // ---------------- P5 SETUP ---------------- \\
       
        // Calculate how many squares can fit on screen
        cols = Math.floor((p.windowWidth*0.99)/squareSize);
        rows = Math.floor((p.windowHeight*3/4)/squareSize);

        // Canvas Dimensions
        WIDTH = Math.floor(cols * squareSize);
        HEIGHT = Math.floor(rows * squareSize);

        //p.frameRate(1);
        currentPath = [];

        // Create p canvas
        let canvas = p.createCanvas(WIDTH, HEIGHT);

        // Disable right-click context menu on grid
        canvas.elt.addEventListener("contextmenu", (e: any) => e.preventDefault())


        let resetButton = p.createButton("Reset");
        resetButton.mouseClicked(reset);

        let toggleButton = p.createButton("Start/Stop");
        toggleButton.mouseClicked(togglePathFinding);

        // ---------------- END P5 SETUP ---------------- \\


        
        grid = createEmptyGrid(rows, cols);


        // TODO START TEMPORARY
        reset();
        // TODO End Temporary
    }

    p.draw = () => {
        p.background(220);

        // Loop through grid and draw squares
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                let type = grid[i][j];
                // Set color depending on fill type
                if (type === FillType.EMPTY) p.fill(255);
                else if (type === FillType.BLOCK) p.fill(0);
                else if (type === FillType.CLOSED) p.fill(0,160,160);
                else if (type === FillType.OPEN) p.fill(0,0,255);
                else if (type === FillType.START) p.fill(230,0,0);
                else if (type === FillType.END) p.fill(0,160,0);
                // If position is in the list of current best path, set fill to orange
                if (displayPath.some((pos) => pos.equals(p.createVector(i,j)))) p.fill(255,140,0);
                // If position is the start or end position, set fill to red or green
                if (startPos.equals(p.createVector(i,j))) p.fill(230,0,0);
                if (endPos.equals(p.createVector(i,j))) p.fill(0,160,0);

                p.square(i * squareSize, j * squareSize, squareSize);
            }
        }

        if (DEBUG_VALUES) aStar.renderNodeValues(squareSize);
    }

    function reset() {
        // Set start and end points
        startPos = p.createVector(6,6);
        endPos = p.createVector(3,3);
        currentPath = [];
        displayPath = [];
        setPos(startPos, 'S');
        setPos(endPos, 'E');

        // TODO this feels bad
        for (const rowi in grid) {
            if (Object.prototype.hasOwnProperty.call(grid, rowi)) {
                const row = grid[rowi];
                for (const squarei in row) {
                    if (Object.prototype.hasOwnProperty.call(row, squarei)) {
                        const square = row[squarei];
                        if (square !== 'B' && square !== 'S' && square !== 'E') {
                            grid[rowi][squarei] = ' ';
                        }
                    }
                }
            }
        }


        aStar = new AStarSolver(p, grid, startPos, endPos);
    }

    /** Toggles running of algorithm */
    function togglePathFinding() {
        // Already running, stop running
        if (running) {
            clearInterval(algInterval);
        } else {  // Not running, start running
            stepPathFinder();
            algInterval = setInterval(() => {
                stepPathFinder();
            }, algIntervalDelay);
        }
        running = !running;
    }

    // Places a barrier
    p.mousePressed = () => {place()}  // TODO Drag start and end points
    p.mouseDragged = () => {place()}

    p.keyPressed = () => {
        // aStar.stepGrid();
    }



    /**
     * Steps through the path finding algorithm once
     * If the algorithm is finished, stops the algorithm
     */
    function stepPathFinder() {
        let stepResult = aStar.stepGrid();
        currentPath = stepResult[0];
        if (stepResult[1] !== AlgStatus.RUNNING) {
            togglePathFinding();  // Stop running
        }
        if (stepResult[1] === AlgStatus.FOUND_SOLUTION) {
            walkPath();
        } else if (stepResult[1] === AlgStatus.NO_SOLUTION) {
            alert("No solution!");
        }
    }

    /**
     * Places a barrier at the mouse position if left click
     * Removes a barrier at the mouse position if right click
     */
    function place(): void {
        // Position to set
        let position = p.createVector(Math.floor(p.mouseX/squareSize),Math.floor(p.mouseY/squareSize));
        
        // TODO Another invalid position when going left of grid, non-fetal
        // Invalid positions
        if (position.x >= cols) return;
        if (position.y >= rows) return;
        if (position.equals(startPos) || position.equals(endPos)) return;

        // Set with left, clear with right click
        if (p.mouseButton == "left") grid[position.x][position.y] = 'B';
        else if (p.mouseButton == "right") grid[position.x][position.y] = ' ';
    }

    /**
     * Sets a position in a grid to a given block
     * @param {Vector} pos - Position to set
     * @param {String} setTo - Char string to set the position to
     */
    function setPos(pos: p5.Vector, setTo: string): void {
        grid[pos.x][pos.y] = setTo;
    }

    /**
     * Creates an empty grid of given rows x cols
     * @param {number} rows 
     * @param {number} cols 
     * @returns {string[][]} Empty grid
     */
    function createEmptyGrid(rows: number, cols: number): string[][] {
        let grid = [];
        for (let i = 0; i < cols; i++) {
            let innerArray = [];
            for (let j = 0; j < rows; j++) {
                innerArray[j] = ' ';
            }
            grid[i] = innerArray;
        }
        return grid;
    }

    /**
     * Steps through the path display, displaying one more at a time
     */
    function walkPath() {
        pathInterval = setInterval(() => {
            let pathResult = stepPathDisplay();
            if (!pathResult) {
                clearInterval(pathInterval);
            }
        }, pathIntervalDelay);
    }

    /**
     * Adds a position to the display path
     * Allows the path to move towards the end position
     * @returns {boolean} true if there is more to display
     */
    function stepPathDisplay(): boolean {
        if (displayPath.length === currentPath.length) {
            return false;
        }
        displayPath.push(currentPath[currentPath.length - displayPath.length - 1]);
        if (displayPath.length === currentPath.length) {
            return false;
        }
        return true;
    }
}

// Typescript is complaining about stupid shit it doesn't need to complain about
// @ts-ignore
new p5(sketch);