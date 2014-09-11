/**
 * @overview An XKCD-style password generator for Node.js
 *
 * @author Nathan Wittstock <code@fardogllc.com>
 * @copyright 2014 Nathan Wittstock
 * @license MIT - See the included 'LICENSE' for details.
 * @version 1.1.1
 * @extends EventEmitter
 */
'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var events = require('events');
var async = require('async');
var rand = new (require('random-lib'))();
var when = require('when');
var debug = require('debug')('xkcd-password');

var xkcd = {};

var DEFAULTS = {
  numWords: 4,
  minLength: 5,
  maxLength: 8
};

/**
 * Creates the password generator.
 *
 * @constructor
 * @since 0.0.1
 *
 * @returns {Generator} the word generator
 */
exports = module.exports = xkcd.Password = function() {
  var self = this;
  events.EventEmitter.call(self);

  self.wordlist = null;
  self.wordfile = null;

  // if we've got a wordlist at the ready
  self.ready = false;
  self.initialized = false;

  return this;
};

// Extends EventEmitter
util.inherits(xkcd.Password, events.EventEmitter);

/**
 * Initializes the password generator with a pre-defined word list.
 *
 * @since 0.0.1
 * @param {array} wordlist - The array of words to use.
 *
 * @returns {Generator} the word generator
 */
xkcd.Password.prototype.initWithWordList = function(wordlist) {
  var self = this;

  // verify that the wordlist is an appropriate object
  if (typeof wordlist === 'object' && wordlist.length > 0) {
    self.wordlist = wordlist;
    self.ready = true;
    return self;
  }
  else {
    throw new Error('Wordlist provided was not an array.');
  }
};

/**
 * Initializes the generator
 *
 * @since 0.2.0
 * @param {object} options
 *
 * @emits {Generator} 'ready' event
 */
xkcd.Password.prototype._initialize = function() {
  var self = this;

  self.initialized = true;

  // We don't have a wordlist yet, and need to get one
  if (!self.wordlist) {
    if (!self.wordfile) {
      // use internal wordlist
      self.wordfile = path.join(__dirname, '../vendor/mwords/113809of.fic');
    }

    // perform our file reading asynchronously, then call the _generate function
    self.wordlist = [];
    require('readline').createInterface({
      input: fs.createReadStream(self.wordfile),
      terminal: false
    }).on('line', function readWordFileLine(line) {
      // append to internal wordlist
      self.wordlist.push(line);
    }).on('close', function resolveReadOfWordFile() {
      // emit that we're ready, and call the next function
      debug('Done reading wordlist.');
      self.ready = true;
      self.emit('ready', self);
    });
  }
};

/**
 * Initializes the password generator with a newline delimited word file.
 *
 * @since 0.0.1
 * @param {string} wordfile - Path to the word file to be used.
 *
 * @returns {Generator} the word generator
 */
xkcd.Password.prototype.initWithWordFile = function(wordfile) {
  var self = this;

  if (typeof wordfile !== 'string') {
    throw new Error('Wordfile provided was not a string.');
  }
  else {
    self.wordfile = wordfile;
    return self;
  }
};

/**
 * Parses the options and generates the password.
 *
 * @since 0.2.0
 * @param {object} options - The object containing options, or alternately a 
 *  number which is just the words to generate, everything else default.
 * @param {generateCallback} next - The callback function to call after 
 *  generation.
 *
 * @returns {Promise} the promise object
 */
xkcd.Password.prototype.generate = function(options, next) {
  var self = this;

  var numWords = DEFAULTS.numWords;
  var minLength = DEFAULTS.minLength;
  var maxLength = DEFAULTS.maxLength;

  var deferred = null;

  if (typeof options === 'number') {
    numWords = options;
  }
  else if (typeof options === 'function') {
    next = options;
    options = DEFAULTS;
  }
  else if (typeof options !== 'undefined' && options) {
    if (typeof options.numWords === 'number') {
      numWords = options.numWords ;
    }
    if (typeof options.minLength === 'number') {
      minLength = options.minLength;
    }
    if (typeof options.maxLength === 'number') {
      maxLength = options.maxLength;
    }
  }

  if (!next || typeof next !== 'function') {
    next = function() {};
    deferred = when.defer();
  }

  if (self.ready) {
    self._generate(numWords, minLength, maxLength, next, deferred);
  }
  else {
    self.on('ready', function onReadyGenerate() {
      debug('Ready now. Calling generate.');
      self._generate(numWords, minLength, maxLength, next, deferred);
    });

    // run the init if we haven't already
    if (!self.initialized) {
      debug('Initializing.');
      self._initialize();
    }
  }

  return (deferred ? deferred.promise : null);
};

