const path = require('path');

module.exports = {
  target: 'node',
  output: {
    filename: 'index.js',
  },
  resolve: {
    alias: {
      sofa: path.join(__dirname, '../dist/index.js'),
    },
    modules: ['node_modules', '../node_modules'],
  },
};
