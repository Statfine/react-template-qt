

const entryFactory = require('../../../../factory/EntryFactory');
const cmdHelper = require('../../../../helper/CmdHelper');
const elementReferenceProperty = require('../../../../provider/bpmn/parts/implementation/ElementReferenceProperty');

module.exports = function(
  group, element, bpmnFactory, errorEventDefinition,
  showErrorCodeVariable, showErrorMessageVariable, translate
) {


  const getValue = function(modelProperty) {
    return function(element) {
      const modelPropertyValue = errorEventDefinition.get(`smart:${  modelProperty}`);
      const value = {};

      value[modelProperty] = modelPropertyValue;
      return value;
    };
  };

  const setValue = function(modelProperty) {
    return function(element, values) {
      const props = {};

      props[`smart:${  modelProperty}`] = values[modelProperty] || undefined;

      return cmdHelper.updateBusinessObject(element, errorEventDefinition, props);
    };
  };


  group.entries = group.entries.concat(
    elementReferenceProperty(element, errorEventDefinition, bpmnFactory, {
      id: 'error-element-message',
      label: translate('Error Message'),
      referenceProperty: 'errorRef',
      modelProperty: 'errorMessage'
    })
  );

  if (showErrorCodeVariable) {
    group.entries.push(entryFactory.textField({
      id: 'errorCodeVariable',
      label: translate('Error Code Variable'),
      modelProperty : 'errorCodeVariable',

      get: getValue('errorCodeVariable'),
      set: setValue('errorCodeVariable')
    }));
  }

  if (showErrorMessageVariable) {
    group.entries.push(entryFactory.textField({
      id: 'errorMessageVariable',
      label: translate('Error Message Variable'),
      modelProperty: 'errorMessageVariable',

      get: getValue('errorMessageVariable'),
      set: setValue('errorMessageVariable')
    }));
  }

};
