const entryFactory = require('../../../factory/EntryFactory');

const cmdHelper = require('../../../helper/CmdHelper');
const ImplementationTypeHelper = require('../../../helper/ImplementationTypeHelper');

const scriptImplementation = require('./implementation/Script');

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
        // { name: translate('start'), value: 'start' },
        // { name: translate('end'), value: 'end' },
        { name: translate('ACTIVITY_START'), value: 'ACTIVITY_START' },
        { name: translate('ACTIVITY_END'), value: 'ACTIVITY_END' },
      ];

  const taskListenerEventTypeOptions = [
    { name: translate('create'), value: 'create' },
    { name: translate('assignment'), value: 'assignment' },
    { name: translate('complete'), value: 'complete' },
    { name: translate('delete'), value: 'delete' },
  ];

  const isSelected = function (element, node) {
    return getSelectedListener(element, node);
  };

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

        return cmdHelper.updateBusinessObject(
          element,
          getSelectedListener(element, node),
          { event: eventType },
        );
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
};
