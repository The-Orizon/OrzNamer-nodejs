'use strict';

var pkg = require('./package.json');
console.log(pkg._.name + ' ' + pkg.version);

var argv = require('minimist')(process.argv.slice(2));
var Bot = require('./lib/libbot.js');

// Default Config
if(argv._.length == 0) argv._.push('./config.json')

// Load Every Config
argv._
    .map(function (config){
        return require(config);
    })
    .forEach(Bot);