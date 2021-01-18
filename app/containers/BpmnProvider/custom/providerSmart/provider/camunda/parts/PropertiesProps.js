const properties = require('./implementation/Properties');
const elementHelper = require('../../../helper/ElementHelper');
const cmdHelper = require('../../../helper/CmdHelper');

module.exports = function (group, element, bpmnFactory, translate) {
  const propertiesEntry = properties(
    element,
    bpmnFactory,
    {
      id: 'properties',
      modelProperties: ['name', 'value'],
      labels: [translate('Name'), translate('Value')],

      getParent(element, node, bo) {
        return bo.extensionElements;
      },

      createParent(element, bo) {
        const parent = elementHelper.createElement(
          'bpmn:ExtensionElements',
          { values: [] },
          bo,
          bpmnFactory,
        );
        const cmd = cmdHelper.updateBusinessObject(element, bo, {
          extensionElements: parent,
        });
        return {
          cmd,
          parent,
        };
      },
    },
    translate,
  );

  if (propertiesEntry) {
    group.entries.push(propertiesEntry);
  }
};
