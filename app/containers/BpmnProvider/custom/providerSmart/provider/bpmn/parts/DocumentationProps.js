const ModelUtil = require('bpmn-js/lib/util/ModelUtil');
const entryFactory = require('../../../factory/EntryFactory');
const cmdHelper = require('../../../helper/CmdHelper');

const is = ModelUtil.is;
const getBusinessObject = ModelUtil.getBusinessObject;

module.exports = function(group, element, bpmnFactory, translate) {
  const getValue = function(businessObject) {
    return function(element) {
      const documentations =
        businessObject && businessObject.get('documentation');
      const text =
        documentations && documentations.length > 0
          ? documentations[0].text
          : '';

      return { documentation: text };
    };
  };

  const setValue = function(businessObject) {
    return function(element, values) {
      const newObjectList = [];

      if (
        typeof values.documentation !== 'undefined' &&
        values.documentation !== ''
      ) {
        newObjectList.push(
          bpmnFactory.create('bpmn:Documentation', {
            text: values.documentation,
          }),
        );
      }

      return cmdHelper.setList(
        element,
        businessObject,
        'documentation',
        newObjectList,
      );
    };
  };

  // Element Documentation
  const elementDocuEntry = entryFactory.textBox({
    id: 'documentation',
    label: translate('Element Documentation'),
    modelProperty: 'documentation',
  });

  elementDocuEntry.set = setValue(getBusinessObject(element));

  elementDocuEntry.get = getValue(getBusinessObject(element));

  group.entries.push(elementDocuEntry);

  let processRef;

  // Process Documentation when having a Collaboration Diagram
  if (is(element, 'bpmn:Participant')) {
    processRef = getBusinessObject(element).processRef;

    // do not show for collapsed Pools/Participants
    if (processRef) {
      const processDocuEntry = entryFactory.textBox({
        id: 'process-documentation',
        label: translate('Process Documentation'),
        modelProperty: 'documentation',
      });

      processDocuEntry.set = setValue(processRef);

      processDocuEntry.get = getValue(processRef);

      group.entries.push(processDocuEntry);
    }
  }
};
