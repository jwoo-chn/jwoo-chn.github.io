let canvas = document.getElementById('flappy-c');
const ctx = canvas.getContext('2d');
const NUM_BIRDIES = 50;
const IMAGE_DIRECTORY = '/assets/flappy-components/statics/';
let { NEAT, activation, crossover, mutate } = require('neat_net-js');

let config = {
	model: [
		{nodeCount: 4, type: "input"},
		{nodeCount: 2, type: "output", activationfunc: activation.SOFTMAX}
	],
	mutationRate: 0.1,
	crossoverMethod: crossover.RANDOM,
	mutationMethod: mutate.RANDOM,
	populationSize: NUM_BIRDIES
};