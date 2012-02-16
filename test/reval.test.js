var reval = require('../')
  , expect = require('chai').expect;

function example(a, b, c) {
  var e = 1
    , f = 2
    , g = 3;

  return g * f * e;
}

describe('API', function(){
  describe('reval(src).run()', function(){
    it('should execute the given source and return the result', function(done){
      var result = reval(example.toString()).run();
      
      expect(result).to.equal(6);
      done();
    })
  })
  
  describe('reval(src).watch(fn)', function(){
    it('should output the values of the local variables', function(done){
      var ctx = reval(example.toString());
      
      var vals = {}, i = 0;
      
      ctx.watch(function(name, val) {
        vals[name] = val;
        
        if(i++ === 2) {
          expect(vals).to.eql({
            'e': 1,
            'f': 2,
            'g': 3
          });
          
          done();
        }
      });
      
      ctx.run();
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
  
  
})