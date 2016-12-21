var test = require('tape')

var CLI = require('../lib/cli')

test('parse args', function (test) {
  test.plan(6)

  var argv = ['-n', '10', '-x', '20', '-m', '5', '-f', '/path.txt', '-s', '-']
  var cli = new CLI().parse(argv)

  test.equal(10, cli.parsedOptions.numWords, 'should have correct numWords')
  test.equal(20, cli.parsedOptions.maxLength, 'should have correct maxLength')
  test.equal(5, cli.parsedOptions.minLength, 'should have correct minLength')
  test.equal('/path.txt', cli.parsedOptions.wordFile, 'should have correct wordFile')
  test.equal('-', cli.parsedOptions.separator, 'should have correct wordFile')
  test.ok(cli.errors.length === 0, 'should have no errors')
  test.end()
})

test('numeric values', function (test) {
  test.plan(1)

  var argv = ['-n', 'ten']
  var cli = new CLI().parse(argv)

  test.ok(cli.errors.length === 1, 'should have an error when numWords is not numeric')
  test.end()
})

test('string values', function (test) {
  test.plan(1)

  var argv = ['-s', '']
  var cli = new CLI().parse(argv)

  test.ok(cli.errors.length === 1, 'should have an error when separator is empty')
  test.end()
})

test('default values', function (test) {
  test.plan(3)

  var argv = ['-n', '10']
  var cli = new CLI().parse(argv)

  test.equal(' ', cli.parsedOptions.separator, 'should have default separator')

  cli = null

  argv = ['-x', '3']
  cli = new CLI().parse(argv)
  test.equal(1, cli.parsedOptions.minLength, 'should set minLenght on small maxLength')

  cli = null

  argv = ['-x', '5']
  cli = new CLI().parse(argv)
  test.ok(!cli.parsedOptions.minLength, 'should not set minLength on larger maxLength')

  test.end()
})

test('help and version', function (test) {
  test.plan(2)

  var argv = ['-v']

  var cli = new CLI().parse(argv)
  test.ok(cli.message.length > 0, 'should have version message')

  cli = null

  argv = ['--help']
  cli = new CLI().parse(argv)
  test.ok(cli.message.length > 150, 'should have long help message')
  test.end()
})

test('sync callback style', function (test) {
  test.plan(2)

  var argv = ['-x', '5']

  new CLI().parse(argv, function (err, message, options) {
    test.equal(5, options.maxLength, 'should have correct maxLength')
    test.ok(!err, 'should not have an error')
    test.end()
  })
})
