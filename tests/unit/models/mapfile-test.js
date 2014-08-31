'use strict';

var Blueprint         = require('../../../lib/models/blueprint');
var assert            = require('assert');

describe('.mapFile', function() {
  it('replaces all occurences of __name__ with module name',function(){
    var path = Blueprint.prototype.mapFile('__name__/__name__-controller.js',{dasherizedModuleName: 'my-blueprint'});
    assert.equal(path,'my-blueprint/my-blueprint-controller.js');

    path = Blueprint.prototype.mapFile('__name__/controller.js',{dasherizedModuleName: 'my-blueprint'});
    assert.equal(path,'my-blueprint/controller.js');

    path = Blueprint.prototype.mapFile('__name__/__name__.js',{dasherizedModuleName: 'my-blueprint'});
    assert.equal(path,'my-blueprint/my-blueprint.js');
  });

  it('accepts locals.fileMap with multiple mappings',function(){
    var locals = {};
    locals.filemap= {
      __name__: 'user',
      __type__: 'controller',
      __path__: 'pods/users',
      __plural__: ''
    };

    var path = Blueprint.prototype.mapFile('__name__/__type____plural__.js',locals);
    assert.equal(path,'user/controller.js');

    path = Blueprint.prototype.mapFile('__path__/__name__/__type__.js',locals);
    assert.equal(path,'pods/users/user/controller.js');
  });
});
