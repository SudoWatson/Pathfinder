import { AlgStatus } from "../../tools.js";
import AlgoBase from "../algoBase.js";
import Node from "../nodeBase.js";


const ENABLE_DIAGONAL = false;

class BreadthFirst extends AlgoBase {
    public static algoName = "Breadth First";  // TODO Check description, currently made by Copilot
    public static description = "Breadth First Search is a path finding algorithm that searches the entire grid in a breadth first manner. It is not the most efficient algorithm, but it is guaranteed to find the shortest path if one exists.";
    

    constructor(p: p5, grid: string[][], startPos: p5.Vector, endPos: p5.Vector) {
        super(p, grid, startPos, endPos);
    }

    protected override getCurrentNode(): Node {
        return this.toSearch[0] as Node;
    }

    protected override stepGrid(): [p5.Vector[], AlgStatus] {
        let currentNode = this.currentNode as Node;

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


                // If neighbor is in closed list, skip to next
                let doContinue = false;
                this.searched.some((searchedNode) => {
                    if (searchedNode.pos.equals(neighborPos)) {
                        doContinue = true;
                    }
                });
                if (doContinue) continue;
                // If neighbor is in open list, skip to next
                this.toSearch.some((searchedNode) => {
                    if (searchedNode.pos.equals(neighborPos)) {
                        doContinue = true;
                    }
                });
                if (doContinue) continue;
                
                // If neighbor is a barrier, skip to next
                if (this.grid[neighborX][neighborY] === "B") continue;
                
                // Otherwise, add to open list
                let newNode = new Node(neighborPos, currentNode);
                this.addToToSearched(newNode);
            }
        }
       return [this.buildPath(currentNode), AlgStatus.RUNNING];
    }
}

export default BreadthFirst;