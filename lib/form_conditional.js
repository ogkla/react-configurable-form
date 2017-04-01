'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require('lodash');

var supportedOps = ['eq', 'neq', 'gt', 'lt', 'gte', 'lte'];

var FormConditional = function () {
  function FormConditional() {
    _classCallCheck(this, FormConditional);
  }

  _createClass(FormConditional, null, [{
    key: 'check',
    value: function check(condition, elementCallback, currentElement) {
      var outputBool = void 0;
      if (condition.gate) {
        outputBool = FormConditional._evaluateLogicGates(condition, elementCallback);
      } else if (condition.func && typeof condition.func[0] === 'function') {
        var params = _.map(condition.func, function (value, index) {
          if (index === 0) {
            return elementCallback(currentElement);
          }
          return elementCallback(value);
        });
        outputBool = condition.func[0].apply(null, params);
      }
      return outputBool;
    }
  }, {
    key: '_evaluateLogicGates',
    value: function _evaluateLogicGates(condition, elementCallback) {
      var output = void 0;
      var gate = condition.gate;
      if (!condition.inputExpr || _typeof(condition.inputExpr) !== 'object') {
        throw new Error('Input expression not proper');
      }
      if (gate === 'not') {
        return !this._evaluateInputExpr(condition.inputExpr, elementCallback);
      }
      if (gate !== 'and' && gate !== 'or') {
        throw new Error('Currently only and, or and not are supported');
      }
      _.map(condition.inputExpr, function (exprUnit) {
        var exprOutput = void 0;
        if (exprUnit.gate) {
          exprOutput = FormConditional._evaluateLogicGates(exprUnit, elementCallback);
        } else {
          exprOutput = FormConditional._evaluateInputExpr(exprUnit, elementCallback);
        }
        if (output === undefined) {
          output = exprOutput;
        } else if (gate === 'or') {
          output = output || exprOutput;
        } else if (gate === 'and') {
          output = output && exprOutput;
        }
      });
      return output;
    }
  }, {
    key: '_evaluateInputExpr',
    value: function _evaluateInputExpr(inputExpr, elementCallback) {
      if (!inputExpr.element) {
        throw new Error('Invalid expression');
      }
      var comparisonValue = void 0;
      var elemValue = elementCallback(inputExpr.element);
      var outputBool = void 0;
      if (inputExpr.constant !== undefined) {
        comparisonValue = inputExpr.constant;
      } else if (inputExpr.comparisonElement) {
        comparisonValue = elementCallback(inputExpr.comparisonElement);
        if (/^[0-9]+$/.test(comparisonValue)) {
          comparisonValue = parseInt(comparisonValue, 10);
        }
      } else {
        throw new Error('Invalid expression. either constant or comparisonElement is required');
      }

      if (/^[0-9]+$/.test(elemValue)) {
        elemValue = parseInt(elemValue, 10);
      }

      var op = inputExpr.op;

      if (supportedOps.indexOf(op) === -1) {
        throw new Error('Only following ops are supported: eq, gt, lt, gte, lte');
      }

      switch (op) {
        case 'eq':
          outputBool = elemValue === comparisonValue;
          break;
        case 'neq':
          outputBool = elemValue !== comparisonValue;
          break;
        case 'gt':
          outputBool = elemValue > comparisonValue;
          break;
        case 'lt':
          outputBool = elemValue < comparisonValue;
          break;
        case 'gte':
          outputBool = elemValue >= comparisonValue;
          break;
        case 'lte':
          outputBool = elemValue <= comparisonValue;
          break;
        default:
        // no default value
      }
      return outputBool;
    }
  }]);

  return FormConditional;
}();

module.exports = FormConditional;