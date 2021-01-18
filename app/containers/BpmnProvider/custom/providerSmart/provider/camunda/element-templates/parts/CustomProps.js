const assign = require('lodash/assign');

const entryFactory = require('../../../../factory/EntryFactory');
const getBusinessObject = require('bpmn-js/lib/util/ModelUtil')
  .getBusinessObject;
const getTemplate = require('../Helper').getTemplate;
const cmdHelper = require('../../../../helper/CmdHelper');
const elementHelper = require('../../../../helper/ElementHelper');

const findExtension = require('../Helper').findExtension;
const findExtensions = require('../Helper').findExtensions;
const findInputParameter = require('../Helper').findInputParameter;
const findOutputParameter = require('../Helper').findOutputParameter;
const findSmartProperty = require('../Helper').findSmartProperty;
const findSmartInOut = require('../Helper').findSmartInOut;

const createSmartProperty = require('../CreateHelper').createSmartProperty;
const createInputParameter = require('../CreateHelper').createInputParameter;
const createOutputParameter = require('../CreateHelper').createOutputParameter;
const createSmartIn = require('../CreateHelper').createSmartIn;
const createSmartOut = require('../CreateHelper').createSmartOut;
const createSmartInWithBusinessKey = require('../CreateHelper')
  .createSmartInWithBusinessKey;
const createSmartFieldInjection = require('../CreateHelper')
  .createSmartFieldInjection;

const SMART_PROPERTY_TYPE = 'smart:property';
const SMART_INPUT_PARAMETER_TYPE = 'smart:inputParameter';
const SMART_OUTPUT_PARAMETER_TYPE = 'smart:outputParameter';
const SMART_IN_TYPE = 'smart:in';
const SMART_OUT_TYPE = 'smart:out';
const SMART_IN_BUSINESS_KEY_TYPE = 'smart:in:businessKey';
const SMART_EXECUTION_LISTENER_TYPE = 'smart:executionListener';
const SMART_FIELD = 'smart:field';

const BASIC_MODDLE_TYPES = ['Boolean', 'Integer', 'String'];

const EXTENSION_BINDING_TYPES = [
  SMART_PROPERTY_TYPE,
  SMART_INPUT_PARAMETER_TYPE,
  SMART_OUTPUT_PARAMETER_TYPE,
  SMART_IN_TYPE,
  SMART_OUT_TYPE,
  SMART_IN_BUSINESS_KEY_TYPE,
  SMART_FIELD,
];

const IO_BINDING_TYPES = [
  SMART_INPUT_PARAMETER_TYPE,
  SMART_OUTPUT_PARAMETER_TYPE,
];

const IN_OUT_BINDING_TYPES = [
  SMART_IN_TYPE,
  SMART_OUT_TYPE,
  SMART_IN_BUSINESS_KEY_TYPE,
];

/**
 * Injects custom properties into the given group.
 *
 * @param {djs.model.Base} element
 * @param {ElementTemplates} elementTemplates
 * @param {BpmnFactory} bpmnFactory
 * @param {Function} translate
 */
