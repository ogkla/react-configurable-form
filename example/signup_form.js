const React = require('react');
const Col = require('../grid/col.js');
const Row = require('../grid/row.js');
const Container = require('../grid/container.js');
const ReactForm = require('react-configurable-form');

class SignupForm extends React.Component {
  constructor() {
    super();
    this._formElementConfig = {
      elements: {
        email: {
          type: 'text',
          placeholder: 'Enter your email address',
          validations: [
            'email',
            'mandatory',
          ],
          attributes: {
            label: 'Email',
          },
        },
        password: {
          type: 'password',
          placeholder: 'Enter the password',
          validations: [
            'mandatory',
          ],
        },
        tos: {
          type: 'checkbox',
          attributes: {
            label: 'I agree to the terms of service',
            labelPosition: 'suffix',
          },
        },
        apps: {
          type: 'radio',
          options: {
            iphone: 'Iphone Apps',
            android: 'Android Apps',
          },
          attributes: {
            label: 'What apps do you have?',
          },
          value: 'android',
        },
        submit: {
          type: 'submit',
          value: 'Submit',
          condition: {
            gate: 'or',
            inputExpr: [
              {
                element: 'email',
                op: 'eq',
                constant: '',
              },
              {
                element: 'password',
                op: 'eq',
                constant: '',
              },
            ],
          },
          conditionalAttributes: {
            disabled: 'disabled',
          },
        },
      },
      order: ['email', 'password', 'apps', 'tos', 'submit'],
      action: {
        submit: this.onSubmit,
        validation: this.onValidation,
      },

    };
  }
  onValidation(options) {
    console.log(options);
  }

  onSubmit(e, elementValues, validationErrors) {
    console.log(elementValues);
    console.log(validationErrors);
    console.log('onsubmit');
    e.preventDefault();
  }

  render() {
    return (
      <ReactForm formConfig={this._formElementConfig} />
    );
  }
}
module.exports = SignupForm;
