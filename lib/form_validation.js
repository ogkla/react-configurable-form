'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FormValidation = function () {
  function FormValidation() {
    _classCallCheck(this, FormValidation);
  }

  _createClass(FormValidation, null, [{
    key: 'email',
    value: function email(value) {
      var regex = new RegExp('^\\S+@\\S+\\.\\S+$', 'i');
      return regex.test(value);
    }
  }, {
    key: 'domain',
    value: function domain(value) {
      /* eslint-disable no-useless-escape */
      var regex = new RegExp('^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$');
      /* eslint-enable no-useless-escape */
      return regex.test(value);
    }
  }, {
    key: 'regexCheck',
    value: function regexCheck(value, regex, flags) {
      var regexObj = new RegExp(regex, flags);
      return regexObj.test(value);
    }
  }, {
    key: 'isNumber',
    value: function isNumber(value) {
      var regex = new RegExp(/^[0-9]+$/);
      return regex.test(value);
    }
  }, {
    key: 'range',
    value: function range(value, minimum, maximum, inclusive) {
      inclusive = inclusive || false;
      return inclusive ? value >= minimum && value <= maximum : value > minimum && value < maximum;
    }
  }, {
    key: 'lengthRange',
    value: function lengthRange(value, minimumLen, maximumLen) {
      value = value || '';
      return value.length > minimumLen && value.length < maximumLen;
    }
  }, {
    key: 'empty',
    value: function empty(value) {
      return !value || value.length === 0;
    }
  }, {
    key: 'mandatory',
    value: function mandatory(value) {
      return value && value.length > 0;
    }
  }]);

  return FormValidation;
}();

module.exports = FormValidation;