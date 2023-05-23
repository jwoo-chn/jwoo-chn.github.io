// initialize the canvas where simulation will take place
const canvas = document.getElementById('flappy-c');
const ctx = canvas.getContext('2d');

// sets the image directory for the image components
const IMAGE_DIRECTORY = '/assets/flappy-components/statics/';

// imports the NEAT library
const { NEAT, activation, crossover, mutate } = require('neat_net-js');
const graph = new Graph('Score vs Generation Graph');

// sets the in-game time
const time = {
  inGameNow: 0,
  now: performance.now(), //ms
  then: performance.now(), //ms
  delta: 0 //s
}

// sets up the canvas screen for the simulation
const screen = {
  aspectRatio: 16 / 9,
  canvas: { //width and height that will be used in canvas rendering (the canvas is 64m wide)
    w: 64,
    h: undefined,
  },

  // resizes the screen based off a specific aspect ratio
  resize: function() {
    let w = window.innerWidth;
    let h = window.innerHeight;

    if (w / h > this.aspectRatio) {
      this.offsetX = (w - this.aspectRatio * h) / 2;
      w = this.aspectRatio * h;
      this.offsetY = 0;
    } else {
      this.offsetX = 0;
      this.offsetY = (h - w / this.aspectRatio) / 2;
      h = w / this.aspectRatio;
    }
    
    // aligns/resizes the canvas
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.style.left = this.offsetX + "px";
    canvas.style.top = this.offsetY + "px";

    this.canvas.h = this.canvas.w / this.aspectRatio;

    this.scale = w / this.canvas.w;

    ctx.transform(1, 0, 0, 1, 0, 0);
    ctx.scale(this.scale, this.scale);
  },
  offsetX: 0,
  offsetY: 0,
};

// initializing more variables
// assets = nothing for now; initialized in window.load() so simulation will start after all images are loaded in
var assets;

// sets up the default configurations
var config = createDefaultConfig();

// initializes the brain of the AI
var brain = new NEAT(config);

// boolean to check if the user pressed the pause button
// NOTE: starts as true, as simulation does not start till user presses btn on Home Screen
var pause = true;

//function to resize the screen when necessary
function resize() {
  screen.resize();
}

// create default configuration of neural network for the restart-simulation button
function createDefaultConfig() {
  return {
    model: [
      { nodeCount: 5, type: "input" }, // 5 inputs into the program
      { nodeCount: 2, type: "output", // 2 outputs as binary (flap or no flap)
      activationfunc: activation.SOFTMAX }
    ],
    mutationRate: 0.1, //default mutation rate when moving to nextGeneration of simulator
    crossoverMethod: crossover.RANDOM,
    mutationMethod: mutate.RANDOM, // sets the mutation/crossover methods to randomized
    populationSize: 30, // num of birds
  };
}


// Create all the sliders/buttons for the adjustable game parameters
function createDefaultUIConfig() {
  return new Config([
    new ConfigTab("Genetic", [
      new Slider('numBirds', 'Population Size', "The number of birds per generation.<br><span class='highlight'>Note: Changing this restarts the simulation</span>", [5, 80], 30),
      new Slider('mutationRate', 'Mutation Rate', "The percent probability that a gene is randomly changed.<br><span class='highlight'>Note: Changing this restarts the simulation</span>", [1, 20], 10),
      new Button(restartSim, 'Restart Simulation', 'Clear all training data and restart the simulation.'),
    ]),
    new ConfigTab("Environment", [
      new Slider('xVel', 'Bird Speed', 'The speed at which the birds move.', [3, 30], 10),
      new Slider('jumpVel', 'Jump Power', 'The power put into a single bird flap.', [10, 50], 22),
      new Slider('pipeGapHeight', 'Pipe Gap Height', 'The distance between the top and bottom pipes.', [5, 20], 10),
      new Slider('gravity', 'Gravity', 'The acceleration of gravity.', [50,100], 60),
    ]),
    new ConfigTab("Miscellaneous", [
      new Slider('camX', 'Camera X', 'The horizontal position of the birds on the screen.', [2,50], 10),
      new Slider('speed', 'Speed', 'The speed at which the simulation runs.', [5, 300], 50),
    ]),
    new ConfigTab("Graph", [graph])
  ]);
}

// import and loads in a component from the statics folder
function createImage(src) {
  let ret = new Image();
  ret.src = IMAGE_DIRECTORY + src;
  ret.style.visibility = 'hidden';
  document.body.append(ret);
  return ret;
}

