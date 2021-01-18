const getBusinessObject = require('bpmn-js/lib/util/ModelUtil')
  .getBusinessObject;
const escapeHTML = require('../../../../Utils').escapeHTML;

const entryFactory = require('../../../../factory/EntryFactory');

const elementHelper = require('../../../../helper/ElementHelper');
const cmdHelper = require('../../../../helper/CmdHelper');

const domClasses = require('min-dom').classes;

/**
 * Get a property value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 * @param {string} propertyName
 *
 * @return {any} the property value
 */
function getProperty(element, propertyName) {
  const loopCharacteristics = getLoopCharacteristics(element);
  return loopCharacteristics && loopCharacteristics.get(propertyName);
}

/**
 * Get the body of a given expression.
 *
 * @param {ModdleElement<bpmn:FormalExpression>} expression
 *
 * @return {string} the body (value) of the expression
 */
function getBody(expression) {
  return expression && expression.get('body');
}

/**
 * Get the loop characteristics of an element.
 *
 * @param {djs.model.Base} element
 *
 * @return {ModdleElement<bpmn:MultiInstanceLoopCharacteristics>} the loop characteristics
 */
function getLoopCharacteristics(element) {
  const bo = getBusinessObject(element);
  return bo.loopCharacteristics;
}

/**
 * Get the loop cardinality of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {ModdleElement<bpmn:FormalExpression>} an expression representing the loop cardinality
 */
function getLoopCardinality(element) {
  return getProperty(element, 'loopCardinality');
}

/**
 * Get the loop cardinality value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {string} the loop cardinality value
 */
function getLoopCardinalityValue(element) {
  const loopCardinality = getLoopCardinality(element);
  return getBody(loopCardinality);
}

/**
 * Get the completion condition of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {ModdleElement<bpmn:FormalExpression>} an expression representing the completion condition
 */
function getCompletionCondition(element) {
  return getProperty(element, 'completionCondition');
}

/**
 * Get the completion condition value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {string} the completion condition value
 */
function getCompletionConditionValue(element) {
  const completionCondition = getCompletionCondition(element);
  return getBody(completionCondition);
}

/**
 * Get the 'smart:collection' attribute value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {string} the 'smart:collection' value
 */
function getCollection(element) {
  return getProperty(element, 'smart:collection');
}

/**
 * Get the 'smart:elementVariable' attribute value of the loop characteristics.
 *
 * @param {djs.model.Base} element
 *
 * @return {string} the 'smart:elementVariable' value
 */
function getElementVariable(element) {
  return getProperty(element, 'smart:elementVariable');
}

/**
 * Creates 'bpmn:FormalExpression' element.
 *
 * @param {ModdleElement} parent
 * @param {string} body
 * @param {BpmnFactory} bpmnFactory
 *
 * @result {ModdleElement<bpmn:FormalExpression>} a formal expression
 */
function createFormalExpression(parent, body, bpmnFactory) {
  return elementHelper.createElement(
    'bpmn:FormalExpression',
    { body },
    parent,
    bpmnFactory,
  );
}

/**
 * Updates a specific formal expression of the loop characteristics.
 *
 * @param {djs.model.Base} element
 * @param {string} propertyName
 * @param {string} newValue
 * @param {BpmnFactory} bpmnFactory
 */
function updateFormalExpression(element, propertyName, newValue, bpmnFactory) {
  const loopCharacteristics = getLoopCharacteristics(element);

  const expressionProps = {};

  if (!newValue) {
    // remove formal expression
    expressionProps[propertyName] = undefined;
    return cmdHelper.updateBusinessObject(
      element,
      loopCharacteristics,
      expressionProps,
    );
  }

  const existingExpression = loopCharacteristics.get(propertyName);

  if (!existingExpression) {
    // add formal expression
    expressionProps[propertyName] = createFormalExpression(
      loopCharacteristics,
      newValue,
      bpmnFactory,
    );
    return cmdHelper.updateBusinessObject(
      element,
      loopCharacteristics,
      expressionProps,
    );
  }

  // edit existing formal expression
  return cmdHelper.updateBusinessObject(element, existingExpression, {
    body: newValue,
  });
}

module.exports = function(element, bpmnFactory, translate) {
  const entries = [];

  // error message /////////////////////////////////////////////////////////////////

  entries.push({
    id: 'multiInstance-errorMessage',
    html: `${'<div data-show="isValid">' +
      '<span class="bpp-icon-warning"></span> '}${escapeHTML(
      translate('Must provide either loop cardinality or collection'),
    )}</div>`,

    isValid(element, node, notification, scope) {
      const loopCharacteristics = getLoopCharacteristics(element);

      let isValid = true;
      if (loopCharacteristics) {
        const loopCardinality = getLoopCardinalityValue(element);
        const collection = getCollection(element);

        isValid = !loopCardinality && !collection;
      }

      domClasses(node).toggle('bpp-hidden', !isValid);
      domClasses(notification).toggle('bpp-error-message', isValid);

      return isValid;
    },
  });

  // loop cardinality //////////////////////////////////////////////////////////////

  entries.push(
    entryFactory.textField({
      id: 'multiInstance-loopCardinality',
      label: translate('Loop Cardinality'),
      modelProperty: 'loopCardinality',

      get(element, node) {
        return {
          loopCardinality: getLoopCardinalityValue(element),
        };
      },

      set(element, values) {
        return updateFormalExpression(
          element,
          'loopCardinality',
          values.loopCardinality,
          bpmnFactory,
        );
      },
    }),
  );

  // collection //////////////////////////////////////////////////////////////////

  entries.push(
    entryFactory.textField({
      id: 'multiInstance-collection',
      label: translate('Collection'),
      modelProperty: 'collection',

      get(element, node) {
        return {
          collection: getCollection(element),
        };
      },

      set(element, values) {
        const loopCharacteristics = getLoopCharacteristics(element);
        return cmdHelper.updateBusinessObject(element, loopCharacteristics, {
          'smart:collection': values.collection || undefined,
        });
      },

      validate(element, values, node) {
        const collection = getCollection(element);
        const elementVariable = getElementVariable(element);

        if (!collection && elementVariable) {
          return { collection: 'Must provide a value' };
        }
      },
    }),
  );

  // element variable ////////////////////////////////////////////////////////////

  entries.push(
    entryFactory.textField({
      id: 'multiInstance-elementVariable',
      label: translate('Element Variable'),
      modelProperty: 'elementVariable',

      get(element, node) {
        return {
          elementVariable: getElementVariable(element),
        };
      },

      set(element, values) {
        const loopCharacteristics = getLoopCharacteristics(element);
        return cmdHelper.updateBusinessObject(element, loopCharacteristics, {
          'smart:elementVariable': values.elementVariable || undefined,
        });
      },
    }),
  );

  // Completion Condition //////////////////////////////////////////////////////

  entries.push(
    entryFactory.textField({
      id: 'multiInstance-completionCondition',
      label: translate('Completion Condition'),
      modelProperty: 'completionCondition',

      get(element) {
        return {
          completionCondition: getCompletionConditionValue(element),
        };
      },

      set(element, values) {
        return updateFormalExpression(
          element,
          'completionCondition',
          values.completionCondition,
          bpmnFactory,
        );
      },
    }),
  );

  return entries;
};
