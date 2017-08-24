'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require('lodash');
var FormConditional = require('./form_conditional');
var FormValidation = require('./form_validation');

var ValueValidation = function () {
  function ValueValidation(formConfig, fieldValues) {
    _classCallCheck(this, ValueValidation);

    this._formConfig = formConfig;
    this._fieldValues = fieldValues;
    this._elementsConfig = _.get(formConfig, 'elements');
    this._error = [];
    this._hasError = false;
  }

  _createClass(ValueValidation, [{
    key: 'check',
    value: function check() {
      var _this = this;

      var eleOrder = _.get(this._formConfig, 'order');

      _.each(eleOrder, function (elementName) {
        _this._validateElement(elementName);
      });
      return {
        hasError: this._hasError,
        validations: this._error
      };
    }
  }, {
    key: '_getAttributes',
    value: function _getAttributes(elementName) {
      var _this2 = this;

      var eleConf = this._elementsConfig[elementName];
      var attributes = eleConf.attributes || {};
      var condBool = void 0;
      if (eleConf.condition) {
        condBool = FormConditional.check(eleConf.condition, function (param) {
          return _this2._fieldValues[param].value;
        }, elementName);
        if (condBool) {
          attributes = _.assign({}, attributes, eleConf.conditionalAttributes);
        }
      }
      return attributes;
    }
  }, {
    key: '_validateElement',
    value: function _validateElement(elementName) {
      var _this3 = this;

      var attr = this._getAttributes(elementName);
      if (attr && attr.dontShow) {
        return;
      }
      var eleConf = this._elementsConfig[elementName];
      this._performValidation(elementName);
      if (eleConf.type === 'composite') {
        _.each(eleConf.children, function (childKey) {
          _this3._validateElement(childKey);
        });
      }
    }
  }, {
    key: '_performValidation',
    value: function _performValidation(elementName) {
      var _this4 = this;

      var conf = this._elementsConfig[elementName];
      var output = {
        validationErrors: {},
        elementName: elementName
      };
      if (conf.validations && conf.validations.length > 0) {
        _.each(conf.validations, function (vType) {
          if (typeof vType === 'string') {
            if (FormValidation[vType] && typeof FormValidation[vType] === 'function') {
              output.validationErrors[vType] = !FormValidation[vType](_this4._fieldValues[elementName]);
            } else {
              output.validationErrors[vType] = false;
            }
          } else if (vType instanceof Array && typeof vType[0] === 'string') {
            if (typeof vType[1] === 'function') {
              output.validationErrors[vType[0]] = !vType[1](_this4._fieldValues[elementName]);
            } else if (FormValidation[vType[0]] && typeof FormValidation[vType[0]] === 'function') {
              var args = [_this4._fieldValues[elementName]];
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
  }]);

  return ValueValidation;
}();

module.exports = ValueValidation;