// creates the game handler, which contains all details about the simulation
function createHandler() {
  return {
      rng: new PRNG(0),

      birds: [], //list of birds
      x: 0, //x position of all the birds | m
      xVel: 10, //x velocity of all the birds | m/s
      birdHeight: 2.25, //assume the bird's hitbox is a square | m
      jumpVel: 22, //change in y-velocity upon flapping | m/s

      gravity: 60, //gravity acceleration | m/s^2
      
      pipeDist: 24, //distance between pipes | m
      pipeGapHeight: 10, //distance of the gap between bottom and top | m
      gapHeightRange: [6, 33], //range of heights that the gap can vary between | m
      pipeRadius: 2, //radius of the pipe (the width of the pipe is twice this) | m
      nextPipe: undefined, //the next pipe that the birds must pass through

      camX: 10, //x position of where to put the birds on the screen
      speed: 50, //game movement speed
      numBirds: 30, //number of birds
      mutationRate: 0.1, //probability of a gene being randomly changed

      constScore: 0,

      init: function() {
        // initilizes the array of birds
        this.birds = new Array(this.numBirds);
        for (let i = 0; i < this.numBirds; i++) {
          this.birds[i] = new Bird();
        } 
        
        // seeds for pipe randomization
        this.rng = new PRNG(Math.random()*1e9);

        // sets the initial position of the birds
        this.x = 0;
      },

      simulate: function() {
        // Calculate new x value
        this.x += this.xVel * time.delta;

        // draws the background graphics
        let disp = -(this.x/2)%20.2;
        for (let i = 0; i < 5; i++) 
          ctx.drawImage(assets.bg, disp + i * 20.2, 0, 20.25, screen.canvas.h);
        ctx.fillStyle = 'rgb(0,0,0)';

        // gets the upcoming pipe
        this.nextPipe = this.getPipe(this.x - 2);

        // loops through all the birds
        for (let i = 0; i < this.numBirds; i++) {
          let b = this.birds[i];
          
          // checks to see if the bird hit the upcoming pipe or hit the ground
          if ((b.xDistToPipe() <= this.birdHeight / 2 + this.pipeRadius * 1.02 && (b.yDistToBottomPipe() <= this.birdHeight / 2 || b.yDistToTopPipe() <= this.birdHeight / 2))
            || b.y < 4) {
            b.die();
          }
          
          // if the bird is not dead
          if (!b.dead) {
            // sets the distance the bird traveled to the current x position
            b.dist = this.x;

            // increments fitness as it survived 
            b.fitness += 0.01;
            
            // sets the fitness of the bird into the neural network
            brain.setFitness(b.fitness, i);
            
            // applies the gravity acceleration 
            b.yVel -= this.gravity * time.delta;

            // displaces the bird based on current velocity in the time duration
            b.y += b.yVel * time.delta;
            
            // sets inputs into the neural network
            brain.setInputs(b.getInputs(), i);

            // pass bird input data through the nodes of the neural network
            brain.feedForward();

            // renders bird at a specific angle
            let pos = [this.camX + b.dist - this.x, screen.canvas.h - b.y];
            b.angle = Math.atan2(b.yVel, this.xVel);
            
            ctx.translate(pos[0], pos[1]);

            // applies bird rotation
            ctx.rotate(-b.angle/4-.3);

            ctx.fillStyle = "rgb(237, 255, 0)";
            
            // draws the image
            ctx.drawImage(assets.birdSprites[(Math.floor(time.inGameNow/100))%3], -this.birdHeight/2 * 34/24, -this.birdHeight/2, this.birdHeight * 34/24, this.birdHeight);

            ctx.rotate(b.angle/4+.3);
            ctx.translate(-pos[0], -pos[1]);
            
            // get the decision of the specific bird and flaps if the bird decides to
            let choices = brain.getDesicions(i);
            if (choices[i] == 1) {
              b.flap();
            }

          } else { // if the bird is dead

            // y-vel is 0 so the bird should not move when dead
            b.yVel = 0;

            // decrease opacity till its invisble (0 opacity)
            b.opacity = Math.max(b.opacity - .05, 0);

            // position of the bird to be rendered in terms of canvas coordinates
            let pos = [this.camX + b.dist - this.x, screen.canvas.h - b.y];

            // set the opacity of any subsequent canvas drawings to b.opacity
            ctx.globalAlpha = b.opacity;
            
            // rotate the bird and then draw it
            ctx.translate(pos[0], pos[1]);
            ctx.rotate(-b.angle/4-.3);

            ctx.fillStyle = "rgb(237, 255, 0)";

            ctx.drawImage(assets.birdSprites[(Math.floor(time.inGameNow/100))%3], -this.birdHeight/2 * 34/24, -this.birdHeight/2, this.birdHeight * 34/24, this.birdHeight);

            ctx.rotate(b.angle/4+.3);
            ctx.translate(-pos[0], -pos[1]);

            // set the opacity of any subsequent canvas drawing back to its default, which is 1
            ctx.globalAlpha = 1;
          }

        }

        // finds the bounds of the screen 
        let start = this.x - this.camX - this.pipeRadius;
        let end = this.x - this.camX + screen.canvas.w + this.pipeRadius;

        ctx.fillStyle = "rgb(28, 161, 21)";

        // draws pipes between the bounds of the screen based on the rng values
        for (let x = start; x <= end; x += this.pipeDist) {
          // gets the position of each pipe
          let pipe = this.getPipe(x);
          
          // render pipe images at the pipe locations
          ctx.drawImage(assets.pipeUp, pipe.x - this.pipeRadius - this.x + this.camX,
            screen.canvas.h - pipe.bottom,
            2 * this.pipeRadius,
           2 * this.pipeRadius * 320/52);

          ctx.drawImage(assets.pipeDown, pipe.x - this.pipeRadius - this.x + this.camX,
            screen.canvas.h - pipe.top,
            2 * this.pipeRadius,
            -2 * this.pipeRadius * 320/52,
          );
        }
        
        // renders the ground image, which must be tesselated 
        disp = -(this.x)%20.2;
        for (let i = 0; i < 5; i++) {
          ctx.drawImage(assets.base, disp + i * 20.2, 33, 20.25, 6.75);
        }
        
        // computes the score of the living birds
        // NOTE: since all birds are align to same x-pos, each alive bird score is the same
        let score = Math.max(Math.ceil(this.x / this.pipeDist), 1) - 1;
        this.constScore = score;
        let scorelength = score.toString().length;

        // writes the score to the screen
        disp = screen.canvas.w/2 - 1.2 * scorelength/2;
        for (let i = scorelength - 1; i >= 0; i--) {
          ctx.drawImage(assets.nums[score%10], disp + i, 2.5, 1.2, 36/24*1.3);
          score = Math.floor(score/10);
        }
        
        // sets up the font details to draw the generation text
        ctx.font = "1.7px 'Figtree', sans-serif";
        ctx.lineWidth = .34;
        
        // writes the generation number to the screen
        let dispGen = "Generation: " + (brain.generation + 1);
        ctx.strokeStyle = 'rgb(0,0,0)';
        ctx.strokeText(dispGen, .76, 35.05);
        ctx.fillStyle = 'rgb(255,255,255)';
        ctx.fillText(dispGen, .7, 35);
      },

      // function to get the pipe that occurs immediately after current position x
      getPipe: function(x) {
        let i = Math.max(Math.ceil(x / this.pipeDist), 1); 
        return new Pipe(
          this.rng.num(i) * (this.gapHeightRange[1] - this.gapHeightRange[0] - this.pipeGapHeight) + this.gapHeightRange[0],
          i * this.pipeDist
        );
      },
      
      // checks to see if all the birds are dead
      isExtinct: function() {
        for (let i = 0; i < this.numBirds; i++) {
          if (!this.birds[i].dead) 
            return false;
        }

        return true;
      }
    }
}

