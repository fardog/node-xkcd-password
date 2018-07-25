var test = require("tape")

var CLI = require("../lib/cli")

test("parse args", function(t) {
  t.plan(6)

  var argv = ["-n", "10", "-x", "20", "-m", "5", "-f", "/path.txt", "-s", "-"]
  var cli = new CLI().parse(argv)

  t.equal(10, cli.parsedOptions.numWords, "should have correct numWords")
  t.equal(20, cli.parsedOptions.maxLength, "should have correct maxLength")
  t.equal(5, cli.parsedOptions.minLength, "should have correct minLength")
  t.equal(
    "/path.txt",
    cli.parsedOptions.wordFile,
    "should have correct wordFile"
  )
  t.equal("-", cli.parsedOptions.separator, "should have correct wordFile")
  t.ok(cli.errors.length === 0, "should have no errors")
  t.end()
})

test("numeric values", function(t) {
  t.plan(1)

  var argv = ["-n", "ten"]
  var cli = new CLI().parse(argv)

  t.ok(
    cli.errors.length === 1,
    "should have an error when numWords is not numeric"
  )
  t.end()
})

test("string values", function(t) {
  t.plan(1)

  var argv = ["-s", ""]
  var cli = new CLI().parse(argv)

  t.ok(cli.errors.length === 1, "should have an error when separator is empty")
  t.end()
})

test("default values", function(t) {
  t.plan(3)

  var argv = ["-n", "10"]
  var cli = new CLI().parse(argv)

  t.equal(" ", cli.parsedOptions.separator, "should have default separator")

  cli = null

  argv = ["-x", "3"]
  cli = new CLI().parse(argv)
  t.equal(
    1,
    cli.parsedOptions.minLength,
    "should set minLenght on small maxLength"
  )

  cli = null

  argv = ["-x", "5"]
  cli = new CLI().parse(argv)
  t.ok(
    !cli.parsedOptions.minLength,
    "should not set minLength on larger maxLength"
  )

  t.end()
})

test("help and version", function(t) {
  t.plan(2)

  var argv = ["-v"]

  var cli = new CLI().parse(argv)
  t.ok(cli.message.length > 0, "should have version message")

  cli = null

  argv = ["--help"]
  cli = new CLI().parse(argv)
  t.ok(cli.message.length > 150, "should have long help message")
  t.end()
})

test("sync callback style", function(t) {
  t.plan(2)

  var argv = ["-x", "5"]

  new CLI().parse(argv, function(err, message, options) {
    t.equal(5, options.maxLength, "should have correct maxLength")
    t.ok(!err, "should not have an error")
    t.end()
  })
})
