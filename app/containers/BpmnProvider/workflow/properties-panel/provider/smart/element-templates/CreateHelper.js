const assign = require('lodash/assign');

/**
 * Create an input parameter representing the given
 * binding and value.
 *
 * @param {PropertyBinding} binding
 * @param {String} value
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {ModdleElement}
 */
function createInputParameter(binding, value, bpmnFactory) {
  const scriptFormat = binding.scriptFormat;
  let parameterValue;
  let parameterDefinition;

  if (scriptFormat) {
    parameterDefinition = bpmnFactory.create('smart:Script', {
      scriptFormat,
      value,
    });
  } else {
    parameterValue = value;
  }

  return bpmnFactory.create('smart:InputParameter', {
    name: binding.name,
    value: parameterValue,
    definition: parameterDefinition,
  });
}

module.exports.createInputParameter = createInputParameter;

/**
 * Create an output parameter representing the given
 * binding and value.
 *
 * @param {PropertyBinding} binding
 * @param {String} value
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {ModdleElement}
 */
function createOutputParameter(binding, value, bpmnFactory) {
  const scriptFormat = binding.scriptFormat;
  let parameterValue;
  let parameterDefinition;

  if (scriptFormat) {
    parameterDefinition = bpmnFactory.create('smart:Script', {
      scriptFormat,
      value: binding.source,
    });
  } else {
    parameterValue = binding.source;
  }

  return bpmnFactory.create('smart:OutputParameter', {
    name: value,
    value: parameterValue,
    definition: parameterDefinition,
  });
}

module.exports.createOutputParameter = createOutputParameter;

/**
 * Create smart property from the given binding.
 *
 * @param {PropertyBinding} binding
 * @param {String} value
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {ModdleElement}
 */
function createSmartProperty(binding, value, bpmnFactory) {
  return bpmnFactory.create('smart:Property', {
    name: binding.name,
    value: value || '',
  });
}

module.exports.createSmartProperty = createSmartProperty;

/**
 * Create smart:in element from given binding.
 *
 * @param {PropertyBinding} binding
 * @param {String} value
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {ModdleElement}
 */
function createSmartIn(binding, value, bpmnFactory) {
  const properties = createSmartInOutAttrs(binding, value);

  return bpmnFactory.create('smart:In', properties);
}

module.exports.createSmartIn = createSmartIn;

/**
 * Create smart:in with businessKey element from given binding.
 *
 * @param {PropertyBinding} binding
 * @param {String} value
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {ModdleElement}
 */
function createSmartInWithBusinessKey(binding, value, bpmnFactory) {
  return bpmnFactory.create('smart:In', {
    businessKey: value,
  });
}

module.exports.createSmartInWithBusinessKey = createSmartInWithBusinessKey;

/**
 * Create smart:out element from given binding.
 *
 * @param {PropertyBinding} binding
 * @param {String} value
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {ModdleElement}
 */
function createSmartOut(binding, value, bpmnFactory) {
  const properties = createSmartInOutAttrs(binding, value);

  return bpmnFactory.create('smart:Out', properties);
}

module.exports.createSmartOut = createSmartOut;

/**
 * Create smart:executionListener element containing an inline script from given binding.
 *
 * @param {PropertyBinding} binding
 * @param {String} value
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {ModdleElement}
 */
function createSmartExecutionListenerScript(binding, value, bpmnFactory) {
  const scriptFormat = binding.scriptFormat;
  let parameterValue;
  let parameterDefinition;

  if (scriptFormat) {
    parameterDefinition = bpmnFactory.create('smart:Script', {
      scriptFormat,
      value,
    });
  } else {
    parameterValue = value;
  }

  return bpmnFactory.create('smart:ExecutionListener', {
    event: binding.event,
    value: parameterValue,
    script: parameterDefinition,
  });
}

module.exports.createSmartExecutionListenerScript = createSmartExecutionListenerScript;

/**
 * Create smart:field element containing string or expression from given binding.
 *
 * @param {PropertyBinding} binding
 * @param {String} value
 * @param {BpmnFactory} bpmnFactory
 *
 * @return {ModdleElement}
 */
function createSmartFieldInjection(binding, value, bpmnFactory) {
  const DEFAULT_PROPS = {
    string: undefined,
    expression: undefined,
    name: undefined,
  };

  const props = assign({}, DEFAULT_PROPS);

  if (!binding.expression) {
    props.string = value;
  } else {
    props.expression = value;
  }
  props.name = binding.name;

  return bpmnFactory.create('smart:Field', props);
}
module.exports.createSmartFieldInjection = createSmartFieldInjection;

// helpers ////////////////////////////

/**
 * Create properties for smart:in and smart:out types.
 */
function createSmartInOutAttrs(binding, value) {
  const properties = {};

  // smart:in source(Expression) target
  if (binding.target) {
    properties.target = binding.target;

    if (binding.expression) {
      properties.sourceExpression = value;
    } else {
      properties.source = value;
    }
  }

  // smart:(in|out) variables local
  else if (binding.variables) {
    properties.variables = 'all';

    if (binding.variables === 'local') {
      properties.local = true;
    }
  }

  // smart:out source(Expression) target
  else {
    properties.target = value;

    ['source', 'sourceExpression'].forEach(function (k) {
      if (binding[k]) {
        properties[k] = binding[k];
      }
    });
  }

  return properties;
}
