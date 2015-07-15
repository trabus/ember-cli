/*jshint node:true*/
var addPackageTemplateCompiler = require('../../lib/utilities/add-package-template-compiler');
var path                       = require('path');

module.exports = {
  description: 'Generates a template.',
  
  afterInstall: function(options) {
  
    if (options.project.isEmberCLIAddon() || options.inRepoAddon) {
      var projectRoot = options.inRepoAddon ? path.join(this.project.root, 'lib', options.inRepoAddon) : this.project.root;
      
      return addPackageTemplateCompiler(projectRoot);
    }
  } 
};
