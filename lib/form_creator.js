'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = require('react');
var FormValidation = require('./form_validation');
var FormConditional = require('./form_conditional');
var _ = require('lodash');

var ReactForm = function (_React$PureComponent) {
  _inherits(ReactForm, _React$PureComponent);

  function ReactForm() {
    _classCallCheck(this, ReactForm);

    var _this = _possibleConstructorReturn(this, (ReactForm.__proto__ || Object.getPrototypeOf(ReactForm)).call(this));

    _this._formSubmit = _this._formSubmit.bind(_this);
    _this.state = {
      elementsConf: {},
      validForm: true
    };
    return _this;
  }

  _createClass(ReactForm, [{
    key: '_formSubmit',
    value: function _formSubmit(e) {
      var _this2 = this;

      e.preventDefault();
      var response = {};
      _.each(this.props.formConfig.order, function (elementName) {
        _this2._createResponseObject(elementName, response);
      });
      this.props.formConfig.action.submit(e, response);
    }
  }, {
    key: '_createResponseObject',
    value: function _createResponseObject(elementName, response) {
      var _this3 = this;

      var attr = this._getAttributes(elementName);
      if (attr.dontShow) {
        return;
      }
      if (this.state.elementsConf[elementName].type === 'composite') {
        _.each(this.state.elementsConf[elementName].children, function (child) {
          _this3._createResponseObject(child, response);
        });
        return;
      }
      var output = this._performValidation(elementName);
      response[elementName] = {};
      response[elementName].value = this.state.elementsConf[elementName].value;
      if (!_.every(output.validationErrors, function (hasError) {
        return !hasError;
      })) {
        response[elementName].validationErrors = output.validationErrors;
      }
    }
  }, {
    key: '_handleChange',
    value: function _handleChange(elementName, e) {
      var elemConf = _.assign({}, this.state.elementsConf);
      if (elemConf[elementName].type === 'checkbox') {
        elemConf[elementName].value = e.target.checked;
        this.setState({ elementsConf: elemConf });
        this.props.formConfig.action.validation(this._performValidation(elementName));
      } else {
        elemConf[elementName].value = e.target.value;
        this.setState({ elementsConf: elemConf });
        if (elemConf[elementName].type === 'radio' || elemConf[elementName].type === 'select') {
          this.props.formConfig.action.validation(this._performValidation(elementName));
        }
      }
      if (this.props.formConfig.disableSubmitWhenUnValidated) {
        this._validatedForm();
      }
    }
  }, {
    key: '_performValidation',
    value: function _performValidation(elementName) {
      var _this4 = this;

      var conf = this.props.formConfig.elements[elementName];
      var output = {
        validationErrors: {},
        elementName: elementName
      };
      if (conf.validations && conf.validations.length > 0) {
        _.each(conf.validations, function (vType) {
          if (typeof vType === 'string') {
            if (FormValidation[vType] && typeof FormValidation[vType] === 'function') {
              output.validationErrors[vType] = !FormValidation[vType](_this4.state.elementsConf[elementName].value);
            } else {
              output.validationErrors[vType] = false;
            }
          } else if (vType instanceof Array && typeof vType[0] === 'string') {
            if (typeof vType[1] === 'function') {
              output.validationErrors[vType[0]] = !vType[1](_this4.state.elementsConf[elementName].value);
            } else if (FormValidation[vType[0]] && typeof FormValidation[vType[0]] === 'function') {
              var args = [_this4.state.elementsConf[elementName].value];
              args = args.concat(vType.slice(1));
              output.validationErrors[vType[0]] = !FormValidation[vType[0]].apply(null, args);
            } else {
              output.validationErrors[vType[0]] = false;
            }
          }
        });
      }
      return output;
    }
  }, {
    key: '_handleBlur',
    value: function _handleBlur(elementName) {
      if (['checkbox', 'radio', 'select'].indexOf(this.state.elementsConf[elementName].type) !== -1) {
        return;
      }

      var eachElemConf = this.state.elementsConf[elementName];
      if (eachElemConf.modifyFunc && typeof eachElemConf.modifyFunc === 'function') {
        var elemConf = _.assign({}, this.state.elementsConf);
        var _eachElemConf = elemConf[elementName];
        _eachElemConf.value = _eachElemConf.modifyFunc(_eachElemConf.value);
        this.setState({ elementsConf: elemConf });
      }

      this.props.formConfig.action.validation(this._performValidation(elementName));
    }
  }, {
    key: '_getAttributes',
    value: function _getAttributes(elementName) {
      var _this5 = this;

      var conf = this.state.elementsConf[elementName];
      var attributes = conf.attributes || {};
      var condBool = void 0;
      if (conf.condition) {
        condBool = FormConditional.check(conf.condition, function (param) {
          return _this5.state.elementsConf[param].value;
        }, elementName);
        if (condBool) {
          attributes = _.assign({}, attributes, conf.conditionalAttributes);
        }
      }
      return attributes;
    }
  }, {
    key: '_generateRadioBoxHtml',
    value: function _generateRadioBoxHtml(elementName, conf, elementId, attrSpread) {
      var _this6 = this;

      var radios = _.map(conf.options, function (optionLabel, optionKey) {
        var valueId = optionKey + '_' + elementId;
        var checked = conf.value === optionKey;
        return React.createElement(
          'div',
          _extends({}, attrSpread, { key: valueId }),
          React.createElement('input', {
            type: conf.type,
            name: elementName,
            value: optionKey,
            onChange: _this6._handleChange.bind(_this6, elementName),
            id: valueId,
            checked: checked
          }),
          React.createElement(
            'label',
            { htmlFor: valueId },
            optionLabel
          )
        );
      });
      return radios;
    }
  }, {
    key: '_generateSelectHtml',
    value: function _generateSelectHtml(elementName, conf, elementId, attrSpread) {
      var options = _.map(conf.options, function (optionLabel, optionKey) {
        var valueId = optionKey + '_' + elementId;

        return React.createElement(
          'option',
          { key: valueId, value: optionKey },
          optionLabel
        );
      });
      return React.createElement(
        'select',
        _extends({
          name: elementName,
          onChange: this._handleChange.bind(this, elementName)
        }, attrSpread, {
          value: conf.value
        }),
        options
      );
    }
  }, {
    key: '_generateInputHtml',
    value: function _generateInputHtml(elementName, conf, elementId, attrSpread) {
      if (conf.type === 'checkbox') {
        attrSpread.checked = conf.value;
      }
      return React.createElement('input', _extends({
        type: conf.type,
        name: elementName,
        placeholder: conf.placeholder,
        value: this.state.elementsConf[elementName].value,
        onBlur: this._handleBlur.bind(this, elementName),
        onChange: this._handleChange.bind(this, elementName),
        id: elementId
      }, attrSpread));
    }
  }, {
    key: '_generateCompositeElement',
    value: function _generateCompositeElement(elementName, conf, elementId, attrSpread) {
      var _this7 = this;

      var comboHtml = _.map(conf.children, function (childName) {
        return _this7._generateElementHtml(childName);
      });
      return React.createElement(
        'ul',
        _extends({ name: elementName }, attrSpread, { id: elementId }),
        comboHtml
      );
    }
  }, {
    key: '_validatedForm',
    value: function _validatedForm() {
      var _this8 = this;

      var response = {};
      _.each(this.props.formConfig.order, function (elementName) {
        _this8._createResponseObject(elementName, response);
      });
      var isValid = _.isEmpty(_.find(response, function (respObj) {
        var validationErrors = _.get(respObj, 'validationErrors', []);
        return !!_.find(validationErrors, function (r) {
          return r;
        });
      }));
      this.setState({
        validForm: isValid
      });
    }
  }, {
    key: '_generateElementHtml',
    value: function _generateElementHtml(elementName) {
      var attrSpread = {};
      var conf = this.state.elementsConf[elementName];
      var attr = this._getAttributes(elementName);
      var wrapperClassName = '';
      var label = '';
      var labelPosition = 'prefix';
      var prefixLabel = '';
      var suffixLabel = '';
      var elementId = conf.id;
      var elementHtml = void 0;
      if (conf.type === 'submit' && this.props.formConfig.disableSubmitWhenUnValidated) {
        if (this.state.validForm) {
          delete attr.disabled;
        } else {
          attr.disabled = 'disabled';
        }
      }

      /* eslint-disable no-restricted-syntax, no-prototype-builtins */
      for (var key in attr) {
        if (attr.hasOwnProperty(key)) {
          switch (key) {
            case 'dontShow':
              return null;
            case 'wrapperClassName':
              wrapperClassName = attr.wrapperClassName;
              break;
            case 'label':
              elementId = elementId || _.uniqueId(elementName + '_');
              label = React.createElement(
                'label',
                { htmlFor: elementId },
                attr.label
              );
              break;
            case 'labelPosition':
              labelPosition = attr.labelPosition;
              break;
            default:
              attrSpread[key] = attr[key];
          }
        }
        /* eslint-enable no-restricted-syntax, no-prototype-builtins */
      }
      if (label !== '') {
        if (labelPosition === 'prefix') {
          prefixLabel = label;
        } else {
          suffixLabel = label;
        }
      }

      switch (conf.type) {
        case 'radio':
          elementHtml = this._generateRadioBoxHtml(elementName, conf, elementId, attrSpread);
          break;
        case 'select':
          elementHtml = this._generateSelectHtml(elementName, conf, elementId, attrSpread);
          break;
        case 'composite':
          elementHtml = this._generateCompositeElement(elementName, conf, elementId, attrSpread);
          break;
        default:
          elementHtml = this._generateInputHtml(elementName, conf, elementId, attrSpread);
      }

      return React.createElement(
        'li',
        { key: elementName, className: wrapperClassName },
        prefixLabel,
        elementHtml,
        suffixLabel
      );
    }
  }, {
    key: 'constructElementsConf',
    value: function constructElementsConf(nextProps) {
      var elementsConf = {};
      var props = nextProps || this.props;
      _.each(props.formConfig.elements, function (conf, elementName) {
        conf.value = conf.value !== undefined ? conf.value : '';
        elementsConf[elementName] = _.assign({}, conf);
      });

      this.setState({ elementsConf: elementsConf });
    }
  }, {
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.constructElementsConf();
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (this.props.formConfig.disableSubmitWhenUnValidated) {
        this._validatedForm();
      }
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(props) {
      var _this9 = this;

      var elementsConf = {};
      _.each(props.formConfig.elements, function (conf, elementName) {
        if (_this9.state.elementsConf[elementName]) {
          conf.value = _this9.state.elementsConf[elementName].value;
        }
        elementsConf[elementName] = _.assign({}, conf);
      });

      this.setState({ elementsConf: elementsConf });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this10 = this;

      var formElements = _.map(this.props.formConfig.order, function (elementName) {
        return _this10._generateElementHtml(elementName);
      });
      return React.createElement(
        'div',
        { className: this.props.formConfig.className },
        React.createElement(
          'form',
          { onSubmit: this._formSubmit },
          React.createElement(
            'ul',
            null,
            formElements
          )
        )
      );
    }
  }]);

  return ReactForm;
}(React.PureComponent);

module.exports = ReactForm;