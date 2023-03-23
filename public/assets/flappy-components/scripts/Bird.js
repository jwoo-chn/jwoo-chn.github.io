class Bird {
  constructor() {
    this.x = 10;
    this.y = screen.canvas.h / 2;
    this.yVel = 0;
    this.dead = false;
    this.fitness = 0;

    this.opacity = 1;
    this.angle = 0;
    this.dist = 0;

  }

  yDistToBottomPipe() {
    return this.y - gameHandler.flappyBird.nextPipe.bottom;
  }

  yDistToTopPipe() {
    return gameHandler.flappyBird.nextPipe.top - this.y;
  }

  xDistToPipe() {
    return gameHandler.flappyBird.nextPipe.x - gameHandler.flappyBird.x;
  }

  flap() {
    this.yVel = 22;
  }

  die() {
    this.dead = true;
  }

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