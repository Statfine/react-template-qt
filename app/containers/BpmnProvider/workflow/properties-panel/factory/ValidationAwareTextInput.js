const textField = require('./TextInputEntryFactory');

/**
 * This function is a wrapper around TextInputEntryFactory.
 * It adds functionality to cache an invalid value entered in the
 * text input, instead of setting it on the business object.
 */
const validationAwareTextField = function (options, defaultParameters) {
  const modelProperty = options.modelProperty;

  defaultParameters.get = function (element, node) {
    const value = this.__lastInvalidValue;

    delete this.__lastInvalidValue;

    const properties = {};

    properties[modelProperty] =
      value !== undefined ? value : options.getProperty(element, node);

    return properties;
  };

  defaultParameters.set = function (element, values, node) {
    const validationErrors = validate.apply(this, [element, values, node]);
    const propertyValue = values[modelProperty];

    // make sure we do not update the id
    if (validationErrors && validationErrors[modelProperty]) {
      this.__lastInvalidValue = propertyValue;

      return options.setProperty(element, {}, node);
    }
    const properties = {};

    properties[modelProperty] = propertyValue;

    return options.setProperty(element, properties, node);
  };

  var validate = (defaultParameters.validate = function (
    element,
    values,
    node,
  ) {
    const value = values[modelProperty] || this.__lastInvalidValue;

    const property = {};
    property[modelProperty] = value;

    return options.validate(element, property, node);
  });

  return textField(options, defaultParameters);
};

module.exports = validationAwareTextField;
