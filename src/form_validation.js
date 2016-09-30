class FormValidation {
  static email (value) {
    var regex = new RegExp('^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$', 'i');
    return regex.test(value);
  }

  static domain (value) {
    var regex = new RegExp('^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$');
    return regex.test(value);
  }

  static regexCheck(value, regex, flags) {
    var regex = new RegExp(regex, flags)
    return regex.test(value);
  }

  static isNumber(value) {
    var regex = new RegExp(/^[0-9]+$/);
    return regex.test(value);
  }

  static range(value, minimum, maximum, inclusive) {
    inclusive = inclusive || false;
    return inclusive ? (value >= minimum && value <= maximum) : (value > minimum && value < maximum);
  }

  static lengthRange(value, minimumLen, maximumLen) {
    value = value || "";
    return value.length > minimumLen && value.length < maximumLen;
  }

  static empty (value) {
    return !value || value.length === 0;
  }

  static mandatory (value) {
    return value && value.length > 0;
  }

}
module.exports = FormValidation;
