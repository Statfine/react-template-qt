const is = require('bpmn-js/lib/util/ModelUtil').is;

const find = require('min-dash').find;

const entryFactory = require('../../../factory/EntryFactory');

const cmdHelper = require('../../../helper/CmdHelper');
const ImplementationTypeHelper = require('../../../helper/ImplementationTypeHelper');
const scriptImplementation = require('./implementation/Script');
const timerImplementation = require('../../bpmn/parts/implementation/TimerEventDefinition');

module.exports = function (group, element, bpmnFactory, options, translate) {
  const LISTENER_TYPE_LABEL = {
    class: translate('Java Class'),
    expression: translate('Expression'),
    delegateExpression: translate('Delegate Expression'),
    script: translate('Script'),
  };

  options = options || {};

  const getSelectedListener = options.getSelectedListener;

  const classProp = 'class';
  const expressionProp = 'expression';
  const delegateExpressionProp = 'delegateExpression';
  const scriptProp = 'script';

  const executionListenerEventTypeOptions = ImplementationTypeHelper.isSequenceFlow(
    element,
  )
    ? [{ name: translate('take'), value: 'take' }]
    : [
        { name: translate('start'), value: 'start' },
        { name: translate('end'), value: 'end' },
      ];

  const taskListenerEventTypeOptions = [
    { name: translate('create'), value: 'create' },
    { name: translate('assignment'), value: 'assignment' },
    { name: translate('complete'), value: 'complete' },
    { name: translate('delete'), value: 'delete' },
    { name: translate('update'), value: 'update' },
    { name: translate('timeout'), value: 'timeout' },
  ];

  const isSelected = function (element, node) {
    return getSelectedListener(element, node);
  };

  // eventType ////////////////
  group.entries.push(
    entryFactory.selectBox({
      id: 'listener-event-type',
      label: translate('Event Type'),
      modelProperty: 'eventType',
      emptyParameter: false,

      get(element, node) {
        const listener = getSelectedListener(element, node);

        const eventType = listener && listener.get('event');

        return {
          eventType,
        };
      },

      set(element, values, node) {
        const eventType = values.eventType;
        const listener = getSelectedListener(element, node);
        let eventDefinitions = listener && listener.eventDefinitions;

        // ensure only timeout events can have timer event definitions
        if (eventDefinitions && eventType !== 'timeout') {
          eventDefinitions = [];
        }

        return cmdHelper.updateBusinessObject(element, listener, {
          event: eventType,
          eventDefinitions,
        });
      },

      selectOptions(element, node) {
        let eventTypeOptions;

        const selectedListener = getSelectedListener(element, node);
        if (ImplementationTypeHelper.isTaskListener(selectedListener)) {
          eventTypeOptions = taskListenerEventTypeOptions;
        } else if (
          ImplementationTypeHelper.isExecutionListener(selectedListener)
        ) {
          eventTypeOptions = executionListenerEventTypeOptions;
        }

        return eventTypeOptions;
      },

      hidden(element, node) {
        return !isSelected(element, node);
      },
    }),
  );

  // listenerId ///////////////
  group.entries.push(
    entryFactory.textField({
      id: 'listener-id',
      label: translate('Listener Id'),
      modelProperty: 'listenerId',

      get(element, node) {
        const value = {};
        const listener = getSelectedListener(element, node);

        value.listenerId = (listener && listener.get('id')) || undefined;

        return value;
      },

      set(element, values, node) {
        const update = {};
        const listener = getSelectedListener(element, node);

        update.id = values.listenerId || '';

        return cmdHelper.updateBusinessObject(element, listener, update);
      },

      hidden(element, node) {
        const listener = getSelectedListener(element, node);

        return !ImplementationTypeHelper.isTaskListener(listener);
      },

      validate(element, values, node) {
        const value = values.listenerId;
        const listener = getSelectedListener(element, node);
        const validate = {};

        if (!value && isTimeoutTaskListener(listener)) {
          validate.listenerId = translate(
            'Must provide a value for timeout task listener',
          );
        }

        return validate;
      },
    }),
  );

  // listenerType ///////////////
  group.entries.push(
    entryFactory.selectBox({
      id: 'listener-type',
      label: translate('Listener Type'),
      selectOptions: [
        { value: classProp, name: translate('Java Class') },
        { value: expressionProp, name: translate('Expression') },
        {
          value: delegateExpressionProp,
          name: translate('Delegate Expression'),
        },
        { value: scriptProp, name: translate('Script') },
      ],
      modelProperty: 'listenerType',
      emptyParameter: false,

      get(element, node) {
        const listener = getSelectedListener(element, node);
        return {
          listenerType: ImplementationTypeHelper.getImplementationType(
            listener,
          ),
        };
      },

      set(element, values, node) {
        const listener = getSelectedListener(element, node);
        const listenerType = values.listenerType || undefined;
        const update = {};

        update[classProp] = listenerType === classProp ? '' : undefined;
        update[expressionProp] =
          listenerType === expressionProp ? '' : undefined;
        update[delegateExpressionProp] =
          listenerType === delegateExpressionProp ? '' : undefined;
        update[scriptProp] =
          listenerType === scriptProp
            ? bpmnFactory.create('smart:Script')
            : undefined;

        return cmdHelper.updateBusinessObject(element, listener, update);
      },

      hidden(element, node) {
        return !isSelected(element, node);
      },
    }),
  );

  // listenerValue //////////////
  group.entries.push(
    entryFactory.textField({
      id: 'listener-value',
      dataValueLabel: 'listenerValueLabel',
      modelProperty: 'listenerValue',

      get(element, node) {
        const value = {};
        const listener = getSelectedListener(element, node);
        const listenerType = ImplementationTypeHelper.getImplementationType(
          listener,
        );

        value.listenerValueLabel = LISTENER_TYPE_LABEL[listenerType] || '';
        value.listenerValue =
          (listener && listener.get(listenerType)) || undefined;

        return value;
      },

      set(element, values, node) {
        const update = {};
        const listener = getSelectedListener(element, node);
        const listenerType = ImplementationTypeHelper.getImplementationType(
          listener,
        );

        update[listenerType] = values.listenerValue || '';

        return cmdHelper.updateBusinessObject(element, listener, update);
      },

      hidden(element, node) {
        const listener = getSelectedListener(element, node);
        return !listener || listener.script;
      },

      validate(element, values) {
        const value = values.listenerValue;
        const validate = {};

        if (!value) {
          validate.listenerValue = translate('Must provide a value');
        }

        return validate;
      },
    }),
  );

  // script ////////////////////
  const script = scriptImplementation('scriptFormat', 'value', true, translate);

  group.entries.push({
    id: 'listener-script-value',
    html: `<div data-show="isScript">${script.template}</div>`,

    get(element, node) {
      const listener = getSelectedListener(element, node);
      return listener && listener.script
        ? script.get(element, listener.script)
        : {};
    },

    set(element, values, node) {
      const listener = getSelectedListener(element, node);
      const update = script.set(element, values, listener);
      return cmdHelper.updateBusinessObject(element, listener.script, update);
    },

    validate(element, values, node) {
      const listener = getSelectedListener(element, node);
      return listener && listener.script
        ? script.validate(element, values)
        : {};
    },

    isScript(element, node) {
      const listener = getSelectedListener(element, node);
      return listener && listener.script;
    },

    script,
  });

  // timerEventDefinition //////
  const timerEventDefinitionHandler = function (element, node) {
    const listener = getSelectedListener(element, node);

    if (!listener || !isTimeoutTaskListener(listener)) {
      return;
    }

    const timerEventDefinition = getTimerEventDefinition(listener);

    if (!timerEventDefinition) {
      return false;
    }

    return timerEventDefinition;
  };

  function createTimerEventDefinition(element, node) {
    const listener = getSelectedListener(element, node);

    if (!listener || !isTimeoutTaskListener(listener)) {
      return;
    }

    const eventDefinitions = listener.get('eventDefinitions') || [];
    const timerEventDefinition = bpmnFactory.create(
      'bpmn:TimerEventDefinition',
    );

    eventDefinitions.push(timerEventDefinition);

    listener.eventDefinitions = eventDefinitions;

    return timerEventDefinition;
  }

  const timerOptions = {
    idPrefix: 'listener-',
    createTimerEventDefinition,
  };

  timerImplementation(
    group,
    element,
    bpmnFactory,
    timerEventDefinitionHandler,
    translate,
    timerOptions,
  );
};

// helpers //////////////

function isTimeoutTaskListener(listener) {
  const eventType = listener && listener.event;
  return eventType === 'timeout';
}

function getTimerEventDefinition(bo) {
  const eventDefinitions = bo.eventDefinitions || [];

  return find(eventDefinitions, function (event) {
    return is(event, 'bpmn:TimerEventDefinition');
  });
}
