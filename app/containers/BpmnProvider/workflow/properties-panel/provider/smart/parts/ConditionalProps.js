const is = require('bpmn-js/lib/util/ModelUtil').is;
const isAny = require('bpmn-js/lib/features/modeling/util/ModelingUtil').isAny;
const getBusinessObject = require('bpmn-js/lib/util/ModelUtil')
  .getBusinessObject;
const escapeHTML = require('../../../Utils').escapeHTML;
const domQuery = require('min-dom').query;
const cmdHelper = require('../../../helper/CmdHelper');
const elementHelper = require('../../../helper/ElementHelper');
const eventDefinitionHelper = require('../../../helper/EventDefinitionHelper');
const scriptImplementation = require('./implementation/Script');

module.exports = function (group, element, bpmnFactory, translate) {
  const bo = getBusinessObject(element);

  if (!bo) {
    return;
  }

  const conditionalEventDefinition = eventDefinitionHelper.getConditionalEventDefinition(
    element,
  );

  if (
    !(
      is(element, 'bpmn:SequenceFlow') && isConditionalSource(element.source)
    ) &&
    !conditionalEventDefinition
  ) {
    return;
  }

  const script = scriptImplementation('language', 'body', true, translate);
  group.entries.push({
    id: 'condition',
    label: translate('Condition'),
    html:
      `${
        '<div class="bpp-row">' + '<label for="cam-condition-type">'
      }${escapeHTML(translate('Condition Type'))}</label>` +
      `<div class="bpp-field-wrapper">` +
      `<select id="cam-condition-type" name="conditionType" data-value>` +
      `<option value="expression">${escapeHTML(
        translate('Expression'),
      )}</option>` +
      `<option value="script">${escapeHTML(translate('Script'))}</option>` +
      `<option value="" selected></option>` +
      `</select>` +
      `</div>` +
      `</div>` +
      // expression
      `<div class="bpp-row">` +
      `<label for="cam-condition" data-show="isExpression">${escapeHTML(
        translate('Expression'),
      )}</label>` +
      `<div class="bpp-field-wrapper" data-show="isExpression">` +
      `<input id="cam-condition" type="text" name="condition" />` +
      `<button class="clear" data-action="clear" data-show="canClear">` +
      `<span>X</span>` +
      `</button>` +
      `</div>` +
      `<div data-show="isScript">${script.template}</div>` +
      `</div>`,

    get(element, propertyName) {
      const conditionalEventDefinition = eventDefinitionHelper.getConditionalEventDefinition(
        element,
      );

      const conditionExpression = conditionalEventDefinition
        ? conditionalEventDefinition.condition
        : bo.conditionExpression;

      let values = {};
      let conditionType = '';

      if (conditionExpression) {
        const conditionLanguage = conditionExpression.language;
        if (typeof conditionLanguage !== 'undefined') {
          conditionType = 'script';
          values = script.get(element, conditionExpression);
        } else {
          conditionType = 'expression';
          values.condition = conditionExpression.get('body');
        }
      }

      values.conditionType = conditionType;

      return values;
    },

    set(element, values, containerElement) {
      const conditionType = values.conditionType;
      const commands = [];

      let conditionProps = {
        body: undefined,
      };

      if (conditionType === 'script') {
        conditionProps = script.set(element, values, containerElement);
      } else {
        const condition = values.condition;

        conditionProps.body = condition;
      }

      let conditionOrConditionExpression;

      if (conditionType) {
        conditionOrConditionExpression = elementHelper.createElement(
          'bpmn:FormalExpression',
          conditionProps,
          conditionalEventDefinition || bo,
          bpmnFactory,
        );

        const source = element.source;

        // if default-flow, remove default-property from source
        if (source && source.businessObject.default === bo) {
          commands.push(
            cmdHelper.updateProperties(source, { default: undefined }),
          );
        }
      }

      const update = conditionalEventDefinition
        ? { condition: conditionOrConditionExpression }
        : { conditionExpression: conditionOrConditionExpression };

      commands.push(
        cmdHelper.updateBusinessObject(
          element,
          conditionalEventDefinition || bo,
          update,
        ),
      );

      return commands;
    },

    validate(element, values) {
      let validationResult = {};

      if (!values.condition && values.conditionType === 'expression') {
        validationResult.condition = translate('Must provide a value');
      } else if (values.conditionType === 'script') {
        validationResult = script.validate(element, values);
      }

      return validationResult;
    },

    isExpression(element, inputNode) {
      const conditionType = domQuery('select[name=conditionType]', inputNode);
      if (conditionType.selectedIndex >= 0) {
        return (
          conditionType.options[conditionType.selectedIndex].value ===
          'expression'
        );
      }
    },

    isScript(element, inputNode) {
      const conditionType = domQuery('select[name=conditionType]', inputNode);
      if (conditionType.selectedIndex >= 0) {
        return (
          conditionType.options[conditionType.selectedIndex].value === 'script'
        );
      }
    },

    clear(element, inputNode) {
      // clear text input
      domQuery('input[name=condition]', inputNode).value = '';

      return true;
    },

    canClear(element, inputNode) {
      const input = domQuery('input[name=condition]', inputNode);

      return input.value !== '';
    },

    script,

    cssClasses: ['bpp-textfield'],
  });
};

// utilities //////////////////////////

const CONDITIONAL_SOURCES = [
  'bpmn:Activity',
  'bpmn:ExclusiveGateway',
  'bpmn:InclusiveGateway',
  'bpmn:ComplexGateway',
];

function isConditionalSource(element) {
  return isAny(element, CONDITIONAL_SOURCES);
}
