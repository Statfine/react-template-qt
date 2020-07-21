'use strict';

var findExtension = require('../Helper').findExtension,
    findExtensions = require('../Helper').findExtensions;

var createSmartProperty = require('../CreateHelper').createSmartProperty,
    createInputParameter = require('../CreateHelper').createInputParameter,
    createOutputParameter = require('../CreateHelper').createOutputParameter,
    createSmartIn = require('../CreateHelper').createSmartIn,
    createSmartOut = require('../CreateHelper').createSmartOut,
    createSmartInWithBusinessKey = require('../CreateHelper').createSmartInWithBusinessKey,
    createSmartExecutionListenerScript = require('../CreateHelper').createSmartExecutionListenerScript,
    createSmartFieldInjection = require('../CreateHelper').createSmartFieldInjection;

var forEach = require('lodash/forEach');

var SMART_SERVICE_TASK_LIKE = [
  'smart:class',
  'smart:delegateExpression',
  'smart:expression'
];

/**
 * A handler that changes the modeling template of a BPMN element.
 */
function ChangeElementTemplateHandler(modeling, commandStack, bpmnFactory) {

  function getOrCreateExtensionElements(element) {

    var bo = element.businessObject;

    var extensionElements = bo.extensionElements;

    // add extension elements
    if (!extensionElements) {
      extensionElements = bpmnFactory.create('bpmn:ExtensionElements', {
        values: []
      });

      modeling.updateProperties(element, {
        extensionElements: extensionElements
      });
    }

    return extensionElements;
  }

  function updateModelerTemplate(element, newTemplate) {
    modeling.updateProperties(element, {
      'smart:modelerTemplate': newTemplate && newTemplate.id
    });
  }

  function updateIoMappings(element, newTemplate, context) {

    var newMappings = createInputOutputMappings(newTemplate, bpmnFactory),
        oldMappings;

    if (!newMappings) {
      return;
    }

    if (context) {
      commandStack.execute('properties-panel.update-businessobject', {
        element: element,
        businessObject: context,
        properties: { inputOutput: newMappings }
      });
    } else {
      context = getOrCreateExtensionElements(element);
      oldMappings = findExtension(element, 'smart:InputOutput');
      commandStack.execute('properties-panel.update-businessobject-list', {
        element: element,
        currentObject: context,
        propertyName: 'values',
        objectsToAdd: [ newMappings ],
        objectsToRemove: oldMappings ? [ oldMappings ] : []
      });
    }
  }

  function updateSmartField(element, newTemplate, context) {

    var newMappings = createSmartFieldInjections(newTemplate, bpmnFactory),
        oldMappings;

    if (!newMappings) {
      return;
    }
    if (context) {
      commandStack.execute('properties-panel.update-businessobject', {
        element: element,
        businessObject: context,
        properties: { field: newMappings }
      });
    } else {
      context = getOrCreateExtensionElements(element);
      oldMappings = findExtensions(element, ['smart:Field']);

      commandStack.execute('properties-panel.update-businessobject-list', {
        element: element,
        currentObject: context,
        propertyName: 'values',
        objectsToAdd: newMappings,
        objectsToRemove: oldMappings ? oldMappings : []
      });
    }
  }


  function updateSmartProperties(element, newTemplate, context) {

    var newProperties = createSmartProperties(newTemplate, bpmnFactory),
        oldProperties;

    if (!newProperties) {
      return;
    }

    if (context) {
      commandStack.execute('properties-panel.update-businessobject', {
        element: element,
        businessObject: context,
        properties: { properties: newProperties }
      });
    } else {
      context = getOrCreateExtensionElements(element);
      oldProperties = findExtension(element, 'smart:Properties');

      commandStack.execute('properties-panel.update-businessobject-list', {
        element: element,
        currentObject: context,
        propertyName: 'values',
        objectsToAdd: [ newProperties ],
        objectsToRemove: oldProperties ? [ oldProperties ] : []
      });
    }
  }

  function updateProperties(element, newTemplate, context) {

    var newProperties = createBpmnPropertyUpdates(newTemplate, bpmnFactory);

    var newPropertiesCount = Object.keys(newProperties).length;

    if (!newPropertiesCount) {
      return;
    }

    if (context) {
      commandStack.execute('properties-panel.update-businessobject', {
        element: element,
        businessObject: context,
        properties: newProperties
      });
    } else {
      modeling.updateProperties(element, newProperties);
    }
  }

  function updateInOut(element, newTemplate, context) {

    var newInOut = createSmartInOut(newTemplate, bpmnFactory),
        oldInOut;

    if (!newInOut) {
      return;
    }

    if (context) {
      commandStack.execute('properties-panel.update-businessobject', {
        element: element,
        businessObject: context,
        properties: { inout: newInOut }
      });
    } else {
      context = getOrCreateExtensionElements(element);
      oldInOut = findExtensions(context, [ 'smart:In', 'smart:Out' ]);

      commandStack.execute('properties-panel.update-businessobject-list', {
        element: element,
        currentObject: context,
        propertyName: 'values',
        objectsToAdd: newInOut,
        objectsToRemove: oldInOut
      });
    }
  }

  function updateExecutionListener(element, newTemplate, context) {

    var newExecutionListeners = createSmartExecutionListeners(newTemplate, bpmnFactory),
        oldExecutionsListeners;

    if (!newExecutionListeners.length) {
      return;
    }

    if (context) {
      commandStack.execute('properties-panel.update-businessobject', {
        element: element,
        businessObject: context,
        properties: { executionListener: newExecutionListeners }
      });
    } else {
      context = getOrCreateExtensionElements(element);
      oldExecutionsListeners = findExtensions(context, [ 'smart:ExecutionListener' ]);

      commandStack.execute('properties-panel.update-businessobject-list', {
        element: element,
        currentObject: context,
        propertyName: 'values',
        objectsToAdd: newExecutionListeners,
        objectsToRemove: oldExecutionsListeners
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

    var scopeElement = bpmnFactory.create(scopeName);

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

    var extensionElements = getOrCreateExtensionElements(element);
    var oldScope = findExtension(extensionElements, scopeName);

    commandStack.execute('properties-panel.update-businessobject-list', {
      element: element,
      currentObject: extensionElements,
      propertyName: 'values',
      objectsToAdd: [ scopeElement ],
      objectsToRemove: oldScope ? [ oldScope ] : []
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
  this.preExecute = function(context) {

    var element = context.element,
        newTemplate = context.newTemplate;

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
      forEach(newTemplate.scopes, function(scopeDefinition, scopeName) {
        updateScopeElements(element, scopeName, scopeDefinition);
      });

    }
  };
}

ChangeElementTemplateHandler.$inject = [ 'modeling', 'commandStack', 'bpmnFactory' ];

module.exports = ChangeElementTemplateHandler;



// helpers /////////////////////////////

function createBpmnPropertyUpdates(template, bpmnFactory) {

  var propertyUpdates = {};

  template.properties.forEach(function(p) {

    var binding = p.binding,
        bindingTarget = binding.name,
        propertyValue;

    if (binding.type === 'property') {

      if (bindingTarget === 'conditionExpression') {
        propertyValue = bpmnFactory.create('bpmn:FormalExpression', {
          body: p.value,
          language: binding.scriptFormat
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
        SMART_SERVICE_TASK_LIKE.forEach(function(prop) {
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
  var injections = [];

  template.properties.forEach(function(p) {
    var binding = p.binding,
        bindingType = binding.type;
    if (bindingType === 'smart:field') {
      injections.push(createSmartFieldInjection(
        binding, p.value, bpmnFactory
      ));
    }
  });

  if (injections.length) {
    return injections;
  }
}

function createSmartProperties(template, bpmnFactory) {

  var properties = [];

  template.properties.forEach(function(p) {
    var binding = p.binding,
        bindingType = binding.type;

    if (bindingType === 'smart:property') {
      properties.push(createSmartProperty(
        binding, p.value, bpmnFactory
      ));
    }
  });

  if (properties.length) {
    return bpmnFactory.create('smart:Properties', {
      values: properties
    });
  }
}

function createInputOutputMappings(template, bpmnFactory) {

  var inputParameters = [],
      outputParameters = [];

  template.properties.forEach(function(p) {
    var binding = p.binding,
        bindingType = binding.type;

    if (bindingType === 'smart:inputParameter') {
      inputParameters.push(createInputParameter(
        binding, p.value, bpmnFactory
      ));
    }

    if (bindingType === 'smart:outputParameter') {
      outputParameters.push(createOutputParameter(
        binding, p.value, bpmnFactory
      ));
    }
  });

  // do we need to create new ioMappings (?)
  if (outputParameters.length || inputParameters.length) {
    return bpmnFactory.create('smart:InputOutput', {
      inputParameters: inputParameters,
      outputParameters: outputParameters
    });
  }
}

function createSmartInOut(template, bpmnFactory) {

  var inOuts = [];

  template.properties.forEach(function(p) {
    var binding = p.binding,
        bindingType = binding.type;

    if (bindingType === 'smart:in') {
      inOuts.push(createSmartIn(
        binding, p.value, bpmnFactory
      ));
    } else
    if (bindingType === 'smart:out') {
      inOuts.push(createSmartOut(
        binding, p.value, bpmnFactory
      ));
    } else
    if (bindingType === 'smart:in:businessKey') {
      inOuts.push(createSmartInWithBusinessKey(
        binding, p.value, bpmnFactory
      ));
    }
  });

  return inOuts;
}


function createSmartExecutionListeners(template, bpmnFactory) {

  var executionListener = [];

  template.properties.forEach(function(p) {
    var binding = p.binding,
        bindingType = binding.type;

    if (bindingType === 'smart:executionListener') {
      executionListener.push(createSmartExecutionListenerScript(
        binding, p.value, bpmnFactory
      ));
    }
  });

  return executionListener;
}
