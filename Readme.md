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
    
### Print all local variables.

    function locals() {
      var x = 2
        , y = 3;

      return x * y;
    }

    var ctx = reval(locals.toString());

    ctx.watch(function(name, val) {
      console.info(arguments);
    });

    ctx.run();
    
**Output**

    ['x', 2]
    ['y', 3]
    
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