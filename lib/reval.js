var burrito = require('burrito');

module.exports = function(src) {
  var ctx = exports;
  ctx.src = src;
  return ctx;
}

exports.run = function() {
  var lid = 0;
  
  // instrument
  var src = burrito(this.src, function (node) {
      if(node.name === 'while' || node.name === 'for') {
        // parse
        var wsrc = node.source().replace('{', '{ if(ctx.isSpinning('+ lid++ +')) break; ');
        node.wrap(wsrc)
      }
    
      if(node.name === 'var') {
        
        var watchSrc = '%s\n';
        
        node.label().forEach(function(label) {
          watchSrc += 'ctx.changed("'+ label +'", '+ label +'); \n';
        })
        
        node.wrap(watchSrc + ';');
      }
  });
  
  // ...then execute
  var result;
  
  try {
    result = eval('(function(ctx) { return ('+src+') })');
    result = result.call(this, this);
  } catch(e) {
    // TODO emit error
  }
  
  if(typeof result === 'function') {
    try {
      result = result.call(this);
    } catch(e) {
      // TODO emit exec func error
    }
  }
  
  return result;
}

exports.changed = function(name, val) {
  if(typeof this._watcher == 'function') this._watcher.apply(this, arguments);
}

var loops = {}, max = 10;

exports.isSpinning = function(id) {
  loops[id] = loops[id] || 1;
  
  return loops[id]++ > max;
}

exports.watch = function(fn) {
  this._watcher = fn;
}