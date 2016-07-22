var expect = require('chai').expect;
var baseball = require('../lib/markov-chain-baseball-model');

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
    var r = 2;
    var i = { outs: 0, runners: 123, runs: 0 };
    var c = [];
    var m = baseball.model(baseball.assumptions, baseball.outTransitions);
    var result = baseball.runProbability(i, r, m, c);
    var totalProbability = result.reduce((p, c) => p + c);
    console.log("Probability of scoring " + r + " is: " + totalProbability);
    expect(totalProbability).to.be.above(0.0);
  });

  it('should give a probability vector for each run.', function () {
    var i = { outs: 2, runners: 123, runs: 0 };
    var result = baseball.runVector(i);
    console.log("Probability of scoring runs");
    console.log(result);
    expect(result.length).to.equal(baseball.assumptions.maxScore);
  });
});