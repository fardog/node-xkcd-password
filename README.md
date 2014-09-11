# XKCD Password Generator v1.2.0 

[![Build Status](https://travis-ci.org/fardog/node-xkcd-password.svg)](https://travis-ci.org/fardog/node-xkcd-password) [![Dependency Status](https://gemnasium.com/fardog/node-xkcd-password.svg)](https://gemnasium.com/fardog/node-xkcd-password)

Creates an [XKCD-style password](http://xkcd.com/936/) based on your parameters. Includes a CLI (`xkcd-password`) for your convenience, and a default wordlist. Supports both a callback-based API and [Promises/A+](http://promisesaplus.com/).

> **Warning:** I am not a cryptographer, or any sort of password expert. An audit would be greatly appreciated.

## Installation

To install the module for use in your projects:

```
npm install xkcd-password
```

Or a global install to get the commandline client:

```
npm install xkcd-password -g
```

This will make the `xkcd-password` command available on your path.

## Usage

This can be used both as a module in another application, or when installed 
globally, via a commandline application.

### CLI

```
$ xkcd-password --help

Usage: xkcd-password [options]

Options:
   -n, --numWords    The number of words to generate for your password.  [4]
   -m, --minLength   Minimum lengh of words chosen for the generated password.  [5]
   -x, --maxLength   Maximum length of words chosen for the generated password.  [8]
   -f, --wordFile    The newline-delimited list of words to be used as the source.
   -s, --separator   The separator character to use between words when output to the console.  [ ]
   --version         print version and exit
```

### Module

```js
var xkcdPassword = require('xkcd-password');
var pw = new xkcdPassword();

var options = {
  numWords: 4,
  minLength: 5,
  maxLength: 8
};

// using callbacks
pw.generate(options, function(err, result) {
  console.log(result); // ['distome', 'pantries', 'sending', 'weiner']
});


// or, with promises
pw.generate(options).then(function(result) {
  console.log(result); // [ 'crambo', 'piled', 'procural', 'plunk' ]
}).catch(function(err) {
  if (!err) {
    console.log('No errors here!');
  }
});
```

## Environment Variables

- **DISABLE_LOOP_PREVENTION**  
It's possible for you to ask for a very specific list of words—say, 100 two character passwords—which would fail if you didn't have enough words of that size, but your wordlist was big enough—say 1000 words. As such, loop prevention was added in v1.1.0. If you'd like to disable this prevention, set DISABLE_LOOP_PREVENTION to a truth-y value.

*Internally, we use [random-lib][randomlib] for our random number generator, which uses the following environment variables:*

- **RAND_ALLOW_PRNG**  
Set this environment variable to allow fallback to Node's `crypto.pseudoRandomBytes()` function if we fail to get entropy from `crypto.randomBytes()`. This decreases the quality of the random numbers, but will stop us from throwing an error.

- **RAND_BUFFER_SIZE**  
How many bytes of entropy we create in a single go. Internally, we create a buffer of entropy and then use it until it's exhausted, then refill the buffer. A small buffer exhausts more quickly, but generates faster and uses less memory. Default is 512 bytes. This value cannot be less than 256 bytes.

## Notes

- The CLI will set the minimum word length to 1 if the maximum word length requested is below the default minimum word length (5), and the minimum is not set. This is as of version 1.2.0. This is to simplify asking for very small words from the CLI. This does not apply to using the module in your applications, just the CLI.

## Known Bugs

- Trying to generate more a large number of words in a single `generate()` call may overflow the call stack. You'll usually be fine up to 2500 words though so it's not much of a problem.

## Contributing

Feel free to send pull requests! I'm not picky, but would like the following:

1. Write tests for any new features, and do not break existing tests.
2. Be sure to point out any changes that break API.

## History

- **v1.2.0**  
Replaces [nomnom][nomnom] with [minimist][minimist], and adds a custom validator for CLI options.

- **v1.1.1**  
Updates dependencies and internal documentation. Adds dependency badge.

- **v1.1.0**  
Doesn't use promises unless you haven't specified a callback. Prevents the generator from entering an infinite loop. Adds additional checks on minimum and maximum word length options.

- **v1.0.0**  
API now supports Promises as well as callbacks.

- **v0.2.7**  
Updates to the latest version of [random-lib][randomlib] and debug.

- **v0.2.6**  
Updates to the latest version of [async][async], so that xkcd-password and [random-lib][randomlib] use the same version.

- **v0.2.5**  
Additional tests.

- **v0.2.4**  
Avoids [releasing Zalgo](http://blog.izs.me/post/59142742143/designing-apis-for-asynchrony) on errors.

- **v0.2.3**  
Smarter rewrite of word generation function based on additional functionality that [random-lib][randomlib] provides. Additional tests.

- **v0.2.2**  
Now uses my [random-lib][randomlib] wrapper for `crypto.randomBytes()`.

- **v0.2.1**  
Now uses Node's `crypto.randomBytes()` for its PRNG, rather than Math.random() in most cases.

- **v0.2.0**  
Changes generation function to accept an "options" object rather than discrete parameters to the generate function. Provides defaults if options aren't given.

[async]: http://github.com/caolan/async/
[randomlib]: http://www.npmjs.org/package/random-lib/
[nomnom]: https://www.npmjs.org/package/nomnom
[minimist]: https://www.npmjs.org/package/minimist

## The MIT License (MIT)

Copyright (c) 2014 Nathan Wittstock

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Grady Ward's Moby

This project includes a wordlist taken from Grady Ward's Moby II, a list of 
words that has been placed in the public domain.

### License

The Moby lexicon project is complete and has
been place into the public domain. Use, sell,
rework, excerpt and use in any way on any platform.

Placing this material on internal or public servers is
also encouraged. The compiler is not aware of any
export restrictions so freely distribute world-wide.

You can verify the public domain status by contacting

Grady Ward
3449 Martha Ct.
Arcata, CA  95521-4884

