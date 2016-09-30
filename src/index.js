var React = require('react');
var FormValidation = require('./form_validation');
var FormConditional = require('./form_conditional');
var _ = require('lodash');


class ReactForm extends React.Component {
  constructor () {
    super();
    this.formSubmit = this.formSubmit.bind(this);
    this.state = {
      elementsConf: {}
    };
  }

  formSubmit(e) {
    e.preventDefault();
    var response = {};
    this.props.formConfig.order.map(elementName => {
      var attr = this.getAttributes(elementName);
      if (attr.dontShow) {
        return;
      }
      var output = this._performValidation(elementName);
      response[elementName] = {};
      response[elementName].value = this.state.elementsConf[elementName].value;
      if (!_.every(output.validationErrors, (hasError => !hasError))) {
        response[elementName].validationErrors = output.validationErrors;
      }
    });
    this.props.formConfig.action.submit(e, response);

  }

  handleChange(elementName, e) {
    var elemConf = _.assign({}, this.state.elementsConf);
    if (elemConf[elementName].type === "checkbox") {
      elemConf[elementName].value = e.target.checked;
      this.setState({elementsConf: elemConf});
      this.props.formConfig.action.validation(this._performValidation(elementName));
    } else {
      elemConf[elementName].value = e.target.value;
      this.setState({elementsConf: elemConf});
      if (elemConf[elementName].type === "radio" || elemConf[elementName].type === "select") {
        this.props.formConfig.action.validation(this._performValidation(elementName));
      }
    }
  }


  _performValidation(elementName) {
    var conf = this.props.formConfig.elements[elementName];
    var output = {
      validationErrors: {},
      elementName: elementName
    };
    if (conf.validations && conf.validations.length > 0) {
      conf.validations.map(vType => {
        if (typeof vType === 'string') {
          if (FormValidation[vType] && typeof FormValidation[vType] === 'function') {
            output.validationErrors[vType] = !FormValidation[vType](this.state.elementsConf[elementName].value);
          } else {
            output.validationErrors[vType] = false;
          }
        } else if (vType instanceof Array && typeof vType[0] === 'string' ) {
          if (typeof vType[1] === 'function') {
            output.validationErrors[vType[0]] = !vType[1](this.state.elementsConf[elementName].value);
          } else if (FormValidation[vType[0]] && typeof FormValidation[vType[0]] === 'function') {
            var args = [this.state.elementsConf[elementName].value];
            args.concat(vType.slice(1));
            output.validationErrors[vType[0]] = !FormValidation[vType[0]].apply(null, args);
          } else {
            output.validationErrors[vType[0]] = false;
          }
        }
      });
    }
    return output;
  }

  handleBlur(elementName, e) {
    if (["checkbox", "radio", "select"].indexOf(this.state.elementsConf[elementName].type) !== -1) {
      return;
    }
    this.props.formConfig.action.validation(this._performValidation(elementName));
  }
  componentWillMount() {
    var elementsConf = {};
    this.props.formConfig.order.map(elementName => {
      var conf = this.props.formConfig.elements[elementName];
      conf.value = conf.value !== undefined ? conf.value : '';
      elementsConf[elementName] = _.assign({}, conf);
    });

    this.setState({elementsConf: elementsConf});
  }

  getAttributes(elementName) {
    var conf = this.state.elementsConf[elementName];
    var attributes = conf.attributes || {}, condBool;
    if (conf.condition) {
      condBool = FormConditional.check(conf.condition, param => this.state.elementsConf[param].value, elementName);
      if (condBool) {
       attributes =  _.assign(attributes, conf.conditionalAttributes)
      }
    }
    return attributes;
  }

  generateRadioBoxHtml(elementName, conf, elementId, attrSpread) {
    var radios = _.map(conf.options, (optionLabel, optionKey) => {
      var valueId = optionKey + '_' +elementId,
      checked;
      if (conf.value === optionKey) {
        checked = 'checked';
      }
      return (
        <div {...attrSpread} key = {valueId}>
          <input
              type = {conf.type}
              name = {elementName}
              value = {optionKey}
              onChange = {this.handleChange.bind(this, elementName)}
              id = {valueId}
              checked = {checked}
              />
          <label htmlFor={valueId}>{optionLabel}</label>
        </div>
      );
    });
    return radios;
  }

  generateSelectHtml(elementName, conf, elementId, attrSpread) {
    var options = _.map(conf.options, (optionLabel, optionKey) => {
      var valueId = optionKey + '_' +elementId;

      return (
          <option key = {valueId} value = {optionKey}>{optionLabel}</option>
      );
    });
    return (
      <select
        name = {elementName}
        onChange = {this.handleChange.bind(this, elementName)}
        {...attrSpread}
        value = {conf.value}
        >
        {options}
      </select>
    );
  }

  generateInputHtml(elementName, conf, elementId, attrSpread) {
    return (
      <input
            type = {conf.type}
            name = {elementName}
            placeholder = {conf.placeholder}
            value = {this.state.elementsConf[elementName].value}
            onBlur = {this.handleBlur.bind(this, elementName)}
            onChange = {this.handleChange.bind(this, elementName)}
            id = {elementId}
            {...attrSpread}
            />
    );
  }
  generateElementHtml(elementName) {
    var attrSpread = {}, dontShow;
      var conf = this.state.elementsConf[elementName];
      var attr = this.getAttributes(elementName);
      var wrapperClassName = '';
      var label = '';
      var labelPosition = 'prefix';
      var prefixLabel = '';
      var suffixLabel = '';
      var elementId = conf.id;
      var elementHtml;


      for (var key in attr) {
        if (attr.hasOwnProperty(key)) {
          switch(key) {
            case "dontShow":
              return null;
            case "wrapperClassName":
              wrapperClassName = attr.wrapperClassName;
              break;
            case "label":
              elementId = elementId ? elementId : _.uniqueId(elementName + "_");
              label = <label htmlFor={elementId}>{attr.label}</label>;
              break;
            case "labelPosition":
              labelPosition = attr.labelPosition;
              break;
            default:
              attrSpread[key] = attr[key];
          }
        }
      }
      if (label !== "") {
        if (labelPosition === 'prefix') {
          prefixLabel = label;
        } else {
          suffixLabel = label;
        }
      }

      switch(conf.type) {
        case "radio":
          elementHtml = this.generateRadioBoxHtml(elementName, conf, elementId, attrSpread);
          break;
        case "select":
          elementHtml = this.generateSelectHtml(elementName, conf, elementId, attrSpread);
          break;
        default:
          elementHtml = this.generateInputHtml(elementName, conf, elementId, attrSpread);
      }

      return (
        <li key={elementName} className={wrapperClassName}>
          {prefixLabel}
          {elementHtml}
          {suffixLabel}
        </li>
      );
  }

  render() {
    var formElements = this.props.formConfig.order.map(elementName => {
      return this.generateElementHtml(elementName);
    });
    return (
      <div>
        <form onSubmit={this.formSubmit}>
          <ul>
            {formElements}
          </ul>
        </form>
      </div>
    )
  }
}
module.exports = ReactForm;
