"use strict";

class CellularSpatialIndexCell {

    constructor () {
        this.head = null;
    }

    add(entry) {
        if (this.head == null) {
            this.head = entry;
            entry.next(null);
            entry.previous(null);
            this.tail = entry;
        } else {
            this.tail.next(entry);
            entry.next(null);
            entry.previous(this.tail);
            this.tail = entry;
        }
    }

    *iterateEntries() {
        let cur = this.head;
        while (cur != null) {
            yield cur.getEntry();
            cur = cur.next();
        }
    }

    purgeEntries(shouldPurgeCallback, purgedEntriesList) {
        let cur = this.head;
        while (cur != null) {
            if (shouldPurgeCallback(cur.getEntry())) {
                // ToDo we probably don't need CellEntry.previous() and we can just have a local variable pointing to the previous cell entry
                if (cur.previous()) {
                    cur.previous().next(cur.next())
                }
                purgedEntriesList.push(cur);
            }
            cur = cur.next();
        }
        return purgedEntriesList;
    }
}

class CellEntry {

    constructor (entry) {
        this.entry = entry;
        this._next = null;
        this._previous = null;
    }

    setNext(entry) {
        this._next = entry;
    }

    setPrevious(entry) {
        this._previous = entry;
    }

    getEntry() {
        return this.entry;
    }

    next() {
        return this._next;
    }

    previous() {
        return this._previous;
    }
}

/**
 * Divides the sandbox in square cells of fixed size. Each cell may hold a variable number of entries. But, given the
 * nature of the experiment, cells will hold approximately the same number of entries each.
 *
 * Cells' size is a power of 2, so finding out in which cell resides a given position is as easy as shifting bits.
 */
class CellularSpatialIndex extends SpatialIndex {

    /**
     *
     * @param cullingRadiusExponent exponent representing a cell square's size
     * @param width width of the sandbox - no problem if it isn't a power of 2
     * @param height height of the sandbox - no problem if it isn't a power of 2
     */
    constructor (cullingRadiusExponent, width, height) {
        super();
        this.cellSizeExponent = cullingRadiusExponent;
        this.cellSize = 1 << this.cellSizeExponent;
        this.width = width;
        this.widthInCells = Math.ceil(this.width / this.cellSize);
        this.height = height;
        this.heightInCells = Math.ceil(this.height / this.cellSize);

        /** reusable auxiliary array to store relevant cells during a query */
        this.relevantCells = [];
        /** reusable auxiliary array to store relevant neighbors during a query */
        this.relevantNeighbors = [];
        /** reusable auxiliary array to annotate which entries changed cells */
        this.movedCellEntries = [];

        this.cells = [];
        this.totalCellCount = this.widthInCells * this.heightInCells;
        for (let i = 0; i < this.totalCellCount; i++) {
            this.cells.push(new CellularSpatialIndexCell());
        }
    }

    bulkLoad(entries) {
        for (const entry of entries) {
            const cellEntry = new CellEntry(entry);
            const cellIndex = this.vectorToCellIndex(entry.getPos());
            if (!this.cells[cellIndex]) {
                console.error('Invalid position when bulk loading!');
                console.error(entry.getPos());
            }
            this.cells[cellIndex].add(cellEntry);
        }
    }

    vectorToCellIndex(vec) {
        const col = vec.x >> this.cellSizeExponent;
        const row = vec.y >> this.cellSizeExponent;
        return row * this.widthInCells + col;
    }

