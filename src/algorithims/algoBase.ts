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
    }

    /** Returns the current node being searched */
    abstract getCurrentNode(): NodeBase;

    /**
     * Executes a single step of the path finding algorithm
     * @returns - The current best path, and whether the algorithm has finished
     */
    abstract stepGrid(): [p5.Vector[], AlgStatus];

    /** Creates a list of positions of the path of the given node */
    buildPath(node: NodeBase): p5.Vector[] {
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
    renderNodeValues(squareSize: number): void {};

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
