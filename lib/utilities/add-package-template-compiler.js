'use strict';

var fs      = require('fs-extra');
var path    = require('path');
var Promise = require('../ext/promise');

module.exports = function addPackageTemplateCompiler(rootPath, compilerName) {
  var compilerPackageName = compilerName || 'ember-cli-htmlbars';
  var packagePath         = path.join(rootPath, 'package.json');
  var contents            = JSON.parse(fs.readFileSync(packagePath, { encoding: 'utf8' }));
  
  var version = contents.devDependencies[compilerPackageName] || null;
  
  // if we've already added it, return
  if (contents.dependencies[compilerPackageName]) {
    return Promise.resolve(true);
  }
  
  // if we already had it as a devDependency, move to dependencies
  if (version) {
    try {
      console.log('writing contents:', compilerPackageName, version)
      contents.dependencies[compilerPackageName] = version;
      delete contents.devDependencies[compilerPackageName];
      // write the content to the package
      fs.writeFileSync(packagePath, JSON.stringify(contents, null, 2));
    } catch (err) {
      console.log('um, err',err)
      Promise.reject(err);
    }
  } else {
    // we have to add the package through npm install
    
  }
  return Promise.resolve(true);
};