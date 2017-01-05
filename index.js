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

    sim.step();

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

        // debug speed
        let speed = particle.getVelocity().mag();
        speed = Math.min(speed, 5) / 5;
        speed = Math.floor(speed * 255);
        fill(255, 204, 100, speed);

        ellipse(pos.x, pos.y, 8, 8);
    }

    // const sample = sim.getParticles()[0];
    // const pos = sample.getPos();
    // const vel = sample.getVelocity();
    // const force = sample.getForce();
    // debugConsole.text(`${pos.x}, ${pos.y} - ${vel.x}, ${vel.y} - ${force.x}, ${force.y}`)
}
