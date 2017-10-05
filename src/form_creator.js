const React = require('react');
const FormValidation = require('./form_validation');
const FormConditional = require('./form_conditional');
const _ = require('lodash');


class ReactForm extends React.PureComponent {
  constructor() {
    super();
    this._formSubmit = this._formSubmit.bind(this);
    this.state = {
      elementsConf: {},
      validForm: true,
    };
  }

  _formSubmit(e) {
    e.preventDefault();
    const response = {};
    _.each(this.props.formConfig.order, (elementName) => {
      this._createResponseObject(elementName, response);
    });
    this.props.formConfig.action.submit(e, response);
  }

  _createResponseObject(elementName, response) {
    const attr = this._getAttributes(elementName);
    if (attr.dontShow) {
      return;
    }
    if (this.state.elementsConf[elementName].type === 'composite') {
      _.each(this.state.elementsConf[elementName].children, (child) => {
        this._createResponseObject(child, response);
      });
      return;
    }
    const output = this._performValidation(elementName);
    response[elementName] = {};
    response[elementName].value = this.state.elementsConf[elementName].value;
    if (!_.every(output.validationErrors, (hasError => !hasError))) {
      response[elementName].validationErrors = output.validationErrors;
    }
  }

  _handleChange(elementName, e) {
    const elemConf = _.assign({}, this.state.elementsConf);
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


  _performValidation(elementName) {
    const conf = this.props.formConfig.elements[elementName];
    const output = {
      validationErrors: {},
      elementName,
    };
    if (conf.validations && conf.validations.length > 0) {
      _.each(conf.validations, (vType) => {
        if (typeof vType === 'string') {
          if (FormValidation[vType] && typeof FormValidation[vType] === 'function') {
            output.validationErrors[vType] =
              !FormValidation[vType](this.state.elementsConf[elementName].value);
          } else {
            output.validationErrors[vType] = false;
          }
        } else if (vType instanceof Array && typeof vType[0] === 'string') {
          if (typeof vType[1] === 'function') {
            output.validationErrors[vType[0]] =
              !vType[1](this.state.elementsConf[elementName].value);
          } else if (FormValidation[vType[0]] && typeof FormValidation[vType[0]] === 'function') {
            let args = [this.state.elementsConf[elementName].value];
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

  _handleBlur(elementName) {
    if (['checkbox', 'radio', 'select'].indexOf(this.state.elementsConf[elementName].type) !== -1) {
      return;
    }

    let eachElemConf = this.state.elementsConf[elementName];
    if (eachElemConf.modifyFunc && typeof eachElemConf.modifyFunc === 'function') {
      const elemConf = _.assign({}, this.state.elementsConf);
      eachElemConf = elemConf[elementName];
      eachElemConf.value = eachElemConf.modifyFunc(eachElemConf.value);
      this.setState({ elementsConf: elemConf });
    }

    this.props.formConfig.action.validation(this._performValidation(elementName));
  }


  _getAttributes(elementName) {
    const conf = this.state.elementsConf[elementName];
    let attributes = conf.attributes || {};
    let condBool;
    if (conf.condition) {
      condBool = FormConditional.check(conf.condition, param =>
        this.state.elementsConf[param].value, elementName);
      if (condBool) {
        attributes = _.assign({}, attributes, conf.conditionalAttributes);
      }
    }
    return attributes;
  }

  _generateRadioBoxHtml(elementName, conf, elementId, attrSpread) {
    const radios = _.map(conf.options, (optionLabel, optionKey) => {
      const valueId = `${optionKey}_${elementId}`;
      const checked = (conf.value === optionKey);
      return (
        <div {...attrSpread} key={valueId}>
          <input
            type={conf.type}
            name={elementName}
            value={optionKey}
            onChange={this._handleChange.bind(this, elementName)}
            id={valueId}
            checked={checked}
          />
          <label htmlFor={valueId}>{optionLabel}</label>
        </div>
      );
    });
    return radios;
  }

  _generateSelectHtml(elementName, conf, elementId, attrSpread) {
    const options = _.map(conf.options, (optionLabel, optionKey) => {
      const valueId = `${optionKey}_${elementId}`;

      return (
        <option key={valueId} value={optionKey}>{optionLabel}</option>
      );
    });
    return (
      <select
        name={elementName}
        onChange={this._handleChange.bind(this, elementName)}
        {...attrSpread}
        value={conf.value}
      >
        {options}
      </select>
    );
  }

  _generateInputHtml(elementName, conf, elementId, attrSpread) {
    if (conf.type === 'checkbox') {
      attrSpread.checked = conf.value;
    }
    return (
      <input
        type={conf.type}
        name={elementName}
        placeholder={conf.placeholder}
        value={this.state.elementsConf[elementName].value}
        onBlur={this._handleBlur.bind(this, elementName)}
        onChange={this._handleChange.bind(this, elementName)}
        id={elementId}
        {...attrSpread}
      />
    );
  }
  _generateCompositeElement(elementName, conf, elementId, attrSpread) {
    const comboHtml = _.map(conf.children, childName => this._generateElementHtml(childName));
    return (
      <ul name={elementName} {...attrSpread} id={elementId}>
        {comboHtml}
      </ul>
    );
  }

  _validatedForm() {
    const response = {};
    _.each(this.props.formConfig.order, (elementName) => {
      this._createResponseObject(elementName, response);
    });
    const isValid = _.isEmpty(_.find(response, (respObj) => {
      const validationErrors = _.get(respObj, 'validationErrors', []);
      return !!(_.find(validationErrors, r => r));
    }));
    this.setState({
      validForm: isValid,
    });
  }
  _generateElementHtml(elementName) {
    const attrSpread = {};
    const conf = this.state.elementsConf[elementName];
    const attr = this._getAttributes(elementName);
    let wrapperClassName = '';
    let label = '';
    let labelPosition = 'prefix';
    let prefixLabel = '';
    let suffixLabel = '';
    let elementId = conf.id;
    let elementHtml;
    if (conf.type === 'submit' && this.props.formConfig.disableSubmitWhenUnValidated) {
      if (this.state.validForm) {
        delete attr.disabled;
      } else {
        attr.disabled = 'disabled';
      }
    }

    /* eslint-disable no-restricted-syntax, no-prototype-builtins */
    for (const key in attr) {
      if (attr.hasOwnProperty(key)) {
        switch (key) {
          case 'dontShow':
            return null;
          case 'wrapperClassName':
            wrapperClassName = attr.wrapperClassName;
            break;
          case 'label':
            elementId = elementId || _.uniqueId(`${elementName}_`);
            label = <label htmlFor={elementId}>{attr.label}</label>;
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

    return (
      <li key={elementName} className={wrapperClassName}>
        {prefixLabel}
        {elementHtml}
        {suffixLabel}
      </li>
    );
  }
  constructElementsConf(nextProps) {
    const elementsConf = {};
    const props = nextProps || this.props;
    _.each(props.formConfig.elements, (conf, elementName) => {
      conf.value = conf.value !== undefined ? conf.value : '';
      elementsConf[elementName] = _.assign({}, conf);
    });

    this.setState({ elementsConf });
  }

  componentWillMount() {
    this.constructElementsConf();
  }
  componentDidMount() {
    if (this.props.formConfig.disableSubmitWhenUnValidated) {
      this._validatedForm();
    }
  }

  componentWillReceiveProps(props) {
    const elementsConf = {};
    _.each(props.formConfig.elements, (conf, elementName) => {
      if (this.state.elementsConf[elementName]) {
        conf.value = this.state.elementsConf[elementName].value;
      }
      elementsConf[elementName] = _.assign({}, conf);
    });


    this.setState({ elementsConf });
  }

  render() {
    const formElements = _.map(this.props.formConfig.order,
      elementName => this._generateElementHtml(elementName));
    return (
      <div className={this.props.formConfig.className}>
        <form onSubmit={this._formSubmit}>
          <ul>
            {formElements}
          </ul>
        </form>
      </div>
    );
  }
}
module.exports = ReactForm;
