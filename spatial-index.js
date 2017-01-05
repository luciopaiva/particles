"use strict";

class SpatialIndex {

    constructor () {
        this.entries = [];
    }

    bulkLoad(entries) {
        for (const entry of entries) {
            this.entries.push(entry);
        }
    }

    getNearestNeighborsWithDistances(queryVector, howMany) {
        const tuples = this.entries.map((entry) => { return {
            entry: entry,
            dist: queryVector.dist(entry.getPos())
        }});
        return tuples
            .sort((a, b) => a.dist - b.dist)
            .slice(0, howMany);
    }

    getNearestNeighbors(queryVector, howMany) {
        return this.getNearestNeighborsWithDistances(queryVector, howMany)
            .map(tuple => tuple.entry);
    }
}