function mainloop() {
  // recursive call to continue animation
  window.requestAnimationFrame(mainloop);

  // if game is paused
  if (time.inGameNow == 0 && pause) return;

  // if the generation has all died, create the new generation of birds and apply user changes
  if (gameHandler.isExtinct()) {

    graph.drawGraph(brain.generation+1, gameHandler.constScore);

    // start the next generation since all current birds are dead
    brain.doGen();

    // recreates the default handler to have fresh set of birds
    gameHandler = createHandler();
    
    // applies the previous set input-values so simulation settings remain the same
    UIconfig.enforce();

    // starts the simulation again
    gameHandler.init();
  }
  
  // set the current time to performance.now(), which represents the number of milliseconds since the webpage was started
  time.now = performance.now();

  // the min function prevents the time step, time.delta from being a very large value
  // at frame rates lower than 20fps, the simulation will start to lag
  time.delta = Math.min((time.now - time.then) / 1000, .05); 

  time.then = time.now;
  
  // scale the time by user-speed input
  time.delta *= gameHandler.speed/50;

  // if the game is paused, time.delta should be set to 0
  time.delta *= 1-pause;

  // update the in-game timer
  time.inGameNow += time.delta * 1000;

  // clear the canvas before rendering anything to it
  ctx.clearRect(0, 0, screen.canvas.w, screen.canvas.h);

  // ensures that any pixelated images will not be blurry when rendered
  ctx.imageSmoothingEnabled = false;

  gameHandler.simulate();
}

// resizes the screen, when window size changes
window.addEventListener('resize', resize);

// when the window finishes loading
window.onload = new function() {
  // double check that window is sized properly
  resize();
  
  // initializes images here, so it will definitely load before simulation starts
  assets = {
    birdSprites : [createImage('yellowbird-downflap.png'), createImage('yellowbird-midflap.png'), createImage('yellowbird-upflap.png')],
    nums : [createImage('0.png'), createImage('1.png'), createImage('2.png'), createImage('3.png'), createImage('4.png'), createImage('5.png'), createImage('6.png'), createImage('7.png'), createImage('8.png'), createImage('9.png')],
    bg : createImage('background-day.png'),
    base : createImage('base.png'),
    pipeUp : createImage('pipe-green.png'),
    pipeDown : createImage('pipe-green-down.png')
  };
  
  // creates the default handler
  gameHandler = createHandler(); 

  // creates the default UI configurations
  UIconfig = createDefaultUIConfig();
  
  // initialize both UIconfig and the game handler 
  UIconfig.init();
  gameHandler.init();

  graph.drawGraph();

  // start the simulation
  window.requestAnimationFrame(mainloop);
}



