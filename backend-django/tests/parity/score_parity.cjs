// Parity harness: compute the legacy JS stock score for a data fixture.
// .cjs so Node does not treat this file as an ES module via the frontend package.json.
const fs = require('fs');
const path = require('path');

const calculatorPath = path.resolve(
  __dirname,
  '../../../backend/utils/stockScoreCalculator.js'
);
const { calculateStockScore } = require(calculatorPath);

const data = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
process.stdout.write(JSON.stringify(calculateStockScore(data)));
