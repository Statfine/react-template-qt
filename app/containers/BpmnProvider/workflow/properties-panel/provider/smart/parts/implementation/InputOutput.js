

const getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

const elementHelper = require('../../../../helper/ElementHelper');
const extensionElementsHelper = require('../../../../helper/ExtensionElementsHelper');
const inputOutputHelper = require('../../../../helper/InputOutputHelper');
const cmdHelper = require('../../../../helper/CmdHelper');

const extensionElementsEntry = require('./ExtensionElements');


function getInputOutput(element, insideConnector) {
  return inputOutputHelper.getInputOutput(element, insideConnector);
}

function getConnector(element) {
  return inputOutputHelper.getConnector(element);
}

function getInputParameters(element, insideConnector) {
  return inputOutputHelper.getInputParameters(element, insideConnector);
}

function getOutputParameters(element, insideConnector) {
  return inputOutputHelper.getOutputParameters(element, insideConnector);
}

function getInputParameter(element, insideConnector, idx) {
  return inputOutputHelper.getInputParameter(element, insideConnector, idx);
}

function getOutputParameter(element, insideConnector, idx) {
  return inputOutputHelper.getOutputParameter(element, insideConnector, idx);
}


function createElement(type, parent, factory, properties) {
  return elementHelper.createElement(type, properties, parent, factory);
}

function createInputOutput(parent, bpmnFactory, properties) {
  return createElement('smart:InputOutput', parent, bpmnFactory, properties);
}

function createParameter(type, parent, bpmnFactory, properties) {
  return createElement(type, parent, bpmnFactory, properties);
}


function ensureInputOutputSupported(element, insideConnector) {
  return inputOutputHelper.isInputOutputSupported(element, insideConnector);
}

function ensureOutparameterSupported(element, insideConnector) {
  return inputOutputHelper.areOutputParametersSupported(element, insideConnector);
}

module.exports = function(element, bpmnFactory, options, translate) {

  const TYPE_LABEL = {
    'smart:Map': translate('Map'),
    'smart:List': translate('List'),
    'smart:Script': translate('Script')
  };

  options = options || {};

  const insideConnector = !!options.insideConnector;
  const idPrefix = options.idPrefix || '';

  const getSelected = function(element, node) {
    let selection = (inputEntry && inputEntry.getSelected(element, node)) || { idx: -1 };

    let parameter = getInputParameter(element, insideConnector, selection.idx);
    if (!parameter && outputEntry) {
      selection = outputEntry.getSelected(element, node);
      parameter = getOutputParameter(element, insideConnector, selection.idx);
    }
    return parameter;
  };

  const result = {
    getSelectedParameter: getSelected
  };

  const entries = result.entries = [];

  if (!ensureInputOutputSupported(element)) {
    return result;
  }

  const newElement = function(type, prop, factory) {

    return function(element, extensionElements, value) {
      const commands = [];

      let inputOutput = getInputOutput(element, insideConnector);
      if (!inputOutput) {
        const parent = !insideConnector ? extensionElements : getConnector(element);
        inputOutput = createInputOutput(parent, bpmnFactory, {
          inputParameters: [],
          outputParameters: []
        });

        if (!insideConnector) {
          commands.push(cmdHelper.addAndRemoveElementsFromList(
            element,
            extensionElements,
            'values',
            'extensionElements',
            [ inputOutput ],
            []
          ));
        } else {
          commands.push(cmdHelper.updateBusinessObject(element, parent, { inputOutput }));
        }
      }

      const newElem = createParameter(type, inputOutput, bpmnFactory, { name: value });
      commands.push(cmdHelper.addElementsTolist(element, inputOutput, prop, [ newElem ]));

      return commands;
    };
  };

  const removeElement = function(getter, prop, otherProp) {
    return function(element, extensionElements, value, idx) {
      const inputOutput = getInputOutput(element, insideConnector);
      const parameter = getter(element, insideConnector, idx);

      const commands = [];
      commands.push(cmdHelper.removeElementsFromList(element, inputOutput, prop, null, [ parameter ]));

      const firstLength = inputOutput.get(prop).length-1;
      const secondLength = (inputOutput.get(otherProp) || []).length;

      if (!firstLength && !secondLength) {

        if (!insideConnector) {
          commands.push(extensionElementsHelper.removeEntry(getBusinessObject(element), element, inputOutput));
        } else {
          const connector = getConnector(element);
          commands.push(cmdHelper.updateBusinessObject(element, connector, { inputOutput: undefined }));
        }

      }

      return commands;
    };
  };

  const setOptionLabelValue = function(getter) {
    return function(element, node, option, property, value, idx) {
      const parameter = getter(element, insideConnector, idx);

      let suffix = 'Text';

      const definition = parameter.get('definition');
      if (typeof definition !== 'undefined') {
        const type = definition.$type;
        suffix = TYPE_LABEL[type];
      }

      option.text = `${value || ''  } : ${  suffix}`;
    };
  };


  // input parameters ///////////////////////////////////////////////////////////////

  var inputEntry = extensionElementsEntry(element, bpmnFactory, {
    id: `${idPrefix  }inputs`,
    label: translate('Input Parameters'),
    modelProperty: 'name',
    prefix: 'Input',
    resizable: true,

    createExtensionElement: newElement('smart:InputParameter', 'inputParameters'),
    removeExtensionElement: removeElement(getInputParameter, 'inputParameters', 'outputParameters'),

    getExtensionElements(element) {
      return getInputParameters(element, insideConnector);
    },

    onSelectionChange(element, node, event, scope) {
      outputEntry && outputEntry.deselect(element, node);
    },

    setOptionLabelValue: setOptionLabelValue(getInputParameter)

  });
  entries.push(inputEntry);


  // output parameters ///////////////////////////////////////////////////////

  if (ensureOutparameterSupported(element, insideConnector)) {
    var outputEntry = extensionElementsEntry(element, bpmnFactory, {
      id: `${idPrefix  }outputs`,
      label: translate('Output Parameters'),
      modelProperty: 'name',
      prefix: 'Output',
      resizable: true,

      createExtensionElement: newElement('smart:OutputParameter', 'outputParameters'),
      removeExtensionElement: removeElement(getOutputParameter, 'outputParameters', 'inputParameters'),

      getExtensionElements(element) {
        return getOutputParameters(element, insideConnector);
      },

      onSelectionChange(element, node, event, scope) {
        inputEntry.deselect(element, node);
      },

      setOptionLabelValue: setOptionLabelValue(getOutputParameter)

    });
    entries.push(outputEntry);
  }

  return result;

};
