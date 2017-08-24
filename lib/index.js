'use strict';

var formCreator = require('./form_creator.js');
var formValidation = require('./form_validation.js');
var ValueValidation = require('./value_validation');

module.exports.form = formCreator;
module.exports.validations = formValidation;

module.exports.validateValues = function (formConfig, values) {
  return new ValueValidation(formConfig, values).check();
};