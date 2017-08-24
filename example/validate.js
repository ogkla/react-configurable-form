const { validateValues } = require('../lib');
const config = {
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
};
const values = {
  email: 'golak@gmail.com',
  password: 'golak'
};
const val = validateValues(config, values);
console.log(val);
console.log(val.validations.email);
console.log(val.validations.password);