"use strict";

let logger = null;

class Logger {

    constructor () {
        this.fps = $('#fps');
        this.numParticles = $('#num-particles');
        this.migratedParticles = $('#migrated-particles');
        this.averageSpeed = $('#avg-speed');
        this.minNeighborCount = $('#min-neighbor-count');
        this.averageNeighborCount = $('#avg-neighbor-count');
        this.maxNeighborCount = $('#max-neighbor-count');
    }

    logFloat(elem, value, prec) {
        elem.text(value.toFixed(prec));
    }

    logFps(fps) {
        this.logFloat(this.fps, fps, 2);
    }

    logNumParticles(numParticles) {
        this.numParticles.text(numParticles);
    }

    logMigratedParticles(migratedParticles) {
        this.migratedParticles.text(migratedParticles);
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
