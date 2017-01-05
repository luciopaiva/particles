"use strict";

const
    HALF_PI = Math.PI / 2,
    WORLD_WIDTH = 800,
    WORLD_HEIGHT = 500;

let
    sim, debugConsole;

function setup() {
    createCanvas(WORLD_WIDTH, WORLD_HEIGHT);
    background(51);
    fill(255, 204, 100);
    stroke(200, 160, 50);

    randomSeed(42);
    sim = new Simulation(WORLD_WIDTH, WORLD_HEIGHT);
    debugConsole = $('#debug-console');
}

function draw() {
    background(51);  // clear scene

    // spatial index cell grid
    const w = SIMULATION_CULLING_RADIUS;
    stroke(150, 150, 255);
    for (let x = w; x < WORLD_WIDTH; x += w) {
        line(x, 0, x, WORLD_HEIGHT);
    }
    for (let y = w; y < WORLD_HEIGHT; y += w) {
        line(0, y, WORLD_WIDTH, y);
    }

    sim.step();

    let accruedSpeeds = 0;

    stroke(200, 160, 50);
    for (const particle of sim.getParticles()) {
        const pos = particle.getPos();

        // // debug heading
        // let heading = particle.getVelocity().heading() + Math.PI;  // value between -PI and PI
        // heading = Math.floor(heading / HALF_PI);
        // switch (heading) {
        //     case 0: fill(255, 0, 0); break;
        //     case 1: fill(0, 255, 0); break;
        //     case 2: fill(0, 0, 255); break;
        //     case 3: fill(255, 0, 255); break;
        //     default: fill(255, 255, 255); break;
        // }

        // // debug speed
        // let speed = particle.getVelocity().mag();
        // speed = Math.min(speed, 5) / 5;
        // speed = Math.floor(speed * 255);
        // fill(255, 204, 100, speed);

        let speed = particle.getVelocity().mag();
        if (isNaN(speed)) {
            console.error(particle);
        } else {
            accruedSpeeds += speed;
        }

        ellipse(pos.x, pos.y, 8, 8);
    }

    // const sample = sim.getParticles()[0];
    // const pos = sample.getPos();
    // const vel = sample.getVelocity();
    // const force = sample.getForce();
    // debugConsole.text(`${pos.x}, ${pos.y} - ${vel.x}, ${vel.y} - ${force.x}, ${force.y}`)

    accruedSpeeds /= sim.getParticles().length;
    debugConsole.text(accruedSpeeds);
}
