const formCreator = require('./form_creator.js');
const formValidation = require('./form_validation.js');
const ValueValidation = require('./value_validation');

module.exports.form = formCreator;
module.exports.validations = formValidation;

module.exports.validateValues = (formConfig, values) => (
  new ValueValidation(formConfig, values).check()
);

