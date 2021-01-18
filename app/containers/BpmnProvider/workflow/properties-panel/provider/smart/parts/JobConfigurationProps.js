const is = require('bpmn-js/lib/util/ModelUtil').is;
const getBusinessObject = require('bpmn-js/lib/util/ModelUtil')
  .getBusinessObject;

const jobPriority = require('./implementation/JobPriority');
const jobRetryTimeCycle = require('./implementation/JobRetryTimeCycle');

module.exports = function(group, element, bpmnFactory, translate) {
  const businessObject = getBusinessObject(element);

  if (
    is(element, 'smart:JobPriorized') ||
    (is(element, 'bpmn:Participant') && businessObject.get('processRef'))
  ) {
    group.entries = group.entries.concat(
      jobPriority(
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

  if (is(element, 'smart:AsyncCapable')) {
    group.entries = group.entries.concat(
      jobRetryTimeCycle(
        element,
        bpmnFactory,
        {
          getBusinessObject,
        },
        translate,
      ),
    );
  }
};
