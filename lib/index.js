/**
 * @overview An XKCD-style password generator for Node.js
 *
 * @author Nathan Wittstock <code@fardogllc.com>
 * @copyright 2014 Nathan Wittstock
 * @license MIT - See the included 'LICENSE' for details.
 * @version 0.0.2
 * @extends EventEmitter
 */
'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var events = require('events');
var async = require('async');
var debug = require('debug')('xkcd-password');

var xkcd = {};

/**
 * Creates the password generator.
 *
 * @constructor
 * @since 0.0.1
 */
exports = module.exports = xkcd.Password = function() {
  var self = this;
  events.EventEmitter.call(self);

  self.wordlist = null;
  self.wordfile = null;

  // if we've got a wordlist at the ready
  self.ready = false;
};

// Extends EventEmitter
util.inherits(xkcd.Password, events.EventEmitter);

/**
 * Initializes the password generator with a pre-defined word list.
 *
 * @since 0.0.1
 * @param {array} wordlist - The array of words to use.
 */
xkcd.Password.prototype.initWithWordList = function(wordlist) {
  var self = this;

  //TODO verify wordlist is correct
  self.wordlist = wordlist;
};

/**
 * Initializes the password generator with a newline delimited word file.
 *
 * @since 0.0.1
 * @param {string} wordfile - Path to the word file to be used.
 */
xkcd.Password.prototype.initWithWordFile = function(wordfile) {
  var self = this;

  //TODO verify that wordfile exists
  self.wordfile = wordfile;
};

/**
 * Generates the password.
 *
 * @since 0.0.1
 * @param {integer} numWords - Number of words to generate.
 * @param {integer} minLength - The minimum length of a word to use.
 * @param {integer} maxLength - The maximum length of a word to use.
 * @param {generateCallback} next - The callback function to call after 
 *  generation.
 */
xkcd.Password.prototype.generate = function(numWords, minLength, maxLength, next) {
  var self = this;

  // We don't have a wordlist yet, and need to get one
  if (!self.wordlist) {
    if (!self.wordfile) {
      self.wordfile = path.join(__dirname, '../vendor/mwords/113809of.fic');
    }

    // perform our file reading asynchronously, then call the _generate function
    async.waterfall([
      // async read the wordlist file
      function (callback) {
        self.wordlist = [];
        require('readline').createInterface({
          input: fs.createReadStream(self.wordfile),
          terminal: false
        }).on('line', function(line) {
          // append to internal wordlist
          self.wordlist.push(line);
        }).on('close', function() {
          // emit that we're ready, and call the next function
          self.emit('ready', self);
          self.ready = true;
          debug('Done reading wordlist.');
          callback(null);
        });
      },
      function(callback) {
        self._generate(numWords, minLength, maxLength, callback);
      }
    ], function (err, result) {
      if (err) {
        next(err);
      }
      else {
        next(null, result);
      }
    });
  }
  // if we already have a wordlist
  else {
    // and if we're ready, then we can generate
    if (self.ready) {
      self._generate(numWords, minLength, maxLength, next);
    }
    // otherwise we have to wait until the wordlist is read in, then generate
    else {
      self.on('ready', function() {
        self._generate(numWords, minLength, maxLength, next);
      });
    }
  }
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
 * @param {generateCallback} next - The callback function to call after 
 *  generation.
 */
xkcd.Password.prototype._generate = function(numWords, minLength, maxLength, next) {
  var self = this;
  debug("Generating password.");

  // TODO verify that all required parameters have been set

  var randomNumbers = [];

  // we need numWords random numbers, and they must be unique
  async.doWhilst(
    function(callback) {
      var randomNumber = Math.floor(Math.random() * self.wordlist.length);
      // we already found that random number
      if (randomNumbers.indexOf(randomNumber) > -1) {
        callback();
      }
      else {
        // verify that the words picked are within the min/maxLength
        if (self.wordlist[randomNumber].length > maxLength
            || self.wordlist[randomNumber].length < minLength) {
              callback();
        }
        // push the random number into our selected array
        else {
          randomNumbers.push(randomNumber);
          callback();
        }
      }
    },
    function() { return randomNumbers.length < numWords },
    function(err) {
      var words = [];
      async.each(randomNumbers, function(number, callback) {
        words.push(self.wordlist[number]);
        callback();
      }, function(err) {
        if (err) {
          next(err);
        }
        else {
          next(null, words);
        }
      });
    }
  );
};
