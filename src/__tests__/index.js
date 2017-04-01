const reactConfigurableForm = require('../index');
const renderer = require('react-test-renderer');

test('both validation and form creator should be exposed', () => {
  expect(reactConfigurableForm.form).toBeDefined();
  expect(reactConfigurableForm.validations).toBeDefined();
});
