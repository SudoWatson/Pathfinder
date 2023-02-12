class NodeBase {
    /** Node position on grid */
    public pos: p5.Vector;
    /** Parent node along current shortest path */
    public parentNode: NodeBase | null;

    constructor(pos: p5.Vector, parentNode?: NodeBase) {
        this.pos = pos;
        this.parentNode = parentNode || null;
    }
}

export default NodeBase;