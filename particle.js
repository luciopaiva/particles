"use strict";

class Particle {

    constructor (x, y) {
        this.pos = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.force = createVector(0, 0);
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
}
