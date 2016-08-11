#!/usr/bin/env node
var baseball = require('../lib/markov-chain-baseball-model.js');
var program = require('commander');

program
  .arguments('<command>')
  .option('-b, --baserunners <baserunners>', 'Available runner states: 0, 1, 2, 3, 12, 13, 23, 123')
  .option('-o, --outs <outs>', 'Available outs: 0, 1, 2')
  .option('-r, --runs <runs>', 'Current amount of runs within the half inning')
  .option('-e, --expected <expected>', 'Will sum the probabilities for the expected runs or more')
  .action(function (command) {
    if (command === 'vector') {
      var userInput = { runs: parseInt(program.runs), runners: parseInt(program.baserunners), outs: parseInt(program.outs)};
      console.log(userInput);
      var probabilities = baseball.runVector(userInput);
      console.log(probabilities);
      console.log("Sum: " + probabilities.reduce((a, b) => a + b) * 100 + "%");
    } else if (command === 'prob') {
      var userInput = { runs: parseInt(program.runs), runners: parseInt(program.baserunners), outs: parseInt(program.outs)};
      console.log(userInput);
      var probabilities = baseball.runVector(userInput);
      var modified = probabilities.splice(0, parseInt(program.expected));
      console.log("Sum of expected:" + Math.round(probabilities.reduce((a, b) => a + b) * 10000) / 100 + "%");
    } else if (command === 'steal') {
      var userInput = { runs: parseInt(program.runs), runners: parseInt(program.runners), outs: parseInt(program.outs)};
      console.log(userInput);
      var firstState = runProbabilities(baseball.runVector(userInput));
      var inputRunners = (userInput.runners).toString().split('').map(Number);
      var firstRunner = inputRunners.splice(0, 1);
      var s2 = {runs: userInput.runs, runners: parseInt(firstRunner.map(i => i + 1).concat(inputRunners).join('')), outs: userInput.outs};
      console.log(s2);
      var stolenState = runProbabilities(baseball.runVector(s2));
      var i2 = (userInput.runners).toString().split('').map(Number);
      var s3 = {runs: userInput.runs, runners: Array.from(i2.slice(1, 3).join('')).map(Number).reduce((i, j) => i + j, 0), outs: userInput.outs + 1};
      console.log(s3);
      var caughtState = runProbabilities(baseball.runVector(s3));

      console.log(firstState);
      console.log(stolenState);
      console.log(caughtState);
      var successRate = (firstState - caughtState) / (stolenState - caughtState);

      console.log("Baserunner needs to be successfull: " + Math.round(successRate * 10000) / 100 + "%");
    } else {
      console.log("Command not found: " + command);
    }
  }).parse(process.argv);

function runProbabilities(vector) {
  noRun = vector.splice(0, 1);
  run = vector.reduce((a, b) => a + b);
  return run;
}