/**
 * Callback executed after password is generated.
 *
 * @since 0.0.1
 * @callback {generateCallback}
 * @param {Error} err - Error if there was one, null if not.
 * @param {array} result - Resulting array of words.
 */

/**
 * Actual word generation function that is called after everything is 
 *  initialized. Should not be used directly.
 * 
 * @since 0.0.1
 * @param {integer} numWords - Number of words to generate.
 * @param {integer} minLength - The minimum length of a word to use.
 * @param {integer} maxLength - The maximum length of a word to use.
 * @param {generateCallback} next - The callback function to call after or none
 * @param {Object} deferred - The promise to resolve, or none
 *  generation.
 */
xkcd.Password.prototype._generate = function(numWords, minLength, maxLength, next, deferred) {
  var self = this;
  debug("Generating password.");

  numWords = parseInt (numWords, 10);
  minLength = parseInt (minLength, 10);
  maxLength = parseInt (maxLength, 10);
  var err = null;

  // ensure that required parameters have been set
  if (numWords <= 0 || minLength < 0 || maxLength < 2) {
    err = new Error('Parameters provided were not correct.');
    process.nextTick(function resolveParametersError() {
      next(err);
      if (deferred) {
        deferred.reject(err);
      }
    });
  }
  // make sure we're not asking for more unique words than we have available
  else if (numWords > self.wordlist.length) {
    err = new Error ('More words than were available in the wordlist were requested.');
    process.nextTick(function resolveTooManyWordsError() {
      next(err);
      if (deferred) {
        deferred.reject(err);
      }
    });
  }
  else if (maxLength < minLength) {
    err = new Error ('Your maximum word length can\'t be less than your minimum length. Try specifying a maximum length and minimum length directly.');
    process.nextTick(function resolveMaxLengthIncorrectError() {
      next(err);
      if (deferred) {
        deferred.reject(err);
      }
    });
  }
  // generate the numbers
  else {
    rand.randomUniqueInts({num: numWords, min: 0, max: self.wordlist.length - 1}, function generateWords(err, ints) {
      var position = 0;
      var numLoops = 0;
      var words = [];
      
      async.doWhilst(function generateWord(callback) {
        // if the word is too short, we need a new random number
        if(self.wordlist[ints[position]].length > maxLength || self.wordlist[ints[position]].length < minLength) {
          rand.randomInt({min: 0, max: self.wordlist.length -1}, function generateAnotherInt(err, int) {
            if (ints.indexOf(int) > -1) {
              // we already found that random number, run callback to make the loop again
              callback();
            }
            else {
              // replace the integer in that position and run the loop again
              ints[position] = int;
              callback();
            }
          });
        }
        else {
          // it's a good word, push it onto the stack
          words.push(self.wordlist[ints[position]]);
          position++;
          callback();
        }
      },
      function postCheckGeneration() { 
        if (!process.env.DISABLE_LOOP_PREVENTION) {
          if (numLoops > ((numWords * 10000) > 850000 ? 850000 : (numWords * 10000))) {
            return false;
          }
          numLoops++;
        }
        return words.length < numWords;
      },
      function resolveGeneration(err) {
        if (err) {
          next(err);
          if (deferred) {
            deferred.reject(err);
          }
        }
        else if (words.length < numWords) {
          var tooFewWordsError = new Error('You asked for more words than could be generated. This may because you\'re asking for too many words of a certain length.');
          next(tooFewWordsError);
          if (deferred) {
            deferred.reject(tooFewWordsError);
          }
        }
        else {
          next(null, words);
          if (deferred) {
            deferred.resolve(words);
          }
        }
      });
    });
  }
};

