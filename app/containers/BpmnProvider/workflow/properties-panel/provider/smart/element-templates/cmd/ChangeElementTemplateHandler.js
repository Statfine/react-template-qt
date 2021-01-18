const findExtension = require('../Helper').findExtension;
const findExtensions = require('../Helper').findExtensions;

const createSmartProperty = require('../CreateHelper').createSmartProperty;
const createInputParameter = require('../CreateHelper').createInputParameter;
const createOutputParameter = require('../CreateHelper').createOutputParameter;
const createSmartIn = require('../CreateHelper').createSmartIn;
const createSmartOut = require('../CreateHelper').createSmartOut;
const createSmartInWithBusinessKey = require('../CreateHelper')
  .createSmartInWithBusinessKey;
const createSmartExecutionListenerScript = require('../CreateHelper')
  .createSmartExecutionListenerScript;
const createSmartFieldInjection = require('../CreateHelper')
  .createSmartFieldInjection;

const forEach = require('lodash/forEach');

const SMART_SERVICE_TASK_LIKE = [
  'smart:class',
  'smart:delegateExpression',
  'smart:expression',
];

/**
 * A handler that changes the modeling template of a BPMN element.
 */
function ChangeElementTemplateHandler(modeling, commandStack, bpmnFactory) {
  function getOrCreateExtensionElements(element) {
    const bo = element.businessObject;

    let extensionElements = bo.extensionElements;

    // add extension elements
    if (!extensionElements) {
      extensionElements = bpmnFactory.create('bpmn:ExtensionElements', {
        values: [],
      });

      modeling.updateProperties(element, {
        extensionElements,
      });
    }

    return extensionElements;
  }

  function updateModelerTemplate(element, newTemplate) {
    modeling.updateProperties(element, {
      'smart:modelerTemplate': newTemplate && newTemplate.id,
    });
  }

  function updateIoMappings(element, newTemplate, context) {
    const newMappings = createInputOutputMappings(newTemplate, bpmnFactory);
    let oldMappings;

    if (!newMappings) {
      return;
    }

    if (context) {
      commandStack.execute('properties-panel.update-businessobject', {
        element,
        businessObject: context,
        properties: { inputOutput: newMappings },
      });
    } else {
      context = getOrCreateExtensionElements(element);
      oldMappings = findExtension(element, 'smart:InputOutput');
      commandStack.execute('properties-panel.update-businessobject-list', {
        element,
        currentObject: context,
        propertyName: 'values',
        objectsToAdd: [newMappings],
        objectsToRemove: oldMappings ? [oldMappings] : [],
      });
    }
  }

  function updateSmartField(element, newTemplate, context) {
    const newMappings = createSmartFieldInjections(newTemplate, bpmnFactory);
    let oldMappings;

    if (!newMappings) {
      return;
    }
    if (context) {
      commandStack.execute('properties-panel.update-businessobject', {
        element,
        businessObject: context,
        properties: { field: newMappings },
      });
    } else {
      context = getOrCreateExtensionElements(element);
      oldMappings = findExtensions(element, ['smart:Field']);

      commandStack.execute('properties-panel.update-businessobject-list', {
        element,
        currentObject: context,
        propertyName: 'values',
        objectsToAdd: newMappings,
        objectsToRemove: oldMappings || [],
      });
    }
  }

  function updateSmartProperties(element, newTemplate, context) {
    const newProperties = createSmartProperties(newTemplate, bpmnFactory);
    let oldProperties;

    if (!newProperties) {
      return;
    }

    if (context) {
      commandStack.execute('properties-panel.update-businessobject', {
        element,
        businessObject: context,
        properties: { properties: newProperties },
      });
    } else {
      context = getOrCreateExtensionElements(element);
      oldProperties = findExtension(element, 'smart:Properties');

      commandStack.execute('properties-panel.update-businessobject-list', {
        element,
        currentObject: context,
        propertyName: 'values',
        objectsToAdd: [newProperties],
        objectsToRemove: oldProperties ? [oldProperties] : [],
      });
    }
  }

  function updateProperties(element, newTemplate, context) {
    const newProperties = createBpmnPropertyUpdates(newTemplate, bpmnFactory);

    const newPropertiesCount = Object.keys(newProperties).length;

    if (!newPropertiesCount) {
      return;
    }

    if (context) {
      commandStack.execute('properties-panel.update-businessobject', {
        element,
        businessObject: context,
        properties: newProperties,
      });
    } else {
      modeling.updateProperties(element, newProperties);
    }
  }

  function updateInOut(element, newTemplate, context) {
    const newInOut = createSmartInOut(newTemplate, bpmnFactory);
    let oldInOut;

    if (!newInOut) {
      return;
    }

    if (context) {
      commandStack.execute('properties-panel.update-businessobject', {
        element,
        businessObject: context,
        properties: { inout: newInOut },
      });
    } else {
      context = getOrCreateExtensionElements(element);
      oldInOut = findExtensions(context, ['smart:In', 'smart:Out']);

      commandStack.execute('properties-panel.update-businessobject-list', {
        element,
        currentObject: context,
        propertyName: 'values',
        objectsToAdd: newInOut,
        objectsToRemove: oldInOut,
      });
    }
  }

  function updateExecutionListener(element, newTemplate, context) {
    const newExecutionListeners = createSmartExecutionListeners(
      newTemplate,
      bpmnFactory,
    );
    let oldExecutionsListeners;

    if (!newExecutionListeners.length) {
      return;
    }

    if (context) {
      commandStack.execute('properties-panel.update-businessobject', {
        element,
        businessObject: context,
        properties: { executionListener: newExecutionListeners },
      });
    } else {
      context = getOrCreateExtensionElements(element);
      oldExecutionsListeners = findExtensions(context, [
        'smart:ExecutionListener',
      ]);

      commandStack.execute('properties-panel.update-businessobject-list', {
        element,
        currentObject: context,
        propertyName: 'values',
        objectsToAdd: newExecutionListeners,
        objectsToRemove: oldExecutionsListeners,
      });
    }
  }

  /**
   * Update / recreate a scoped element.
   *
   * @param {djs.model.Base} element the diagram parent element
   * @param {String} scopeName name of the scope, i.e. smart:Connector
   * @param {Object} scopeDefinition
   */
  function updateScopeElements(element, scopeName, scopeDefinition) {
    const scopeElement = bpmnFactory.create(scopeName);

    // update smart:inputOutput
    updateIoMappings(element, scopeDefinition, scopeElement);

    // update smart:field
    updateSmartField(element, scopeDefinition, scopeElement);

    // update smart:properties
    updateSmartProperties(element, scopeDefinition, scopeElement);

    // update other properties (bpmn:condition, smart:async, ...)
    updateProperties(element, scopeDefinition, scopeElement);

    // update smart:in and smart:out
    updateInOut(element, scopeDefinition, scopeElement);

    // update smart:executionListener
    updateExecutionListener(element, scopeDefinition, scopeElement);

    const extensionElements = getOrCreateExtensionElements(element);
    const oldScope = findExtension(extensionElements, scopeName);

    commandStack.execute('properties-panel.update-businessobject-list', {
      element,
      currentObject: extensionElements,
      propertyName: 'values',
      objectsToAdd: [scopeElement],
      objectsToRemove: oldScope ? [oldScope] : [],
    });
  }

  /**
   * Compose an element template change action, updating all
   * necessary underlying properties.
   *
   * @param {Object} context
   * @param {Object} context.element
   * @param {Object} context.oldTemplate
   * @param {Object} context.newTemplate
   */
  this.preExecute = function (context) {
    const element = context.element;
    const newTemplate = context.newTemplate;

    // update smart:modelerTemplate attribute
    updateModelerTemplate(element, newTemplate);

    if (newTemplate) {
      // update smart:inputOutput
      updateIoMappings(element, newTemplate);

      // update smart:field
      updateSmartField(element, newTemplate);

      // update smart:properties
      updateSmartProperties(element, newTemplate);

      // update other properties (bpmn:condition, smart:async, ...)
      updateProperties(element, newTemplate);

      // update smart:in and smart:out
      updateInOut(element, newTemplate);

      // update smart:executionListener
      updateExecutionListener(element, newTemplate);

      // loop on scopes properties
      forEach(newTemplate.scopes, function (scopeDefinition, scopeName) {
        updateScopeElements(element, scopeName, scopeDefinition);
      });
    }
  };
}

