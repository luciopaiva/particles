"use strict";


class Logger {

    constructor () {
        this.fps = document.getElementById('fps');
        this.numParticles = document.getElementById('num-particles');
        this.migratedParticles = document.getElementById('migrated-particles');
        this.averageSpeed = document.getElementById('avg-speed');
        this.minNeighborCount = document.getElementById('min-neighbor-count');
        this.averageNeighborCount = document.getElementById('avg-neighbor-count');
        this.maxNeighborCount = document.getElementById('max-neighbor-count');
        this.waveIntensity = document.getElementById('wave-intensity');
    }

    logFloat(elem, value, prec) {
        elem.innerText = value.toFixed(prec);
    }

    logFps(fps) {
        this.logFloat(this.fps, fps, 2);
    }

    logNumParticles(numParticles) {
        this.numParticles.innerText = numParticles;
    }

    logMigratedParticles(migratedParticles) {
        this.migratedParticles.innerText = migratedParticles;
    }

    logAvgSpeed(speed) {
        this.logFloat(this.averageSpeed, speed, 2);
    }

    logMinNeighborCount(neighborCount) {
        this.minNeighborCount.innerText = neighborCount;
    }

    logAvgNeighborCount(neighborCount) {
        this.logFloat(this.averageNeighborCount, neighborCount, 2);
    }

    logMaxNeighborCount(neighborCount) {
        this.maxNeighborCount.innerText = neighborCount;
    }

    logWaveIntensity(waveAngle) {
        this.logFloat(this.waveIntensity, waveAngle, 2);
    }
}

// wait until everything is loaded, otherwise references to ids won't work
const logger = new Logger();
