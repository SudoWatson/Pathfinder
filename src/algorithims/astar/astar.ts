import { AlgStatus } from "../../tools.js";
import AlgoBase from "../algoBase.js";
import NodeBase from "../nodeBase.js";

// TODO Diagonal movement is hard coded to be disabled
/** Cost for a node to go straight to another node */
const STRAIGHT_COST = 1;
/** Cost for a node to go diagonal to another node */
const DIAGONAL_COST = 14;

const ENABLE_DIAGONAL = false;

// type Node = {
//     /** Node position on grid */
//     pos: p5.Vector,
//     /** Distance from starting node */
//     gCost: number,
//     /** Distance from end node */
//     hCost: number
// }

class Node extends NodeBase {
    /** Distance from starting node */
    public gCost: number;
    /** Distance from end node */
    public hCost: number;
    /** GCost + HCost; Total expected distance along path this node is part of */
    //public fCost: number;

    constructor(pos: p5.Vector, gCost: number) {
        super(pos);
        this.gCost = gCost;
        this.hCost = 0;
    }

    /** GCost + HCost: Total expected distance along path this node is part of */
    get fCost() {
        return this.gCost + this.hCost;
    }

    /** Update the hCost according the the given end node */
    updateHCost(endNode: Node) {
        this.hCost = distanceBetween(this.pos, endNode.pos);
    }
}



class AStarSolver extends AlgoBase {


    constructor(p: p5, grid: string[][], startPos: p5.Vector, endPos: p5.Vector) {
        super(p, grid, startPos, endPos);
        this.endNode = new Node(endPos, 0);
        this.startNode = new Node(startPos, 0);
        (this.startNode as Node).updateHCost(this.endNode as Node);
        this.toSearch.push(this.startNode);
    }

    /**
     * Executes a single step of the path finding algorithm
     * @returns - The current best path, and whether the algorithm has finished
     */
    stepGrid(): [p5.Vector[], AlgStatus] {
        /** The node with the lowest fCost currently */
        let currentNode: Node = this.toSearch[0] as Node;
        if (this.toSearch.length === 0) {
            // No nodes left to search, impossible to solve
            console.log("Cannot find a path");
            return [this.buildPath(currentNode), AlgStatus.NO_SOLUTION];
        }
        // Get closest open node to end
        this.toSearch.forEach((newNode: NodeBase|Node) => {
            // If currentNode already has lower fCost, don't bother
            if (currentNode.fCost < (newNode as Node).fCost) return;  // Exit forEach
            // If fCosts are equal, go by hCost
            if (currentNode.hCost < (newNode as Node).hCost) return;
            // Otherwise, this new node is better
            currentNode = newNode as Node;
        })

        // Remove currentNode from toSearch list
        let indexOfCurrentNode = this.toSearch.indexOf(currentNode);
        if (indexOfCurrentNode === -1) {
            console.error("Could not find currentNode in open list");
            return [this.buildPath(currentNode), AlgStatus.ERROR];
        }
        this.toSearch.splice(indexOfCurrentNode, 1);
        this.addToSearched(currentNode);
        if (currentNode.pos.equals(this.endNode.pos)) {
            // Finished
            console.log("Found shortest path");
            return [this.buildPath(currentNode), AlgStatus.FOUND_SOLUTION];
        }

        let cnx = currentNode.pos.x;
        let cny = currentNode.pos.y;
        for (let neighborX = cnx-1; neighborX <= cnx+1; neighborX++) {
            // Out of bounds, don't check
            if (neighborX <= -1) continue;
            if (neighborX >= this.grid.length) continue;

            for (let neighborY = cny-1; neighborY <= cny+1; neighborY++) {
                // Don't check diagonals if not enabled
                if (!ENABLE_DIAGONAL) {
                    if (neighborX !== cnx && neighborY !== cny) continue;
                }

                // Out of bounds, don't check
                if (neighborY <= -1) continue;
                if (neighborY >= this.grid[0].length) continue;

                let neighborPos = this.p.createVector(neighborX, neighborY);


                // Check if neighbor is in closed list
                let inClosed = false;
                for (const searchedNode of this.searched) {
                    if (searchedNode.pos.equals(neighborPos)) {
                        inClosed = true;
                        break;
                    }
                }
                // If neighbor is in closed group or is a barrier, skip to next
                if (inClosed || this.grid[neighborX][neighborY] === "B") continue;
                

                // Check if neighbor is in open list
                let inOpen = false;
                let neighborNode: Node;
                for (const nodeToSearch of this.toSearch) {
                    if (nodeToSearch.pos.equals(neighborPos)) {
                        inOpen = true;
                        neighborNode = nodeToSearch as Node;
                        break;
                    }
                }


                /** Boolean of whether the new nodes fCost is close with the currentNode as parent or not */
                let isCloserWithThisNode = false;
                    
                // Boolean of whether the new node is inline with an axis of the currentNode
                let isInline = neighborX === currentNode.pos.x || neighborY === currentNode.pos.y;

                let potentialNewGCost = currentNode.gCost + ((isInline) ? STRAIGHT_COST : DIAGONAL_COST);
                if (inOpen) {
                    isCloserWithThisNode = potentialNewGCost < neighborNode!.gCost;
                }

                // if neighbor is not in toSearch list, or neighbor is close with currentNode as parent
                if (!inOpen || isCloserWithThisNode) {
                    if (!inOpen) {  // Node doesn't yet exist, create it
                        neighborNode = new Node(neighborPos, potentialNewGCost);
                        neighborNode.updateHCost(this.endNode as Node);
                        this.addToToSearched(neighborNode);
                    }
                    neighborNode!.parentNode = currentNode;
                    neighborNode!.gCost = potentialNewGCost;
                }
            }
        }
       return [this.buildPath(currentNode), AlgStatus.RUNNING];
    }

