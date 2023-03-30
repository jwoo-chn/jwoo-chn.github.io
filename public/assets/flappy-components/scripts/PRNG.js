//a simple psuedo random number generator for generating the pipes
class PRNG {
  constructor(seed) {
    //Will return in range 0 to 1 if seed >= 0 and -1 to 0 if seed < 0.
    this.seed = seed;
  }

  //generate a random number with the Mulberry32 function and return it
  num(x) {
    var t = (this.seed + x) + 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}
