var test = require("tape")
var async = require("async")
var path = require("path")
var _ = require("underscore")

var XKCDPassword = require("../")

test("tests generating four words", function(t) {
  t.plan(1)

  var pw = new XKCDPassword()
  var options = {
    numWords: 4,
    minLength: 5,
    maxLength: 8
  }

  pw.generate(options, function(err, result) {
    if (err) t.fail(err)
    t.equal(4, result.length, "should see four generated words")
    t.end()
  })
})

test("can use without new keyword", function(t) {
  t.plan(1)

  var pw = XKCDPassword()
  var options = {
    numWords: 4,
    minLength: 5,
    maxLength: 8
  }

  pw.generate(options, function(err, result) {
    if (err) t.fail(err)
    t.equal(4, result.length, "should see four generated words")
    t.end()
  })
})

test("(promise) tests generating four words", function(t) {
  t.plan(1)

  var pw = new XKCDPassword()
  var options = {
    numWords: 4,
    minLength: 5,
    maxLength: 8
  }

  pw.generate(options).then(function(result) {
    t.equal(4, result.length, "should see four generated words")
    t.end()
  })
})

test("tests running two consecutive generations", function(t) {
  t.plan(3)

  var pw = new XKCDPassword()
  var options = {
    numWords: 4,
    minLength: 5,
    maxLength: 8
  }

  pw.generate(options, function(err, result1) {
    if (err) t.fail(err)
    t.equal(4, result1.length, "should see four generated words from result1")
    pw.generate(options, function(err2, result2) {
      if (err2) t.fail(err2)
      t.equal(4, result2.length, "should see four generated words from result2")

      // tests if there's overlap in the two generated arrays, which is
      // not probable
      var difference = _.difference(result1, result2)
      t.ok(
        difference.length > 0,
        "should not have the same values in both arrays."
      )
      t.end()
    })
  })
})

test("(promise) tests running two consecutive generations", function(t) {
  t.plan(3)

  var pw = new XKCDPassword()
  var options = {
    numWords: 4,
    minLength: 5,
    maxLength: 8
  }

  pw.generate(options).then(function(result1) {
    t.equal(4, result1.length, "should see four generated words from result1")
    pw.generate(options).then(function(result2) {
      t.equal(4, result2.length, "should see four generated words from result2")

      // tests if there's overlap in the two generated arrays, which is
      // not probable
      var difference = _.difference(result1, result2)
      t.ok(
        difference.length > 0,
        "should not have the same values in both arrays."
      )
      t.end()
    })
  })
})

test("ensures we don't have any problems that only crop up rarely", function(t) {
  t.plan(2101)

  var pw = new XKCDPassword()
  var options = {
    numWords: 10,
    minLength: 6,
    maxLength: 10
  }

  var count = 0
  async.doWhilst(
    function(callback) {
      pw.generate(options, function(err, result) {
        if (err) t.fail(err)
        t.equal(options.numWords, result.length, "should get numWords words")
        for (var i = 0; i < result.length; i++) {
          t.equal(
            true,
            result[i].length <= options.maxLength,
            "word should be shorter than the max length"
          )
          t.equal(
            true,
            result[i].length >= options.minLength,
            "word should be longer than the min length"
          )
        }

        count++
        callback()
      })
    },
    function() {
      return count < 100
    },
    function(err) {
      if (err) t.fail(err)

      t.equal(100, count, "should have run 100 times")
      t.end()
    }
  )
})

test("generates too many small words, to ensure we don't hang on generation", function(t) {
  t.plan(2)

  var pw = new XKCDPassword()
  var options = {
    numWords: 86,
    minLength: 2,
    maxLength: 2
  }

  pw.generate(options, function(err) {
    t.ok(err, "should see an error")

    options = {
      numWords: 1000,
      minLength: 3,
      maxLength: 3
    }
    pw.generate(options, function(err2) {
      t.ok(err2, "should see an error")
      t.end()
    })
  })
})

test("generates exactly enough words to see if we trip the too many words error falsely", function(t) {
  t.plan(1)

  var pw = new XKCDPassword()
  var options = {
    numWords: 85,
    minLength: 2,
    maxLength: 2
  }

  pw.generate(options, function(err, result) {
    if (err) t.fail(err)
    t.equal(85, result.length, "should see 85 words")
    t.end()
  })
})

test("tests generating two asynchronous runs of the generator", function(t) {
  t.plan(4)

  var pw = new XKCDPassword()
  var options = {
    numWords: 4,
    minLength: 5,
    maxLength: 8
  }

  async.parallel(
    [
      function(callback) {
        pw.generate(options, function(err, result) {
          if (err) t.fail(err)
          callback(null, result)
        })
      },
      function(callback) {
        pw.generate(options, function(err, result) {
          if (err) t.fail(err)
          callback(null, result)
        })
      }
    ],
    function(err, results) {
      if (err) t.fail(err)
      t.equal(2, results.length, "should see two results")
      t.equal(
        options.numWords,
        results[0].length,
        "should see four generated words from result[0]"
      )
      t.equal(
        options.numWords,
        results[1].length,
        "should see four generated words from result[1]"
      )

      var difference = _.difference(results[0], results[1])
      t.ok(
        difference.length > 0,
        "should not have the same values in both arrays."
      )
      t.end()
    }
  )
})

