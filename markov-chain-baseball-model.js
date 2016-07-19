var math = require('mathjs');

//Average probabilities come from MajorLeagueBaseball, via http://www.uwosh.edu/faculty_staff/kuennene/Baseball.ppt
//An average game is considered to have 5 runs
exports.assumptions = {
    homerun: 0.03,
    single: 0.16,
    double: 0.05,
    triple: 0.005,
    walk: 0.094,
    sacbunt: 0.0105,
    innings: 9,
    maxScore: 40,
    maxAtBats: 18,
    availableOuts: [0, 1, 2],
    runnerStates: [0, 1, 2, 3, 12, 13, 23, 123]
};

// Definition of all Markov transitions without producing an out
// runners [from state, to state]
exports.runnerTransitions = {
  noouts:
    [
      //homerun
      { from: 0, to: 0, transition: this.assumptions.homerun, runs: 1 },
      { from: 1, to: 0, transition: this.assumptions.homerun, runs: 2 },
      { from: 2, to: 0, transition: this.assumptions.homerun, runs: 2 },
      { from: 3, to: 0, transition: this.assumptions.homerun, runs: 2 },
      { from: 12, to: 0, transition: this.assumptions.homerun, runs: 3 },
      { from: 13, to: 0, transition: this.assumptions.homerun, runs: 3 },
      { from: 23, to: 0, transition: this.assumptions.homerun, runs: 3 },
      { from: 123, to: 0, transition: this.assumptions.homerun, runs: 4 },
      //single
      { from: 0, to: 1, transition: this.assumptions.single+this.assumptions.walk, runs: 0 },
      { from: 1, to: 12, transition: 0.65*this.assumptions.single+this.assumptions.walk, runs: 0 },
      { from: 1, to: 13, transition: 0.35*this.assumptions.single, runs: 0 },
      { from: 2, to: 1, transition: 0.65*this.assumptions.single, runs: 1 },
      { from: 2, to: 13, transition: 0.35*this.assumptions.single, runs: 0 },
      { from: 3, to: 1, transition: this.assumptions.single, runs: 1 },
      { from: 12, to: 12, transition: this.assumptions.single/4.0, runs: 1 },
      { from: 12, to: 13, transition: this.assumptions.single/2.0, runs: 1 },
      { from: 12, to: 123, transition: this.assumptions.single/4.0+this.assumptions.walk, runs: 0 },
      { from: 13, to: 12, transition: this.assumptions.single/2.0, runs: 1 },
      { from: 13, to: 13, transition: this.assumptions.single/2.0, runs: 1 },
      { from: 23, to: 1, transition: this.assumptions.single/2.0, runs: 2 },
      { from: 23, to: 13, transition: this.assumptions.single/2.0, runs: 1 },
      { from: 123, to: 12, transition: this.assumptions.single/2.0, runs: 2 },
      { from: 123, to: 13, transition: this.assumptions.single/2.0, runs: 2 },
      //double
      { from: 0, to: 2, transition: this.assumptions.double, runs: 0 },
      { from: 1, to: 2, transition: this.assumptions.double/2.0, runs: 1 },
      { from: 1, to: 23, transition: this.assumptions.double/2.0, runs: 0 },
      { from: 2, to: 2, transition: this.assumptions.double, runs: 1 },
      { from: 3, to: 2, transition: this.assumptions.double, runs: 1 },
      { from: 12, to: 2, transition: this.assumptions.double/2.0, runs: 2 },
      { from: 12, to: 23, transition: this.assumptions.double/2.0, runs: 2 },
      { from: 13, to: 2, transition: this.assumptions.double/2.0, runs: 2 },
      { from: 13, to: 23, transition: this.assumptions.double/2.0, runs: 1 },
      { from: 23, to: 2, transition: this.assumptions.double, runs: 2 },
      { from: 123, to: 2, transition: this.assumptions.double/2.0, runs: 3 },
      { from: 123, to: 23, transition: this.assumptions.double/2.0, runs: 2 },
      //triple
      { from: 0, to: 3, transition: this.assumptions.triple, runs: 0 },
      { from: 1, to: 3, transition: this.assumptions.triple, runs: 1 },
      { from: 2, to: 3, transition: this.assumptions.triple, runs: 1 },
      { from: 3, to: 3, transition: this.assumptions.triple, runs: 1 },
      { from: 12, to: 3, transition: this.assumptions.triple, runs: 2 },
      { from: 13, to: 3, transition: this.assumptions.triple, runs: 2 },
      { from: 23, to: 3, transition: this.assumptions.triple, runs: 2 },
      { from: 123, to: 3, transition: this.assumptions.triple, runs: 3 },
      //walk
      { from: 2, to: 4, transition: this.assumptions.walk, runs: 0 },
      { from: 3, to: 13, transition: this.assumptions.walk, runs: 0 },
      { from: 13, to: 123, transition: this.assumptions.walk, runs: 0 },
      { from: 23, to: 123, transition: this.assumptions.walk, runs: 0 },
      { from: 123, to: 123, transition: this.assumptions.walk, runs: 1 },
    ],
  sacrifice:
    [
      //sacrifice bunt
      { from: 1, to: 2, transition: this.assumptions.sacbunt, runs: 0 },
      { from: 2, to: 3, transition: this.assumptions.sacbunt, runs: 0 },
      { from: 3, to: 0, transition: this.assumptions.sacbunt, runs: 1 },
      { from: 12, to: 13, transition: this.assumptions.sacbunt/2.0, runs: 0 },
      { from: 12, to: 23, transition: this.assumptions.sacbunt/2.0, runs: 0 },
      { from: 13, to: 1, transition: this.assumptions.sacbunt, runs: 1 },
      { from: 23, to: 2, transition: this.assumptions.sacbunt/2.0, runs: 1 },
      { from: 23, to: 3, transition: this.assumptions.sacbunt/2.0, runs: 1 },
      { from: 123, to: 12, transition: this.assumptions.sacbunt/2.0, runs: 1 },
      { from: 123, to: 13, transition: this.assumptions.sacbunt/2.0, runs: 1 }
    ]
};