ChangeElementTemplateHandler.$inject = [
  'modeling',
  'commandStack',
  'bpmnFactory',
];

module.exports = ChangeElementTemplateHandler;

// helpers /////////////////////////////

function createBpmnPropertyUpdates(template, bpmnFactory) {
  const propertyUpdates = {};

  template.properties.forEach(function (p) {
    const binding = p.binding;
    const bindingTarget = binding.name;
    let propertyValue;

    if (binding.type === 'property') {
      if (bindingTarget === 'conditionExpression') {
        propertyValue = bpmnFactory.create('bpmn:FormalExpression', {
          body: p.value,
          language: binding.scriptFormat,
        });
      } else {
        propertyValue = p.value;
      }

      // assigning smart:async to true|false
      // assigning bpmn:conditionExpression to { $type: 'bpmn:FormalExpression', ... }
      propertyUpdates[bindingTarget] = propertyValue;

      // make sure we unset other "implementation types"
      // when applying a smart:class template onto a preconfigured
      // smart:delegateExpression element
      if (SMART_SERVICE_TASK_LIKE.indexOf(bindingTarget) !== -1) {
        SMART_SERVICE_TASK_LIKE.forEach(function (prop) {
          if (prop !== bindingTarget) {
            propertyUpdates[prop] = undefined;
          }
        });
      }
    }
  });

  return propertyUpdates;
}

