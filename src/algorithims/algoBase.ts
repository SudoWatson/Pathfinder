import { AlgStatus, FillType } from "../tools.js";
import NodeBase from "./nodeBase.js";

abstract class AlgoBase {

    /** p5 instance */
    protected p: p5;
    /** Nodes already searched and found best path to; Closed list */
    protected searched: NodeBase[];
    /** Nodes to search and find best path to; Open list */
    protected toSearch: NodeBase[];
    protected grid: String[][];
    protected startNode: NodeBase;
    protected endNode: NodeBase;
    protected currentNode: NodeBase;

    /** Name of the algorithm */
    public static algoName: string = "Unnamed";
    /** Description of the algorithm */
    public static description: string = "No description available";

    constructor(p: p5, grid: string[][], startPos: p5.Vector, endPos: p5.Vector) {
        this.searched = [];
        this.toSearch = [];
        this.grid = grid;
        this.p = p;
        this.endNode = new NodeBase(endPos);
        this.startNode = new NodeBase(startPos);
        this.toSearch.push(this.startNode);
        this.currentNode = this.startNode;
    }

    private checkStatus(): [p5.Vector[], AlgStatus] | null {
        this.currentNode = this.getCurrentNode();
        if (this.toSearch.length === 0) {
            // No nodes left to search, impossible to solve
            console.log("Cannot find a path");
            return [[], AlgStatus.NO_SOLUTION];
        }
        this.currentNode = this.getCurrentNode();

        // Remove currentNode from toSearch list
        let indexOfCurrentNode = this.toSearch.indexOf(this.currentNode);
        if (indexOfCurrentNode === -1) {
            // This should never happen
            console.error("Could not find currentNode in open list");
            return [this.buildPath(this.currentNode), AlgStatus.ERROR];
        }
        this.toSearch.splice(indexOfCurrentNode, 1);
        this.addToSearched(this.currentNode);
        if (this.currentNode.pos.equals(this.endNode.pos)) {
            // Finished
            console.log("Found shortest path");
            return [this.buildPath(this.currentNode), AlgStatus.FOUND_SOLUTION];
        }
        return null;
    }

    /** Returns the current node being searched */
    protected abstract getCurrentNode(): NodeBase;

    /**
     * Executes a single step of the path finding algorithm
     * @returns - The current best path, and whether the algorithm has finished
     */
    protected abstract stepGrid(): [p5.Vector[], AlgStatus];

    /**
     * Executes a single step of the path finding algorithm
     * @returns - The current best path, and whether the algorithm has finished
     */
    public StepGrid(): [p5.Vector[], AlgStatus] {
        let status = this.checkStatus();
        return status == null ? this.stepGrid() : status;
    }

    /** Creates a list of positions of the path of the given node */
    public buildPath(node: NodeBase): p5.Vector[] {
        let path: p5.Vector[] = [];
        let currentNode: NodeBase | null = node;
        while (currentNode !== null && currentNode !== undefined) {
            path.push(currentNode.pos);
            currentNode = currentNode.parentNode;
        }
        return path;
    }


    /** Renders the node values as an overlay
     * @param squareSize - The size of the squares in the grid
     * Displays the fCost - center, gCost - top left, and hCost - top right of each node
    */
    public renderNodeValues(squareSize: number): void {};

    get squaresSearched() {
        return [...this.searched];
    }

    get squaresToSearch() {
        return [...this.toSearch];
    }

    /** Add the node to the 'toSearched' list */
    addToToSearched(node: NodeBase) {
        this.grid[node.pos.x][node.pos.y] = FillType.OPEN;
        this.toSearch.push(node);
    }

    /** Add the node to the 'searched' list */
    addToSearched(node: NodeBase) {
        this.grid[node.pos.x][node.pos.y] = FillType.CLOSED;
        this.searched.push(node);
    }

    // TODO Implement an out of bounds checker function
}

export default AlgoBase;
