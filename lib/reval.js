var burrito = require('burrito');

module.exports = function(src) {
  var ctx = Object.create(exports);
  ctx.src = src;
  return ctx;
}

exports.run = function() {
  var lid = 0;
  var watchLines = {};
  var firstNode;
  var ctx = this;
  
  function trace(node) {
      var wsrc = '';
    
      if(!firstNode) {
        firstNode = node;
      }
    
      if(node.name === 'while' || node.name === 'for') {
        // parse
        wsrc = node.source().replace('{', '{ if(ctx.isSpinning('+ lid++ +')) break; ');
        node.wrap(wsrc);
      }
      
      if(node.name === 'assign' && node.start.type === 'name') {
        if(typeof node.start.line == 'number') watchLines[node.start.line] = ' ctx.changed("'+ node.start.value +'", '+ node.start.value +');';
      }
      
      if(node.name === 'return') {
        var index = node.start.line - 1; // cant call after return
        watchLines[index] = (watchLines[index] || '') + ' ctx.changed("return", '+ '(function() {' + node.source() + '})()' +')';
      }
      
      
      // TODO handle 'function'
      if(node.name === 'defun') {
        var labels = node.value[1];
        
        labels.forEach(function(label) {
          wsrc += ' ctx.changed("'+ label +'", undefined); ';
        });
        
        if(wsrc && typeof node.start.line == 'number') watchLines[node.start.line] = wsrc;
      }
    
      if(node.name === 'var') {
        node.label().forEach(function(label) {
          wsrc += ' ctx.changed("'+ label +'", '+ label +');';
        })
        
        if(wsrc && typeof node.start.line == 'number') watchLines[node.start.line] = wsrc;
      }
  }
  
  // instrument
  try {
    var src = burrito(this.src, trace);
  } catch(e) {
    this.error && this.error(e);
    return;
  }
  
  var instrumented = ''
    , injections = this.injections || []
  ;
  
  src.split('\n').forEach(function(line, i) {
    instrumented += line + (injections[i] || '') + (watchLines[i] || '') + '\n';
  })
    
  // ...then execute
  var exec, err, result;

  if(firstNode.name != 'defun' && firstNode.name != 'function') {
    instrumented = 'function(ctx) {' + instrumented + '}';
  }
  
  try {
    exec = eval('(' + instrumented + ')');
  } catch(e) {
    err = e;
    this.error && this.error(e);
    return;
  }
  
  try {
    result = exec.call(this, this);
  } catch(e) { 
    err = e;
    this.error && this.error(e);
    return;
  }
  
  return result;
}

exports.changed = function(name, val) {
  if(typeof this._watcher == 'function') this._watcher.apply(this, arguments);
}

var loops = {}, max = 1024;

exports.isSpinning = function(id) {
  loops[id] = loops[id] || 1;
  
  return loops[id]++ > max;
}

exports.watch = function(fn) {
  this._watcher = fn;
}

exports.inject = function(src, line) {
  var injections = this.injections || (this.injections = {});
  injections[line] = (injections[line] || '') + src;
}

exports.wrap = function(start, end, src) {
  var out = ''
    , chars = this.src.split('')
    , len = chars.length
    , i = 0
    , wrapper = src.split('%s')
  ;
  
  chars[start] += wrapper[0];
  chars[end] += wrapper[1] || '';

  this.src = chars.join('');
  
  return this;
}

exports.error = function(fn) {
  this.error = fn;
  return this;
}
