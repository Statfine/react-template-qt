const entryFactory = require('../../../../factory/EntryFactory');

const cmdHelper = require('../../../../helper/CmdHelper');

/**
 * Create an entry to modify a property of an element which
 * is referenced by a event definition.
 *
 * @param  {djs.model.Base} element
 * @param  {ModdleElement} definition
 * @param  {BpmnFactory} bpmnFactory
 * @param  {Object} options
 * @param  {string} options.id the id of the entry
 * @param  {string} options.label the label of the entry
 * @param  {string} options.referenceProperty the name of referencing property
 * @param  {string} options.modelProperty the name of property to modify
 * @param  {string} options.shouldValidate a flag indicate whether to validate or not
 *
 * @return {Array<Object>} return an array containing the entries
 */
module.exports = function (element, definition, bpmnFactory, options) {
  const id = options.id || 'element-property';
  const label = options.label;
  const referenceProperty = options.referenceProperty;
  const modelProperty = options.modelProperty || 'name';
  const shouldValidate = options.shouldValidate || false;

  const entry = entryFactory.textField({
    id,
    label,
    modelProperty,

    get(element, node) {
      const reference = definition.get(referenceProperty);
      const props = {};
      props[modelProperty] = reference && reference.get(modelProperty);
      return props;
    },

    set(element, values, node) {
      const reference = definition.get(referenceProperty);
      const props = {};
      props[modelProperty] = values[modelProperty] || undefined;
      return cmdHelper.updateBusinessObject(element, reference, props);
    },

    hidden(element, node) {
      return !definition.get(referenceProperty);
    },
  });

  if (shouldValidate) {
    entry.validate = function (element, values, node) {
      const reference = definition.get(referenceProperty);
      if (reference && !values[modelProperty]) {
        const validationErrors = {};
        validationErrors[modelProperty] = 'Must provide a value';
        return validationErrors;
      }
    };
  }

  return [entry];
};