module.exports = function (element, elementTemplates, bpmnFactory, translate) {
  const template = getTemplate(element, elementTemplates);

  if (!template) {
    return [];
  }

  const renderCustomField = function (id, p, idx) {
    const propertyType = p.type;

    const entryOptions = {
      id,
      description: p.description,
      label: p.label ? translate(p.label) : p.label,
      modelProperty: id,
      get: propertyGetter(id, p),
      set: propertySetter(id, p, bpmnFactory),
      validate: propertyValidator(id, p, translate),
    };

    let entry;

    if (propertyType === 'Boolean') {
      entry = entryFactory.checkbox(entryOptions);
    }

    if (propertyType === 'String') {
      entry = entryFactory.textField(entryOptions);
    }

    if (propertyType === 'Text') {
      entry = entryFactory.textBox(entryOptions);
    }

    if (propertyType === 'Dropdown') {
      entryOptions.selectOptions = p.choices;

      entry = entryFactory.selectBox(entryOptions);
    }

    return entry;
  };

  const groups = [];
  let id;
  let entry;

  const customFieldsGroup = {
    id: 'customField',
    label: translate('Custom Fields'),
    entries: [],
  };
  template.properties.forEach(function (p, idx) {
    id = `custom-${template.id}-${idx}`;

    entry = renderCustomField(id, p, idx);
    if (entry) {
      customFieldsGroup.entries.push(entry);
    }
  });
  if (customFieldsGroup.entries.length > 0) {
    groups.push(customFieldsGroup);
  }

  if (template.scopes) {
    for (var scopeName in template.scopes) {
      const scope = template.scopes[scopeName];
      var idScopeName = scopeName.replace(/:/g, '_');

      var customScopeFieldsGroup = {
        id: `customField-${idScopeName}`,
        label: translate('Custom Fields for scope: ') + scopeName,
        entries: [],
      };

      scope.properties.forEach(function (p, idx) {
        const propertyId = `custom-${template.id}-${idScopeName}-${idx}`;

        const scopedProperty = propertyWithScope(p, scopeName);

        entry = renderCustomField(propertyId, scopedProperty, idx);
        if (entry) {
          customScopeFieldsGroup.entries.push(entry);
        }
      });

      if (customScopeFieldsGroup.entries.length > 0) {
        groups.push(customScopeFieldsGroup);
      }
    }
  }

  return groups;
};

// getters, setters and validators ///////////////

/**
 * Return a getter that retrieves the given property.
 *
 * @param {String} name
 * @param {PropertyDescriptor} property
 *
 * @return {Function}
 */
function propertyGetter(name, property) {
  /* getter */
  return function get(element) {
    const value = getPropertyValue(element, property);

    return objectWithKey(name, value);
  };
}

/**
 * Return a setter that updates the given property.
 *
 * @param {String} name
 * @param {PropertyDescriptor} property
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {Function}
 */
function propertySetter(name, property, bpmnFactory) {
  /* setter */
  return function set(element, values) {
    const value = values[name];

    return setPropertyValue(element, property, value, bpmnFactory);
  };
}

/**
 * Return a validator that ensures the property is ok.
 *
 * @param {String} name
 * @param {PropertyDescriptor} property
 * @param {Function} translate
 *
 * @return {Function}
 */
function propertyValidator(name, property, translate) {
  /* validator */
  return function validate(element, values) {
    const value = values[name];

    const error = validateValue(value, property, translate);

    if (error) {
      return objectWithKey(name, error);
    }
  };
}

// get, set and validate helpers ///////////////////

/**
 * Return the value of the specified property descriptor,
 * on the passed diagram element.
 *
 * @param {djs.model.Base} element
 * @param {PropertyDescriptor} property
 *
 * @return {Any}
 */
