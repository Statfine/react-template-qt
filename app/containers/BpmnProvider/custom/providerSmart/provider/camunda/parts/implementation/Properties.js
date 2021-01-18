const getBusinessObject = require('bpmn-js/lib/util/ModelUtil')
  .getBusinessObject;
const is = require('bpmn-js/lib/util/ModelUtil').is;

const assign = require('lodash/assign');
const forEach = require('lodash/forEach');
const find = require('lodash/find');
const factory = require('../../../../factory/EntryFactory');

const elementHelper = require('../../../../helper/ElementHelper');
const extensionElementsHelper = require('../../../../helper/ExtensionElementsHelper');
const cmdHelper = require('../../../../helper/CmdHelper');
const utils = require('../../../../Utils');

function generatePropertyId() {
  return utils.nextId('Property_');
}

/**
 * Get all smart:property objects for a specific business object
 *
 * @param  {ModdleElement} parent
 *
 * @return {Array<ModdleElement>} a list of smart:property objects
 */
function getPropertyValues(parent) {
  const properties = parent && getPropertiesElement(parent);
  if (properties && properties.values) {
    return properties.values;
  }
  return [];
}

/**
 * Get all smart:Properties object for a specific business object
 *
 * @param  {ModdleElement} parent
 *
 * @return {ModdleElement} a smart:Properties object
 */
function getPropertiesElement(element) {
  if (!isExtensionElements(element)) {
    return element.properties;
  }
  return getPropertiesElementInsideExtensionElements(element);
}

/**
 * Get first smart:Properties object for a specific bpmn:ExtensionElements
 * business object.
 *
 * @param {ModdleElement} extensionElements
 *
 * @return {ModdleElement} a smart:Properties object
 */
function getPropertiesElementInsideExtensionElements(extensionElements) {
  return find(extensionElements.values, function (elem) {
    return is(elem, 'smart:Properties');
  });
}

/**
 * Returns true, if the given business object is a bpmn:ExtensionElements.
 *
 * @param {ModdleElement} element
 *
 * @return {boolean} a boolean value
 */
function isExtensionElements(element) {
  return is(element, 'bpmn:ExtensionElements');
}

/**
 * Create a smart:property entry using tableEntryFactory
 *
 * @param  {djs.model.Base} element
 * @param  {BpmnFactory} bpmnFactory
 * @param  {Object} options
 * @param  {string} options.id
 * @param  {Array<string>} options.modelProperties
 * @param  {Array<string>} options.labels
 * @param  {function} options.getParent Gets the parent business object
 * @param  {function} options.show Indicate when the entry will be shown, should return boolean
 */
module.exports = function (element, bpmnFactory, options, translate) {
  const getParent = options.getParent;

  const modelProperties = options.modelProperties;
  const createParent = options.createParent;

  let bo = getBusinessObject(element);
  if (is(element, 'bpmn:Participant')) {
    bo = bo.get('processRef');
  }

  // build properties group only when the participant have a processRef
  if (!bo) {
    return;
  }

  assign(options, {
    addLabel: translate('Add Property'),
    getElements(element, node) {
      const parent = getParent(element, node, bo);
      return getPropertyValues(parent);
    },
    addElement(element, node) {
      const commands = [];
      let parent = getParent(element, node, bo);

      if (!parent && typeof createParent === 'function') {
        const result = createParent(element, bo);
        parent = result.parent;
        commands.push(result.cmd);
      }

      let properties = getPropertiesElement(parent);
      if (!properties) {
        properties = elementHelper.createElement(
          'smart:Properties',
          {},
          parent,
          bpmnFactory,
        );

        if (!isExtensionElements(parent)) {
          commands.push(
            cmdHelper.updateBusinessObject(element, parent, {
              properties: properties,
            }),
          );
        } else {
          commands.push(
            cmdHelper.addAndRemoveElementsFromList(
              element,
              parent,
              'values',
              'extensionElements',
              [properties],
              [],
            ),
          );
        }
      }

      const propertyProps = {};
      forEach(modelProperties, function (prop) {
        propertyProps[prop] = undefined;
      });

      // create id if necessary
      if (modelProperties.indexOf('id') >= 0) {
        propertyProps.id = generatePropertyId();
      }

      const property = elementHelper.createElement(
        'smart:Property',
        propertyProps,
        properties,
        bpmnFactory,
      );
      commands.push(
        cmdHelper.addElementsTolist(element, properties, 'values', [property]),
      );

      return commands;
    },
    updateElement(element, value, node, idx) {
      const parent = getParent(element, node, bo);
      const property = getPropertyValues(parent)[idx];

      forEach(modelProperties, function (prop) {
        value[prop] = value[prop] || undefined;
      });

      return cmdHelper.updateBusinessObject(element, property, value);
    },
    validate(element, value, node, idx) {
      // validate id if necessary
      if (modelProperties.indexOf('id') >= 0) {
        const parent = getParent(element, node, bo);
        const properties = getPropertyValues(parent);
        const property = properties[idx];

        if (property) {
          // check if id is valid
          const validationError = utils.isIdValid(
            property,
            value.id,
            translate,
          );

          if (validationError) {
            return { id: validationError };
          }
        }
      }
    },
    removeElement(element, node, idx) {
      const commands = [];
      const parent = getParent(element, node, bo);
      const properties = getPropertiesElement(parent);
      const propertyValues = getPropertyValues(parent);
      const currentProperty = propertyValues[idx];

      commands.push(
        cmdHelper.removeElementsFromList(element, properties, 'values', null, [
          currentProperty,
        ]),
      );

      if (propertyValues.length === 1) {
        // remove smart:properties if the last existing property has been removed
        if (!isExtensionElements(parent)) {
          commands.push(
            cmdHelper.updateBusinessObject(element, parent, {
              properties: undefined,
            }),
          );
        } else {
          forEach(parent.values, function (value) {
            if (is(value, 'smart:Properties')) {
              commands.push(
                extensionElementsHelper.removeEntry(bo, element, value),
              );
            }
          });
        }
      }

      return commands;
    },
  });

  return factory.table(options);
};
