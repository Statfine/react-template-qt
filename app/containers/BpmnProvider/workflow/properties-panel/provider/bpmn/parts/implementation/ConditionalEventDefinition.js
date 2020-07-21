

const entryFactory = require('../../../../factory/EntryFactory');
const cmdHelper = require('../../../../helper/CmdHelper');

const is = require('bpmn-js/lib/util/ModelUtil').is;
const isEventSubProcess = require('bpmn-js/lib/util/DiUtil').isEventSubProcess;

module.exports = function(group, element, bpmnFactory, conditionalEventDefinition, elementRegistry, translate) {

  const getValue = function(modelProperty) {
    return function(element) {
      const modelPropertyValue = conditionalEventDefinition.get(`camunda:${  modelProperty}`);
      const value = {};

      value[modelProperty] = modelPropertyValue;
      return value;
    };
  };

  const setValue = function(modelProperty) {
    return function(element, values) {
      const props = {};

      props[`camunda:${  modelProperty}`] = values[modelProperty] || undefined;

      return cmdHelper.updateBusinessObject(element, conditionalEventDefinition, props);
    };
  };

  group.entries.push(entryFactory.textField({
    id: 'variableName',
    label: translate('Variable Name'),
    modelProperty : 'variableName',

    get: getValue('variableName'),
    set: setValue('variableName')
  }));

  const isConditionalStartEvent =
    is(element, 'bpmn:StartEvent') && !isEventSubProcess(element.parent);

  if (!isConditionalStartEvent) {
    group.entries.push(entryFactory.textField({
      id: 'variableEvent',
      label: translate('Variable Event'),
      description: translate('Specify more than one variable change event as a comma separated list.'),
      modelProperty : 'variableEvent',

      get: getValue('variableEvent'),
      set: setValue('variableEvent')
    }));
  }
};
