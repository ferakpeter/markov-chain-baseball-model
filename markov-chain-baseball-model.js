
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
    maxAtBats: 18
};

// index [row, column]
var row = 0;
var column = 1;

exports.transitions = [
	{ index: [24,24], transition: 1.0, runs: [] },

    //homerun
    { index: [0, 0], transition: this.assumptions.homerun, runs: [] },
    { index: [1, 0], transition: this.assumptions.homerun, runs: [] },
    { index: [2, 0], transition: this.assumptions.homerun, runs: [] },
    { index: [3, 0], transition: this.assumptions.homerun, runs: [] },
    { index: [4, 0], transition: this.assumptions.homerun, runs: [] },
    { index: [5, 0], transition: this.assumptions.homerun, runs: [] },
    { index: [6, 0], transition: this.assumptions.homerun, runs: [] },
    { index: [7, 0], transition: this.assumptions.homerun, runs: [] },
    //single
    { index: [0,1], transition: this.assumptions.single+this.assumptions.walk, runs: [] },
    { index: [1,4], transition: 0.65*this.assumptions.single+this.assumptions.walk, runs: [] },
    { index: [1,5], transition: 0.35*this.assumptions.single, runs: [] },
    { index: [2,1], transition: 0.65*this.assumptions.single, runs: [] },
    { index: [2,5], transition: 0.35*this.assumptions.single, runs: [] },
    { index: [3,1], transition: this.assumptions.single, runs: [] },
    { index: [4,4], transition: this.assumptions.single/4.0, runs: [] },
    { index: [4,5], transition: this.assumptions.single/2.0, runs: [] },
    { index: [4,7], transition: this.assumptions.single/4.0+this.assumptions.walk, runs: [] },
    { index: [5,4], transition: this.assumptions.single/2.0, runs: [] },
    { index: [5,5], transition: this.assumptions.single/2.0, runs: [] },
    { index: [6,1], transition: this.assumptions.single/2.0, runs: [] },
    { index: [6,5], transition: this.assumptions.single/2.0, runs: [] },
    { index: [7,4], transition: this.assumptions.single/2.0, runs: [] },
    { index: [7,5], transition: this.assumptions.single/2.0, runs: [] },
    { index: [7,7], transition: this.assumptions.walk, runs: [] },

    //double
    { index: [0,2], transition: this.assumptions.double, runs: [] },
    { index: [1,2], transition: this.assumptions.double/2.0, runs: [] },
    { index: [1,6], transition: this.assumptions.double/2.0, runs: [] },
    { index: [2,2], transition: this.assumptions.double, runs: [] },
    { index: [3,2], transition: this.assumptions.double, runs: [] },
    { index: [4,2], transition: this.assumptions.double/2.0, runs: [] },
    { index: [4,6], transition: this.assumptions.double/2.0, runs: [] },
    { index: [5,2], transition: this.assumptions.double/2.0, runs: [] },
    { index: [5,6], transition: this.assumptions.double/2.0, runs: [] },
    { index: [6,2], transition: this.assumptions.double, runs: [] },
    { index: [7,2], transition: this.assumptions.double/2.0, runs: [] },
    { index: [7,6], transition: this.assumptions.double/2.0, runs: [] },

    //triple
    { index: [0, 3], transition: this.assumptions.triple, runs: [] },
    { index: [1, 3], transition: this.assumptions.triple, runs: [] },
    { index: [2, 3], transition: this.assumptions.triple, runs: [] },
    { index: [3, 3], transition: this.assumptions.triple, runs: [] },
    { index: [4, 3], transition: this.assumptions.triple, runs: [] },
    { index: [5, 3], transition: this.assumptions.triple, runs: [] },
    { index: [6, 3], transition: this.assumptions.triple, runs: [] },
    { index: [7, 3], transition: this.assumptions.triple, runs: [] },

    //walk
    { index: [2,4], transition: this.assumptions.walk, runs: [] },
    { index: [3,5], transition: this.assumptions.walk, runs: [] },
    { index: [5,7], transition: this.assumptions.walk, runs: [] },
    { index: [6,7], transition: this.assumptions.walk, runs: [] },

    //sacrifice bunt
    { index: [1,10], transition: this.assumptions.sacbunt, runs: [] },
    { index: [2,11], transition: this.assumptions.sacbunt, runs: [] },
    { index: [3,8], transition: this.assumptions.sacbunt, runs: [] },
    { index: [4,13], transition: this.assumptions.sacbunt/2.0, runs: [] },
    { index: [4,14], transition: this.assumptions.sacbunt/2.0, runs: [] },
    { index: [5,9], transition: this.assumptions.sacbunt, runs: [] },
    { index: [6,10], transition: this.assumptions.sacbunt/2.0, runs: [] },
    { index: [6,11], transition: this.assumptions.sacbunt/2.0, runs: [] },
    { index: [7,12], transition: this.assumptions.sacbunt/2.0, runs: [] },
    { index: [7,13], transition: this.assumptions.sacbunt/2.0, runs: [] },

    //same pattern of probabilities 0 and 1 outs respectively
];

