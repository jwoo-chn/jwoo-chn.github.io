// breed(male, female) {
//     for (let i = 0; i < male.inputWeights.length; i++) {
//       for (let j = 0; j < male.inputWeights[i].length; j++) {
//         this.inputWeights[i][j] = (male.inputWeights[i][j] + female.inputWeights[i][j]) / 2;
//       }
//     }

//     for (let i = 0; i < male.hiddenWeights.length; i++) {
//       for (let j = 0; j < male.hiddenWeights[i].length; j++) {
//         this.hiddenWeights[i][j] = (male.hiddenWeights[i][j] + female.hiddenWeights[i][j]) / 2;
//       }
//     }

//     this.mutate();
//   }

//   sigmoid(x) {
//     return 1 / (1 + Math.exp(-x));
//   }

//   sigmoid1d(x) {
//     let result = new Array(x.length);
//     for (let i = 0; i < x.length; i++) {
//       result[i] = this.sigmoid(x[i]);
//     }
//     return result;
//   }

//   dot1d1d(a, b) {
//     let result = 0;
//     for (let i = 0; i < a.length; i++) {
//       result += a[i] * b[i];
//     }
//     return result;
//   }

//   dot1d2d(a, b) {
//     let result = new Array(b[0].length);
//     for (let i = 0; i < b[0].length; i++) {
//       result[i] = 0;
//       for (let j = 0; j < b.length; j++) {
//         result[i] += a[j] * b[j][i];
//       }
//     }
//     return result;
//   }

// mutate() {
//     for (let i = 0; i < this.inputWeights.length; i++) {
//       for (let j = 0; j < this.inputWeights[0].length; j++) {
//         this.inputWeights[i][j] = this.getMutatedGenes(this.inputWeights[i][j]);
//       }
//     }

//     for (let i = 0; i < this.hiddenWeights.length; i++) {
//       for (let j = 0; j < this.hiddenWeights[0].length; j++) {
//         this.hiddenWeights[i][j] = this.getMutatedGenes(this.hiddenWeights[i][j]);
//       }
//     }
//   }

//   getMutatedGenes(weight) {
//     let multiplier = 0;
//     let learningRate = 0.0005 * Math.floor(Math.random() * 5); // mutates by maximum of 0.0125/2 up or down
//     // console.log(learningRate)
//     let isSave = Math.random() < 0.5;
//     let upDown = Math.random() < 0.5;

//     if (!isSave && upDown)
//       multiplier = 1;
//     else if (!isSave && !upDown)
//       multiplier = -1;

//     return weight + learningRate * multiplier;
//   }

//   createWeights(x, y) {
//     let weight = new Array(x);
//     for (var i = 0; i < x; i++) {
//       weight[i] = new Array(y);
//       // weight[i] = [];
//       for (var j = 0; j < y; j++) {
//         weight[i][j] = this.gaussianRandom(0, 0.05);
//       }
//     }

//     return weight;
//   }

//   gaussianRandom(mean = 0, stdev = 1) {
//     let u = 1 - Math.random(); //Converting [0,1) to (0,1)
//     let v = Math.random();
//     let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
//     // Transform to the desired mean and standard deviation:
//     return z * stdev + mean;
//   }

// if (Object.is(male, null)) {
//     this.inputWeights = this.createWeights(5, 3);
//     this.hiddenWeights = this.createWeights(3, 1);
//   } else if (Object.is(female, null)) {
//     this.inputWeights = male.inputWeights;
//     this.hiddenWeights = male.hiddenWeights;
//     this.mutate();
//   } else {
//     this.inputWeights = this.createWeights(5, 3);
//     this.hiddenWeights = this.createWeights(3, 1);
//     this.breed(male, female);
//   }

// // for(let j = 0; j < 5; j++){
//     //     console.log(this.inputWeights[j]);
//     // }
//     let hiddenIn = this.dot1d2d(input, this.inputWeights);
//     // console.log(hiddenIn);
//     let hiddenOut = this.sigmoid1d(hiddenIn);
//     // console.log(hiddenOut);
//     let predIn = this.dot1d1d(hiddenOut, this.hiddenWeights);

//     if (this.sigmoid(predIn) > 0.5) return true;