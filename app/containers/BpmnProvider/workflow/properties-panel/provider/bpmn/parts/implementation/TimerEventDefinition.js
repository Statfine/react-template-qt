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
) {
  const selectOptions = [
    { value: 'timeDate', name: translate('Date') },
    { value: 'timeDuration', name: translate('Duration') },
    { value: 'timeCycle', name: translate('Cycle') },
  ];

  group.entries.push(
    entryFactory.selectBox({
      id: 'timer-event-definition-type',
      label: translate('Timer Definition Type'),
      selectOptions,
      emptyParameter: true,
      modelProperty: 'timerDefinitionType',

      get(element, node) {
        return {
          timerDefinitionType:
            getTimerDefinitionType(timerEventDefinition) || '',
        };
      },

      set(element, values) {
        const props = {
          timeDuration: undefined,
          timeDate: undefined,
          timeCycle: undefined,
        };

        const newType = values.timerDefinitionType;
        if (values.timerDefinitionType) {
          const oldType = getTimerDefinitionType(timerEventDefinition);

          let value;
          if (oldType) {
            const definition = timerEventDefinition.get(oldType);
            value = definition.get('body');
          }

          props[newType] = createFormalExpression(
            timerEventDefinition,
            value,
            bpmnFactory,
          );
        }

        return cmdHelper.updateBusinessObject(
          element,
          timerEventDefinition,
          props,
        );
      },
    }),
  );

  group.entries.push(
    entryFactory.textField({
      id: 'timer-event-definition',
      label: translate('Timer Definition'),
      modelProperty: 'timerDefinition',

      get(element, node) {
        const type = getTimerDefinitionType(timerEventDefinition);
        const definition = type && timerEventDefinition.get(type);
        const value = definition && definition.get('body');
        return {
          timerDefinition: value,
        };
      },

      set(element, values) {
        const type = getTimerDefinitionType(timerEventDefinition);
        const definition = type && timerEventDefinition.get(type);

        if (definition) {
          return cmdHelper.updateBusinessObject(element, definition, {
            body: values.timerDefinition || undefined,
          });
        }
      },

      validate(element) {
        const type = getTimerDefinitionType(timerEventDefinition);
        const definition = type && timerEventDefinition.get(type);
        if (definition) {
          const value = definition.get('body');
          if (!value) {
            return {
              timerDefinition: translate('Must provide a value'),
            };
          }
        }
      },

      hidden(element) {
        return !getTimerDefinitionType(timerEventDefinition);
      },
    }),
  );
}

module.exports = TimerEventDefinition;
