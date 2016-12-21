var test = require('tape')
var async = require('async')
var path = require('path')
var _ = require('underscore')

var XKCDPassword = require('../')

test('tests generating four words', function (test) {
  test.plan(1)

  var pw = new XKCDPassword()
  var options = {
    numWords: 4,
    minLength: 5,
    maxLength: 8
  }

  pw.generate(options, function (err, result) {
    if (err) test.fail(err)
    test.equal(4, result.length, 'should see four generated words')
    test.end()
  })
})

test('can use without new keyword', function (test) {
  test.plan(1)

  var pw = XKCDPassword()
  var options = {
    numWords: 4,
    minLength: 5,
    maxLength: 8
  }

  pw.generate(options, function (err, result) {
    if (err) test.fail(err)
    test.equal(4, result.length, 'should see four generated words')
    test.end()
  })
})

test('(promise) tests generating four words', function (test) {
  test.plan(1)

  var pw = new XKCDPassword()
  var options = {
    numWords: 4,
    minLength: 5,
    maxLength: 8
  }

  pw.generate(options).then(function (result) {
    test.equal(4, result.length, 'should see four generated words')
    test.end()
  })
})

test('tests running two consecutive generations', function (test) {
  test.plan(3)

  var pw = new XKCDPassword()
  var options = {
    numWords: 4,
    minLength: 5,
    maxLength: 8
  }

  pw.generate(options, function (err, result1) {
    if (err) test.fail(err)
    test.equal(4, result1.length, 'should see four generated words from result1')
    pw.generate(options, function (err, result2) {
      if (err) test.fail(err)
      test.equal(4, result2.length, 'should see four generated words from result2')

      // tests if there's overlap in the two generated arrays, which is
      // not probable
      var difference = _.difference(result1, result2)
      test.ok(difference.length > 0, 'should not have the same values in both arrays.')
      test.end()
    })
  })
})

test('(promise) tests running two consecutive generations', function (test) {
  test.plan(3)

  var pw = new XKCDPassword()
  var options = {
    numWords: 4,
    minLength: 5,
    maxLength: 8
  }

  pw.generate(options).then(function (result1) {
    test.equal(4, result1.length, 'should see four generated words from result1')
    pw.generate(options).then(function (result2) {
      test.equal(4, result2.length, 'should see four generated words from result2')

      // tests if there's overlap in the two generated arrays, which is
      // not probable
      var difference = _.difference(result1, result2)
      test.ok(difference.length > 0, 'should not have the same values in both arrays.')
      test.end()
    })
  })
})

test("ensures we don't have any problems that only crop up rarely", function (test) {
  test.plan(2101)

  var pw = new XKCDPassword()
  var options = {
    numWords: 10,
    minLength: 6,
    maxLength: 10
  }

  var count = 0
  async.doWhilst(function (callback) {
    pw.generate(options, function (err, result) {
      if (err) test.fail(err)
      test.equal(options.numWords, result.length, 'should get numWords words')
      for (var i = 0; i < result.length; i++) {
        test.equal(true, result[i].length <= options.maxLength, 'word should be shorter than the max length')
        test.equal(true, result[i].length >= options.minLength, 'word should be longer than the min length')
      }

      count++
      callback()
    })
  },
  function () { return count < 100 },
  function (err) {
    if (err) test.fail(err)

    test.equal(100, count, 'should have run 100 times')
    test.end()
  })
})

test("generates too many small words, to ensure we don't hang on generation", function (test) {
  test.plan(2)

  var pw = new XKCDPassword()
  var options = {
    numWords: 86,
    minLength: 2,
    maxLength: 2
  }

  pw.generate(options, function (err, result) {
    test.ok(err, 'should see an error')

    options = {
      numWords: 1000,
      minLength: 3,
      maxLength: 3
    }
    pw.generate(options, function (err, result) {
      test.ok(err, 'should see an error')
      test.end()
    })
  })
})
test('generates exactly enough words to see if we trip the too many words error falsely', function (test) {
  test.plan(1)

  var pw = new XKCDPassword()
  var options = {
    numWords: 85,
    minLength: 2,
    maxLength: 2
  }

  pw.generate(options, function (err, result) {
    if (err) test.fail(err)
    test.equal(85, result.length, 'should see 85 words')
    test.end()
  })
})

test('tests generating two asynchronous runs of the generator', function (test) {
  test.plan(4)

  var pw = new XKCDPassword()
  var options = {
    numWords: 4,
    minLength: 5,
    maxLength: 8
  }

  async.parallel([
    function (callback) {
      pw.generate(options, function (err, result) {
        if (err) test.fail(err)
        callback(null, result)
      })
    },
    function (callback) {
      pw.generate(options, function (err, result) {
        if (err) test.fail(err)
        callback(null, result)
      })
    }
  ], function (err, results) {
    if (err) test.fail(err)
    test.equal(2, results.length, 'should see two results')
    test.equal(options.numWords, results[0].length, 'should see four generated words from result[0]')
    test.equal(options.numWords, results[1].length, 'should see four generated words from result[1]')

    var difference = _.difference(results[0], results[1])
    test.ok(difference.length > 0, 'should not have the same values in both arrays.')
    test.end()
  })
})

