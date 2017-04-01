var _ = require('lodash');
var supportedOps = ["eq", "neq", "gt", "lt", "gte", "lte"];
class FormConditional {
  static check (condition, elementCallback, currentElement) {
    var outputBool;
    if (condition['gate']) {
      outputBool = FormConditional._evaluateLogicGates(condition, elementCallback);
    } else if (condition.func && typeof condition.func[0] === 'function') {
      var params = _.map(condition.func, (value, index) => {
        if (index === 0) {
          return elementCallback(currentElement);
        } else {
          return elementCallback(value);
        }
      });
      outputBool = condition.func[0].apply(null, params);
    }
    return outputBool;
  }

  static _evaluateLogicGates (condition, elementCallback) {
    var output, gate = condition['gate'];
    if (!condition.inputExpr || typeof condition.inputExpr !== 'object') {
      throw "Input expression not proper";
    }
    if (gate === "not") {
      return !this._evaluateInputExpr(condition.inputExpr, elementCallback);
    }
    if (gate !== 'and' && gate !== 'or') {
      throw "Currently only and, or and not are supported";
    }
    _.map(condition.inputExpr, exprUnit => {
      var exprOutput;
      if (exprUnit['gate']) {
        exprOutput = FormConditional._evaluateLogicGates(exprUnit, elementCallback)
      } else {
        exprOutput = FormConditional._evaluateInputExpr(exprUnit, elementCallback)
      }
      if (output === undefined) {
        output = exprOutput;
      } else {
        if (gate === 'or') {
          output = output || exprOutput;
        } else if (gate === 'and') {
          output = output && exprOutput;
        }
      }
    });
    return output;
  }

  static _evaluateInputExpr (inputExpr, elementCallback) {
    if (!inputExpr.element) {
      throw "Invalid expression";
    }
    var op, comparisonValue, elemValue = elementCallback(inputExpr['element']), outputBool;
    if (inputExpr.constant !== undefined) {
      comparisonValue = inputExpr.constant;
    } else if (inputExpr.comparisonElement) {
      comparisonValue = elementCallback(inputExpr.comparisonElement);
      if (/^[0-9]+$/.test(comparisonValue)) {
        comparisonValue = parseInt(comparisonValue);
      }
    } else {
      throw "Invalid expression. either constant or comparisonElement is required";
    }

    if (/^[0-9]+$/.test(elemValue)) {
      elemValue = parseInt(elemValue);
    }



    op = inputExpr.op;

    if (supportedOps.indexOf(op) === -1) {
      throw "Only following ops are supported: eq, gt, lt, gte, lte";
    }

    switch(op) {
      case "eq":
        outputBool = elemValue == comparisonValue;
        break;
      case "neq":
        outputBool = elemValue != comparisonValue;
        break;
      case "gt":
        outputBool = elemValue > comparisonValue;
        break;
      case "lt":
        outputBool = elemValue < comparisonValue;
        break;
      case "gte":
        outputBool = elemValue >= comparisonValue;
        break;
      case "lte":
        outputBool = elemValue <= comparisonValue;
        break;
    }
    return outputBool
  }
}
module.exports = FormConditional;