function createSmartFieldInjections(template, bpmnFactory) {
  const injections = [];

  template.properties.forEach(function (p) {
    const binding = p.binding;
    const bindingType = binding.type;
    if (bindingType === 'smart:field') {
      injections.push(createSmartFieldInjection(binding, p.value, bpmnFactory));
    }
  });

  if (injections.length) {
    return injections;
  }
}

function createSmartProperties(template, bpmnFactory) {
  const properties = [];

  template.properties.forEach(function (p) {
    const binding = p.binding;
    const bindingType = binding.type;

    if (bindingType === 'smart:property') {
      properties.push(createSmartProperty(binding, p.value, bpmnFactory));
    }
  });

  if (properties.length) {
    return bpmnFactory.create('smart:Properties', {
      values: properties,
    });
  }
}

function createInputOutputMappings(template, bpmnFactory) {
  const inputParameters = [];
  const outputParameters = [];

  template.properties.forEach(function (p) {
    const binding = p.binding;
    const bindingType = binding.type;

    if (bindingType === 'smart:inputParameter') {
      inputParameters.push(createInputParameter(binding, p.value, bpmnFactory));
    }

    if (bindingType === 'smart:outputParameter') {
      outputParameters.push(
        createOutputParameter(binding, p.value, bpmnFactory),
      );
    }
  });

  // do we need to create new ioMappings (?)
  if (outputParameters.length || inputParameters.length) {
    return bpmnFactory.create('smart:InputOutput', {
      inputParameters,
      outputParameters,
    });
  }
}

function createSmartInOut(template, bpmnFactory) {
  const inOuts = [];

  template.properties.forEach(function (p) {
    const binding = p.binding;
    const bindingType = binding.type;

    if (bindingType === 'smart:in') {
      inOuts.push(createSmartIn(binding, p.value, bpmnFactory));
    } else if (bindingType === 'smart:out') {
      inOuts.push(createSmartOut(binding, p.value, bpmnFactory));
    } else if (bindingType === 'smart:in:businessKey') {
      inOuts.push(createSmartInWithBusinessKey(binding, p.value, bpmnFactory));
    }
  });

  return inOuts;
}

function createSmartExecutionListeners(template, bpmnFactory) {
  const executionListener = [];

  template.properties.forEach(function (p) {
    const binding = p.binding;
    const bindingType = binding.type;

    if (bindingType === 'smart:executionListener') {
      executionListener.push(
        createSmartExecutionListenerScript(binding, p.value, bpmnFactory),
      );
    }
  });

  return executionListener;
}
