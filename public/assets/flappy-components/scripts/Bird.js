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

  yDistToBottomPipe() {
    return this.y - gameHandler.nextPipe.bottom;
  }

  yDistToTopPipe() {
    return gameHandler.nextPipe.top - this.y;
  }

  xDistToPipe() {
    return gameHandler.nextPipe.x - gameHandler.x;
  }

  flap() {
    this.yVel = gameHandler.jumpVel;
  }

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