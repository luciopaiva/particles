"use strict";

const
    SIMULATION_RELEVANT_NEIGHBORS = 8,
    SIMULATION_NUM_PARTICLES = 100;


class Simulation {

    constructor (width, height) {
        this.width = width;
        this.height = height;

        this.particles = [];
        this.spatialIndex = new SpatialIndex();

        for (let i = 0; i < SIMULATION_NUM_PARTICLES; i++) {
            const particle = new Particle(random(0, this.width), random(0, this.height));
            this.particles.push(particle);
            const pos = particle.getPos();
            // console.info(`Particle created at (${pos.x}, ${pos.y})`);
        }

        this.spatialIndex.bulkLoad(this.particles);
    }

    step() {
        // Forces are first calculated for *all* entries and only after that they are committed. This avoids an
        // inconsistent state and the result of entry i at time t doesn't affect the result of entry i+1 at time t
        // (all calculations for time t should only be based on particles' positions at t-1)

        // Calculate forces acting on each particle
        for (const particle of this.particles) {
            const neighbors = this.spatialIndex.getNearestNeighbors(
                particle.getPos(), SIMULATION_RELEVANT_NEIGHBORS);

            const force = particle.getForce();
            force.set(0, 0);

            for (const neighbor of neighbors) {
                const distVector = particle.getPos().copy().sub(neighbor.getPos());
                const neighborForceMagnitude = 10 / distVector.magSq();
                const neighborForce = distVector.normalize().mult(neighborForceMagnitude);
                force.add(neighborForce);
            }
        }

        // Now commit the resulting forces by updating particles' velocities and positions
        for (const particle of this.particles) {
            const accel = particle.getForce().div(particle.getMass());
            particle.getVelocity().add(accel);
            particle.getPos().add(particle.getVelocity());
        }
    }

    getParticles() {
        return this.particles;
    }
}