function getPropertyValue(element, property) {
  let bo = getBusinessObject(element);

  const binding = property.binding;
  const scope = property.scope;

  const bindingType = binding.type;
  const bindingName = binding.name;

  const propertyValue = property.value || '';

  if (scope) {
    bo = findExtension(bo, scope.name);
    if (!bo) {
      return propertyValue;
    }
  }

  // property
  if (bindingType === 'property') {
    const value = bo.get(bindingName);

    if (bindingName === 'conditionExpression') {
      if (value) {
        return value.body;
      }
      // return defined default
      return propertyValue;
    }
    // return value; default to defined default
    return typeof value !== 'undefined' ? value : propertyValue;
  }

  let smartProperties;
  let smartProperty;

  if (bindingType === SMART_PROPERTY_TYPE) {
    if (scope) {
      smartProperties = bo.get('properties');
    } else {
      smartProperties = findExtension(bo, 'smart:Properties');
    }

    if (smartProperties) {
      smartProperty = findSmartProperty(smartProperties, binding);

      if (smartProperty) {
        return smartProperty.value;
      }
    }

    return propertyValue;
  }

  let inputOutput;
  let ioParameter;

  if (IO_BINDING_TYPES.indexOf(bindingType) !== -1) {
    if (scope) {
      inputOutput = bo.get('inputOutput');
    } else {
      inputOutput = findExtension(bo, 'smart:InputOutput');
    }

    if (!inputOutput) {
      // ioParameter cannot exist yet, return property value
      return propertyValue;
    }
  }

  // smart input parameter
  if (bindingType === SMART_INPUT_PARAMETER_TYPE) {
    ioParameter = findInputParameter(inputOutput, binding);

    if (ioParameter) {
      if (binding.scriptFormat) {
        if (ioParameter.definition) {
          return ioParameter.definition.value;
        }
      } else {
        return ioParameter.value || '';
      }
    }

    return propertyValue;
  }

  // smart output parameter
  if (binding.type === SMART_OUTPUT_PARAMETER_TYPE) {
    ioParameter = findOutputParameter(inputOutput, binding);

    if (ioParameter) {
      return ioParameter.name;
    }

    return propertyValue;
  }

  let ioElement;

  if (IN_OUT_BINDING_TYPES.indexOf(bindingType) != -1) {
    ioElement = findSmartInOut(bo, binding);

    if (ioElement) {
      if (bindingType === SMART_IN_BUSINESS_KEY_TYPE) {
        return ioElement.businessKey;
      }
      if (bindingType === SMART_OUT_TYPE) {
        return ioElement.target;
      }
      if (bindingType === SMART_IN_TYPE) {
        return ioElement[binding.expression ? 'sourceExpression' : 'source'];
      }
    }

    return propertyValue;
  }

  if (bindingType === SMART_EXECUTION_LISTENER_TYPE) {
    let executionListener;
    if (scope) {
      executionListener = bo.get('executionListener');
    } else {
      executionListener = findExtension(bo, 'smart:ExecutionListener');
    }

    return executionListener.script.value;
  }

  let fieldInjection;
  if (SMART_FIELD === bindingType) {
    const fieldInjections = findExtensions(bo, ['smart:Field']);
    fieldInjections.forEach(function (item) {
      if (item.name === binding.name) {
        fieldInjection = item;
      }
    });
    if (fieldInjection) {
      return fieldInjection.string || fieldInjection.expression;
    }
    return '';
  }

  throw unknownPropertyBinding(property);
}

module.exports.getPropertyValue = getPropertyValue;

/**
 * Return an update operation that changes the diagram
 * element's custom property to the given value.
 *
 * The response of this method will be processed via
 * {@link PropertiesPanel#applyChanges}.
 *
 * @param {djs.model.Base} element
 * @param {PropertyDescriptor} property
 * @param {String} value
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {Object|Array<Object>} results to be processed
 */
