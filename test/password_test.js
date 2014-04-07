'use strict';

var grunt = require('grunt');
var _ = require('underscore');
var xkcdPassword = require('../lib');
var async = require('async');
var path = require('path');


exports.xkcdpass = {
  // tests generating four words
  generatePassword: function(test) {
    test.expect(1);

    var pw = new xkcdPassword();
    var numWords = 4;
    var maxLength = 5;
    var minLength = 8;

    pw.generate(numWords, maxLength, minLength, function(err, result) {
      test.equal(4, result.length, 'should see four generated words');
      test.done();
    });
  },
  // tests running two consecutive generations
  generateTwoRuns: function(test) {
    test.expect(3);

    var pw = new xkcdPassword();
    var numWords = 4;
    var maxLength = 5;
    var minLength = 8;

    pw.generate(numWords, maxLength, minLength, function(err, result1) {
      pw.generate(numWords, maxLength, minLength, function(err, result2) {
        test.equal(4, result1.length, 'should see four generated words from result1');
        test.equal(4, result2.length, 'should see four generated words from result2');

        // tests if there's overlap in the two generated arrays, which is 
        // not probable
        var difference = _.difference(result1, result2);
        test.ok(difference.length > 0, difference, 'should not have the same values in both arrays.');
        test.done();
      });
    });
  },
  // tests generating two asynchronous runs of the generator
  generateAsync: function(test) {
    test.expect(4);

    var pw = new xkcdPassword();
    var numWords = 4;
    var maxLength = 5;
    var minLength = 8;

    async.parallel([
      function(callback) {
        pw.generate(numWords, maxLength, minLength, function(err, result) {
          callback(null, result);
        });
      },
      function(callback) {
        pw.generate(numWords, maxLength, minLength, function(err, result) {
          callback(null, result);
        });
      }
    ], function(err, results) {
      test.equal(2, results.length, 'should see two results');
      test.equal(numWords, results[0].length, 'should see four generated words from result[0]');
      test.equal(numWords, results[1].length, 'should see four generated words from result[1]');

      var difference = _.difference(results[0], results[1]);
      test.ok(difference.length > 0, difference, 'should not have the same values in both arrays.');
      test.done();
    });
  },
  useBadWordList: function(test) {
    test.expect(1);

    var wordlist = "something";

    test.throws(function() {
      var pw = new xkcdPassword().initWithWordList(wordlist);
    }, Error, 'should error on a bad wordlist');
    test.done();
  },
  generateFromList: function(test) {
    test.expect(1);

    var wordlist = [
      'one',
      'two',
      'three',
      'four',
    ];

    var pw = new xkcdPassword().initWithWordList(wordlist);
    pw.generate(4, 1, 10, function(err, result) {
      var difference = _.difference(wordlist, result);
      test.ok(difference.length === 0, 'should use all words from wordlist');
      test.done();
    });
  },
  useLocalWordList: function(test) {
    test.expect(1);

    var wordlist = [
      'one',
      'two',
      'three',
      'four',
    ];
    var wordfile = path.join(__dirname, 'fixtures/wordlist.txt');

    var pw = new xkcdPassword().initWithWordFile(wordfile);
    pw.generate(4, 1, 10, function(err, result) {
      var difference = _.difference(wordlist, result);
      test.ok(difference.length === 0, 'should use local wordfile');
      test.done();
    });
  }
};
