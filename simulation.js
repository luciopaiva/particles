"use strict";

const
    SIMULATION_DISPLACE_EVENLY = false,
    SIMULATION_WALLS_SHOULD_REPEL = true,
    SIMULATION_SPEED_LIMIT = 1,  // set to zero to disable it
    SIMULATION_CULLING_RADIUS_EXPONENT = 5,
    SIMULATION_CULLING_RADIUS = 1 << SIMULATION_CULLING_RADIUS_EXPONENT,
    SIMULATION_REPULSION_CONSTANT_FACTOR = 10,
    SIMULATION_NUM_PARTICLES = 1000;


class Simulation {

    constructor (width, height) {
        this.width = width;
        this.height = height;
        this.k = SIMULATION_REPULSION_CONSTANT_FACTOR;

        this.particles = [];
        this.spatialIndex = new CellularSpatialIndex(SIMULATION_CULLING_RADIUS_EXPONENT, width, height);

        if (SIMULATION_DISPLACE_EVENLY) {
            const totalArea = width * height;
            const areaPerParticle = totalArea / SIMULATION_NUM_PARTICLES;
            // FixMe this is wrong - it treats the area as if it was a square, but it is a rectangle
            const particleSquareSide = Math.sqrt(areaPerParticle);
            const particlesPerRow = Math.floor(width / particleSquareSide);
            const rowOffset = (width - particlesPerRow * particleSquareSide) / 2;
            const particlesPerCol = Math.floor(height / particleSquareSide);
            const colOffset = (height - particlesPerCol * particleSquareSide) / 2;
            const particleSquareHalfSide = particleSquareSide / 2;

            for (let y = colOffset + particleSquareHalfSide; y < height; y += particleSquareSide) {
                for (let x = rowOffset + particleSquareHalfSide; x < width; x += particleSquareSide) {
                    const particle = new Particle(x, y);
                    // console.info(x, y);
                    this.particles.push(particle);
                }
            }
        } else {
            for (let i = 0; i < SIMULATION_NUM_PARTICLES; i++) {
                const particle = new Particle(random(0, this.width), random(0, this.height));
                this.particles.push(particle);
            }
        }

        this.spatialIndex.bulkLoad(this.particles);
    }

    step() {
        // Forces are first calculated for *all* entries and only after that they are committed. This avoids an
        // inconsistent state and the result of entry i at time t doesn't affect the result of entry i+1 at time t
        // (all calculations for time t should only be based on particles' positions at t-1)

        let accruedNeighborCount = 0;
        let maxNeighborCount = Number.NEGATIVE_INFINITY;
        let minNeighborCount = Number.POSITIVE_INFINITY;

        // Calculate forces acting on each particle
        for (const particle of this.particles) {
            const neighbors = this.spatialIndex.getRelevantNeighbors(particle.getPos(), SIMULATION_CULLING_RADIUS);
            accruedNeighborCount += neighbors.length;
            if (neighbors.length > maxNeighborCount) maxNeighborCount = neighbors.length;
            if (neighbors.length < minNeighborCount) minNeighborCount = neighbors.length;

            const force = particle.getForce();
            force.set(0, 0);

            // forces owing to nearby neighbors
            for (const neighbor of neighbors) {
                const distVector = particle.getPos().copy().sub(neighbor.getPos());
                const neighborForceMagnitude = this.k / distVector.magSq();
                const neighborForce = distVector.normalize().mult(neighborForceMagnitude);
                force.add(neighborForce);
            }

            if (SIMULATION_WALLS_SHOULD_REPEL) {
                // forces owing to sandbox walls repelling the particle

                // left wall
                let distSqLeft = ((particle.getPos().x - 0) * (particle.getPos().x - 0)) || 1;  // must not be zero
                // right wall
                let distSqRight = ((particle.getPos().x - WORLD_WIDTH) * (particle.getPos().x - WORLD_WIDTH)) || 1;
                // top wall
                let distSqTop = ((particle.getPos().y - 0) * (particle.getPos().y - 0)) || 1;
                // bottom wall
                let distSqBottom = ((particle.getPos().y - WORLD_HEIGHT) * (particle.getPos().y - WORLD_HEIGHT)) || 1;

                force.x += this.k / distSqLeft;
                force.x -= this.k / distSqRight;
                force.y += this.k / distSqTop;
                force.y -= this.k / distSqBottom;
            }
        }

        logger.logAvgNeighborCount(accruedNeighborCount / this.particles.length);
        logger.logMinNeighborCount(minNeighborCount);
        logger.logMaxNeighborCount(maxNeighborCount);

        // Now commit the resulting forces by updating particles' velocities and positions
        for (const particle of this.particles) {
            const accel = particle.getForce().div(particle.getMass());
            const vel = particle.getVelocity();
            vel.add(accel);
            // Limit velocity magnitude to 50 pixels per refresh. Necessary to avoid particles escaping the sandbox
            // (they could do that if they acquired sufficient speed).
            // ToDo this limit should be dependant on the refresh rate (if the rate increases, so does the limit!)
            if (SIMULATION_SPEED_LIMIT) {
                vel.limit(SIMULATION_SPEED_LIMIT);
            }
            const pos = particle.getPos();
            pos.add(vel);

            // check if position is overbound and correct it if so, also mirroring velocity vector in the process
            this.adjustIfParticleIsOverbound(particle);
        }

        const entriesMoved = this.spatialIndex.update();
        logger.logMigratedParticles(entriesMoved);
    }

    adjustIfParticleIsOverbound(particle) {
        const pos = particle.getPos();
        const vel = particle.getVelocity();

        // ToDo take particle radius into account

        if (pos.x >= WORLD_WIDTH) {
            pos.x = WORLD_WIDTH - 1;
            vel.x *= -1;
        } else if (pos.x < 0) {
            pos.x = 0;
            vel.x *= -1;
        }

        if (pos.y >= WORLD_HEIGHT) {
            pos.y = WORLD_HEIGHT - 1;
            vel.y *= -1;
        } else if (pos.y < 0) {
            pos.y = 0;
            vel.y *= -1;
        }
    }

    getParticles() {
        return this.particles;
    }
}
