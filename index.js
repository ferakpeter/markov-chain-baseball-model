var baseball = require('./lib/markov-chain-baseball-model.js');

console.log(baseball.runVector({ runs: 0, runners: 0, outs: 0}));