# reval [![Build Status](https://secure.travis-ci.org/ritch/reval.png?branch=master)](http://travis-ci.org/ritch/reval)

A JavaScript lib for building continuous execution style programming interfaces like [these](http://vimeo.com/36579366).
  
## Install

    npm install reval

## Examples

### Require it.

    var reval = require('reval');

### Evaluate some JavaScript.

    function src() {
    	return 2 + 2 + 2;
    }

    console.info(reval(src.toString()).run()); // 6
    
### Print changes.

    function locals(a, b, c) {
      var z = function (x,y,z) {}
      var e = 3, f = 4;
      b = 5;
      b = 6;
      b = 7;
      c = e + f + b;
      return f;
    }

    var ctx = reval(locals.toString());

    ctx.watch(function(name, val) {
      console.info(name, val);
    });

    ctx.run();
    
**Output**

    a undefined
    b undefined
    c undefined
    z function (x, y, z) {}
    e 3
    f 4
    b 5
    b 6
    b 7
    c 14
    return 4
    
### Inspect

    function inspect() {
      var x = 1 + 2 + 3 + 4;
    }
    
    reval(inspect.toString())
      .inspect(10, 21, function(val) {
        console.info(val); // 10
      })
      .run()
    ;
    
### Inject after line

    function override() {
      var x = 5; // inject here
      return x;
    }

    var ctx = reval(override.toString());

    ctx.inject('x = 555555;', 1);

    console.info(ctx.run()); // 555555

### Wrap

    function wrap() {
      var foo = 2 > 3;
    }
    
    var ctx = reval(wrap.toString())
    
    ctx.wrap(31, 36, 'console.log(%s)');

### Infinite recursion protection.

    function bad() {
      while(true) {
        // infinte loop
      }
  
      for(var i = 0; true; i++) {
        // infinite loop
      }
    }

    reval(bad.toString()).run();
    
    console.info('...nope still here!');

## Tests

    make test
    
## In the browser

Works in the browser with [browserify](https://github.com/substack/node-browserify).

## License

### MIT/X11





















