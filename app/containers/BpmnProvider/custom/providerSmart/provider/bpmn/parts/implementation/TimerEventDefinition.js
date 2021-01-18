const elementHelper = require('../../../../helper/ElementHelper');
const cmdHelper = require('../../../../helper/CmdHelper');

const entryFactory = require('../../../../factory/EntryFactory');

/**
 * Get the timer definition type for a given timer event definition.
 *
 * @param {ModdleElement<bpmn:TimerEventDefinition>} timer
 *
 * @return {string|undefined} the timer definition type
 */
function getTimerDefinitionType(timer) {
  if (!timer) {
    return;
  }

  const timeDate = timer.get('timeDate');
  if (typeof timeDate !== 'undefined') {
    return 'timeDate';
  }

  const timeCycle = timer.get('timeCycle');
  if (typeof timeCycle !== 'undefined') {
    return 'timeCycle';
  }

  const timeDuration = timer.get('timeDuration');
  if (typeof timeDuration !== 'undefined') {
    return 'timeDuration';
  }
}

/**
 * Get the actual timer event definition based on option, whether it's a getter
 * to fetch the timer event definition or the exact event definition itself
 *
 * @param {ModdleElement<bpmn:TimerEventDefinition>|Function} timerOrFunction
 * @param {Shape} element
 * @param {HTMLElement} node
 *
 * @return ModdleElement<bpmn:TimerEventDefinition>
 */
function getTimerDefinition(timerOrFunction, element, node) {
  if (typeof timerOrFunction === 'function') {
    return timerOrFunction(element, node);
  }

  return timerOrFunction;
}

/**
 * Creates 'bpmn:FormalExpression' element.
 *
 * @param {ModdleElement} parent
 * @param {string} body
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {ModdleElement<bpmn:FormalExpression>} a formal expression
 */
function createFormalExpression(parent, body, bpmnFactory) {
  body = body || undefined;
  return elementHelper.createElement(
    'bpmn:FormalExpression',
    { body },
    parent,
    bpmnFactory,
  );
}

function TimerEventDefinition(
  group,
  element,
  bpmnFactory,
  timerEventDefinition,
  translate,
  options,
) {
  const selectOptions = [
    { value: 'timeDate', name: translate('Date') },
    { value: 'timeDuration', name: translate('Duration') },
    { value: 'timeCycle', name: translate('Cycle') },
  ];

  const prefix = options && options.idPrefix;
  const createTimerEventDefinition =
    options && options.createTimerEventDefinition;

  group.entries.push(
    entryFactory.selectBox({
      id: `${prefix}timer-event-definition-type`,
      label: translate('Timer Definition Type'),
      selectOptions,
      emptyParameter: true,
      modelProperty: 'timerDefinitionType',

      get(element, node) {
        const timerDefinition = getTimerDefinition(
          timerEventDefinition,
          element,
          node,
        );

        return {
          timerDefinitionType: getTimerDefinitionType(timerDefinition) || '',
        };
      },

      set(element, values, node) {
        const props = {
          timeDuration: undefined,
          timeDate: undefined,
          timeCycle: undefined,
        };

        let timerDefinition = getTimerDefinition(
          timerEventDefinition,
          element,
          node,
        );
        const newType = values.timerDefinitionType;

        if (
          !timerDefinition &&
          typeof createTimerEventDefinition === 'function'
        ) {
          timerDefinition = createTimerEventDefinition(element, node);
        }

        if (values.timerDefinitionType) {
          const oldType = getTimerDefinitionType(timerDefinition);

          let value;
          if (oldType) {
            const definition = timerDefinition.get(oldType);
            value = definition.get('body');
          }

          props[newType] = createFormalExpression(
            timerDefinition,
            value,
            bpmnFactory,
          );
        }

        return cmdHelper.updateBusinessObject(element, timerDefinition, props);
      },

      hidden(element, node) {
        return (
          getTimerDefinition(timerEventDefinition, element, node) === undefined
        );
      },
    }),
  );

  group.entries.push(
    entryFactory.textField({
      id: `${prefix}timer-event-definition`,
      label: translate('Timer Definition'),
      modelProperty: 'timerDefinition',

      get(element, node) {
        const timerDefinition = getTimerDefinition(
          timerEventDefinition,
          element,
          node,
        );
        const type = getTimerDefinitionType(timerDefinition);
        const definition = type && timerDefinition.get(type);
        const value = definition && definition.get('body');

        return {
          timerDefinition: value,
        };
      },

      set(element, values, node) {
        const timerDefinition = getTimerDefinition(
          timerEventDefinition,
          element,
          node,
        );
        const type = getTimerDefinitionType(timerDefinition);
        const definition = type && timerDefinition.get(type);

        if (definition) {
          return cmdHelper.updateBusinessObject(element, definition, {
            body: values.timerDefinition || undefined,
          });
        }
      },

      validate(element, node) {
        const timerDefinition = getTimerDefinition(
          timerEventDefinition,
          element,
          node,
        );
        const type = getTimerDefinitionType(timerDefinition);
        const definition = type && timerDefinition.get(type);

        if (definition) {
          const value = definition.get('body');
          if (!value) {
            return {
              timerDefinition: translate('Must provide a value'),
            };
          }
        }
      },

      hidden(element, node) {
        const timerDefinition = getTimerDefinition(
          timerEventDefinition,
          element,
          node,
        );

        return !getTimerDefinitionType(timerDefinition);
      },
    }),
  );
}

module.exports = TimerEventDefinition;
