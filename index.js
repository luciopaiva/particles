"use strict";

const
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
    sim.step();

    for (const particle of sim.getParticles()) {
        const pos = particle.getPos();
        ellipse(pos.x, pos.y, 8, 8);
    }

    const pos = sim.getParticles()[0].getPos();
    const vel = sim.getParticles()[0].getVelocity();
    const force = sim.getParticles()[0].getForce();
    debugConsole.text(`${pos.x}, ${pos.y} - ${vel.x}, ${vel.y} - ${force.x}, ${force.y}`)
}
