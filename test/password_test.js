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
    var options = {
      numWords: 4,
      minLength: 5,
      maxLength: 8
    };

    pw.generate(options, function(err, result) {
      test.equal(4, result.length, 'should see four generated words');
      test.done();
    });
  },
  promiseGeneratePassword: function(test) {
    test.expect(1);

    var pw = new xkcdPassword();
    var options = {
      numWords: 4,
      minLength: 5,
      maxLength: 8
    };

    pw.generate(options).then(function(result) {
      test.equal(4, result.length, 'should see four generated words');
      test.done();
    });
  },
  // tests running two consecutive generations
  generateTwoRuns: function(test) {
    test.expect(3);

    var pw = new xkcdPassword();
    var options = {
      numWords: 4,
      minLength: 5,
      maxLength: 8
    };

    pw.generate(options, function(err, result1) {
        test.equal(4, result1.length, 'should see four generated words from result1');
      pw.generate(options, function(err, result2) {
        test.equal(4, result2.length, 'should see four generated words from result2');

        // tests if there's overlap in the two generated arrays, which is 
        // not probable
        var difference = _.difference(result1, result2);
        test.ok(difference.length > 0, difference, 'should not have the same values in both arrays.');
        test.done();
      });
    });
  },
  promiseGenerateTwoRuns: function(test) {
    test.expect(3);

    var pw = new xkcdPassword();
    var options = {
      numWords: 4,
      minLength: 5,
      maxLength: 8
    };

    pw.generate(options).then(function(result1) {
        test.equal(4, result1.length, 'should see four generated words from result1');
      pw.generate(options).then(function(result2) {
        test.equal(4, result2.length, 'should see four generated words from result2');

        // tests if there's overlap in the two generated arrays, which is 
        // not probable
        var difference = _.difference(result1, result2);
        test.ok(difference.length > 0, difference, 'should not have the same values in both arrays.');
        test.done();
      });
    });
  },
  // ensures we don't have any problems that only crop up rarely
  generateOneHundredRuns: function(test) {
    test.expect(2101);
    
    var pw = new xkcdPassword();
    var options = {
      numWords: 10,
      minLength: 6,
      maxLength: 10
    };
    
    var count = 0;
    async.doWhilst(function(callback) {
      pw.generate(options, function(err, result) {
        test.equal(options.numWords, result.length, 'should get numWords words');
        for (var i = 0; i < result.length; i++) {
          test.equal(true, result[i].length <= options.maxLength, 'word should be shorter than the max length');
          test.equal(true, result[i].length >= options.minLength, 'word should be longer than the min length');
        }
        
        count++;
        callback();
      });
    },
    function() { return count < 100; },
    function(err) {
      if (err) {
        throw(err);
      }
      test.equal(100, count, 'should have run 100 times');
      test.done();
    });
  },
  // generates too many small words, to ensure we don't hang on generation
  generateTooManyWords: function(test) {
    test.expect(2);

    var pw = new xkcdPassword();
    var options = {
      numWords: 86,
      minLength: 2,
      maxLength: 2
    };

    pw.generate(options, function(err, result) {
      test.ok(err, 'should see an error');

      options = {
        numWords: 1000,
        minLength: 3,
        maxLength: 3
      };
      pw.generate(options, function(err, result) {
        test.ok(err, 'should see an error');
        test.done();
      });
    });
  },
  // generates exactly enough words to see if we trip the too many words error falsely
  generateExactlyEnoughWords: function(test) {
    test.expect(1);

    var pw = new xkcdPassword();
    var options = {
      numWords: 85,
      minLength: 2,
      maxLength: 2
    };

    pw.generate(options, function(err, result) {
      test.equal(85, result.length, 'should see 85 words');
      test.done();
    });
  },
  // tests generating two asynchronous runs of the generator
  generateAsync: function(test) {
    test.expect(4);

    var pw = new xkcdPassword();
    var options = {
      numWords: 4,
      minLength: 5,
      maxLength: 8
    };

    async.parallel([
      function(callback) {
        pw.generate(options, function(err, result) {
          callback(null, result);
        });
      },
      function(callback) {
        pw.generate(options, function(err, result) {
          callback(null, result);
        });
      }
    ], function(err, results) {
      test.equal(2, results.length, 'should see two results');
      test.equal(options.numWords, results[0].length, 'should see four generated words from result[0]');
      test.equal(options.numWords, results[1].length, 'should see four generated words from result[1]');

      var difference = _.difference(results[0], results[1]);
      test.ok(difference.length > 0, difference, 'should not have the same values in both arrays.');
      test.done();
    });
  },
  promiseGenerateAsync: function(test) {
    test.expect(4);

    var pw = new xkcdPassword();
    var options = {
      numWords: 4,
      minLength: 5,
      maxLength: 8
    };

    async.parallel([
      function(callback) {
        pw.generate(options).then(function(result) {
          callback(null, result);
        });
      },
      function(callback) {
        pw.generate(options).then(function(result) {
          callback(null, result);
        });
      }
    ], function(err, results) {
      test.equal(2, results.length, 'should see two results');
      test.equal(options.numWords, results[0].length, 'should see four generated words from result[0]');
      test.equal(options.numWords, results[1].length, 'should see four generated words from result[1]');

      var difference = _.difference(results[0], results[1]);
      test.ok(difference.length > 0, difference, 'should not have the same values in both arrays.');
      test.done();
    });
  },
  useBadWordList: function(test) {
    test.expect(2);

    var wordlist = "something";

    test.throws(function() {
      var pw = new xkcdPassword().initWithWordList(wordlist);
    }, Error, 'should error on a bad wordlist');
    test.throws(function() {
      var pw = new xkcdPassword().initWithWordFile([]);
    }, Error, 'should error on a bad wordfile');

    test.done();
  },
  testErrors: function(test) {
    test.expect(5);

    var wordList = [
      'one',
      'two',
      'three'
    ];
    
    var pw = new xkcdPassword().initWithWordList(wordList);
    pw.generate({numWords: 4}, function(err, result) {
      test.ok(err, 'should see an error message on asking for too many words.');

      pw.generate({numWords: 0}, function(err, result) {
        test.ok(err, 'should see an error on asking for no words.');

        pw.generate({numWords: 4, minLength: -1}, function(err, result) {
          test.ok(err, 'should see an error on asking for a negative length');

          pw.generate({numWords: 4, maxLength: 1}, function(err, result) {
            test.ok(err, 'should see an error on a very small max length');
            
            pw.generate({minLength: 10, maxLength: 9}, function(err, result) {
              test.ok(err, 'should see an error when max is less than min');
              test.done();
            });
          });
        });
      });
    });
  },
  promiseTestErrors: function(test) {
    test.expect(5);

    var wordList = [
      'one',
      'two',
      'three'
    ];
    
    var pw = new xkcdPassword().initWithWordList(wordList);
    pw.generate({numWords: 4}).catch(function(err) {
      test.ok(err, 'should see an error message on asking for too many words.');

      pw.generate({numWords: 0}).catch(function(err) {
        test.ok(err, 'should see an error on asking for no words.');

        pw.generate({numWords: 4, minLength: -1}).catch(function(err) {
          test.ok(err, 'should see an error on asking for a negative length');

          pw.generate({numWords: 4, maxLength: 1}).catch(function(err) {
            test.ok(err, 'should see an error on a very small max length');

            pw.generate({minLength: 10, maxLength: 9}).catch(function(err) {
              test.ok(err, 'should see an error when max is less than min');
              test.done();
            });
          });
        });
      });
    });
  },
  generateFromList: function(test) {
    test.expect(1);

    var wordlist = [
      'one',
      'two',
      'three',
      'four',
    ];
    var options = {
      numWords: 4,
      minLength: 1,
      maxLength: 10
    };

    var pw = new xkcdPassword().initWithWordList(wordlist);
    pw.generate(options, function(err, result) {
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
    var options = {
      numWords: 4,
      minLength: 1,
      maxLength: 10
    };
    var wordfile = path.join(__dirname, 'fixtures/wordlist.txt');

    var pw = new xkcdPassword().initWithWordFile(wordfile);
    pw.generate(options, function(err, result) {
      var difference = _.difference(wordlist, result);
      test.ok(difference.length === 0, 'should use local wordfile');
      test.done();
    });
  },
  chooseSaneDefaults: function(test) {
    test.expect(1);
    
    var pw = new xkcdPassword();
    pw.generate(function (err, result) {
      test.equal(4, result.length, 'should generate four words by default');
      test.done();
    });
  },
  promiseChooseSaneDefaults: function(test) {
    test.expect(1);
    
    var pw = new xkcdPassword();
    pw.generate().then(function(result) {
      test.equal(4, result.length, 'should generate four words by default');
      test.done();
    });
  }
};
