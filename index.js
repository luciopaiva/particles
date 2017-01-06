"use strict";

const
    RENDER_MODE_NORMAL = 1,
    RENDER_MODE_HEADING = 2,
    RENDER_MODE_VELOCITY = 3,
    WORLD_WIDTH = 800,
    WORLD_HEIGHT = 500;

let
    started = false,
    showGrid = true,
    renderMode = RENDER_MODE_NORMAL,
    sim;

function setup() {
    const canvas = createCanvas(WORLD_WIDTH, WORLD_HEIGHT);
    canvas.parent('canvas-container');
    background(51);
    fill(255, 204, 100);
    stroke(200, 160, 50);

    randomSeed(42);
    sim = new Simulation(WORLD_WIDTH, WORLD_HEIGHT);
}

function draw() {
    if (!started) return;

    background(51);  // clear scene

    if (showGrid) {
        // ToDo is it possible to render this once? Maybe 2 separate canvases on top of each other?
        // spatial index cell grid
        const w = SIMULATION_CULLING_RADIUS;
        stroke(150, 150, 255);
        fill(150, 150, 255);
        for (let x = w; x < WORLD_WIDTH; x += w) {
            line(x, 0, x, WORLD_HEIGHT);
        }
        for (let y = w; y < WORLD_HEIGHT; y += w) {
            line(0, y, WORLD_WIDTH, y);
        }
        for (let i = 0, y = 0; y < WORLD_HEIGHT; y += w) {
            for (let x = 0; x < WORLD_WIDTH; x += w) {
                text(i++, x + 2, y + 12);
            }
        }
    }

    sim.step();

    let accruedSpeeds = 0;

    stroke(200, 160, 50);
    if (renderMode == RENDER_MODE_NORMAL) {
        fill(255, 204, 100);
    }

    for (const particle of sim.getParticles()) {
        const pos = particle.getPos();

        if (renderMode == RENDER_MODE_HEADING) {
            // debug heading
            let heading = particle.getVelocity().heading() + Math.PI;  // value between -PI and PI
            heading = Math.floor(heading / HALF_PI);
            switch (heading) {
                case 0: fill(255, 0, 0); break;
                case 1: fill(0, 255, 0); break;
                case 2: fill(0, 0, 255); break;
                case 3: fill(255, 0, 255); break;
                default: fill(255, 255, 255); break;
            }
        } else if (renderMode == RENDER_MODE_VELOCITY) {
            // debug speed
            let speed = particle.getVelocity().mag();
            speed = Math.min(speed, SIMULATION_SPEED_LIMIT) / SIMULATION_SPEED_LIMIT;
            speed = Math.floor(speed * 255);
            fill(255, 204, 100, speed);
        }

        let speed = particle.getVelocity().mag();
        if (isNaN(speed)) {
            console.error(particle);
        } else {
            accruedSpeeds += speed;
        }

        ellipse(pos.x, pos.y, 8, 8);
        // text(particle.getIndex(), pos.x + 10, pos.y);
    }

    accruedSpeeds /= sim.getParticles().length;
    logger.logAvgSpeed(accruedSpeeds);
    logger.logNumParticles(sim.getParticles().length);
    logger.logFps(frameRate());
}

function keyPressed() {
    switch (keyCode) {
        case RETURN:
            started = !started;
            break;
        case 49:  // 1
            renderMode = RENDER_MODE_NORMAL;
            break;
        case 50:  // 2
            renderMode = RENDER_MODE_HEADING;
            break;
        case 51:  // 3
            renderMode = RENDER_MODE_VELOCITY;
            break;
        case 71:  // g
            showGrid = !showGrid;
            break;
        case 87:  // w
            sim.toggleRepellingWalls();
            break;
        default:
            console.info('keyCode = ' + keyCode);
    }
}