//curried function to calculate the rest prob for each row?
function restProbabilty(t, n) {
	return t.filter(function (i) { return i.index[row] === n; }).map(i => i.transition).reduce((p, c) => p + c, 0);
}

exports.outs = [
    { index: [0,8], transition: restProbabilty(this.transitions, 0), runs: [] },
    { index: [1,9], transition: restProbabilty(this.transitions, 1), runs: [] },
    { index: [2,10], transition: restProbabilty(this.transitions, 2), runs: [] },
    { index: [3,11], transition: restProbabilty(this.transitions, 3), runs: [] },
    { index: [4,12], transition: restProbabilty(this.transitions, 4), runs: [] },
    { index: [5,13], transition: restProbabilty(this.transitions, 5), runs: [] },
    { index: [6,14], transition: restProbabilty(this.transitions, 6), runs: [] },
    { index: [7,15], transition: restProbabilty(this.transitions, 7), runs: [] },
    { index: [8,16], transition: restProbabilty(this.transitions, 8), runs: [] },
    { index: [9,17], transition: restProbabilty(this.transitions, 9), runs: [] },
    { index: [10,18], transition: restProbabilty(this.transitions, 10), runs: [] },
    { index: [11,19], transition: restProbabilty(this.transitions, 11), runs: [] },
    { index: [12,20], transition: restProbabilty(this.transitions, 12), runs: [] },
    { index: [13,21], transition: restProbabilty(this.transitions, 13), runs: [] },
    { index: [14,22], transition: restProbabilty(this.transitions, 14), runs: [] },
    { index: [15,23], transition: restProbabilty(this.transitions, 15), runs: [] },
    { index: [16,24], transition: restProbabilty(this.transitions, 16), runs: [] },
    { index: [17,24], transition: restProbabilty(this.transitions, 17), runs: [] },
    { index: [18,24], transition: restProbabilty(this.transitions, 18), runs: [] },
    { index: [19,24], transition: restProbabilty(this.transitions, 19), runs: [] },
    { index: [20,24], transition: restProbabilty(this.transitions, 20), runs: [] },
    { index: [21,24], transition: restProbabilty(this.transitions, 21), runs: [] },
    { index: [22,24], transition: restProbabilty(this.transitions, 22), runs: [] },
    { index: [23,24], transition: restProbabilty(this.transitions, 23), runs: [] }
];

// Represents the states or bases that the runners can occupy in a baseball game.
// None = 0
// First = 1
// Second = 2
// Third = 3
// FirstSecond = 4
// FirstThird = 5
// SecondThird = 6
// FirstSecondThird = 7

exports.runProbability = function (gameState, expectedRuns, maximumAtBats) {
    var startingRow = gameState.baseRunners + 8 * gameState.outs;

    
    
    return 0.0;
};