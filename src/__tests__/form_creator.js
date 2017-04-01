const React = require('react');
const FormCreator = require('../form_creator');
const renderer = require('react-test-renderer');

test('check form creator can be rendered', () => {
  expect(FormCreator).toBeDefined();
  const formConfig = {
    elements: {
      email: {
        type: 'text',
        placeholder: 'email address please',
        validations: [
          'mandatory',
          'email',
        ],
        humanName: 'Email',
      },
      password: {
        type: 'password',
        placeholder: 'the password please',
        validations: [
          'mandatory',
        ],
        humanName: 'password',
      },
      domain: {
        type: 'text',
        placeholder: 'Domain please',
        validations: [
          'domain',
          'mandatory',
        ],
        humanName: 'domain',
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
    order: ['email', 'password', 'submit'],
    action: {
      submit() {
        console.log('submitted');
      },
      validation() {
        console.log('validated');
      },
    },
    className: 'delve-form login-form',
  };
  const component = renderer.create(
    <FormCreator formConfig={formConfig} />,
  );
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
