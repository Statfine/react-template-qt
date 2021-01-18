const is = require('bpmn-js/lib/util/ModelUtil').is;

const entryFactory = require('../../../../factory/EntryFactory');

const asyncCapableHelper = require('../../../../helper/AsyncCapableHelper');

const elementHelper = require('../../../../helper/ElementHelper');
const eventDefinitionHelper = require('../../../../helper/EventDefinitionHelper');
const cmdHelper = require('../../../../helper/CmdHelper');

function isAsyncBefore(bo) {
  return asyncCapableHelper.isAsyncBefore(bo);
}

function isAsyncAfter(bo) {
  return asyncCapableHelper.isAsyncAfter(bo);
}

function getFailedJobRetryTimeCycle(bo) {
  return asyncCapableHelper.getFailedJobRetryTimeCycle(bo);
}

function removeFailedJobRetryTimeCycle(bo, element) {
  return asyncCapableHelper.removeFailedJobRetryTimeCycle(bo, element);
}

function createExtensionElements(parent, bpmnFactory) {
  return elementHelper.createElement(
    'bpmn:ExtensionElements',
    { values: [] },
    parent,
    bpmnFactory,
  );
}

function createFailedJobRetryTimeCycle(parent, bpmnFactory, cycle) {
  return elementHelper.createElement(
    'smart:FailedJobRetryTimeCycle',
    { body: cycle },
    parent,
    bpmnFactory,
  );
}

module.exports = function(element, bpmnFactory, options, translate) {
  const getBusinessObject = options.getBusinessObject;

  const idPrefix = options.idPrefix || '';
  const labelPrefix = options.labelPrefix || '';

  const retryTimeCycleEntry = entryFactory.textField({
    id: `${idPrefix}retryTimeCycle`,
    label: labelPrefix + translate('Retry Time Cycle'),
    modelProperty: 'cycle',

    get(element, node) {
      const retryTimeCycle = getFailedJobRetryTimeCycle(
        getBusinessObject(element),
      );
      const value = retryTimeCycle && retryTimeCycle.get('body');
      return {
        cycle: value,
      };
    },

    set(element, values, node) {
      const newCycle = values.cycle;
      const bo = getBusinessObject(element);

      if (newCycle === '' || typeof newCycle === 'undefined') {
        // remove retry time cycle element(s)
        return removeFailedJobRetryTimeCycle(bo, element);
      }

      let retryTimeCycle = getFailedJobRetryTimeCycle(bo);

      if (!retryTimeCycle) {
        // add new retry time cycle element
        const commands = [];

        let extensionElements = bo.get('extensionElements');
        if (!extensionElements) {
          extensionElements = createExtensionElements(bo, bpmnFactory);
          commands.push(
            cmdHelper.updateBusinessObject(element, bo, { extensionElements }),
          );
        }

        retryTimeCycle = createFailedJobRetryTimeCycle(
          extensionElements,
          bpmnFactory,
          newCycle,
        );
        commands.push(
          cmdHelper.addAndRemoveElementsFromList(
            element,
            extensionElements,
            'values',
            'extensionElements',
            [retryTimeCycle],
            [],
          ),
        );

        return commands;
      }

      // update existing retry time cycle element
      return cmdHelper.updateBusinessObject(element, retryTimeCycle, {
        body: newCycle,
      });
    },

    hidden(element) {
      const bo = getBusinessObject(element);

      if (bo && (isAsyncBefore(bo) || isAsyncAfter(bo))) {
        return false;
      }

      if (is(element, 'bpmn:Event')) {
        return !eventDefinitionHelper.getTimerEventDefinition(element);
      }

      return true;
    },
  });

  return [retryTimeCycleEntry];
};
