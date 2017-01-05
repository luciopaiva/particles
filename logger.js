"use strict";

let logger = null;

class Logger {

    constructor () {
        this.generalLog = $('#debug-console');
        this.numParticles = $('#num-particles');
        this.averageSpeed = $('#avg-speed');
        this.minNeighborCount = $('#min-neighbor-count');
        this.averageNeighborCount = $('#avg-neighbor-count');
        this.maxNeighborCount = $('#max-neighbor-count');
    }

    logFloat(elem, value, prec) {
        elem.text(value.toFixed(prec));
    }

    log(msg) {
        this.generalLog.text(msg);
    }

    logNumParticles(numParticles) {
        this.numParticles.text(numParticles);
    }

    logAvgSpeed(speed) {
        this.logFloat(this.averageSpeed, speed, 2);
    }

    logMinNeighborCount(neighborCount) {
        this.minNeighborCount.text(neighborCount);
    }

    logAvgNeighborCount(neighborCount) {
        this.logFloat(this.averageNeighborCount, neighborCount, 2);
    }

    logMaxNeighborCount(neighborCount) {
        this.maxNeighborCount.text(neighborCount);
    }
}

$(function () {
    // wait until everything is loaded, otherwise references to ids won't work
    logger = new Logger();
});
