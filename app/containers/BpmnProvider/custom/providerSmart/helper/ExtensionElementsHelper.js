const cmdHelper = require('./CmdHelper');
const elementHelper = require('./ElementHelper');

const is = require('bpmn-js/lib/util/ModelUtil').is;

const ExtensionElementsHelper = {};

const getExtensionElements = function(bo) {
  return bo.get('extensionElements');
};

ExtensionElementsHelper.getExtensionElements = function(bo, type) {
  const extensionElements = getExtensionElements(bo);
  if (typeof extensionElements !== 'undefined') {
    const extensionValues = extensionElements.get('values');
    if (typeof extensionValues !== 'undefined') {
      const elements = extensionValues.filter(function(value) {
        return is(value, type);
      });
      if (elements.length) {
        return elements;
      }
    }
  }
};

ExtensionElementsHelper.addEntry = function(bo, element, entry, bpmnFactory) {
  let extensionElements = bo.get('extensionElements');

  // if there is no extensionElements list, create one
  if (!extensionElements) {
    // TODO: Ask Daniel which operation costs more
    extensionElements = elementHelper.createElement(
      'bpmn:ExtensionElements',
      { values: [entry] },
      bo,
      bpmnFactory,
    );
    return { extensionElements };
  }
  // add new failedJobRetryExtensionElement to existing extensionElements list
  return cmdHelper.addElementsTolist(element, extensionElements, 'values', [
    entry,
  ]);
};

ExtensionElementsHelper.removeEntry = function(bo, element, entry) {
  const extensionElements = bo.get('extensionElements');

  if (!extensionElements) {
    // return an empty command when there is no extensionElements list
    return {};
  }

  return cmdHelper.removeElementsFromList(
    element,
    extensionElements,
    'values',
    'extensionElements',
    [entry],
  );
};

module.exports = ExtensionElementsHelper;
