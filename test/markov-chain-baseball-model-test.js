var expect = require('chai').expect;
var model = require('../markov-chain-baseball-model');

describe('Baseball model', function() {
  it('should make the assumptions public', function() {
    expect(model.assumptions).not.to.be.an('undefined');
  });

  it('should have all transitions defined', function() {
    expect(model.transitions).not.to.be.an('undefined');
  });

});