test('(promise) tests generating two asynchronous runs of the generator', function (test) {
  test.plan(4)

  var pw = new XKCDPassword()
  var options = {
    numWords: 4,
    minLength: 5,
    maxLength: 8
  }

  async.parallel([
    function (callback) {
      pw.generate(options).then(function (result) {
        callback(null, result)
      })
    },
    function (callback) {
      pw.generate(options).then(function (result) {
        callback(null, result)
      })
    }
  ], function (err, results) {
    if (err) test.fail(err)
    test.equal(2, results.length, 'should see two results')
    test.equal(options.numWords, results[0].length, 'should see four generated words from result[0]')
    test.equal(options.numWords, results[1].length, 'should see four generated words from result[1]')

    var difference = _.difference(results[0], results[1])
    test.ok(difference.length > 0, 'should not have the same values in both arrays.')
    test.end()
  })
})

test('use bad word list', function (test) {
  test.plan(2)

  var wordlist = 'something'

  test.throws(function () {
    new XKCDPassword().initWithWordList(wordlist)
  }, Error, 'should error on a bad wordlist')
  test.throws(function () {
    new XKCDPassword().initWithWordFile([])
  }, Error, 'should error on a bad wordfile')

  test.end()
})

test('test errors', function (test) {
  test.plan(5)

  var wordList = [
    'one',
    'two',
    'three'
  ]

  var pw = new XKCDPassword().initWithWordList(wordList)
  pw.generate({numWords: 4}, function (err, result) {
    test.ok(err, 'should see an error message on asking for too many words.')

    pw.generate({numWords: 0}, function (err, result) {
      test.ok(err, 'should see an error on asking for no words.')

      pw.generate({numWords: 4, minLength: -1}, function (err, result) {
        test.ok(err, 'should see an error on asking for a negative length')

        pw.generate({numWords: 4, maxLength: 1}, function (err, result) {
          test.ok(err, 'should see an error on a very small max length')

          pw.generate({minLength: 10, maxLength: 9}, function (err, result) {
            test.ok(err, 'should see an error when max is less than min')
            test.end()
          })
        })
      })
    })
  })
})

test('(promise) test errors', function (test) {
  test.plan(5)

  var wordList = [
    'one',
    'two',
    'three'
  ]

  var pw = new XKCDPassword().initWithWordList(wordList)
  pw.generate({numWords: 4}).catch(function (err) {
    test.ok(err, 'should see an error message on asking for too many words.')

    pw.generate({numWords: 0}).catch(function (err) {
      test.ok(err, 'should see an error on asking for no words.')

      pw.generate({numWords: 4, minLength: -1}).catch(function (err) {
        test.ok(err, 'should see an error on asking for a negative length')

        pw.generate({numWords: 4, maxLength: 1}).catch(function (err) {
          test.ok(err, 'should see an error on a very small max length')

          pw.generate({minLength: 10, maxLength: 9}).catch(function (err) {
            test.ok(err, 'should see an error when max is less than min')
            test.end()
          })
        })
      })
    })
  })
})

test('generate from list', function (test) {
  test.plan(1)

  var wordlist = [
    'one',
    'two',
    'three',
    'four'
  ]
  var options = {
    numWords: 4,
    minLength: 1,
    maxLength: 10
  }

  var pw = new XKCDPassword().initWithWordList(wordlist)
  pw.generate(options, function (err, result) {
    if (err) test.fail(err)

    var difference = _.difference(wordlist, result)
    test.ok(difference.length === 0, 'should use all words from wordlist')
    test.end()
  })
})

test('use local word list', function (test) {
  test.plan(1)

  var wordlist = [
    'one',
    'two',
    'three',
    'four'
  ]
  var options = {
    numWords: 4,
    minLength: 1,
    maxLength: 10
  }
  var wordfile = path.join(__dirname, 'fixtures/wordlist.txt')

  var pw = new XKCDPassword().initWithWordFile(wordfile)
  pw.generate(options, function (err, result) {
    if (err) test.fail(err)

    var difference = _.difference(wordlist, result)
    test.ok(difference.length === 0, 'should use local wordfile')
    test.end()
  })
})

test('chooses sane defaults', function (test) {
  test.plan(1)

  var pw = new XKCDPassword()
  pw.generate(function (err, result) {
    if (err) test.fail(err)

    test.equal(4, result.length, 'should generate four words by default')
    test.end()
  })
})

test('(promise) chooses sane defaults', function (test) {
  test.plan(1)

  var pw = new XKCDPassword()
  pw.generate().then(function (result) {
    test.equal(4, result.length, 'should generate four words by default')
    test.end()
  })
})
