const getBusinessObject = require('bpmn-js/lib/util/ModelUtil')
  .getBusinessObject;

const is = require('bpmn-js/lib/util/ModelUtil').is;
const isAny = require('bpmn-js/lib/features/modeling/util/ModelingUtil').isAny;

const find = require('lodash/find');

const TEMPLATE_ATTR = 'smart:modelerTemplate';

/**
 * The BPMN 2.0 extension attribute name under
 * which the element template is stored.
 *
 * @type {String}
 */
module.exports.TEMPLATE_ATTR = TEMPLATE_ATTR;

/**
 * Get template id for a given diagram element.
 *
 * @param {djs.model.Base} element
 *
 * @return {String}
 */
function getTemplateId(element) {
  const bo = getBusinessObject(element);

  if (bo) {
    return bo.get(TEMPLATE_ATTR);
  }
}

module.exports.getTemplateId = getTemplateId;

/**
 * Get template of a given element.
 *
 * @param {Element} element
 * @param {ElementTemplates} elementTemplates
 *
 * @return {TemplateDefinition}
 */
function getTemplate(element, elementTemplates) {
  const id = getTemplateId(element);

  return id && elementTemplates.get(id);
}

module.exports.getTemplate = getTemplate;

/**
 * Get default template for a given element.
 *
 * @param {Element} element
 * @param {ElementTemplates} elementTemplates
 *
 * @return {TemplateDefinition}
 */
function getDefaultTemplate(element, elementTemplates) {
  // return first default template, if any exists
  return elementTemplates.getAll().filter(function (t) {
    return isAny(element, t.appliesTo) && t.isDefault;
  })[0];
}

module.exports.getDefaultTemplate = getDefaultTemplate;

/**
 * Find extension with given type in
 * BPMN element, diagram element or ExtensionElement.
 *
 * @param {ModdleElement|djs.model.Base} element
 * @param {String} type
 *
 * @return {ModdleElement} the extension
 */
function findExtension(element, type) {
  const bo = getBusinessObject(element);

  let extensionElements;

  if (is(bo, 'bpmn:ExtensionElements')) {
    extensionElements = bo;
  } else {
    extensionElements = bo.extensionElements;
  }

  if (!extensionElements) {
    return null;
  }

  return find(extensionElements.get('values'), function (e) {
    return is(e, type);
  });
}

module.exports.findExtension = findExtension;

function findExtensions(element, types) {
  const extensionElements = getExtensionElements(element);

  if (!extensionElements) {
    return [];
  }

  return extensionElements.get('values').filter(function (e) {
    return isAny(e, types);
  });
}

module.exports.findExtensions = findExtensions;

function findSmartInOut(element, binding) {
  const extensionElements = getExtensionElements(element);

  if (!extensionElements) {
    return;
  }

  let matcher;

  if (binding.type === 'smart:in') {
    matcher = function (e) {
      return is(e, 'smart:In') && isInOut(e, binding);
    };
  } else if (binding.type === 'smart:out') {
    matcher = function (e) {
      return is(e, 'smart:Out') && isInOut(e, binding);
    };
  } else if (binding.type === 'smart:in:businessKey') {
    matcher = function (e) {
      return is(e, 'smart:In') && 'businessKey' in e;
    };
  }

  return find(extensionElements.get('values'), matcher);
}

module.exports.findSmartInOut = findSmartInOut;

function findSmartProperty(smartProperties, binding) {
  return find(smartProperties.get('values'), function (p) {
    return p.name === binding.name;
  });
}

module.exports.findSmartProperty = findSmartProperty;

function findInputParameter(inputOutput, binding) {
  const parameters = inputOutput.get('inputParameters');

  return find(parameters, function (p) {
    return p.name === binding.name;
  });
}

module.exports.findInputParameter = findInputParameter;

function findOutputParameter(inputOutput, binding) {
  const parameters = inputOutput.get('outputParameters');

  return find(parameters, function (p) {
    const value = p.value;

    if (!binding.scriptFormat) {
      return value === binding.source;
    }

    const definition = p.definition;

    if (!definition || binding.scriptFormat !== definition.scriptFormat) {
      return false;
    }

    return definition.value === binding.source;
  });
}

module.exports.findOutputParameter = findOutputParameter;

// helpers /////////////////////////////////

function getExtensionElements(element) {
  const bo = getBusinessObject(element);

  if (is(bo, 'bpmn:ExtensionElements')) {
    return bo;
  }
  return bo.extensionElements;
}

function isInOut(element, binding) {
  if (binding.type === 'smart:in') {
    // find based on target attribute
    if (binding.target) {
      return element.target === binding.target;
    }
  }

  if (binding.type === 'smart:out') {
    // find based on source / sourceExpression
    if (binding.source) {
      return element.source === binding.source;
    }

    if (binding.sourceExpression) {
      return element.sourceExpression === binding.sourceExpression;
    }
  }

  // find based variables / local combination
  if (binding.variables) {
    return (
      element.variables === 'all' &&
      (binding.variables !== 'local' || element.local)
    );
  }
}
