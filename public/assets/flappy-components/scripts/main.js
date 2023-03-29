const canvas = document.getElementById('flappy-c');
const ctx = canvas.getContext('2d');

const IMAGE_DIRECTORY = '/assets/flappy-components/statics/';

let { NEAT, activation, crossover, mutate } = require('neat_net-js');

function createDefaultConfig() {
  return {
    model: [
      { nodeCount: 5, type: "input" },
      { nodeCount: 2, type: "output", activationfunc: activation.SOFTMAX }
    ],
    mutationRate: 0.1,
    crossoverMethod: crossover.RANDOM,
    mutationMethod: mutate.RANDOM,
    populationSize: 30,
  };
}

let config = createDefaultConfig();
let brain = new NEAT(config);
let pause = true;

let assets = {
  birdSprites : [createImage('yellowbird-downflap.png'), createImage('yellowbird-midflap.png'), createImage('yellowbird-upflap.png')],
  nums : [createImage('0.png'), createImage('1.png'), createImage('2.png'), createImage('3.png'), createImage('4.png'), createImage('5.png'), createImage('6.png'), createImage('7.png'), createImage('8.png'), createImage('9.png')],
  bg : createImage('background-day.png'),
  base : createImage('base.png'),
  pipeUp : createImage('pipe-green.png'),
  pipeDown : createImage('pipe-green-down.png')
}

function createImage(src) {
  let ret = new Image();
  ret.src = IMAGE_DIRECTORY + src;
  ret.style.visibility = 'hidden';
  document.body.append(ret);
  return ret;
}

let screen = {
  aspectRatio: 16 / 9,
  canvas: { //width and height that will be used in canvas rendering (the canvas is 64m wide)
    w: 64,
    h: undefined,
  },
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
}

function resize() {
  screen.resize();
}

resize();

let time = {
  now: performance.now(), //ms
  then: performance.now(), //ms
  delta: 0 //s
}

