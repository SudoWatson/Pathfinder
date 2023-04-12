import NodeBase from "../nodeBase.js";

class Node extends NodeBase {
    // TODO Diagonal movement is hard coded to be disabled
    /** Cost for a node to go straight to another node */
    static STRAIGHT_COST = 1;
    /** Cost for a node to go diagonal to another node */
    static DIAGONAL_COST = 14;

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
    public get fCost() {
        return this.gCost + this.hCost;
    }

    /** Update the hCost according the the given end node */
    public updateHCost(endNode: Node) {
        this.hCost = this.distanceBetween(this.pos, endNode.pos);
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
    private distanceBetween(pos1: p5.Vector, pos2: p5.Vector): number {
        let distance = 0;
        // Get the axis locked distances
        let dx = Math.abs((pos1.x-pos2.x));
        let dy = Math.abs((pos1.y-pos2.y));
        distance = dx * Node.STRAIGHT_COST + dy * Node.STRAIGHT_COST;
        return distance;
    }
    /**/
}

export default Node;