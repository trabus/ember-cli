/*jshint quotmark: false*/

'use strict';

var Promise              = require('../../lib/ext/promise');
var assertFile           = require('ember-cli-internal-test-helpers/lib/helpers/assert-file');
var assertFileEquals     = require('ember-cli-internal-test-helpers/lib/helpers/assert-file-equals');
var assertFileToNotExist = require('ember-cli-internal-test-helpers/lib/helpers/assert-file-to-not-exist');
var conf                 = require('ember-cli-internal-test-helpers/lib/helpers/conf');
var ember                = require('../helpers/ember');
var fs                   = require('fs-extra');
var path                 = require('path');
var remove               = Promise.denodeify(fs.remove);
var root                 = process.cwd();
var tmproot              = path.join(root, 'tmp');
var BlueprintNpmTask     = require('../helpers/disable-npm-on-blueprint');
var expect               = require('chai').expect;
var mkTmpDirIn           = require('../../lib/utilities/mk-tmp-dir-in');

describe('Acceptance: ember generate in-addon', function() {
  this.timeout(20000);

  before(function() {
    BlueprintNpmTask.disableNPM();
    conf.setup();
  });

  after(function() {
    BlueprintNpmTask.restoreNPM();
    conf.restore();
  });

  beforeEach(function() {
    return mkTmpDirIn(tmproot).then(function(tmpdir) {
      process.chdir(tmpdir);
    });
  });

  afterEach(function() {
    process.chdir(root);
    return remove(tmproot);
  });

  function initAddon(name) {
    return ember([
      'addon',
      name,
      '--skip-npm',
      '--skip-bower'
    ]);
  }

  function generateInAddon(args) {
    var name = 'my-addon';
    var generateArgs = ['generate'].concat(args);

    if (arguments.length > 1) {
      name = arguments[1];
    }

    return initAddon(name).then(function() {
      return ember(generateArgs);
    });
  }

  it('in-addon controller foo', function() {
    return generateInAddon(['controller', 'foo']).then(function() {
      assertFile('addon/controllers/foo.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Controller.extend({\n});"
        ]
      });
      assertFile('app/controllers/foo.js', {
        contains: [
          "export { default } from 'my-addon/controllers/foo';"
        ]
      });
      assertFile('tests/unit/controllers/foo-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('controller:foo'"
        ]
      });
    });
  });

  it('in-addon controller foo/bar', function() {
    return generateInAddon(['controller', 'foo/bar']).then(function() {
      assertFile('addon/controllers/foo/bar.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Controller.extend({\n});"
        ]
      });
      assertFile('app/controllers/foo/bar.js', {
        contains: [
          "export { default } from 'my-addon/controllers/foo/bar';"
        ]
      });
      assertFile('tests/unit/controllers/foo/bar-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('controller:foo/bar'"
        ]
      });
    });
  });

  it('in-addon component x-foo', function() {
    return generateInAddon(['component', 'x-foo']).then(function() {
      assertFile('addon/components/x-foo.js', {
        contains: [
          "import Ember from 'ember';",
          "import layout from '../templates/components/x-foo';",
          "export default Ember.Component.extend({",
          "layout",
          "});"
        ]
      });
      assertFile('addon/templates/components/x-foo.hbs', {
        contains: "{{yield}}"
      });
      assertFile('app/components/x-foo.js', {
        contains: [
          "export { default } from 'my-addon/components/x-foo';"
        ]
      });
      assertFile('tests/integration/components/x-foo-test.js', {
        contains: [
          "import { moduleForComponent, test } from 'ember-qunit';",
          "import hbs from 'htmlbars-inline-precompile';",
          "moduleForComponent('x-foo'",
          "integration: true",
          "{{x-foo}}",
          "{{#x-foo}}"
        ]
      });
    });
  });

  it('in-addon component-test x-foo', function() {
    return generateInAddon(['component-test', 'x-foo']).then(function() {
      assertFile('tests/integration/components/x-foo-test.js', {
        contains: [
          "import { moduleForComponent, test } from 'ember-qunit';",
          "import hbs from 'htmlbars-inline-precompile';",
          "moduleForComponent('x-foo'",
          "integration: true",
          "{{x-foo}}",
          "{{#x-foo}}"
        ]
      });
      assertFileToNotExist('app/component-test/x-foo.js');
    });
  });

  it('in-addon component-test x-foo --unit', function() {
    return generateInAddon(['component-test', 'x-foo', '--unit']).then(function() {
      assertFile('tests/unit/components/x-foo-test.js', {
        contains: [
          "import { moduleForComponent, test } from 'ember-qunit';",
          "moduleForComponent('x-foo'",
          "unit: true"
        ]
      });
      assertFileToNotExist('app/component-test/x-foo.js');
    });
  });

  it('in-addon component nested/x-foo', function() {
    return generateInAddon(['component', 'nested/x-foo']).then(function() {
      assertFile('addon/components/nested/x-foo.js', {
        contains: [
          "import Ember from 'ember';",
          "import layout from '../../templates/components/nested/x-foo';",
          "export default Ember.Component.extend({",
          "layout",
          "});"
        ]
      });
      assertFile('addon/templates/components/nested/x-foo.hbs', {
        contains: "{{yield}}"
      });
      assertFile('app/components/nested/x-foo.js', {
        contains: [
          "export { default } from 'my-addon/components/nested/x-foo';"
        ]
      });
      assertFile('tests/integration/components/nested/x-foo-test.js', {
        contains: [
          "import { moduleForComponent, test } from 'ember-qunit';",
          "import hbs from 'htmlbars-inline-precompile';",
          "moduleForComponent('nested/x-foo'",
          "integration: true",
          "{{nested/x-foo}}",
          "{{#nested/x-foo}}"
        ]
      });
    });
  });

  it('in-addon helper foo-bar', function() {
    return generateInAddon(['helper', 'foo-bar']).then(function() {
      assertFile('addon/helpers/foo-bar.js', {
        contains: "import Ember from 'ember';\n\n" +
                  "export function fooBar(params/*, hash*/) {\n" +
                  "  return params;\n" +
                  "}\n\n" +
                  "export default Ember.Helper.helper(fooBar);"
      });
      assertFile('app/helpers/foo-bar.js', {
        contains: [
          "export { default, fooBar } from 'my-addon/helpers/foo-bar';"
        ]
      });
      assertFile('tests/unit/helpers/foo-bar-test.js', {
        contains: "import { fooBar } from 'dummy/helpers/foo-bar';"
      });
    });
  });

  it('in-addon helper foo/bar-baz', function() {
    return generateInAddon(['helper', 'foo/bar-baz']).then(function() {
      assertFile('addon/helpers/foo/bar-baz.js', {
        contains: "import Ember from 'ember';\n\n" +
                  "export function fooBarBaz(params/*, hash*/) {\n" +
                  "  return params;\n" +
                  "}\n\n" +
                  "export default Ember.Helper.helper(fooBarBaz);"
      });
      assertFile('app/helpers/foo/bar-baz.js', {
        contains: [
          "export { default, fooBarBaz } from 'my-addon/helpers/foo/bar-baz';"
        ]
      });
      assertFile('tests/unit/helpers/foo/bar-baz-test.js', {
        contains: "import { fooBarBaz } from 'dummy/helpers/foo/bar-baz';"
      });
    });
  });

  it('in-addon model foo', function() {
    return generateInAddon(['model', 'foo']).then(function() {
      assertFile('addon/models/foo.js', {
        contains: [
          "import DS from 'ember-data';",
          "export default DS.Model.extend"
        ]
      });
      assertFile('app/models/foo.js', {
        contains: [
          "export { default } from 'my-addon/models/foo';"
        ]
      });
      assertFile('tests/unit/models/foo-test.js', {
        contains: [
          "import { moduleForModel, test } from 'ember-qunit';",
          "moduleForModel('foo'"
        ]
      });
    });
  });

  it('in-addon model foo with attributes', function() {
    return generateInAddon([
      'model',
      'foo',
      'noType',
      'firstName:string',
      'created_at:date',
      'is-published:boolean',
      'rating:number',
      'bars:has-many',
      'baz:belongs-to',
      'echo:hasMany',
      'bravo:belongs_to',
      'foo-names:has-many',
      'barName:has-many',
      'bazName:belongs-to',
      'test-name:belongs-to',
      'echoName:hasMany',
      'bravoName:belongs_to'
    ]).then(function() {
      assertFile('addon/models/foo.js', {
        contains: [
          "noType: DS.attr()",
          "firstName: DS.attr('string')",
          "createdAt: DS.attr('date')",
          "isPublished: DS.attr('boolean')",
          "rating: DS.attr('number')",
          "bars: DS.hasMany('bar')",
          "baz: DS.belongsTo('baz')",
          "echos: DS.hasMany('echo')",
          "bravo: DS.belongsTo('bravo')",
          "fooNames: DS.hasMany('foo-name')",
          "barNames: DS.hasMany('bar-name')",
          "bazName: DS.belongsTo('baz-name')",
          "testName: DS.belongsTo('test-name')",
          "echoNames: DS.hasMany('echo-name')",
          "bravoName: DS.belongsTo('bravo-name')"
        ]
      });
      assertFile('app/models/foo.js', {
        contains: [
          "export { default } from 'my-addon/models/foo';"
        ]
      });
      assertFile('tests/unit/models/foo-test.js', {
        contains: [
          "needs: [",
          "'model:bar',",
          "'model:baz',",
          "'model:echo',",
          "'model:bravo',",
          "'model:foo-name',",
          "'model:bar-name',",
          "'model:baz-name',",
          "'model:echo-name',",
          "'model:test-name',",
          "'model:bravo-name'",
          "]"
        ]
      });
    });
  });

  it('in-addon model foo/bar', function() {
    return generateInAddon(['model', 'foo/bar']).then(function() {
      assertFile('addon/models/foo/bar.js', {
        contains: [
          "import DS from 'ember-data';",
          "export default DS.Model.extend"
        ]
      });
      assertFile('app/models/foo/bar.js', {
        contains: [
          "export { default } from 'my-addon/models/foo/bar';"
        ]
      });
      assertFile('tests/unit/models/foo/bar-test.js', {
        contains: [
          "import { moduleForModel, test } from 'ember-qunit';",
          "moduleForModel('foo/bar'"
        ]
      });
    });
  });

  it('in-addon model-test foo', function() {
    return generateInAddon(['model-test', 'foo']).then(function() {
      assertFile('tests/unit/models/foo-test.js', {
        contains: [
          "import { moduleForModel, test } from 'ember-qunit';",
          "moduleForModel('foo'"
        ]
      });
      assertFileToNotExist('app/model-test/foo.js');
    });
  });

  it('in-addon route foo', function() {
    return generateInAddon(['route', 'foo']).then(function() {
      assertFile('addon/routes/foo.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Route.extend({\n});"
        ]
      });
      assertFile('app/routes/foo.js', {
        contains: [
          "export { default } from 'my-addon/routes/foo';"
        ]
      });
      assertFile('addon/templates/foo.hbs', {
        contains: '{{outlet}}'
      });
      assertFile('app/templates/foo.js', {
        contains: "export { default } from 'my-addon/templates/foo';"
      });
      assertFile('tests/unit/routes/foo-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('route:foo'"
        ]
      });
      assertFile('tests/dummy/app/router.js', {
        doesNotContain: "this.route('foo');"
      });
    });
  });

  it('in-addon route foo/bar', function() {
    return generateInAddon(['route', 'foo/bar']).then(function() {
      assertFile('addon/routes/foo/bar.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.Route.extend({\n});"
        ]
      });
      assertFile('app/routes/foo/bar.js', {
        contains: "export { default } from 'my-addon/routes/foo/bar';"
      });
      assertFile('app/templates/foo/bar.js', {
        contains: "export { default } from 'my-addon/templates/foo/bar';"
      });
      assertFile('tests/unit/routes/foo/bar-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('route:foo/bar'"
        ]
      });
      assertFile('tests/dummy/app/router.js', {
        doesNotContain:  "this.route('bar');"
      });
    });
  });

  it('in-addon route-test foo', function() {
    return generateInAddon(['route-test', 'foo']).then(function() {
      assertFile('tests/unit/routes/foo-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('route:foo'"
        ]
      });
      assertFileToNotExist('app/route-test/foo.js');
    });
  });

  it('in-addon template foo', function() {
    return generateInAddon(['template', 'foo']).then(function() {
      assertFile('addon/templates/foo.hbs');
    });
  });

  it('in-addon template foo/bar', function() {
    return generateInAddon(['template', 'foo/bar']).then(function() {
      assertFile('addon/templates/foo/bar.hbs');
    });
  });

  it('in-addon view foo', function() {
    return generateInAddon(['view', 'foo']).then(function() {
      assertFile('addon/views/foo.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.View.extend({\n})"
        ]
      });
      assertFile('app/views/foo.js', {
        contains: [
          "export { default } from 'my-addon/views/foo';"
        ]
      });
      assertFile('tests/unit/views/foo-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('view:foo'"
        ]
      });
    });
  });

  it('in-addon view foo/bar', function() {
    return generateInAddon(['view', 'foo/bar']).then(function() {
      assertFile('addon/views/foo/bar.js', {
        contains: [
          "import Ember from 'ember';",
          "export default Ember.View.extend({\n})"
        ]
      });
      assertFile('app/views/foo/bar.js', {
        contains: [
          "export { default } from 'my-addon/views/foo/bar';"
        ]
      });
      assertFile('tests/unit/views/foo/bar-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('view:foo/bar'"
        ]
      });
    });
  });

  it('in-addon resource foos', function() {
    return generateInAddon(['resource', 'foos']).catch(function(error) {
      expect(error.message).to.include('blueprint does not support ' +
        'generating inside addons.');
    });
  });

  it('in-addon initializer foo', function() {
    return generateInAddon(['initializer', 'foo']).then(function() {
      assertFile('addon/initializers/foo.js', {
        contains: "export function initialize(/* application */) {\n" +
                  "  // application.inject('route', 'foo', 'service:foo');\n" +
                  "}\n" +
                  "\n"+
                  "export default {\n" +
                  "  name: 'foo',\n" +
                  "  initialize\n" +
                  "};"
      });
      assertFile('app/initializers/foo.js', {
        contains: [
          "export { default, initialize } from 'my-addon/initializers/foo';"
        ]
      });
      assertFile('tests/unit/initializers/foo-test.js');
    });
  });

  it('in-addon initializer foo/bar', function() {
    return generateInAddon(['initializer', 'foo/bar']).then(function() {
      assertFile('addon/initializers/foo/bar.js', {
        contains: "export function initialize(/* application */) {\n" +
                  "  // application.inject('route', 'foo', 'service:foo');\n" +
                  "}\n" +
                  "\n"+
                  "export default {\n" +
                  "  name: 'foo/bar',\n" +
                  "  initialize\n" +
                  "};"
      });
      assertFile('app/initializers/foo/bar.js', {
        contains: [
          "export { default, initialize } from 'my-addon/initializers/foo/bar';"
        ]
      });
      assertFile('tests/unit/initializers/foo/bar-test.js');
    });
  });

  it('in-addon mixin foo', function() {
    return generateInAddon(['mixin', 'foo']).then(function() {
      assertFile('addon/mixins/foo.js', {
        contains: [
          "import Ember from 'ember';",
          'export default Ember.Mixin.create({\n});'
        ]
      });
      assertFile('tests/unit/mixins/foo-test.js', {
        contains: [
          "import FooMixin from 'my-addon/mixins/foo';"
        ]
      });
      assertFileToNotExist('app/mixins/foo.js');
    });
  });

  it('in-addon mixin foo/bar', function() {
    return generateInAddon(['mixin', 'foo/bar']).then(function() {
      assertFile('addon/mixins/foo/bar.js', {
        contains: [
          "import Ember from 'ember';",
          'export default Ember.Mixin.create({\n});'
        ]
      });
      assertFile('tests/unit/mixins/foo/bar-test.js', {
        contains: [
          "import FooBarMixin from 'my-addon/mixins/foo/bar';"
        ]
      });
      assertFileToNotExist('app/mixins/foo/bar.js');
    });
  });

  it('in-addon mixin foo/bar/baz', function() {
    return generateInAddon(['mixin', 'foo/bar/baz']).then(function() {
      assertFile('addon/mixins/foo/bar/baz.js', {
        contains: [
          "import Ember from 'ember';",
          'export default Ember.Mixin.create({\n});'
        ]
      });
      assertFile('tests/unit/mixins/foo/bar/baz-test.js', {
        contains: [
          "import FooBarBazMixin from 'my-addon/mixins/foo/bar/baz';"
        ]
      });
      assertFileToNotExist('app/mixins/foo/bar/baz.js');
    });
  });

  it('in-addon adapter application', function() {
    return generateInAddon(['adapter', 'application']).then(function() {
      assertFile('addon/adapters/application.js', {
        contains: [
          "import DS from \'ember-data\';",
          "export default DS.RESTAdapter.extend({\n});"
        ]
      });
      assertFile('app/adapters/application.js', {
        contains: [
          "export { default } from 'my-addon/adapters/application';"
        ]
      });
      assertFile('tests/unit/adapters/application-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('adapter:application'"
        ]
      });
    });
  });

  it('in-addon adapter foo', function() {
    return generateInAddon(['adapter', 'foo']).then(function() {
      assertFile('addon/adapters/foo.js', {
        contains: [
          "import DS from \'ember-data\';",
          "export default DS.RESTAdapter.extend({\n});"
        ]
      });
      assertFile('app/adapters/foo.js', {
        contains: [
          "export { default } from 'my-addon/adapters/foo';"
        ]
      });
      assertFile('tests/unit/adapters/foo-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('adapter:foo'"
        ]
      });
    });
  });

  it('in-addon adapter foo/bar (with base class foo)', function() {
    return generateInAddon(['adapter', 'foo/bar', '--base-class=foo']).then(function() {
      assertFile('addon/adapters/foo/bar.js', {
        contains: [
          "import FooAdapter from \'../foo\';",
          "export default FooAdapter.extend({\n});"
        ]
      });
      assertFile('app/adapters/foo/bar.js', {
        contains: [
          "export { default } from 'my-addon/adapters/foo/bar';"
        ]
      });
      assertFile('tests/unit/adapters/foo/bar-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('adapter:foo/bar'"
        ]
      });
    });
  });

  it('in-addon adapter-test foo', function() {
    return generateInAddon(['adapter-test', 'foo']).then(function() {
      assertFile('tests/unit/adapters/foo-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('adapter:foo'"
        ]
      });
      assertFileToNotExist('app/adapter-test/foo.js');
    });
  });

  it('in-addon serializer foo', function() {
    return generateInAddon(['serializer', 'foo']).then(function() {
      assertFile('addon/serializers/foo.js', {
        contains: [
          "import DS from 'ember-data';",
          'export default DS.RESTSerializer.extend({\n});'
        ]
      });
      assertFile('app/serializers/foo.js', {
        contains: [
          "export { default } from 'my-addon/serializers/foo';"
        ]
      });
      assertFile('tests/unit/serializers/foo-test.js', {
        contains: [
          "import { moduleForModel, test } from 'ember-qunit';",
        ]
      });
    });
  });

  it('in-addon serializer foo/bar', function() {
    return generateInAddon(['serializer', 'foo/bar']).then(function() {
      assertFile('addon/serializers/foo/bar.js', {
        contains: [
          "import DS from 'ember-data';",
          'export default DS.RESTSerializer.extend({\n});'
        ]
      });
      assertFile('app/serializers/foo/bar.js', {
        contains: [
          "export { default } from 'my-addon/serializers/foo/bar';"
        ]
      });
      assertFile('tests/unit/serializers/foo/bar-test.js', {
        contains: [
          "import { moduleForModel, test } from 'ember-qunit';",
          "moduleForModel('foo/bar'"
        ]
      });
    });
  });

  it('in-addon serializer-test foo', function() {
    return generateInAddon(['serializer-test', 'foo']).then(function() {
      assertFile('tests/unit/serializers/foo-test.js', {
        contains: [
          "import { moduleForModel, test } from 'ember-qunit';",
          "moduleForModel('foo'"
        ]
      });
      assertFileToNotExist('app/serializer-test/foo.js');
    });
  });

  it('in-addon transform foo', function() {
    return generateInAddon(['transform', 'foo']).then(function() {
      assertFile('addon/transforms/foo.js', {
        contains: [
          "import DS from 'ember-data';",
          'export default DS.Transform.extend({\n' +
          '  deserialize(serialized) {\n' +
          '    return serialized;\n' +
          '  },\n' +
          '\n' +
          '  serialize(deserialized) {\n' +
          '    return deserialized;\n' +
          '  }\n' +
          '});'
        ]
      });
      assertFile('app/transforms/foo.js', {
        contains: [
          "export { default } from 'my-addon/transforms/foo';"
        ]
      });
      assertFile('tests/unit/transforms/foo-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('transform:foo'"
        ]
      });
    });
  });

  it('in-addon transform foo/bar', function() {
    return generateInAddon(['transform', 'foo/bar']).then(function() {
      assertFile('addon/transforms/foo/bar.js', {
        contains: [
          "import DS from 'ember-data';",
          'export default DS.Transform.extend({\n' +
          '  deserialize(serialized) {\n' +
          '    return serialized;\n' +
          '  },\n' +
          '\n' +
          '  serialize(deserialized) {\n' +
          '    return deserialized;\n' +
          '  }\n' +
          '});'
        ]
      });
      assertFile('app/transforms/foo/bar.js', {
        contains: [
          "export { default } from 'my-addon/transforms/foo/bar';"
        ]
      });
      assertFile('tests/unit/transforms/foo/bar-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('transform:foo/bar'"
        ]
      });
    });
  });

  it('in-addon util foo-bar', function() {
    return generateInAddon(['util', 'foo-bar']).then(function() {
      assertFile('addon/utils/foo-bar.js', {
        contains: 'export default function fooBar() {\n' +
                  '  return true;\n' +
                  '}'
      });
      assertFile('app/utils/foo-bar.js', {
        contains: [
          "export { default } from 'my-addon/utils/foo-bar';"
        ]
      });
      assertFile('tests/unit/utils/foo-bar-test.js', {
        contains: [
          "import fooBar from 'dummy/utils/foo-bar';"
        ]
      });
    });
  });

  it('in-addon util foo-bar/baz', function() {
    return generateInAddon(['util', 'foo/bar-baz']).then(function() {
      assertFile('addon/utils/foo/bar-baz.js', {
        contains: 'export default function fooBarBaz() {\n' +
                  '  return true;\n' +
                  '}'
      });
      assertFile('app/utils/foo/bar-baz.js', {
        contains: [
          "export { default } from 'my-addon/utils/foo/bar-baz';"
        ]
      });
      assertFile('tests/unit/utils/foo/bar-baz-test.js', {
        contains: [
          "import fooBarBaz from 'dummy/utils/foo/bar-baz';"
        ]
      });
    });
  });

  it('in-addon service foo', function() {
    return generateInAddon(['service', 'foo']).then(function() {
      assertFile('addon/services/foo.js', {
        contains: [
          "import Ember from 'ember';",
          'export default Ember.Service.extend({\n});'
        ]
      });
      assertFile('app/services/foo.js', {
        contains: [
          "export { default } from 'my-addon/services/foo';"
        ]
      });
      assertFile('tests/unit/services/foo-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('service:foo'"
        ]
      });
    });
  });

  it('in-addon service foo/bar', function() {
    return generateInAddon(['service', 'foo/bar']).then(function() {
      assertFile('addon/services/foo/bar.js', {
        contains: [
          "import Ember from 'ember';",
          'export default Ember.Service.extend({\n});'
        ]
      });
      assertFile('app/services/foo/bar.js', {
        contains: [
          "export { default } from 'my-addon/services/foo/bar';"
        ]
      });
      assertFile('tests/unit/services/foo/bar-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('service:foo/bar'"
        ]
      });
    });
  });


  it('in-addon service-test foo', function() {
    return generateInAddon(['service-test', 'foo']).then(function() {
      assertFile('tests/unit/services/foo-test.js', {
        contains: [
          "import { moduleFor, test } from 'ember-qunit';",
          "moduleFor('service:foo'"
        ]
      });
      assertFileToNotExist('app/service-test/foo.js');
    });
  });

  it('in-addon addon-import cannot be called directly', function() {
    return generateInAddon(['addon-import', 'foo']).catch(function(error) {
      expect(error.message).to.include('You cannot call the addon-import blueprint directly.');
    });
  });

  it('in-addon addon-import component-addon works', function() {
    return generateInAddon(['component-addon', 'foo-bar', '--pod']).then(function() {
      assertFile('app/components/foo-bar/component.js', {
        contains: [
          "export { default } from 'my-addon/components/foo-bar/component';"
        ]
      });
    });
  });

  it('in-addon blueprint foo', function() {
    return generateInAddon(['blueprint', 'foo']).then(function() {
      assertFile('blueprints/foo/index.js', {
        contains: "module.exports = {\n" +
                  "  description: ''\n" +
                  "\n" +
                  "  // locals: function(options) {\n" +
                  "  //   // Return custom template variables here.\n" +
                  "  //   return {\n" +
                  "  //     foo: options.entity.options.foo\n" +
                  "  //   };\n" +
                  "  // }\n" +
                  "\n" +
                  "  // afterInstall: function(options) {\n" +
                  "  //   // Perform extra work here.\n" +
                  "  // }\n" +
                  "};"
        });
      });
    });

    it('in-addon blueprint foo/bar', function() {
      return generateInAddon(['blueprint', 'foo/bar']).then(function() {
        assertFile('blueprints/foo/bar/index.js', {
          contains: "module.exports = {\n" +
                    "  description: ''\n" +
                    "\n" +
                    "  // locals: function(options) {\n" +
                    "  //   // Return custom template variables here.\n" +
                    "  //   return {\n" +
                    "  //     foo: options.entity.options.foo\n" +
                    "  //   };\n" +
                    "  // }\n" +
                    "\n" +
                    "  // afterInstall: function(options) {\n" +
                    "  //   // Perform extra work here.\n" +
                    "  // }\n" +
                    "};"
        });
      });
    });

    it('in-addon http-mock foo', function() {
      return generateInAddon(['http-mock', 'foo']).then(function() {
        assertFile('server/index.js', {
          contains:"mocks.forEach(function(route) { route(app); });"
        });
        assertFile('server/mocks/foo.js', {
          contains: "module.exports = function(app) {\n" +
                    "  var express = require('express');\n" +
                    "  var fooRouter = express.Router();\n" +
                    "\n" +
                    "  fooRouter.get('/', function(req, res) {\n" +
                    "    res.send({\n" +
                    "      'foo': []\n" +
                    "    });\n" +
                    "  });\n" +
                    "\n" +
                    "  fooRouter.post('/', function(req, res) {\n" +
                    "    res.status(201).end();\n" +
                    "  });\n" +
                    "\n" +
                    "  fooRouter.get('/:id', function(req, res) {\n" +
                    "    res.send({\n" +
                    "      'foo': {\n" +
                    "        id: req.params.id\n" +
                    "      }\n" +
                    "    });\n" +
                    "  });\n" +
                    "\n" +
                    "  fooRouter.put('/:id', function(req, res) {\n" +
                    "    res.send({\n" +
                    "      'foo': {\n" +
                    "        id: req.params.id\n" +
                    "      }\n" +
                    "    });\n" +
                    "  });\n" +
                    "\n" +
                    "  fooRouter.delete('/:id', function(req, res) {\n" +
                    "    res.status(204).end();\n" +
                    "  });\n" +
                    "\n" +
                    "  // The POST and PUT call will not contain a request body\n" +
                    "  // because the body-parser is not included by default.\n" +
                    "  // To use req.body, run:\n" +
                    "\n" +
                    "  //    npm install --save-dev body-parser\n" +
                    "\n" +
                    "  // After installing, you need to `use` the body-parser for\n" +
                    "  // this mock uncommenting the following line:\n" +
                    "  //\n" +
                    "  //app.use('/api/foo', require('body-parser').json());\n" +
                    "  app.use('/api/foo', fooRouter);\n" +
                    "};"
        });
        assertFile('server/.jshintrc', {
          contains: '{\n  "node": true\n}'
        });
      });
    });

    it('in-addon http-mock foo-bar', function() {
      return generateInAddon(['http-mock', 'foo-bar']).then(function() {
        assertFile('server/index.js', {
          contains: "mocks.forEach(function(route) { route(app); });"
        });
        assertFile('server/mocks/foo-bar.js', {
          contains: "module.exports = function(app) {\n" +
                    "  var express = require('express');\n" +
                    "  var fooBarRouter = express.Router();\n" +
                    "\n" +
                    "  fooBarRouter.get('/', function(req, res) {\n" +
                    "    res.send({\n" +
                    "      'foo-bar': []\n" +
                    "    });\n" +
                    "  });\n" +
                    "\n" +
                    "  fooBarRouter.post('/', function(req, res) {\n" +
                    "    res.status(201).end();\n" +
                    "  });\n" +
                    "\n" +
                    "  fooBarRouter.get('/:id', function(req, res) {\n" +
                    "    res.send({\n" +
                    "      'foo-bar': {\n" +
                    "        id: req.params.id\n" +
                    "      }\n" +
                    "    });\n" +
                    "  });\n" +
                    "\n" +
                    "  fooBarRouter.put('/:id', function(req, res) {\n" +
                    "    res.send({\n" +
                    "      'foo-bar': {\n" +
                    "        id: req.params.id\n" +
                    "      }\n" +
                    "    });\n" +
                    "  });\n" +
                    "\n" +
                    "  fooBarRouter.delete('/:id', function(req, res) {\n" +
                    "    res.status(204).end();\n" +
                    "  });\n" +
                    "\n" +
                    "  // The POST and PUT call will not contain a request body\n" +
                    "  // because the body-parser is not included by default.\n" +
                    "  // To use req.body, run:\n" +
                    "\n" +
                    "  //    npm install --save-dev body-parser\n" +
                    "\n" +
                    "  // After installing, you need to `use` the body-parser for\n" +
                    "  // this mock uncommenting the following line:\n" +
                    "  //\n" +
                    "  //app.use('/api/foo-bar', require('body-parser').json());\n" +
                    "  app.use('/api/foo-bar', fooBarRouter);\n" +
                    "};"
        });
        assertFile('server/.jshintrc', {
          contains: '{\n  "node": true\n}'
        });
      });
    });

    it('in-addon http-proxy foo', function() {
      return generateInAddon(['http-proxy', 'foo', 'http://localhost:5000']).then(function() {
        assertFile('server/index.js', {
          contains: "proxies.forEach(function(route) { route(app); });"
        });
        assertFile('server/proxies/foo.js', {
          contains: "var proxyPath = '/foo';\n" +
                    "\n" +
                    "module.exports = function(app) {\n" +
                    "  // For options, see:\n" +
                    "  // https://github.com/nodejitsu/node-http-proxy\n" +
                    "  var proxy = require('http-proxy').createProxyServer({});\n" +
                    "\n" +
                    "  proxy.on('error', function(err, req) {\n" +
                    "    console.error(err, req.url);\n" +
                    "  });\n" +
                    "\n" +
                    "  app.use(proxyPath, function(req, res, next){\n" +
                    "    // include root path in proxied request\n" +
                    "    req.url = proxyPath + '/' + req.url;\n" +
                    "    proxy.web(req, res, { target: 'http://localhost:5000' });\n" +
                    "  });\n" +
                    "};"
        });
        assertFile('server/.jshintrc', {
          contains: '{\n  "node": true\n}'
        });
      });
    });

    it('in-addon server', function() {
      return generateInAddon(['server']).then(function() {
        assertFile('server/index.js');
        assertFile('server/.jshintrc');
      });
    });

    it('in-addon acceptance-test foo', function() {
      return generateInAddon(['acceptance-test', 'foo']).then(function() {
        var expected = path.join(__dirname, '../fixtures/generate/addon-acceptance-test-expected.js');

        assertFileEquals('tests/acceptance/foo-test.js', expected);
        assertFileToNotExist('app/acceptance-tests/foo.js');
      });
    });

    it('in-addon acceptance-test foo/bar', function() {
      return generateInAddon(['acceptance-test', 'foo/bar']).then(function() {
        var expected = path.join(__dirname, '../fixtures/generate/addon-acceptance-test-nested-expected.js');

        assertFileEquals('tests/acceptance/foo/bar-test.js', expected);
        assertFileToNotExist('app/acceptance-tests/foo/bar.js');
      });
    });
});
