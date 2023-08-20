class Bird {
    constructor() {
  
      // x and y position of birds
      // Note: defaults to 10, as this is the cam-x location, where the birds are static on this x-value
      this.x = 10;
      this.y = screen.canvas.h / 2;
  
      // y-component of bird's velocity
      this.yVel = 0;
  
      // whether the bird is dead/alive
      this.dead = false;
  
      // measures birds fitness based on survival
      this.fitness = 0;
  
      // allows bird to fade out when dead
      this.opacity = 1;
  
      // angle allows bird to move head up when flapping
      this.angle = 0;
  
      // measures how far the bird traveled
      this.dist = 0;
    }
  
    // finds the y distance to the bottom of the closest pipe
    yDistToBottomPipe() {
      return this.y - gameHandler.nextPipe.bottom;
    }
  
    // finds the y distance to the top of the closest pipe
    yDistToTopPipe() {
      return gameHandler.nextPipe.top - this.y;
    }
  
    // finds the x distance to the closest pipe
    xDistToPipe() {
      return gameHandler.nextPipe.x - gameHandler.x;
    }
  
    // sets the bird's velocity to the jump velocity
    flap() {
      this.yVel = gameHandler.jumpVel;
    }
  
    // sets the bird's status to dead
    die() {
      this.dead = true;
    }
  
    // returns the inputs for the AI at this current instance in time
    getInputs() {
      return [
        this.y,
        this.xDistToPipe(),
        this.yDistToBottomPipe(),
        this.yDistToTopPipe(),
        this.yVel,
      ];
    }
  
  }