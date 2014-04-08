# XKCD Password Generator 0.1.1 [![Build Status](https://travis-ci.org/fardog/node-xkcd-password.svg)](https://travis-ci.org/fardog/node-xkcd-password)

Creates an [XKCD-style password](http://xkcd.com/936/) based on your parameters. Includes a CLI (`xkcd-password`) for your convenience, and a default wordlist.

**Warning:** I am not a cryptographer, or any sort of password expert. Use at your own risk.

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

pw.generate(numWords, minLength, maxLength, function(err, result) {
    console.log(result);
    // ['distome', 'pantries', 'sending', 'weiner']
});
```

## Contributing

Feel free to send pull requests! I'm not picky, but would like the following:

1. Write tests for any new features, and do not break existing tests.
2. Be sure to point out any changes that break API.

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