exports.transitions = function () {
  var countOutProbabilities = function (runnerStates, transitions, thirdout) {
    return runnerStates.map((s) =>
      {
        return { from: s, to: thirdout ? 0 : s, transitions: 1.0 - transitions.filter(i => i.from === s).map(i => i.transition).reduce((p, c) => p + c, 0), runs: 0 };
      });
  };

    // var restTransitions = toOuts < 2 ? runnerTransitions.concat(sacTransitions) : runnerTransitions;
  var sacOuts = countOutProbabilities(this.assumptions.runnerStates, this.runnerTransitions.noouts.concat(this.runnerTransitions.sacrifice), false);
  var lastOuts = countOutProbabilities(this.assumptions.runnerStates, this.runnerTransitions.noouts, true);

  var endofgame = [ { from: 0, to: 0, transition: 1.0, runs: 0 } ];

  var outTransitions = [
    { from: 0, to: 0, transitions: this.runnerTransitions.noouts },
    { from: 0, to: 1, transitions: this.runnerTransitions.sacrifice.concat(sacOuts) },
    { from: 1, to: 1, transitions: this.runnerTransitions.noouts },
    { from: 1, to: 2, transitions: this.runnerTransitions.sacrifice.concat(sacOuts) },
    { from: 2, to: 2, transitions: this.runnerTransitions.noouts },
    { from: 2, to: 3, transitions: lastOuts },
    { from: 3, to: 3, transitions: endofgame }
  ];

  var result = [];
  this.assumptions.availableOuts.forEach(o => {
    this.assumptions.runnerStates.forEach(r => {
      result.push(this.atbatProbability({ outs: o, runners: r }, expectedGameState));
    });
  });
  // add third out
  result.push(this.atbatProbability({ outs: 3, runners: 0 }, expectedGameState));


  return outTransitions;
};



// Runnersposition and outs
// exports.convertBaseRunnersToIndex = function (gameState) {
//     return baseRunnerIndex(gameState.baseRunners) + 8 * gameState.outs;
// };

// Represents the states or bases that the runners can occupy in a baseball game.
// None = 0
// First = 1
// Second = 2
// Third = 3
// FirstSecond = 4
// FirstThird = 5
// SecondThird = 6
// FirstSecondThird = 7
// function baseRunnerIndex (stringRepresentation) {
//     switch(stringRepresentation) {
//         case 0: return 0;
//         case 1: return 1;
//         case 2: return 2;
//         case 3: return 3;
//         case 12: return 4;
//         case 13: return 5;
//         case 23: return 6;
//         case 123: return 7;
//     }
// }

exports.vectorTransition = function(initialState) {
  return math.multiply(initialState, this.transitions());
};

exports.atbatProbability = function(gameState, expectedGameState) {
  var possibleStates = this.transitions().filter(t => t.from === gameState.outs && t.to === expectedGameState.outs).map(t => t.transitions)[0];
  var resultingState = possibleStates === undefined ? 0.0 : possibleStates.filter(r => r.from === gameState.runners && r.to === expectedGameState.runners).map(r => r.transition)[0];
  return resultingState === undefined ? 0.0 : resultingState;
};

exports.extractTransitionsByExpectedState = function(expectedGameState) {
  var result = [];
  this.assumptions.availableOuts.forEach(o => {
    this.assumptions.runnerStates.forEach(r => {
      result.push(this.atbatProbability({ outs: o, runners: r }, expectedGameState));
    });
  });
  // add third out
  result.push(this.atbatProbability({ outs: 3, runners: 0 }, expectedGameState));
  return result;
};

exports.extractTransitionsByGameState = function(gameState) {
  var result = [];
  this.assumptions.availableOuts.forEach(o => { 
    this.assumptions.runnerStates.forEach(r => { 
      result.push(this.atbatProbability(gameState, { outs: o, runners: r }));
    });
  });
  // add third out
  result.push(this.atbatProbability(gameState, { outs: 3, runners: 0 }));
  return result;
};

exports.runProbability = function (gameState, expectedRuns, maximumAtBats) {
    // var startingRow = gameState.outs == 3 ? 24 : gameState.baseRunners + 8 * gameState.outs;



    return 0.0;
};