function setPropertyValue(element, property, value, bpmnFactory) {
  let bo = getBusinessObject(element);

  const binding = property.binding;
  const scope = property.scope;

  const bindingType = binding.type;
  const bindingName = binding.name;

  let propertyValue;

  const updates = [];

  let extensionElements;

  if (EXTENSION_BINDING_TYPES.indexOf(bindingType) !== -1) {
    extensionElements = bo.get('extensionElements');

    // create extension elements, if they do not exist (yet)
    if (!extensionElements) {
      extensionElements = elementHelper.createElement(
        'bpmn:ExtensionElements',
        null,
        element,
        bpmnFactory,
      );

      updates.push(
        cmdHelper.updateBusinessObject(
          element,
          bo,
          objectWithKey('extensionElements', extensionElements),
        ),
      );
    }
  }

  if (scope) {
    bo = findExtension(bo, scope.name);
    if (!bo) {
      bo = elementHelper.createElement(scope.name, null, element, bpmnFactory);

      updates.push(
        cmdHelper.addElementsTolist(bo, extensionElements, 'values', [bo]),
      );
    }
  }

  // property
  if (bindingType === 'property') {
    if (bindingName === 'conditionExpression') {
      propertyValue = elementHelper.createElement(
        'bpmn:FormalExpression',
        {
          body: value,
          language: binding.scriptFormat,
        },
        bo,
        bpmnFactory,
      );
    } else {
      const moddlePropertyDescriptor =
        bo.$descriptor.propertiesByName[bindingName];

      const moddleType = moddlePropertyDescriptor.type;

      // make sure we only update String, Integer, Real and
      // Boolean properties (do not accidentally override complex objects...)
      if (BASIC_MODDLE_TYPES.indexOf(moddleType) === -1) {
        throw new Error(`cannot set moddle type <${moddleType}>`);
      }

      if (moddleType === 'Boolean') {
        propertyValue = !!value;
      } else if (moddleType === 'Integer') {
        propertyValue = parseInt(value, 10);

        if (isNaN(propertyValue)) {
          // do not write NaN value
          propertyValue = undefined;
        }
      } else {
        propertyValue = value;
      }
    }

    if (propertyValue !== undefined) {
      updates.push(
        cmdHelper.updateBusinessObject(
          element,
          bo,
          objectWithKey(bindingName, propertyValue),
        ),
      );
    }
  }

  // smart:property
  let smartProperties;
  let existingSmartProperty;
  let newSmartProperty;

  if (bindingType === SMART_PROPERTY_TYPE) {
    if (scope) {
      smartProperties = bo.get('properties');
    } else {
      smartProperties = findExtension(extensionElements, 'smart:Properties');
    }

    if (!smartProperties) {
      smartProperties = elementHelper.createElement(
        'smart:Properties',
        null,
        bo,
        bpmnFactory,
      );

      if (scope) {
        updates.push(
          cmdHelper.updateBusinessObject(element, bo, {
            properties: smartProperties,
          }),
        );
      } else {
        updates.push(
          cmdHelper.addElementsTolist(element, extensionElements, 'values', [
            smartProperties,
          ]),
        );
      }
    }

    existingSmartProperty = findSmartProperty(smartProperties, binding);

    newSmartProperty = createSmartProperty(binding, value, bpmnFactory);

    updates.push(
      cmdHelper.addAndRemoveElementsFromList(
        element,
        smartProperties,
        'values',
        null,
        [newSmartProperty],
        existingSmartProperty ? [existingSmartProperty] : [],
      ),
    );
  }

  // smart:inputParameter
  // smart:outputParameter
  let inputOutput;
  let existingIoParameter;
  let newIoParameter;

  if (IO_BINDING_TYPES.indexOf(bindingType) !== -1) {
    if (scope) {
      inputOutput = bo.get('inputOutput');
    } else {
      inputOutput = findExtension(extensionElements, 'smart:InputOutput');
    }

    // create inputOutput element, if it do not exist (yet)
    if (!inputOutput) {
      inputOutput = elementHelper.createElement(
        'smart:InputOutput',
        null,
        bo,
        bpmnFactory,
      );

      if (scope) {
        updates.push(
          cmdHelper.updateBusinessObject(element, bo, { inputOutput }),
        );
      } else {
        updates.push(
          cmdHelper.addElementsTolist(
            element,
            extensionElements,
            'values',
            inputOutput,
          ),
        );
      }
    }
  }

  if (bindingType === SMART_INPUT_PARAMETER_TYPE) {
    existingIoParameter = findInputParameter(inputOutput, binding);

    newIoParameter = createInputParameter(binding, value, bpmnFactory);

    updates.push(
      cmdHelper.addAndRemoveElementsFromList(
        element,
        inputOutput,
        'inputParameters',
        null,
        [newIoParameter],
        existingIoParameter ? [existingIoParameter] : [],
      ),
    );
  }

  if (bindingType === SMART_OUTPUT_PARAMETER_TYPE) {
    existingIoParameter = findOutputParameter(inputOutput, binding);

    newIoParameter = createOutputParameter(binding, value, bpmnFactory);

    updates.push(
      cmdHelper.addAndRemoveElementsFromList(
        element,
        inputOutput,
        'outputParameters',
        null,
        [newIoParameter],
        existingIoParameter ? [existingIoParameter] : [],
      ),
    );
  }

  // smart:in
  // smart:out
  // smart:in:businessKey
  let existingInOut;
  let newInOut;

  if (IN_OUT_BINDING_TYPES.indexOf(bindingType) !== -1) {
    existingInOut = findSmartInOut(bo, binding);

    if (bindingType === SMART_IN_TYPE) {
      newInOut = createSmartIn(binding, value, bpmnFactory);
    } else if (bindingType === SMART_OUT_TYPE) {
      newInOut = createSmartOut(binding, value, bpmnFactory);
    } else {
      newInOut = createSmartInWithBusinessKey(binding, value, bpmnFactory);
    }

    updates.push(
      cmdHelper.addAndRemoveElementsFromList(
        element,
        extensionElements,
        'values',
        null,
        [newInOut],
        existingInOut ? [existingInOut] : [],
      ),
    );
  }

  if (bindingType === SMART_FIELD) {
    const existingFieldInjections = findExtensions(bo, ['smart:Field']);
    const newFieldInjections = [];

    if (existingFieldInjections.length > 0) {
      existingFieldInjections.forEach(function (item) {
        if (item.name === binding.name) {
          newFieldInjections.push(
            createSmartFieldInjection(binding, value, bpmnFactory),
          );
        } else {
          newFieldInjections.push(item);
        }
      });
    } else {
      newFieldInjections.push(
        createSmartFieldInjection(binding, value, bpmnFactory),
      );
    }

    updates.push(
      cmdHelper.addAndRemoveElementsFromList(
        element,
        extensionElements,
        'values',
        null,
        newFieldInjections,
        existingFieldInjections || [],
      ),
    );
  }

  if (updates.length) {
    return updates;
  }

  // quick warning for better debugging
  console.warn('no update', element, property, value);
}

