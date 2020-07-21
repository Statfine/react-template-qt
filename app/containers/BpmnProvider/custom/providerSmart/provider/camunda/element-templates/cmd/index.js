

const ChangeElementTemplateHandler = require('./ChangeElementTemplateHandler');

const getTemplate = require('../Helper').getTemplate;
const getDefaultTemplate = require('../Helper').getDefaultTemplate;

function registerHandlers(commandStack, elementTemplates, eventBus, elementRegistry) {
  commandStack.registerHandler(
    'propertiesPanel.smart.changeTemplate',
    ChangeElementTemplateHandler
  );

  // apply default element templates on shape creation
  eventBus.on([ 'commandStack.shape.create.postExecuted' ], function(context) {
    applyDefaultTemplate(context.context.shape, elementTemplates, commandStack);
  });

  // apply default element templates on connection creation
  eventBus.on([ 'commandStack.connection.create.postExecuted' ], function(context) {
    applyDefaultTemplate(context.context.connection, elementTemplates, commandStack);
  });
}

registerHandlers.$inject = [ 'commandStack', 'elementTemplates', 'eventBus', 'elementRegistry' ];


module.exports = {
  __init__: [ registerHandlers ]
};


function applyDefaultTemplate(element, elementTemplates, commandStack) {

  if (!getTemplate(element, elementTemplates)
      && getDefaultTemplate(element, elementTemplates)) {

    const command = 'propertiesPanel.smart.changeTemplate';
    const commandContext = {
      element,
      newTemplate: getDefaultTemplate(element, elementTemplates)
    };

    commandStack.execute(command, commandContext);
  }
}