function createHandler() {
  return {
      rng: new PRNG(1),

      birds: [], //list of birds
      x: 0, //x position of all the birds | m
      xVel: 10, //x velocity of all the birds | m/s
      birdHeight: 2, //assume the bird's hitbox is a square | m
      jumpVel: 22, //change in y-velocity upon flapping | m/s

      gravity: 60, //gravity acceleration | m/s^2
      
      pipeDist: 24, //distance between pipes | m
      pipeGapHeight: 10, //distance of the gap between bottom and top | m
      gapHeightRange: [6, 33], //range of heights that the gap can vary between | m
      pipeRadius: 2, //radius of the pipe (the width of the pipe is twice this) | m
      nextPipe: undefined, //the next pipe that the birds must pass through

      camX: 10, //x position of where to put the birds on the screen

      numBirds: 30,
      mutationRate: 0.1,

      init: function() { //the seed determines what the pipes will look like
        this.birds = new Array(this.numBirds);
        for (let i = 0; i < this.numBirds; i++) {
          this.birds[i] = new Bird();
        } 

        this.rng = new PRNG(1);
        this.x = 0;
      },

      simulate: function() {
        this.x += this.xVel * time.delta;

        let disp = -(time.now/200)%20.2;
        for (let i = 0; i < 5; i++) 
          ctx.drawImage(assets.bg, disp + i * 20.2, 0, 20.25, screen.canvas.h);

        ctx.fillStyle = 'rgb(0,0,0)';
        this.nextPipe = this.getPipe(this.x - 2);
        for (let i = 0; i < this.birds.length; i++) {
          let b = this.birds[i];

          if ((b.xDistToPipe() <= this.birdHeight / 2 + this.pipeRadius && (b.yDistToBottomPipe() <= this.birdHeight / 2 || b.yDistToTopPipe() <= this.birdHeight / 2))
            || b.y < 4) {
            b.die();
          }

          // temp render
          if (!b.dead) {
            b.dist = this.x;

            b.fitness += 0.01;
            // console.log(b.fitness);
            brain.setFitness(b.fitness, i);

            b.yVel -= this.gravity * time.delta;
            b.y += b.yVel * time.delta;

            brain.setInputs(b.getInputs(), i);
            brain.feedForward();

            let pos = [this.camX + b.dist - this.x, screen.canvas.h - b.y];
            b.angle = Math.atan2(b.yVel, this.xVel);
            
            ctx.translate(pos[0], pos[1]);
            ctx.rotate(-b.angle/4-.3);

            ctx.fillStyle = "rgb(237, 255, 0)";

            ctx.drawImage(assets.birdSprites[(Math.floor(time.now/100))%3], -this.birdHeight/2 * 34/24, -this.birdHeight/2, this.birdHeight * 34/24, this.birdHeight);

            ctx.rotate(b.angle/4+.3);
            ctx.translate(-pos[0], -pos[1]);

            let choices = brain.getDesicions(i);
            if (choices[i] == 1) {
              b.flap();
            }

          } else {
            b.yVel = 0;
            b.opacity = Math.max(b.opacity - .05, 0);
            let pos = [this.camX + b.dist - this.x, screen.canvas.h - b.y];

            ctx.globalAlpha = b.opacity;
            
            ctx.translate(pos[0], pos[1]);
            ctx.rotate(-b.angle/4-.3);

            ctx.fillStyle = "rgb(237, 255, 0)";

            ctx.drawImage(assets.birdSprites[(Math.floor(time.now/100))%3], -this.birdHeight/2 * 34/24, -this.birdHeight/2, this.birdHeight * 34/24, this.birdHeight);

            ctx.rotate(b.angle/4+.3);
            ctx.translate(-pos[0], -pos[1]);

            ctx.globalAlpha = 1;
          }

        }

        let start = this.x - this.camX - this.pipeRadius;
        let end = this.x - this.camX + screen.canvas.w + this.pipeRadius;

        ctx.fillStyle = "rgb(28, 161, 21)";

        for (let x = start; x <= end; x += this.pipeDist) {
          let pipe = this.getPipe(x);

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

        disp = -(this.x)%20.2;
        for (let i = 0; i < 5; i++) {
          ctx.drawImage(assets.base, disp + i * 20.2, 33, 20.25, 6.75);
        }

        let score = Math.max(Math.ceil(this.x / this.pipeDist), 1) - 1;
        let scorelength = score.toString().length;
        disp = screen.canvas.w/2 - 1.2 * scorelength/2;
        for (let i = scorelength - 1; i >= 0; i--) {
          ctx.drawImage(assets.nums[score%10], disp + i, 2.5, 1.2, 36/24*1.3);
          score = Math.floor(score/10);
        }
      },

      //get the pipe that occurs immediately after position x
      getPipe: function(x) {
        let i = Math.max(Math.ceil(x / this.pipeDist), 1); // the first pipe doesn't exist
        return new Pipe(
          this.rng.num(i) * (this.gapHeightRange[1] - this.gapHeightRange[0] - this.pipeGapHeight) + this.gapHeightRange[0],
          i * this.pipeDist
        );
      },

      getBirds: function() {
        return this.birds;
      },

      setBirds: function(birds) {
        this.birds = birds;
      },

      isExtinct: function() {
        for (let i = 0; i < this.birds.length; i++) {
          if (!this.birds[i].dead) {
            return false;
          }
        }

        return true;
      }
    }
}

window.addEventListener('resize', resize);
window.onload = new function() {
  gameHandler = createHandler();
  gameHandler.init();
  window.requestAnimationFrame(mainloop);
}

function mainloop() {
  window.requestAnimationFrame(mainloop);

  if (pause) return;


  if (gameHandler.isExtinct()) {
    gameHandler = createHandler();
    brain.doGen();
    gameHandler.init();
    UIconfig.enforce();
  }

  time.now = performance.now();
  time.delta = (time.now - time.then) / 1000;
  time.then = time.now;
  time.delta = 1 / 60; //for now, assume 60 fps

  ctx.clearRect(0, 0, screen.canvas.w, screen.canvas.h);
  ctx.imageSmoothingEnabled = false;

  gameHandler.simulate();
}

