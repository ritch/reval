var reval = require('../')
  , expect = require('chai').expect;

function example(a, b, c) {
  var e = 1
    , f = 2
    , g = 3;

  return g * f * e;
}

function locals(a, b, c) {
  var z = function (x,y,z) {}
  var e = 3, f = 4;
  b = 5;
  b = 6;
  b = 7;
  c = e + f + b;
  return f;
}


function override() {
  var x = 5;
  return x;
}

describe('API', function(){
  
  describe('run()', function(){
    it('should execute the given source and return the result', function(done){
      var result = reval(example.toString()).run();
      
      expect(result).to.equal(6);
      done();
    })
  })
  
  describe('watch(fn)', function(){
    it('should output the values of the local variables', function(done){
      var ctx = reval(locals.toString());
      
      var vals = {}, i = 0, total = 11;
      
      ctx.watch(function(name, val) {
        vals[name] = val;
        
        if(i++ === total - 1) {
          expect(vals.e).to.equal(3);
          expect(vals.f).to.equal(4);
          expect(vals.b).to.equal(7);
          expect(vals['return']).to.equal(4);
          
          done();
        }
      });
      
      ctx.run();
    })
    
    
    function simpleLocals() {
      var x = 1;
      var y = 2;
      return 3;
    }
    
    it('simple - should output variables', function(done){
      var ctx = reval(simpleLocals.toString());
      
      var expected = {
        x: 1,
        y: 2,
        'return': 3
      };
      
      var total = 3, cur = 1;
      
      ctx.watch(function(name, val) {       
        expect(val).to.equal(expected[name]);
    
        if(++cur === total) done();
      })
      
      ctx.run();
    })
    
  })
  
  describe('inject(description)', function(){
    it('should reset the value on the given line', function(done){
      var ctx = reval(override.toString());

      ctx.inject('x = 555555;', 1);
      
      expect(ctx.run()).to.equal(555555);
      
      done();
    })
  })
  
  function wrap() {
    return 111 / 11;
  }
  
  describe('wrap(start, end, src)', function(){
    it('should wrap the src', function(done){
      var ctx = reval(wrap.toString())

      ctx.wrap(28, 36, 'Math.round(%s)');

      expect(ctx.run()).to.equal(10);

      done();
    })
  })
  
})

function bad() {
  while(1) {
    // infinte loop 1
  }
  
  for(var i = 0; i < 0; i++) {
    // infinite loop 3
  }
}

describe('Stress / Security', function(){
  
  it('should stop executing after its starts spinning into infinity', function(done){
    var ctx = reval(bad.toString());
    
    ctx.run();
    
    done();
  })
  
  it('should not execute if there is an error', function(done){
    var result = reval('var x = 2; return 2;')
      .error(function(e) {
        expect(e).to.exist;
        expect(e.message.indexOf("'return' outside of function")).to.equal(0);
      })
      .run()
    ;
    
    expect(result).to.equal(undefined);
    done();
  })
  
})