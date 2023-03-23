//a simple psuedo random number generator for generating the pipes
class PRNG {
  constructor(seed) {
    //Will return in range 0 to 1 if seed >= 0 and -1 to 0 if seed < 0.
    this.seed = seed;
  }
  num(x) {
    let a = (this.seed + x) * 15485863;
    return (a * a * a % 2038074743) / 2038074743;
  }
}