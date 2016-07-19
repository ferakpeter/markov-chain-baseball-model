var expect = require('chai').expect;
var model = require('../markov-chain-baseball-model');

var initialGameState = { outs: 0, runners: 0 };

describe('Baseball model assumptions', function() {
  it('must be defined', function() {
    expect(model.assumptions).not.to.be.an('undefined');
  });

  it('should be retrievable', function() {
    expect(model.assumptions.homerun).to.equal(0.03);
  });
});

describe('Baseball model transitions', function() {
  it('should be defined', function() {
    expect(model.transitions).not.to.be.an('undefined');
  });

  // it('should ', function() {
  //   expect().to.equal(1.0);
  // });
});

describe('The baseball model', function() {
  it('should provide the probabilty of changing from one state to another', function() {
    expect(model.atbatProbability(initialGameState, { outs: 0, runners: 0 })).to.equal(model.assumptions.homerun);
  });

  it('should provide a column from the matrix for a given expected gameState as a vector', function() {
    expect(model.extractTransitionsByExpectedState(initialGameState).length).to.equal(25);
  });

  it('should provide a row from the matrix for a given gameState as a vector', function() {
    expect(model.extractTransitionsByGameState(initialGameState).length).to.equal(25);
  });
});

describe('The baseball model', function() {
  it('must calculate the probability of scoring for any amount of runs, given an assumed amount of maximum at bats available for the team.', function () {
    expect(model.runProbability({ runs: 0, baseRunners: 0, outs: 0 }, 1, model.assumptions.maxAtBats)).to.be.above(0.0);
  });
});