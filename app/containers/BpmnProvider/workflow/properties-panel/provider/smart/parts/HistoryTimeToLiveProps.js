const is = require('bpmn-js/lib/util/ModelUtil').is;
const getBusinessObject = require('bpmn-js/lib/util/ModelUtil')
  .getBusinessObject;

const historyTimeToLive = require('./implementation/HistoryTimeToLive');

module.exports = function(group, element, bpmnFactory, translate) {
  const businessObject = getBusinessObject(element);

  if (
    is(element, 'smart:Process') ||
    (is(element, 'bpmn:Participant') && businessObject.get('processRef'))
  ) {
    group.entries = group.entries.concat(
      historyTimeToLive(
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
