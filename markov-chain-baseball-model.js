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
    runnerStates: [0, 1, 2, 3, 12, 13, 23, 123],
    allStates: function() {
      return this.availableOuts.map(o => { 
        return this.runnerStates.map(r => { return { outs: o, runners: r }; });
                        }).reduce((p,c) => p.concat(c)).concat({ outs: 3, runners: 0 }); // add third out
    }
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

function countOutProbabilities (runnerStates, transitions, thirdout) {
  return runnerStates.map((s) =>
    {
      return { from: s, to: thirdout ? 0 : s, transition: 1.0 - transitions.filter(i => i.from === s).map(i => i.transition).reduce((p, c) => p + c, 0), runs: 0 };
    });
}

exports.outTransitions = [
    { from: 0, to: 0, transitions: this.runnerTransitions.noouts },
    { from: 0, to: 1, transitions: this.runnerTransitions.sacrifice.concat(countOutProbabilities(this.assumptions.runnerStates, this.runnerTransitions.noouts.concat(this.runnerTransitions.sacrifice), false)) },
    { from: 1, to: 1, transitions: this.runnerTransitions.noouts },
    { from: 1, to: 2, transitions: this.runnerTransitions.sacrifice.concat(countOutProbabilities(this.assumptions.runnerStates, this.runnerTransitions.noouts.concat(this.runnerTransitions.sacrifice), false)) },
    { from: 2, to: 2, transitions: this.runnerTransitions.noouts },
    { from: 2, to: 3, transitions: countOutProbabilities(this.assumptions.runnerStates, this.runnerTransitions.noouts, true) },
    { from: 3, to: 3, transitions: [ { from: 0, to: 0, transition: 1.0, runs: 0 } ] }
  ];

exports.model = function (assumptions, outTransitions) {
  var atbatProbability = function(transitions, gameState, expectedGameState) {
    var possibleStates = transitions.filter(t => t.from === gameState.outs && t.to === expectedGameState.outs).map(t => t.transitions)[0];
    var resultingState = possibleStates === undefined ? 0.0 : possibleStates.filter(r => r.from === gameState.runners && r.to === expectedGameState.runners).map(r => r.transition)[0];
    return resultingState === undefined ? 0.0 : resultingState;
  };

  var runTransitions = function(f) {
    return outTransitions.map(o => {
      return { from: o.from, to: o.to, transitions: o.transitions.filter(f) };
    });
  };

  var buildMatrix = function(f) {
    return assumptions.allStates().map(from => {
      return assumptions.allStates().map(to => {
        return atbatProbability(runTransitions(f), from, to);
      });
    });
  };

  var filterRuns = (r, t) => { return (t) => t.runs === r; };
  return [ buildMatrix(filterRuns(0)), buildMatrix(filterRuns(1)), buildMatrix(filterRuns(2)), buildMatrix(filterRuns(3)), buildMatrix(filterRuns(4)) ];
};

// Represents the states or bases that the runners can occupy in a baseball game.
function baseRunnerIndex (r) {
    switch(r) {
        case 0: return 0;
        case 1: return 1;
        case 2: return 2;
        case 3: return 3;
        case 12: return 4;
        case 13: return 5;
        case 23: return 6;
        case 123: return 7;
    }
}

function recursion(runs, atbats, m, r, s) {
  // stopping condition
  if (runs < 0 || atbats < 0) {
    return math.zeros(25);
    // starting condition
  } else if (runs === r && atbats === 0) {
    return s;
    // main recursion
  } else {
    return [ math.multiply(recursion(runs, atbats - 1, m, r, s), m[0]), math.multiply(recursion(runs - 1, atbats - 1, m, r, s), m[1]),
              math.multiply(recursion(runs - 2, atbats - 1, m, r, s), m[2]),
              math.multiply(recursion(runs - 3, atbats - 1, m, r, s), m[3]),
              math.multiply(recursion(runs - 4, atbats - 1, m, r, s), m[4]) ].reduce((p, c) => math.add(p, c));
  }
}

exports.runProbability = function (gameState, expectedRuns, assumptions, outTransitions) {
    var startingRow = gameState.outs == 3 ? 24 : baseRunnerIndex(gameState.runners) + 8 * gameState.outs;
    var startingCondition = math.zeros(25);
    startingCondition._data[startingRow] = 1.0;
    var m = this.model(assumptions, outTransitions);
    var result = recursion(expectedRuns, assumptions.maxAtBats, m, gameState.runs, startingCondition);
    return result._data;
};