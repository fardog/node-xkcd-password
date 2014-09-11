'use strict';

var grunt = require('grunt');
var _ = require('underscore');
var Cli = require('../lib/cli');
var async = require('async');
var path = require('path');

exports.xkcdcli = {
  parseArgs: function(test) {
    test.expect(6);

    var argv = ['-n', '10', '-x', '20', '-m', '5', '-f', '/path.txt', '-s', '-'];
    var cli = new Cli().parse(argv);

    test.equal(10, cli.parsedOptions.numWords, 'should have correct numWords');
    test.equal(20, cli.parsedOptions.maxLength, 'should have correct maxLength');
    test.equal(5, cli.parsedOptions.minLength, 'should have correct minLength');
    test.equal('/path.txt', cli.parsedOptions.wordFile, 'should have correct wordFile');
    test.equal('-', cli.parsedOptions.separator, 'should have correct wordFile');
    test.ok(cli.errors.length === 0, 'should have no errors');
    test.done();
  },
  numericValues: function(test) {
    test.expect(1);

    var argv = ['-n', 'ten'];
    var cli = new Cli().parse(argv);

    test.ok(cli.errors.length === 1, 'should have an error when numWords is not numeric');
    test.done();
  },
  stringValues: function(test) {
    test.expect(1);

    var argv = ['-s', ''];
    var cli = new Cli().parse(argv);

    test.ok(cli.errors.length === 1, 'should have an error when separator is empty');
    test.done();
  },
  defaultValues: function(test) {
    test.expect(3);
    
    var argv = ['-n', '10'];
    var cli = new Cli().parse(argv);

    test.equal(' ', cli.parsedOptions.separator, 'should have default separator');

    cli = null;

    argv = ['-x', '3'];
    cli = new Cli().parse(argv);
    test.equal(1, cli.parsedOptions.minLength, 'should set minLenght on small maxLength');

    cli = null;

    argv = ['-x', '5'];
    cli = new Cli().parse(argv);
    test.ok(!cli.parsedOptions.minLength, 'should not set minLength on larger maxLength');

    test.done();
  },
  helpAndVersion: function(test) {
    test.expect(2);

    var argv = ['-v'];

    var cli = new Cli().parse(argv);
    test.ok(cli.message.length > 0, 'should have version message');

    cli = null;

    argv = ['--help'];
    cli = new Cli().parse(argv);
    test.ok(cli.message.length > 150, 'should have long help message');
    test.done();
  },
  syncCallbackStyle: function(test) {
    test.expect(2);

    var argv = ['-x', '5'];
    var cli = new Cli().parse(argv, function(err, message, options) {
      test.equal(5, options.maxLength, 'should have correct maxLength');
      test.ok(!err, 'should not have an error');
      test.done();
    });
  }
};
