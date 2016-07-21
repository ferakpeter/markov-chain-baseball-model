var expect = require('chai').expect;
var baseball = require('../markov-chain-baseball-model');

describe('Baseball model assumptions', function() {
  it('must be defined', function() {
    expect(baseball.assumptions).not.to.be.an('undefined');
  });

  it('should be retrievable', function() {
    expect(baseball.assumptions.homerun).to.equal(0.03);
  });
});

describe('The baseball model', function() {
  it('should be defined', function() {
    expect(baseball.model(baseball.assumptions, baseball.outTransitions)).not.to.be.an('undefined');
  });

  it('must calculate the probability of scoring for any amount of runs, given an assumed amount of maximum at bats available for the team.', function () {
    var expectedRuns = 0;
    var initialGameState = { outs: 0, runners: 123, runs: 0 };
    var result = baseball.runProbability(initialGameState, expectedRuns, baseball.assumptions, baseball.outTransitions);
    var totalProbability = result.reduce((p, c) => p + c);
    console.log("Probability of scoring " + expectedRuns + " is: " + totalProbability);
    expect(totalProbability).to.be.above(0.0);
  });
});