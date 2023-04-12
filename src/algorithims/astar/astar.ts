import { AlgStatus } from "../../tools.js";
import AlgoBase from "../algoBase.js";
import NodeBase from "../nodeBase.js";
import Node from "./node.js";


const ENABLE_DIAGONAL = false;


class AStarSolver extends AlgoBase {
    public static algoName = "A*";
    public static description = "A* is a path finding algorithm that uses a heuristic to find the shortest path.";  // TODO Properly describe A*

    constructor(p: p5, grid: string[][], startPos: p5.Vector, endPos: p5.Vector) {
        super(p, grid, startPos, endPos);

        
        this.endNode = new Node(endPos, 0);
        this.startNode = new Node(startPos, 0);
        (this.startNode as Node).updateHCost(this.endNode as Node);
        this.toSearch.push(this.startNode);
    }

    protected override getCurrentNode(): Node {
        /** The node with the lowest fCost currently */
        let currentNode: Node = this.toSearch[0] as Node;
        // Get closest open node to end
        this.toSearch.forEach((newNode: NodeBase|Node) => {
            // If currentNode already has lower fCost, don't bother
            if (currentNode.fCost < (newNode as Node).fCost) return;  // Exit forEach
            // fCosts are equal, go by hCost
            if (currentNode.hCost < (newNode as Node).hCost) return;
            // Otherwise, this new node is better
            currentNode = newNode as Node;
        })
        return currentNode;
    }

    protected override stepGrid(): [p5.Vector[], AlgStatus] {
        /** The node with the lowest fCost currently */
        let currentNode: Node = this.currentNode as Node;

        // TODO Check feasibility of this being pushed to a function
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
                // TODO Up until here, this is the same as in BFS, put it in a function possibly
                // Just modify this current method signature a bit to take in the current node, neighborpos, and any other variable defined before here but used after
                // Then anything after this comment is what is put inside this method
                // While what is above is in the abstract method before calling this method

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

                let potentialNewGCost = currentNode.gCost + ((isInline) ? Node.STRAIGHT_COST : Node.DIAGONAL_COST);
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



    /** Renders the node values as an overlay
     * @param squareSize - The size of the squares in the grid
     * 
     * Displays the fCost - center, gCost - top left, and hCost - top right of each node
    */
    public override renderNodeValues(squareSize: number) {
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
}

export default AStarSolver;
