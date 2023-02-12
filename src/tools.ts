const enum AlgStatus {
    RUNNING,
    FOUND_SOLUTION,
    NO_SOLUTION,
    ERROR,
}

const enum FillType {
    EMPTY = ' ',
    BLOCK = 'B',
    START = 'S',
    END = 'E',
    CLOSED = 'C',
    OPEN = 'O'
};

export { AlgStatus, FillType};