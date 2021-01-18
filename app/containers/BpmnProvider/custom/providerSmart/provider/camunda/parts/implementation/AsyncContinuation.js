const assign = require('lodash/assign');

const entryFactory = require('../../../../factory/EntryFactory');

const asyncCapableHelper = require('../../../../helper/AsyncCapableHelper');
const eventDefinitionHelper = require('../../../../helper/EventDefinitionHelper');
const cmdHelper = require('../../../../helper/CmdHelper');

function isAsyncBefore(bo) {
  return asyncCapableHelper.isAsyncBefore(bo);
}

function isAsyncAfter(bo) {
  return asyncCapableHelper.isAsyncAfter(bo);
}

function isExclusive(bo) {
  return asyncCapableHelper.isExclusive(bo);
}

function removeFailedJobRetryTimeCycle(bo, element) {
  return asyncCapableHelper.removeFailedJobRetryTimeCycle(bo, element);
}

function canRemoveFailedJobRetryTimeCycle(element) {
  return !eventDefinitionHelper.getTimerEventDefinition(element);
}

module.exports = function(element, bpmnFactory, options, translate) {
  const getBusinessObject = options.getBusinessObject;

  const idPrefix = options.idPrefix || '';
  const labelPrefix = options.labelPrefix || '';

  const asyncBeforeEntry = entryFactory.checkbox({
    id: `${idPrefix}asyncBefore`,
    label: labelPrefix + translate('Asynchronous Before'),
    modelProperty: 'asyncBefore',

    get(element, node) {
      const bo = getBusinessObject(element);
      return {
        asyncBefore: isAsyncBefore(bo),
      };
    },

    set(element, values) {
      const bo = getBusinessObject(element);
      const asyncBefore = !!values.asyncBefore;

      let props = {
        'smart:asyncBefore': asyncBefore,
        'smart:async': false,
      };

      const commands = [];
      if (!isAsyncAfter(bo) && !asyncBefore) {
        props = assign({ 'smart:exclusive': true }, props);
        if (canRemoveFailedJobRetryTimeCycle(element)) {
          commands.push(removeFailedJobRetryTimeCycle(bo, element));
        }
      }

      commands.push(cmdHelper.updateBusinessObject(element, bo, props));
      return commands;
    },
  });

  const asyncAfterEntry = entryFactory.checkbox({
    id: `${idPrefix}asyncAfter`,
    label: labelPrefix + translate('Asynchronous After'),
    modelProperty: 'asyncAfter',

    get(element, node) {
      const bo = getBusinessObject(element);
      return {
        asyncAfter: isAsyncAfter(bo),
      };
    },

    set(element, values) {
      const bo = getBusinessObject(element);
      const asyncAfter = !!values.asyncAfter;

      let props = {
        'smart:asyncAfter': asyncAfter,
      };

      const commands = [];
      if (!isAsyncBefore(bo) && !asyncAfter) {
        props = assign({ 'smart:exclusive': true }, props);
        if (canRemoveFailedJobRetryTimeCycle(element)) {
          commands.push(removeFailedJobRetryTimeCycle(bo, element));
        }
      }

      commands.push(cmdHelper.updateBusinessObject(element, bo, props));
      return commands;
    },
  });

  const exclusiveEntry = entryFactory.checkbox({
    id: `${idPrefix}exclusive`,
    label: labelPrefix + translate('Exclusive'),
    modelProperty: 'exclusive',

    get(element, node) {
      const bo = getBusinessObject(element);
      return { exclusive: isExclusive(bo) };
    },

    set(element, values) {
      const bo = getBusinessObject(element);
      return cmdHelper.updateBusinessObject(element, bo, {
        'smart:exclusive': !!values.exclusive,
      });
    },

    hidden(element) {
      const bo = getBusinessObject(element);
      return bo && !isAsyncAfter(bo) && !isAsyncBefore(bo);
    },
  });

  return [asyncBeforeEntry, asyncAfterEntry, exclusiveEntry];
};