    /**
     * Given a vector, returns a list of indices of the cells relevant when querying for neighbors.
     *
     * Considering the vector falls into cell `i`, it may have up to 8 neighboring cells. As each cell has width equal
     * to size of the culling radius (i.e., the maximum distance a particle can still influence a given neighbor), we
     * must look no further than our direct neighbors, since distances farther than that are certainly not within
     * culling distance anymore.
     *
     * +-------+-------+-------+
     * |       |       |       |
     * | i-w-1 |  i-w  | i-w+1 |
     * |       |       |       |
     * +-------+-------+-------+
     * |       |       |       |
     * |  i-1  |   i   |  i+1  |
     * |       |       |       |
     * +-------+-------+-------+
     * |       |       |       |
     * | i+w-1 |  i+w  | i+w+1 |
     * |       |       |       |
     * +-------+-------+-------+
     *
     * Special cases appear when `i` is at the borders of the sandbox, when it can have 5 or 3 neighbors:
     *
     *     █▀▀▀█▀▀▀█▀▀▀█     █▀▀▀█▀▀▀█
     *     |   | i |   |     ▌ i |   |
     *     +---+---+---+     █---+---+
     *     |   |   |   |     ▌   |   |
     *     +---+---+---+     █---+---+
     *
     * @param vec
     * @returns {Array}
     */
    relevantNeighborCellIndices(vec) {
        this.relevantCells.length = 0;

        const col = vec.x >> this.cellSizeExponent;
        const row = vec.y >> this.cellSizeExponent;

        // const cellX = col << this.cellSizeExponent;
        // const cellY = row << this.cellSizeExponent;
        // const cellQuadrantX = (vec.x - cellX) >> this.cullingRadiusExponent;  // 0 (left quadrant) or 1 (right quadrant)
        // const cellQuadrantY = (vec.y - cellY) >> this.cullingRadiusExponent;  // 0 (top quadrant) or 1 (bottom quadrant)
        //
        // if (cellQuadrantX == 0 && cellQuadrantY == 0) {
        //     // top-left - retrieve cells i-1, i-w, i-w-1
        //
        // } else if (cellQuadrantX == 1 && cellQuadrantY == 0) {
        //     // top-right
        // } else if (cellQuadrantX == 1 && cellQuadrantY == 1) {
        //     // bottom-right
        // } else if (cellQuadrantX == 0 && cellQuadrantY == 1) {
        //     // bottom-left
        // } else {
        //     throw new Error(`Invalid quadrant! Pos was (${vec.x}, ${vec.y})`);
        // }

        const w = this.widthInCells;
        const i = row * w + col;

        this.relevantCells.push(i);

        if (col > 0 && row > 0)
            this.relevantCells.push(i - w - 1);  // top-left cell
        if (row > 0)
            this.relevantCells.push(i - w);      // top cell
        if (col < this.widthInCells - 1 && row > 0)
            this.relevantCells.push(i - w + 1);  // top-right cell
        if (col < this.widthInCells - 1)
            this.relevantCells.push(i + 1);      // right cell
        if (col < this.widthInCells - 1 && row < this.heightInCells - 1)
            this.relevantCells.push(i + w + 1);  // bottom-right cell
        if (row < this.heightInCells - 1)
            this.relevantCells.push(i + w);      // bottom cell
        if (col > 0 && row < this.heightInCells - 1)
            this.relevantCells.push(i + w - 1);  // bottom-left cell
        if (col > 0)
            this.relevantCells.push(i - 1);      // left cell

        return this.relevantCells;
    }

    /**
     * Returns all neighbors that contribute with significant force to a particle located at `queryVector`.
     * @param queryVector
     * @param cullingRadius
     * @returns Array reusable list with relevant neighbors
     */
    getRelevantNeighbors(queryVector, cullingRadius) {
        this.relevantNeighbors.length = 0;
        try {
            for (const cellIndex of this.relevantNeighborCellIndices(queryVector)) {
                for (const neighborEntry of this.cells[cellIndex].iterateEntries()) {
                    if (neighborEntry.getPos().dist(queryVector) < cullingRadius) {
                        this.relevantNeighbors.push(neighborEntry);
                    }
                }
            }
        } catch (err) {
            console.error(`Possible invalid position at (${queryVector.x}, ${queryVector.y})`);
            throw err;
        }
        return this.relevantNeighbors;
    }

    _checkIfChangedCells(currentCellIndex, entry) {
        const actualCellIndex = this.vectorToCellIndex(entry.getPos());
        return (actualCellIndex != currentCellIndex);
    }

    /**
     * Traverse the whole spatial index looking for entries that changed cells, updating their current cells if so.
     * Takes O(n) time, n being the number of entries in the index.
     *
     * @returns {number} how many entries had to be moved
     */
    update() {
        let entriesMoved = 0;

        for (let cellIndex = 0; cellIndex < this.totalCellCount; cellIndex++) {
            const cell = this.cells[cellIndex];

            this.movedCellEntries.length = 0;
            cell.purgeEntries(this._checkIfChangedCells.bind(this, cellIndex), this.movedCellEntries);

            for (const cellEntry of this.movedCellEntries) {
                // ToDo reuse cell index calculation from cell.purgeEntries() above somehow
                const actualCellIndex = this.vectorToCellIndex(cellEntry.getEntry().getPos());
                this.cells[actualCellIndex].add(cellEntry);
                entriesMoved++;
            }
        }

        return entriesMoved;
    }
}