class Pipe {
    constructor(bottom, x) {
        this.bottom = bottom;
        this.top = this.bottom + gameHandler.flappyBird.pipeGapHeight;
        this.x = x;
    }
}