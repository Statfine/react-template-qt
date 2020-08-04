

const is = require('bpmn-js/lib/util/ModelUtil').is;
const getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject;

const extensionElementsEntry = require('./ExtensionElements');
const extensionElementsHelper = require('../../../../helper/ExtensionElementsHelper');
const cmdHelper = require('../../../../helper/CmdHelper');
const elementHelper = require('../../../../helper/ElementHelper');
const ImplementationTypeHelper = require('../../../../helper/ImplementationTypeHelper');


function getListeners(bo, type) {
  return bo && extensionElementsHelper.getExtensionElements(bo, type) || [];
}

const SMART_EXECUTION_LISTENER_ELEMENT = 'smart:ExecutionListener';
const SMART_TASK_LISTENER_ELEMENT = 'smart:TaskListener';

module.exports = function(element, bpmnFactory, options, translate) {

  const LISTENER_TYPE_LABEL = {
    class: translate('Java Class'),
    expression: translate('Expression'),
    delegateExpression: translate('Delegate Expression'),
    script: translate('Script')
  };

  let bo;

  const result = {
    getSelectedListener
  };

  const entries = result.entries = [];

  const isSequenceFlow = ImplementationTypeHelper.isSequenceFlow(element);

  function getSelectedListener(element, node) {
    let selection = (executionListenerEntry && executionListenerEntry.getSelected(element, node)) || { idx: -1 };

    let listener = getListeners(bo, SMART_EXECUTION_LISTENER_ELEMENT)[selection.idx];
    if (!listener && taskListenerEntry) {
      selection = taskListenerEntry.getSelected(element, node);
      listener = getListeners(bo, SMART_TASK_LISTENER_ELEMENT)[selection.idx];
    }
    return listener;
  }

  const setOptionLabelValue = function(type) {
    return function(element, node, option, property, value, idx) {
      const listeners = getListeners(bo, type);
      const listener = listeners[idx];
      const listenerType = ImplementationTypeHelper.getImplementationType(listener);

      const event = (listener.get('event')) ? listener.get('event') : '<empty>';

      const label = `${event || '*'  } : ${  LISTENER_TYPE_LABEL[listenerType] || ''}`;

      option.text = label;
    };
  };

  const newElement = function(element, type, initialEvent) {
    return function(element, extensionElements, value) {
      const props = {
        event: initialEvent,
        class: ''
      };

      const newElem = elementHelper.createElement(type, props, extensionElements, bpmnFactory);

      return cmdHelper.addElementsTolist(element, extensionElements, 'values', [ newElem ]);
    };
  };

  const removeElement = function(element, type) {
    return function(element, extensionElements, value, idx) {
      const listeners = getListeners(bo, type);
      const listener = listeners[idx];
      if (listener) {
        return extensionElementsHelper.removeEntry(bo, element, listener);
      }
    };
  };


  // Execution Listener

  if (is(element, 'bpmn:FlowElement') || is(element, 'bpmn:Process') || is(element, 'bpmn:Participant')) {
    bo = getBusinessObject(element);
    if (is(element, 'bpmn:Participant')) {
      element = element.processRef;
      bo = bo.get('processRef');
    }

    if (bo) {

      var executionListenerEntry = extensionElementsEntry(element, bpmnFactory, {
        id : 'executionListeners',
        label : translate('Execution Listener'),
        modelProperty: 'name',
        idGeneration: 'false',
        reference: 'processRef',

        createExtensionElement: newElement(element, SMART_EXECUTION_LISTENER_ELEMENT, (isSequenceFlow) ? 'take' : 'ACTIVITY_START'),
        removeExtensionElement: removeElement(element, SMART_EXECUTION_LISTENER_ELEMENT),

        getExtensionElements(element) {
          return getListeners(bo, SMART_EXECUTION_LISTENER_ELEMENT);
        },

        onSelectionChange(element, node, event, scope) {
          taskListenerEntry && taskListenerEntry.deselect(element, node);
        },

        setOptionLabelValue: setOptionLabelValue(SMART_EXECUTION_LISTENER_ELEMENT)

      });
      entries.push(executionListenerEntry);

    }
  }


  // Task Listener

  if (is(element, 'bpmn:UserTask')) {
    bo = getBusinessObject(element);

    var taskListenerEntry = extensionElementsEntry(element, bpmnFactory, {
      id : 'taskListeners',
      label : translate('Task Listener'),
      modelProperty: 'name',
      idGeneration: 'false',

      createExtensionElement: newElement(element, SMART_TASK_LISTENER_ELEMENT, 'create'),
      removeExtensionElement: removeElement(element, SMART_TASK_LISTENER_ELEMENT),

      getExtensionElements(element) {
        return getListeners(bo, SMART_TASK_LISTENER_ELEMENT);
      },

      onSelectionChange(element, node, event, scope) {
        executionListenerEntry.deselect(element, node);
      },

      setOptionLabelValue: setOptionLabelValue(SMART_TASK_LISTENER_ELEMENT)

    });
    entries.push(taskListenerEntry);
  }

  return result;

};
