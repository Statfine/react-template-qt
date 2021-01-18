const is = require('bpmn-js/lib/util/ModelUtil').is;
const getBusinessObject = require('bpmn-js/lib/util/ModelUtil')
  .getBusinessObject;

const tasklist = require('./implementation/Tasklist');

module.exports = function (group, element, bpmnFactory, translate) {
  const businessObject = getBusinessObject(element);

  if (
    is(element, 'smart:Process') ||
    (is(element, 'bpmn:Participant') && businessObject.get('processRef'))
  ) {
    group.entries = group.entries.concat(
      tasklist(
        element,
        bpmnFactory,
        {
          getBusinessObject(element) {
            const bo = getBusinessObject(element);

            if (!is(bo, 'bpmn:Participant')) {
              return bo;
            }

            return bo.get('processRef');
          },
        },
        translate,
      ),
    );
  }
};
