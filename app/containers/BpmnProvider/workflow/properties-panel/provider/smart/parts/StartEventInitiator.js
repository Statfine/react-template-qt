const is = require('bpmn-js/lib/util/ModelUtil').is;
const getBusinessObject = require('bpmn-js/lib/util/ModelUtil')
  .getBusinessObject;
const entryFactory = require('../../../factory/EntryFactory');

module.exports = function (group, element, translate) {
  const bo = getBusinessObject(element);

  if (!bo) {
    return;
  }

  if (
    is(element, 'smart:Initiator') &&
    !is(element.parent, 'bpmn:SubProcess')
  ) {
    group.entries.push(
      entryFactory.textField({
        id: 'initiator',
        label: translate('Initiator'),
        modelProperty: 'initiator',
      }),
    );
  }
};
