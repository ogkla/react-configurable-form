const _ = require('lodash');
const FormConditional = require('./form_conditional');
const FormValidation = require('./form_validation');

class ValueValidation {
  constructor(formConfig, fieldValues) {
    this._formConfig = formConfig;
    this._fieldValues = fieldValues;
    this._elementsConfig = _.get(formConfig, 'elements');
    this._error = [];
    this._hasError = false;
  }
  check() {
    const eleOrder = _.get(this._formConfig, 'order');

    _.each(eleOrder, (elementName) => {
      this._validateElement(elementName);
    });
    return {
      hasError: this._hasError,
      validations: this._error,
    };
  }

  _getAttributes(elementName) {
    const eleConf = this._elementsConfig[elementName];
    let attributes = eleConf.attributes || {};
    let condBool;
    if (eleConf.condition) {
      condBool = FormConditional.check(eleConf.condition, param =>
        this._fieldValues[param].value, elementName);
      if (condBool) {
        attributes = _.assign({}, attributes, eleConf.conditionalAttributes);
      }
    }
    return attributes;
  }

  _validateElement(elementName) {
    const attr = this._getAttributes(elementName);
    if (attr && attr.dontShow) {
      return;
    }
    const eleConf = this._elementsConfig[elementName];
    this._performValidation(elementName);
    if (eleConf.type === 'composite') {
      _.each(eleConf.children, (childKey) => {
        this._validateElement(childKey);
      });
    }
  }

  _performValidation(elementName) {
    const conf = this._elementsConfig[elementName];
    const output = {
      validationErrors: {},
      elementName,
    };
    if (conf.validations && conf.validations.length > 0) {
      _.each(conf.validations, (vType) => {
        if (typeof vType === 'string') {
          if (FormValidation[vType] && typeof FormValidation[vType] === 'function') {
            output.validationErrors[vType] =
              !FormValidation[vType](this._fieldValues[elementName]);
          } else {
            output.validationErrors[vType] = false;
          }
        } else if (vType instanceof Array && typeof vType[0] === 'string') {
          if (typeof vType[1] === 'function') {
            output.validationErrors[vType[0]] =
              !vType[1](this._fieldValues[elementName]);
          } else if (FormValidation[vType[0]] && typeof FormValidation[vType[0]] === 'function') {
            let args = [this._fieldValues[elementName]];
            args = args.concat(vType.slice(1));
            output.validationErrors[vType[0]] = !FormValidation[vType[0]].apply(null, args);
          } else {
            output.validationErrors[vType[0]] = false;
          }
        }
      });
    }
    if (!_.isEmpty(output.validationErrors) && _.some(output.validationErrors)) {
      this._hasError = true;
    }
    this._error[elementName] = output;
  }

}
module.exports = ValueValidation;
