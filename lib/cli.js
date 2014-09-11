'use strict';

var fs = require('fs');
var chalk = require('chalk');
var parseArgs = require('minimist');

// Number.isInteger() polyfill ::
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
if (!Number.isInteger) {
  Number.isInteger = function isInteger (nVal) {
    return typeof nVal === "number" && isFinite(nVal) && nVal > -9007199254740992 && nVal < 9007199254740992 && Math.floor(nVal) === nVal;
  };
}

var cli = function(options) {
  this.options = {
    alias: {
      numWords: 'n',
      minLength: 'm',
      maxLength: 'x',
      wordFile: 'f',
      separator: 's',
      version: 'v',
      help: 'h'
    },
    default: {
      separator: ' '
    },
    'boolean': ['version', 'help'],
    'string': ['wordFile', 'separator']
  };

  this.errors = [];
  this.message = null;

  this.helpMessage = [
    chalk.bold.blue("Usage: xkcd-password [options]"),
    "",
    "Options:",
    "   -n, --numWords    The number of words to generate for your password.  [4]",
    "   -m, --minLength   Minimum lengh of words chosen for the generated password.  [5]",
    "   -x, --maxLength   Maximum length of words chosen for the generated password.  [8]",
    "   -f, --wordFile    Path to a newline-delimited list of words to be used as the source.",
    "   -s, --separator   The separator character to use between words when output to the console.  [ ]",
    "   --version         print version and exit"
  ];

  return this;
};

cli.prototype.parse = function(argv, next) {
  var options = parseArgs(argv, this.options);

  if (options.version) {
    var pkg = require('../package.json');
    this.message = "version " + pkg.version;
  }
  else if (options.help) {
    this.message = this.helpMessage.join('\n');
  }
  else {
    /*
     * Options are processed in a significant order; we only save the last error
     * message, so we'll want to make sure the most significant are last
     */

    // ensure that parameter-expecting options have parameters
    ['wordFile', 'separator'].forEach(function(i) {
       if(typeof options[i] !== 'undefined') {
         if (typeof options[i] !== 'string' || options[i].length < 1) {
           this.errors.push(new Error(i + " expects a value."));
         }
       }
    }.bind(this));

    // ensure that number-expecting options have parameters
    ['numWords', 'minLength', 'maxLength'].forEach(function(i) {
      if(typeof options[i] !== 'undefined') {
        if (!Number.isInteger(options[i])) {
          this.errors.push(new Error(i + " expects an integer value."));
        }
      }
    }.bind(this));

    // now we mangle minLength to be maxLength or less, if maxLength is smaller
    // we only do this for the CLI, not for the module itself
    if (!options.minLength && options.maxLength && options.maxLength < 5) {
      options.minLength = 1;
    }
  }
  
  this.parsedOptions = options;
  
  if (typeof next === 'function') {
    // we return the array of errors if there are any, otherwise null
    next(this.errors.length > 0 ? this.errors : null, this.message, options);
  }

  return this;
};


module.exports = cli;
