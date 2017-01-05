"use strict";

const
    SIMULATION_CULLING_RADIUS_EXPONENT = 5,
    SIMULATION_REPULSION_CONSTANT_FACTOR = 10,
    SIMULATION_NUM_PARTICLES = 1000;


class Simulation {

    constructor (width, height) {
        this.width = width;
        this.height = height;
        this.k = SIMULATION_REPULSION_CONSTANT_FACTOR;

        this.particles = [];
        this.spatialIndex = new CellularSpatialIndex(SIMULATION_CULLING_RADIUS_EXPONENT, width, height);

        for (let i = 0; i < SIMULATION_NUM_PARTICLES; i++) {
            const particle = new Particle(random(0, this.width), random(0, this.height));
            this.particles.push(particle);
        }

        this.spatialIndex.bulkLoad(this.particles);
    }

    step() {
        // Forces are first calculated for *all* entries and only after that they are committed. This avoids an
        // inconsistent state and the result of entry i at time t doesn't affect the result of entry i+1 at time t
        // (all calculations for time t should only be based on particles' positions at t-1)

        // Calculate forces acting on each particle
        for (const particle of this.particles) {
            const neighbors = this.spatialIndex.getRelevantNeighbors(particle.getPos());

            const force = particle.getForce();
            force.set(0, 0);

            // forces owing to nearby neighbors
            for (const neighbor of neighbors) {
                const distVector = particle.getPos().copy().sub(neighbor.getPos());
                const neighborForceMagnitude = this.k / distVector.magSq();
                const neighborForce = distVector.normalize().mult(neighborForceMagnitude);
                force.add(neighborForce);
            }

            // forces owing to sandbox walls
            force.x += this.k / Math.pow(particle.getPos().x - 0, 2);
            force.x -= this.k / Math.pow(particle.getPos().x - WORLD_WIDTH, 2);
            force.y += this.k / Math.pow(particle.getPos().y - 0, 2);
            force.y -= this.k / Math.pow(particle.getPos().y - WORLD_HEIGHT, 2);
        }

        // Now commit the resulting forces by updating particles' velocities and positions
        for (const particle of this.particles) {
            const accel = particle.getForce().div(particle.getMass());
            const vel = particle.getVelocity();
            vel.add(accel);
            // Limit velocity magnitude to 50 pixels per refresh. Necessary to avoid particles escaping the sandbox
            // (they could do that if they acquired sufficient speed).
            // ToDo this limit should be dependant on the refresh rate (if the rate increases, so does the limit!)
            vel.limit(5);
            const pos = particle.getPos();
            pos.add(vel);
        }

        const entriesMoved = this.spatialIndex.update();
        const movedPerc = (100 * (entriesMoved / SIMULATION_NUM_PARTICLES));
        // console.info(`Entries moved: ${movedPerc}%`);
    }

    getParticles() {
        return this.particles;
    }
}