    /** Creates a list of positions of the path of the passed node */
    buildPath(node: Node): p5.Vector[] {
        let path: p5.Vector[] = [];
        let currentNode: Node | null = node;
        while (currentNode !== null && currentNode !== undefined) {
            path.push(currentNode.pos);
            currentNode = currentNode.parentNode as Node;
        }
        return path;
    }


    /** Renders the node values as an overlay
     * @param squareSize - The size of the squares in the grid
     * 
     * Displays the fCost - center, gCost - top left, and hCost - top right of each node
     * 
    */
    renderNodeValues(squareSize: number) {
        for (const node of [...this.toSearch, ...this.searched]) {
            let p = this.p;
            p.push();
            p.translate(node.pos.x*squareSize + squareSize/2, node.pos.y*squareSize + squareSize / 2);

            p.fill(255);
            p.textAlign(p.CENTER);
            p.text((node as Node).fCost, 0, 0);
            p.text((node as Node).gCost, -10, -10);
            p.text((node as Node).hCost, 10, -10);

            p.pop();
        }
    }

    get squaresSearched() {
        return [...this.searched];
    }

    get squaresToSearch() {
        return [...this.toSearch];
    }

    /** Add the node to the 'toSearched' list */
    addToToSearched(node: Node) {
        this.grid[node.pos.x][node.pos.y] = 'O';
        this.toSearch.push(node);
    }

    /** Add the node to the 'searched' list */
    addToSearched(node: Node) {
        this.grid[node.pos.x][node.pos.y] = 'C';
        this.searched.push(node);
    }
}

/** Returns the heuristic distance from Vector to Vector */
/* This is for diagonal movement *
function distanceBetween(pos1: p5.Vector, pos2: p5.Vector): number {
    let distance = 0;
    // Get the axis locked distances
    let dx = Math.abs((pos1.x-pos2.x));
    let dy = Math.abs((pos1.y-pos2.y));
    
    // The smallest axis distance is the amount of STRAIGHT steps to go
    if (dx < dy) distance += dx * DIAGONAL_COST;
    else distance += dy * DIAGONAL_COST;

    // The difference of the axis distance is the amount of DIAGONAL steps to go
    distance += Math.abs(dx - dy) * STRAIGHT_COST;

    return distance;
}
*/
/* This is for straight movement */
function distanceBetween(pos1: p5.Vector, pos2: p5.Vector): number {
    let distance = 0;
    // Get the axis locked distances
    let dx = Math.abs((pos1.x-pos2.x));
    let dy = Math.abs((pos1.y-pos2.y));
    distance = dx * STRAIGHT_COST + dy * STRAIGHT_COST;
    return distance;
}

export default AStarSolver;
