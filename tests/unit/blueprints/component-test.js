'use strict';

var Blueprint = require('../../../lib/models/blueprint');
var expect    = require('chai').expect;
var path      = require('path');

describe('blueprint - component', function(){
  describe('entityName', function(){
    it('throws error when hyphen is not present', function(){
      var blueprint = Blueprint.lookup('component', { paths:
        [ path.resolve('./node_modules/ember-cli-legacy-blueprints/blueprints') ]
      });

      expect(function() {
        var nonConformantComponentName = 'form';
        blueprint.normalizeEntityName(nonConformantComponentName);
      }).to.throw(/must include a hyphen in the component name/);
    });


    it('keeps existing behavior by calling Blueprint.normalizeEntityName', function(){
      var blueprint = Blueprint.lookup('component', { paths:
        [ path.resolve('./node_modules/ember-cli-legacy-blueprints/blueprints') ]
        });

      expect(function() {
        var nonConformantComponentName = 'x-form/';
        blueprint.normalizeEntityName(nonConformantComponentName);
      }).to.throw(/trailing slash/);
    });
  });
});
