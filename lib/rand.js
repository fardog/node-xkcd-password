/**
 * @overview A somewhat sound random number generator that tries to give you 
 *  the highest quality randomness it can.
 *
 * @author Nathan Wittstock <code@fardogllc.com>
 * @copyright 2014 Nathan Wittstock
 * @license MIT - See the included 'LICENSE' for details.
 * @version 0.1.0
 * @extends EventEmitter
 */
'use strict';

var crypto = require('crypto');
var util = require('util');
var events = require('events');
var async = require('async');
var debug = require('debug')('rand');

var rand = {};

/**
 * Creates the random number generator.
 * @constructor
 * @since 0.1.0
 */
exports = module.exports = rand.Generator = function() {
  var self = this;
  
  // If we're ready to spew random numbers or not
  self.ready = false;
  self.initializing = false;
  
  // We use a buffer of entropy for our numbers, and refill it when it empties
  self.bufferSize = (process.env.RAND_BUFFER_SIZE >= 256 ? process.env.RAND_BUFFER_SIZE : 512);
  self.buffer = null;
  self.bufferPosition = 0;
  
  self._fillBuffer();
};

// Extends EventEmitter
util.inherits(rand.Generator, events.EventEmitter);

rand.Generator.prototype.randomInts = function(num, max, next) {
  var self = this;
  debug('random called');
  
  if (!self.ready) {
    // if we aren't ready, we need to wait for the ready signal, and then fire only once
    var generate = function(gen) {
      self.removeListener('ready', generate);
      debug('got ready, running');
      gen.randomInts(num, max, next);
    };
    self.on('ready', generate);
    
    if (!self.initializing) {
      self._fillBuffer();
    }
  }
  else {
    var numbers = [];
    async.doWhilst(function(callback) {
      // we need to get 7 bytes of entropy if we don't have it, flush buffer
      if (self.buffer.length - self.bufferPosition < 7) {
        self.ready = false;
        self._fillBuffer(callback);
      }
      else {
        // this mess of math comes from http://stackoverflow.com/questions/15753019/floating-point-number-from-crypto-randombytes-in-javascript
        self.bufferPosition += 7;
        //(((((((a6 % 32)/32 + a5)/256 + a4)/256 + a3)/256 + a2)/256 + a1)/256 + a0)/256
        var random = (((((((
          self.buffer[self.bufferPosition-7] % 32)/32 +
          self.buffer[self.bufferPosition-6])/256 +
          self.buffer[self.bufferPosition-5])/256 +
          self.buffer[self.bufferPosition-4])/256 +
          self.buffer[self.bufferPosition-3])/256 +
          self.buffer[self.bufferPosition-2])/256 +
          self.buffer[self.bufferPosition-1])/256;
        
        random = Math.floor(random * max);
        numbers.push(random);
        callback();
      }
    }, function() {
      return numbers.length < num;
    }, function(err) {
      if (typeof next === 'function') {
        next(err, numbers);
      }
    });
  }
};

/**
 * Fills the buffer with random entropy, and emits 'ready' when available
 */
rand.Generator.prototype._fillBuffer = function(next) {
  var self = this;
  
  debug('filling buffer');
  self.initializing = true;
  self.ready = false;
  crypto.randomBytes(self.bufferSize, function(err, buf) {
    if (err) {
      // if we allow less good entropy, do it. otherwise, puke.
      if (process.env.RAND_ALLOW_PRNG) {
        buf = crypto.pseudoRandomBytes(self.bufferSize);
      }
      else {
        throw(err);
      }
    }
    else {
      debug('buffer filled');
      self.buffer = buf;
      self.bufferPosition = 0;
      self.ready = true;
      self.initializing = false;
      self.emit('ready', self);
    }
    
    if(typeof next === 'function') {
      next(err);
    }
  });
};