module.exports.setPropertyValue = setPropertyValue;

/**
 * Validate value of a given property.
 *
 * @param {String} value
 * @param {PropertyDescriptor} property
 * @param {Function} translate
 *
 * @return {Object} with validation errors
 */
function validateValue(value, property, translate) {
  const constraints = property.constraints || {};

  if (constraints.notEmpty && isEmpty(value)) {
    return translate('Must not be empty');
  }

  if (constraints.maxLength && value.length > constraints.maxLength) {
    return translate('Must have max length {length}', {
      length: constraints.maxLength,
    });
  }

  if (constraints.minLength && value.length < constraints.minLength) {
    return translate('Must have min length {length}', {
      length: constraints.minLength,
    });
  }

  let pattern = constraints.pattern;
  let message;

  if (pattern) {
    if (typeof pattern !== 'string') {
      message = pattern.message;
      pattern = pattern.value;
    }

    if (!matchesPattern(value, pattern)) {
      return message || translate('Must match pattern {pattern}', { pattern });
    }
  }
}

// misc helpers ///////////////////////////////

function propertyWithScope(property, scopeName) {
  if (!scopeName) {
    return property;
  }

  return assign({}, property, {
    scope: {
      name: scopeName,
    },
  });
}

/**
 * Return an object with a single key -> value association.
 *
 * @param {String} key
 * @param {Any} value
 *
 * @return {Object}
 */
function objectWithKey(key, value) {
  const obj = {};

  obj[key] = value;

  return obj;
}

/**
 * Does the given string match the specified pattern?
 *
 * @param {String} str
 * @param {String} pattern
 *
 * @return {Boolean}
 */
function matchesPattern(str, pattern) {
  const regexp = new RegExp(pattern);

  return regexp.test(str);
}

function isEmpty(str) {
  return !str || /^\s*$/.test(str);
}

/**
 * Create a new {@link Error} indicating an unknown
 * property binding.
 *
 * @param {PropertyDescriptor} property
 *
 * @return {Error}
 */
function unknownPropertyBinding(property) {
  const binding = property.binding;

  return new Error(`unknown binding: <${binding.type}>`);
}
