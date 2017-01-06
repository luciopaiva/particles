"use strict";

let nextParticleIndex = 1;

class Particle {

    constructor (x, y) {
        this.index = nextParticleIndex++;
        this.mass = 1;
        this.pos = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.force = createVector(0, 0);
    }

    getIndex() {
        return this.index;
    }

    getPos() {
        return this.pos;
    }

    getVelocity() {
        return this.velocity;
    }

    getForce() {
        return this.force;
    }

    getMass() {
        return this.mass;
    }
}
