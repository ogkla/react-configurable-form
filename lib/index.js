'use strict';

var formCreator = require('./form_creator.js');
var formValidation = require('./form_validation.js');

module.exports.form = formCreator;
module.exports.validations = formValidation;