let canvas = document.getElementById('dino-c');
const ctx = canvas.getContext('2d');
const NUM_DINO = 1;
const IMAGE_DIRECTORY = '/assets/dino-components/statics/';
// let { NEAT, activation, crossover, mutate } = require('neat_net-js');


// let brain = new NEAT(config);

// let assets = {
//   birdSprites : [createImage('yellowbird-downflap.png'), createImage('yellowbird-midflap.png'), createImage('yellowbird-upflap.png')],
//   nums : [createImage('0.png'), createImage('1.png'), createImage('2.png'), createImage('3.png'), createImage('4.png'), createImage('5.png'), createImage('6.png'), createImage('7.png'), createImage('8.png'), createImage('9.png')],
//   bg : createImage('background-day.png'),
//   base : createImage('base.png'),
//   pipeUp : createImage('pipe-green.png'),
//   pipeDown : createImage('pipe-green-down.png')
// }

// function createImage(src) {
//   let ret = new Image();
//   ret.src = IMAGE_DIRECTORY + src;
//   ret.style.visibility = 'hidden';
//   document.body.append(ret);
//   return ret;
// }

let screen = {
  aspectRatio: 4 / 1,
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

      dinos: [], //list of dinos
      x: 0, //x position of all the dinos | m
      xVel: 10, //x velocity of all the dinos | m/s
      xAccel: .0005, //x acceleration of all the dinos | m/s^2
      maxXVel: 20, //max x velocity of all the dinos | m/s
      dinoSize: 1, //assume the dino's hitbox is a square | m
      jumpHeight: 10,

      obstacleDist: 20, //distance between obstacles

      gravity: 60, //gravity acceleration | m/s^2
      camX: 10, //x position of where to put the dinos on the screen
      camY: 10, //y position of where to put the ground on the screen (y = 0)

      obstacleRadius: 1,

      init: function(seed) { //the seed determines what the pipes will look like
        this.dinos = new Array(NUM_DINO);
        for (let i = 0; i < NUM_DINO; i++) {
          this.dinos[i] = new Dino();
        } 

        this.rng = new PRNG(seed);
        this.x = 0;
        this.xVel = 10;
      },

      simulate: function() {
        this.xVel = Math.min(this.maxXVel, this.xVel + this.xAccel * time.delta);
        this.x += this.xVel * time.delta;
        ctx.fillStyle = 'rgb(0,0,0)';
        
        let start = this.x - this.camX - 3*this.obstacleRadius;
        let end = this.x - this.camX + screen.canvas.w + 3*this.obstacleRadius;

        for (let x = start; x <= end; x += this.obstacleDist) {
          let obstacle = this.getObstacle(x);

          if (obstacle.typeObj == obstacle.CACTUS) {
            ctx.fillRect(obstacle.x + this.camX - this.x, screen.canvas.h - this.camY - (this.obstacleRadius*2), this.obstacleRadius*2, this.obstacleRadius*(1+(obstacle.hMultiplier/2)));
          } else if (obstacle.typeObj == obstacle.BIRD) {
            let height = screen.canvas.h - this.camY - (this.obstacleRadius*2)*(1+obstacle.hMultiplier); 
            ctx.fillRect(obstacle.x + this.camX - this.x, height, this.obstacleRadius*2, this.obstacleRadius*2);
          }
          
        }
        
        for (let i = 0; i < this.dinos.length; i++) {
          let dino = this.dinos[i];
          dino.yVel -= this.gravity * time.delta;
          dino.y += dino.yVel * time.delta;
          if (dino.y < 0) {
            dino.y = 0;
            dino.yVel = 0;
          }

          ctx.fillRect(this.camX, screen.canvas.h - dino.y - this.camY - this.dinoSize, this.dinoSize, this.dinoSize);
        }
      },

      //get the obstacle that occurs immediately after position x
      getObstacle: function(x) {
        let i = Math.max(Math.ceil(x / this.obstacleDist), 1); // the first obstacle doesn't exist
        return new Obstacle(Math.floor(this.rng.num(i) * 3), Math.random() < 0.8, i * this.obstacleDist);
      },

      getDinos: function() {
        return this.dinos;
      },

      setDino: function(dinos) {
        this.dinos = dinos;
      },

      isExtinct: function() {
        for (let i = 0; i < this.dinos.length; i++) {
          if (!this.dinos[i].dead) {
            return false;
          }
        }

        return true;
      }
    }
}

window.addEventListener('resize', resize);
window.onload = new function() {
  window.requestAnimationFrame(mainloop);
}
gameHandler = createHandler();
gameHandler.init(1);

function mainloop() {
  window.requestAnimationFrame(mainloop);
  if (gameHandler.isExtinct()) {
    gameHandler = createHandler();
    gameHandler.init(1);
  }

  time.now = performance.now();
  time.delta = (time.now - time.then) / 1000;
  time.then = time.now;
  time.delta = 1 / 60; //for now, assume 60 fps

  ctx.clearRect(0, 0, screen.canvas.w, screen.canvas.h);
  ctx.imageSmoothingEnabled = false;

  gameHandler.simulate();
}


window.addEventListener("click", function() {
    gameHandler.getDinos()[0].jump(1);
});