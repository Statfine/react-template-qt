const getBusinessObject = require('bpmn-js/lib/util/ModelUtil')
  .getBusinessObject;
const is = require('bpmn-js/lib/util/ModelUtil').is;
const asyncContinuation = require('./implementation/AsyncContinuation');

module.exports = function(group, element, bpmnFactory, translate) {
  if (is(element, 'smart:AsyncCapable')) {
    group.entries = group.entries.concat(
      asyncContinuation(
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
