/*!
 * comment.js
 * Copyright (c) 2014 Denis Ciccale (@tdecs)
 * Released under the MIT license
 * https://github.com/dciccale/comment.js/blob/master/LICENSE.txt
 */

'use strict';

var path = require('path');
var fs = require('fs');
var dot = require('dot');

var utils = require('./utils');

var REGEX_DOT_PARTIAL_EXT = /\.def(\.dot|\.jst)?$/;

// Returns an object map containing the precompiled templates {templateName: templateFunction}
var Template = function (options) {
  var templates;

  this.path = options.path;
  this.prettify = options.prettify;

  // pre-compile templates
  templates = this._precompile();

  return templates;
};

// Returns the content of a template
Template.prototype._getTemplate = function (name) {
  return utils.file.read(path.join(this.path, name));
};

// Reads partial templates and map them into an object to be passed to the main template
Template.prototype._getPartials = function () {
  var partialsdir = path.join(this.path, 'partials');
  var partials = {};

  utils._.forEach(fs.readdirSync(partialsdir), function (filename) {
    var filepath = path.join(partialsdir, filename);
    var name;

    if (REGEX_DOT_PARTIAL_EXT.test(filename)) {
      name = filename.replace(REGEX_DOT_PARTIAL_EXT, '');
      partials[name] = utils.file.read(filepath);
    }
  }, this);

  return partials;
};

// Pre-compile templates
Template.prototype._precompile = function () {
  var templates = {};

  // Get partials used in the main template
  var partials = this._getPartials();

  // Pre-compile the main template along with the partials
  templates.main = dot.compile(this._getTemplate('main.dot'), partials);

  // Get and pre-compile the src template if needed
  if (this.prettify) {
    templates.src = dot.template(this._getTemplate('src.dot'));
  }

  return templates;
};

module.exports = Template;