test("(promise) tests generating two asynchronous runs of the generator", function(t) {
  t.plan(4)

  var pw = new XKCDPassword()
  var options = {
    numWords: 4,
    minLength: 5,
    maxLength: 8
  }

  async.parallel(
    [
      function(callback) {
        pw.generate(options).then(function(result) {
          callback(null, result)
        })
      },
      function(callback) {
        pw.generate(options).then(function(result) {
          callback(null, result)
        })
      }
    ],
    function(err, results) {
      if (err) t.fail(err)
      t.equal(2, results.length, "should see two results")
      t.equal(
        options.numWords,
        results[0].length,
        "should see four generated words from result[0]"
      )
      t.equal(
        options.numWords,
        results[1].length,
        "should see four generated words from result[1]"
      )

      var difference = _.difference(results[0], results[1])
      t.ok(
        difference.length > 0,
        "should not have the same values in both arrays."
      )
      t.end()
    }
  )
})

test("use bad word list", function(t) {
  t.plan(2)

  var wordlist = "something"

  t.throws(
    function() {
      new XKCDPassword().initWithWordList(wordlist)
    },
    Error,
    "should error on a bad wordlist"
  )
  t.throws(
    function() {
      new XKCDPassword().initWithWordFile([])
    },
    Error,
    "should error on a bad wordfile"
  )

  t.end()
})

test("test errors", function(t) {
  t.plan(5)

  var wordList = ["one", "two", "three"]

  var pw = new XKCDPassword().initWithWordList(wordList)
  pw.generate({ numWords: 4 }, function(err) {
    t.ok(err, "should see an error message on asking for too many words.")

    pw.generate({ numWords: 0 }, function(err2) {
      t.ok(err2, "should see an error on asking for no words.")

      pw.generate({ numWords: 4, minLength: -1 }, function(err3) {
        t.ok(err3, "should see an error on asking for a negative length")

        pw.generate({ numWords: 4, maxLength: 1 }, function(err4) {
          t.ok(err4, "should see an error on a very small max length")

          pw.generate({ minLength: 10, maxLength: 9 }, function(err5) {
            t.ok(err5, "should see an error when max is less than min")
            t.end()
          })
        })
      })
    })
  })
})

test("(promise) test errors", function(t) {
  t.plan(5)

  var wordList = ["one", "two", "three"]

  var pw = new XKCDPassword().initWithWordList(wordList)
  pw.generate({ numWords: 4 }).catch(function(err) {
    t.ok(err, "should see an error message on asking for too many words.")

    pw.generate({ numWords: 0 }).catch(function(err2) {
      t.ok(err2, "should see an error on asking for no words.")

      pw.generate({ numWords: 4, minLength: -1 }).catch(function(err3) {
        t.ok(err3, "should see an error on asking for a negative length")

        pw.generate({ numWords: 4, maxLength: 1 }).catch(function(err4) {
          t.ok(err4, "should see an error on a very small max length")

          pw.generate({ minLength: 10, maxLength: 9 }).catch(function(err5) {
            t.ok(err5, "should see an error when max is less than min")
            t.end()
          })
        })
      })
    })
  })
})

test("generate from list", function(t) {
  t.plan(1)

  var wordlist = ["one", "two", "three", "four"]
  var options = {
    numWords: 4,
    minLength: 1,
    maxLength: 10
  }

  var pw = new XKCDPassword().initWithWordList(wordlist)
  pw.generate(options, function(err, result) {
    if (err) t.fail(err)

    var difference = _.difference(wordlist, result)
    t.ok(difference.length === 0, "should use all words from wordlist")
    t.end()
  })
})

test("use local word list", function(t) {
  t.plan(1)

  var wordlist = ["one", "two", "three", "four"]
  var options = {
    numWords: 4,
    minLength: 1,
    maxLength: 10
  }
  var wordfile = path.join(__dirname, "fixtures/wordlist.txt")

  var pw = new XKCDPassword().initWithWordFile(wordfile)
  pw.generate(options, function(err, result) {
    if (err) t.fail(err)

    var difference = _.difference(wordlist, result)
    t.ok(difference.length === 0, "should use local wordfile")
    t.end()
  })
})

test("chooses sane defaults", function(t) {
  t.plan(1)

  var pw = new XKCDPassword()
  pw.generate(function(err, result) {
    if (err) t.fail(err)

    t.equal(4, result.length, "should generate four words by default")
    t.end()
  })
})

test("(promise) chooses sane defaults", function(t) {
  t.plan(1)

  var pw = new XKCDPassword()
  pw.generate().then(function(result) {
    t.equal(4, result.length, "should generate four words by default")
    t.end()
  })
})
