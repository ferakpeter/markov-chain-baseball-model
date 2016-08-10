#!/usr/bin/env node
var baseball = require('./markov-chain-baseball-model.js');
var program = require('commander');

program
  .arguments('<command>')
  .option('-r, --runners <runners>', 'Available runner states: 0, 1, 2, 3, 12, 13, 23, 123')
  .option('-o, --outs <outs>', 'Available outs: 0, 1, 2')
  .option('-u, --runs <runs>', 'Current amount of runs within the half inning')
  .option('-e, --expected <expected>', 'Will sum the probabilities for the expected runs or more')
  .action(function (command) {
    if (command === 'vector') {
      var userInput = { runs: parseInt(program.runs), runners: parseInt(program.runners), outs: parseInt(program.outs)};
      console.log(userInput);
      var probabilities = baseball.runVector(userInput);
      console.log(probabilities);
      console.log("Sum: " + probabilities.reduce((a, b) => a + b) * 100 + "%");
      if (program.expected != undefined) {
        var modified = probabilities.splice(0, parseInt(program.expected));
        console.log("Sum of expected:" + Math.round(probabilities.reduce((a, b) => a + b) * 10000) / 100 + "%");
      }
    } else {
      console.log("Command not found: " + command);
    }
  }).parse(process.argv);